import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="grid items-center gap-10 pb-12 pt-10 md:grid-cols-2 md:pt-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full  border-[#b08d2a]/30 bg-white/5 px-3 py-1 text-xs text-zinc-200">
          <span className="h-2 w-2 rounded-full bg-[#b08d2a]" />
          Suivi temps réel. Livraison maîtrisée.
        </div>

        <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-tight text-zinc-50 sm:text-5xl">
          La livraison qui sonne juste.
          <span className="block bg-gradient-to-b from-[#f5d77a] to-[#b08d2a] bg-clip-text text-transparent">
            Rapide, traçable, fiable.
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-zinc-300 sm:text-lg">
          DelivTrack centralise vos expéditions et vos tournées avec un suivi clair, une exécution rapide, et une
          expérience livreur pensée pour le terrain.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-full bg-[#b08d2a] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#c19b32] focus:outline-none focus:ring-2 focus:ring-[#b08d2a]/60"
          >
            Se connecter
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center rounded-full  border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-zinc-100 backdrop-blur transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#b08d2a]/60"
          >
            Créer un compte
          </Link>
        </div>

        <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4">
          <div className="rounded-2xl  border-white/10 bg-white/5 p-4">
            <dt className="text-xs text-zinc-400">Temps moyen</dt>
            <dd className="mt-1 text-lg font-semibold text-zinc-100">Moins de 2h</dd>
          </div>
          <div className="rounded-2xl  border-white/10 bg-white/5 p-4">
            <dt className="text-xs text-zinc-400">Suivi</dt>
            <dd className="mt-1 text-lg font-semibold text-zinc-100">Temps réel</dd>
          </div>
          <div className="rounded-2xl  border-white/10 bg-white/5 p-4">
            <dt className="text-xs text-zinc-400">Couverture</dt>
            <dd className="mt-1 text-lg font-semibold text-zinc-100">Nationale</dd>
          </div>
        </dl>
      </div>

      <div className="relative">
        <div className="overflow-hidden rounded-3xl  border-white/10 bg-white/5">
          <div className="relative aspect-[4/3] w-full">
            <img
              src="https://images.unsplash.com/photo-1605902711622-cfb43c44367f?auto=format&fit=crop&w=1400&q=80"
              alt="Coursier et colis dans un environnement urbain"
              className="h-full w-full object-cover opacity-90"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
          </div>
          <div className="grid gap-3 p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-zinc-100">Centre de contrôle</div>
              <div className="rounded-full  border-[#b08d2a]/30 bg-[#b08d2a]/10 px-2.5 py-1 text-xs text-[#f5d77a]">
                Statut: en cours
              </div>
            </div>
            <div className="text-xs leading-5 text-zinc-300">
              Des informations lisibles, au bon moment: attribution, progression, preuve de livraison.
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl  border-white/10 bg-black/20 p-3">
                <div className="text-[11px] text-zinc-400">Attribution</div>
                <div className="mt-1 text-sm font-semibold text-zinc-100">Instantanée</div>
              </div>
              <div className="rounded-2xl  border-white/10 bg-black/20 p-3">
                <div className="text-[11px] text-zinc-400">Trajet</div>
                <div className="mt-1 text-sm font-semibold text-zinc-100">Optimisé</div>
              </div>
              <div className="rounded-2xl  border-white/10 bg-black/20 p-3">
                <div className="text-[11px] text-zinc-400">Preuve</div>
                <div className="mt-1 text-sm font-semibold text-zinc-100">Horodatée</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute -bottom-8 -left-6 hidden h-24 w-24 rounded-3xl  border-[#b08d2a]/30 bg-[#b08d2a]/10 blur-[0.2px] md:block" />
        <div className="pointer-events-none absolute -top-7 -right-7 hidden h-32 w-32 rounded-full  border-white/10 bg-white/5 blur-[0.2px] md:block" />
      </div>
    </section>
  );
}
