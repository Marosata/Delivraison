export default function HowItWorksSection() {
  return (
    <section id="how" className="scroll-mt-24 border-t border-white/10 py-14">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">Comment ça marche</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-300">
            Trois étapes, une exécution fluide. Du back-office à la preuve de livraison.
          </p>

          <ol className="mt-8 grid gap-4">
            <li className="rounded-3xl  border-white/10 bg-white/5 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl  border-[#b08d2a]/30 bg-[#b08d2a]/10 text-sm font-semibold text-[#f5d77a]">
                  01
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-50">Création de commande</div>
                  <div className="mt-1 text-sm leading-6 text-zinc-300">
                    L&apos;admin saisit l&apos;adresse, le statut et l&apos;assignation. Tout est structuré et traçable.
                  </div>
                </div>
              </div>
            </li>

            <li className="rounded-3xl  border-white/10 bg-white/5 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl  border-[#b08d2a]/30 bg-[#b08d2a]/10 text-sm font-semibold text-[#f5d77a]">
                  02
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-50">Exécution sur le terrain</div>
                  <div className="mt-1 text-sm leading-6 text-zinc-300">
                    Le livreur voit uniquement ses commandes assignées, avec progression claire et sécurisée.
                  </div>
                </div>
              </div>
            </li>

            <li className="rounded-3xl  border-white/10 bg-white/5 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl  border-[#b08d2a]/30 bg-[#b08d2a]/10 text-sm font-semibold text-[#f5d77a]">
                  03
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-50">Preuve & historique</div>
                  <div className="mt-1 text-sm leading-6 text-zinc-300">
                    Horodatage, statuts, et historique: un niveau de confiance adapté aux opérations réelles.
                  </div>
                </div>
              </div>
            </li>
          </ol>
        </div>

        <div className="rounded-3xl  border-white/10 bg-white/5 p-6">
          <div className="relative overflow-hidden rounded-2xl  border-white/10 bg-black/20">
            <div className="aspect-[16/10]">
              <img
                src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1400&q=80"
                alt="Tableau de bord et logistique"
                className="h-full w-full object-cover opacity-90"
                loading="lazy"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="text-sm font-semibold text-zinc-100">Conçu pour les équipes</div>
              <div className="mt-1 text-sm leading-6 text-zinc-300">
                Un design sobre, lisible, qui met l&apos;information au centre.
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl  border-white/10 bg-black/20 p-4">
              <div className="text-xs text-zinc-400">Sécurité</div>
              <div className="mt-1 text-sm font-semibold text-zinc-100">Rôles séparés</div>
            </div>
            <div className="rounded-2xl  border-white/10 bg-black/20 p-4">
              <div className="text-xs text-zinc-400">Déploiement</div>
              <div className="mt-1 text-sm font-semibold text-zinc-100">Prêt production</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
