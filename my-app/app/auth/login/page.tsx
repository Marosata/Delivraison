import Link from 'next/link';

import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#b08d2a]/20 blur-3xl" />
        <div className="absolute -bottom-56 right-[-120px] h-[640px] w-[640px] rounded-full bg-[#9b7a20]/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(176,141,42,0.16),transparent_60%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-10 sm:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold tracking-wide text-zinc-100 hover:text-zinc-50">
            DelivTrack
          </Link>
          <Link
            href="/auth/register"
            className="rounded-full bg-[#b08d2a] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#c19b32]"
          >
            S&apos;inscrire
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
