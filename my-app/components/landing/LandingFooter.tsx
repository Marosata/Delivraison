import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer id="contact" className="relative border-t border-white/10">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="text-sm font-semibold text-zinc-100">DelivTrack</div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Une entreprise fictive pour démontrer une plateforme de livraison moderne.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-zinc-100">Liens utiles</div>
            <div className="mt-3 grid gap-2 text-sm text-zinc-300">
              <Link className="hover:text-zinc-100" href="/auth/login">
                Se connecter
              </Link>
              <Link className="hover:text-zinc-100" href="/auth/register">
                S&apos;inscrire
              </Link>
              <a className="hover:text-zinc-100" href="#services">
                Services
              </a>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-zinc-100">Contact</div>
            <div className="mt-3 text-sm text-zinc-300">
              <div>contact@delivtrack.example</div>
              <div className="mt-1">+33 1 84 88 00 00</div>
              <div className="mt-1">12 Avenue de la Logistique, 75000 Paris</div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-zinc-400 sm:flex-row">
          <div>© {new Date().getFullYear()} DelivTrack. Tous droits réservés.</div>
          <div className="flex gap-4">
            <a className="hover:text-zinc-200" href="#">
              Confidentialité
            </a>
            <a className="hover:text-zinc-200" href="#">
              Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
