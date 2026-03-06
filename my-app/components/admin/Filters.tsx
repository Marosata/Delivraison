'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type FiltersProps = {
  currentSearch: string;
  currentStatus: string;
  currentLivreur: string;
  livreurs: Array<{ id: string; nom: string; prenom: string }>;
};

export default function Filters({ currentSearch, currentStatus, currentLivreur, livreurs }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  const resetFilters = () => {
    router.push('?');
  };

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-4">
      <input
        type="text"
        placeholder="Rechercher par adresse"
        defaultValue={currentSearch}
        onChange={(e) => updateQuery('search', e.target.value)}
        className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100"
      />
      <select
        value={currentStatus}
        onChange={(e) => updateQuery('status', e.target.value)}
        className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100"
      >
        <option value="">Tous statuts</option>
        <option value="en_attente">En attente</option>
        <option value="en_cours">En cours</option>
        <option value="livré">Livré</option>
        <option value="annulé">Annulé</option>
      </select>
      <select
        value={currentLivreur}
        onChange={(e) => updateQuery('livreur', e.target.value)}
        className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100"
      >
        <option value="">Tous livreurs</option>
        {livreurs.map((l) => (
          <option key={l.id} value={l.id}>
            {l.prenom} {l.nom}
          </option>
        ))}
      </select>
      <button
        onClick={resetFilters}
        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100"
      >
        Réinitialiser
      </button>
    </div>
  );
}
