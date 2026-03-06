'use client';

import { useActionState } from 'react';

import { loginAction } from '@/app/auth/actions';

type ActionState = {
  ok: boolean;
  message: string;
};

const initialState: ActionState = {
  ok: false,
  message: '',
};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
        <div className="text-sm font-semibold text-zinc-100">Connexion</div>
        <div className="mt-1 text-sm text-zinc-400">Accès à votre espace DelivTrack</div>

        <form action={formAction} className="mt-6 grid gap-4">
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
              autoComplete="current-password"
              className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-zinc-100 outline-none transition focus:border-[#b08d2a]/60 focus:ring-2 focus:ring-[#b08d2a]/30"
            />
          </div>

          {state.message ? (
            <div
              className={
                state.ok
                  ? 'rounded-2xl border border-[#b08d2a]/30 bg-[#b08d2a]/10 p-3 text-sm text-zinc-200'
                  : 'rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100'
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
            {pending ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
