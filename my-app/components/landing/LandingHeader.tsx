import Link from 'next/link';

export default function LandingHeader() {
  return (
    <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl  border-[#b08d2a]/40 bg-white/5" />
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-wide text-zinc-100">DelivTrack</div>
          <div className="text-xs text-zinc-400">Livraison & suivi</div>
        </div>
      </div>

      <nav className="hidden items-center gap-7 text-sm text-zinc-300 sm:flex">
        <a className="hover:text-zinc-100" href="#services">
          Services
        </a>
        <a className="hover:text-zinc-100" href="#how">
          Fonctionnement
        </a>
        <a className="hover:text-zinc-100" href="#contact">
          Contact
        </a>
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="rounded-full  border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-100 backdrop-blur transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#b08d2a]/60"
        >
          Se connecter
        </Link>
        <Link
          href="/auth/register"
          className="rounded-full bg-[#b08d2a] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#c19b32] focus:outline-none focus:ring-2 focus:ring-[#b08d2a]/60"
        >
          S&apos;inscrire
        </Link>
      </div>
    </header>
  );
}
