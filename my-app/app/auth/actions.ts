'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/server';

type ActionState = {
  ok: boolean;
  message: string;
};

async function getSiteUrlFromRequest(): Promise<string> {
  const h = await headers();

  const origin = h.get('origin');
  if (origin) return origin;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return siteUrl;

  return 'http://localhost:3000';
}

export async function registerAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const prenom = String(formData.get('prenom') ?? '').trim();
  const nom = String(formData.get('nom') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const role = String(formData.get('role') ?? 'livreur');
  const adminAccessCode = String(formData.get('adminAccessCode') ?? '').trim();

  let adminVerified = false;

  console.log('[auth][register] attempt', { email, role });

  if (!prenom || !nom || !email || !password) {
    console.error('[auth][register] missing_fields', { prenom: !!prenom, nom: !!nom, email: !!email, password: !!password });
    return { ok: false, message: 'Tous les champs sont obligatoires.' };
  }

  if (role !== 'admin' && role !== 'livreur') {
    console.error('[auth][register] invalid_role', { role });
    return { ok: false, message: 'Rôle invalide.' };
  }

  if (role === 'admin') {
    const secret = process.env.ADMIN_SECRET_KEY;

    if (!secret) {
      console.error('[auth][register] ADMIN_SECRET_KEY missing (server env)');
      return { ok: false, message: "Configuration manquante: ADMIN_SECRET_KEY n'est pas défini." };
    }

    if (adminAccessCode !== secret) {
      console.error('[auth][register] invalid_admin_access_code', { email });
      return { ok: false, message: "Code d'accès admin invalide." };
    }

    adminVerified = true;
  }

  const supabase = await createClient();

  const siteUrl = await getSiteUrlFromRequest();
  const emailRedirectTo = `${siteUrl}/auth/confirm`;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        role,
        prenom,
        nom,
        admin_verified: adminVerified,
      },
    },
  });

  if (error) {
    console.error('[auth][register] signUp_error', { email, role, error });

    const anyError = error as unknown as { status?: number; code?: string; message?: string };
    if (anyError.status === 429 || anyError.code === 'over_email_send_rate_limit') {
      const bypass = process.env.DEV_BYPASS_EMAIL_CONFIRM === 'true';
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      console.warn('[auth][register] email_rate_limited', {
        email,
        bypass,
        hasUrl: !!url,
        hasServiceRoleKey: !!serviceRoleKey,
      });

      if (bypass && url && serviceRoleKey) {
        console.warn('[auth][register] bypass_enabled_creating_user_via_admin_api', { email, role });

        const admin = createSupabaseAdminClient(url, serviceRoleKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: created, error: createUserError } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            role,
            prenom,
            nom,
            admin_verified: adminVerified,
          },
        });

        if (createUserError || !created.user) {
          console.error('[auth][register] admin_createUser_error', { email, createUserError });
          return {
            ok: false,
            message:
              "Inscription impossible pour le moment (limite email). Réessayez dans quelques minutes ou contactez l'administrateur.",
          };
        }

        const userId = created.user.id;

        const { error: upsertError } = await admin.from('profiles').upsert(
          {
            id: userId,
            email,
            prenom,
            nom,
            role: role === 'admin' && adminVerified ? 'admin' : 'livreur',
          },
          { onConflict: 'id' },
        );

        if (upsertError) {
          console.error('[auth][register] bypass_profiles_upsert_error', { email, userId, upsertError });
        } else {
          console.log('[auth][register] bypass_profiles_upsert_success', { email, userId });
        }

        return {
          ok: true,
          message:
            "Compte créé en mode développement (confirmation email ignorée à cause de la limitation). Vous pouvez vous connecter directement.",
        };
      }

      return {
        ok: false,
        message:
          "Trop de demandes d'inscription. Supabase a temporairement bloqué l'envoi d'emails. Réessayez dans quelques minutes.",
      };
    }

    return { ok: false, message: error.message };
  }

  console.log('[auth][register] signUp_success', { email, role, emailRedirectTo });
  return { ok: true, message: 'Inscription réussie. Vérifiez votre email pour confirmer votre compte.' };
}

export async function loginAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  console.log('[auth][login] attempt', { email });

  if (!email || !password) {
    console.error('[auth][login] missing_fields', { email: !!email, password: !!password });
    return { ok: false, message: 'Email et mot de passe obligatoires.' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('[auth][login] signIn_error', { email, error });

    const normalizedMessage = error.message.toLowerCase();
    if (normalizedMessage.includes('email') && normalizedMessage.includes('confirm')) {
      return { ok: false, message: "Email non confirmé. Vérifiez votre boîte mail." };
    }

    return { ok: false, message: error.message };
  }

  const userId = data.user?.id;
  if (!userId) {
    console.error('[auth][login] missing_user_after_success', { email });
    return { ok: false, message: 'Connexion échouée: utilisateur introuvable.' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('[auth][login] profile_fetch_error', { email, userId, profileError });
    return { ok: false, message: "Impossible de récupérer le profil utilisateur." };
  }

  if (profile?.role === 'admin') {
    console.log('[auth][login] redirect_admin', { email, userId });
    redirect('/admin/dashboard');
  }

  console.log('[auth][login] redirect_livreur', { email, userId });
  redirect('/livreur/dashboard');
}

export async function logoutAction(): Promise<void> {
  console.log('[auth][logout] attempt');

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('[auth][logout] signOut_error', { error });
  } else {
    console.log('[auth][logout] success');
  }

  redirect('/');
}
