export default function ServicesSection() {
  return (
    <section id="services" className="scroll-mt-24 border-t border-white/10 py-14">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">Services</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
            Une offre simple, premium, conçue pour la performance et la visibilité de vos livraisons.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl  border-white/10 bg-white/5 p-6">
          <div className="text-sm font-semibold text-zinc-50">Livraison express</div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Délais courts, tournées efficaces, priorisation intelligente. Une exécution rapide sans compromis.
          </p>
          <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="mt-5 text-xs text-zinc-400">Idéal pour: e-commerce, pharmacies, pièces urgentes.</div>
        </div>

        <div className="rounded-3xl  border-[#b08d2a]/30 bg-[#b08d2a]/10 p-6">
          <div className="text-sm font-semibold text-[#f5d77a]">Suivi temps réel</div>
          <p className="mt-2 text-sm leading-6 text-zinc-200">
            Statuts clairs, progression visible, horodatage fiable. Les équipes savent, les clients comprennent.
          </p>
          <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-[#b08d2a]/40 to-transparent" />
          <div className="mt-5 text-xs text-zinc-300">Transparence pour: admins, livreurs et support.</div>
        </div>

        <div className="rounded-3xl  border-white/10 bg-white/5 p-6">
          <div className="text-sm font-semibold text-zinc-50">Couverture nationale</div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Déploiement progressif, zones configurables, organisation multi-ville. Vous gardez le contrôle.
          </p>
          <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="mt-5 text-xs text-zinc-400">Pensé pour grandir: d'une ville à tout un pays.</div>
        </div>
      </div>
    </section>
  );
}
