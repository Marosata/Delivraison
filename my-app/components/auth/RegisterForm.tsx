'use client';

import { useActionState, useMemo, useState } from 'react';

import { registerAction } from '@/app/auth/actions';

type ActionState = {
  ok: boolean;
  message: string;
};

const initialState: ActionState = {
  ok: false,
  message: '',
};

export default function RegisterForm() {
  const [role, setRole] = useState<'livreur' | 'admin'>('livreur');

  const [state, formAction, pending] = useActionState(registerAction, initialState);

  const isSuccess = state.ok;
  const showAdminCode = role === 'admin' && !isSuccess;

  const feedbackTone = useMemo(() => {
    if (!state.message) return 'neutral';
    return state.ok ? 'success' : 'error';
  }, [state.message, state.ok]);

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
        <div className="text-sm font-semibold text-zinc-100">Créer un compte</div>
        <div className="mt-1 text-sm text-zinc-400">Inscription DelivTrack</div>

        {isSuccess ? (
          <div className="mt-6 rounded-2xl border border-[#b08d2a]/30 bg-[#b08d2a]/10 p-4">
            <div className="text-sm font-semibold text-[#f5d77a]">Vérifiez votre email</div>
            <div className="mt-1 text-sm leading-6 text-zinc-200">{state.message}</div>
          </div>
        ) : (
          <form action={formAction} className="mt-6 grid gap-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label className="text-xs text-zinc-300" htmlFor="prenom">
                  Prénom
                </label>
                <input
                  id="prenom"
                  name="prenom"
                  required
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-zinc-100 outline-none transition focus:border-[#b08d2a]/60 focus:ring-2 focus:ring-[#b08d2a]/30"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs text-zinc-300" htmlFor="nom">
                  Nom
                </label>
                <input
                  id="nom"
                  name="nom"
                  required
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-zinc-100 outline-none transition focus:border-[#b08d2a]/60 focus:ring-2 focus:ring-[#b08d2a]/30"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs text-zinc-300" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-zinc-100 outline-none transition focus:border-[#b08d2a]/60 focus:ring-2 focus:ring-[#b08d2a]/30"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs text-zinc-300" htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-zinc-100 outline-none transition focus:border-[#b08d2a]/60 focus:ring-2 focus:ring-[#b08d2a]/30"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs text-zinc-300" htmlFor="role">
                Rôle
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value === 'admin' ? 'admin' : 'livreur')}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-zinc-100 outline-none transition focus:border-[#b08d2a]/60 focus:ring-2 focus:ring-[#b08d2a]/30"
              >
                <option value="livreur">Livreur</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {showAdminCode ? (
              <div className="grid gap-1.5">
                <label className="text-xs text-zinc-300" htmlFor="adminAccessCode">
                  Code d&apos;accès admin
                </label>
                <input
                  id="adminAccessCode"
                  name="adminAccessCode"
                  type="password"
                  required
                  className="h-11 w-full rounded-xl border border-[#b08d2a]/30 bg-black/30 px-3 text-sm text-zinc-100 outline-none transition focus:border-[#b08d2a]/70 focus:ring-2 focus:ring-[#b08d2a]/30"
                />
                <div className="text-xs text-zinc-500">
                  Ce code est vérifié côté serveur via la variable d&apos;environnement ADMIN_SECRET_KEY.
                </div>
              </div>
            ) : null}

            {state.message ? (
              <div
                className={
                  feedbackTone === 'success'
                    ? 'rounded-2xl border border-[#b08d2a]/30 bg-[#b08d2a]/10 p-3 text-sm text-zinc-200'
                    : feedbackTone === 'error'
                      ? 'rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100'
                      : 'rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-200'
                }
              >
                {state.message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className="mt-1 inline-flex h-11 items-center justify-center rounded-xl bg-[#b08d2a] px-4 text-sm font-semibold text-black transition hover:bg-[#c19b32] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? 'Création...' : 'S\'inscrire'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
