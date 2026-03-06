import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    console.error('[auth][confirm] missing_env', { hasUrl: !!url, hasAnonKey: !!anonKey });
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const nextUrl = new URL(request.url);
  const code = nextUrl.searchParams.get('code');

  console.log('[auth][confirm] request', { hasCode: !!code });

  if (!code) {
    console.error('[auth][confirm] missing_code');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  let response = NextResponse.redirect(new URL('/auth/login', request.url));

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[auth][confirm] exchange_error', { error });
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('[auth][confirm] getUser_error', { userError });
    return response;
  }

  const rawRole = user.user_metadata?.role;
  const adminVerified = user.user_metadata?.admin_verified === true;
  const role = rawRole === 'admin' && adminVerified ? 'admin' : 'livreur';
  const prenom = typeof user.user_metadata?.prenom === 'string' ? user.user_metadata.prenom : null;
  const nom = typeof user.user_metadata?.nom === 'string' ? user.user_metadata.nom : null;
  const email = user.email ?? '';

  console.log('[auth][confirm] exchange_success', {
    userId: user.id,
    email,
    role,
    adminVerified,
    hasServiceRoleKey: !!serviceRoleKey,
  });

  // Important: si le trigger profiles n'a pas tourné (ou si RLS bloque), on force un upsert via service role.
  if (!serviceRoleKey) {
    console.error('[auth][confirm] missing_service_role_key', {
      message: 'Ajoute SUPABASE_SERVICE_ROLE_KEY dans .env.local pour permettre l\'upsert profiles à la confirmation.',
    });
    return response;
  }

  const admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: upsertError } = await admin.from('profiles').upsert(
    {
      id: user.id,
      email,
      prenom,
      nom,
      role,
    },
    { onConflict: 'id' },
  );

  if (upsertError) {
    console.error('[auth][confirm] profiles_upsert_error', { userId: user.id, upsertError });
  } else {
    console.log('[auth][confirm] profiles_upsert_success', { userId: user.id, role });
  }

  return response;
}
