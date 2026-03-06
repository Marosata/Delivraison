'use client';

import { useActionState, useState } from 'react';

import { createCommandeAction, updateCommandeAction } from '@/app/admin/commandes/actions';

type LivreursOption = {
  id: string;
  prenom: string;
  nom: string;
};

type CommandFormProps = {
  initialData?: {
    id?: string;
    adresse_livraison: string;
    gps_lat: number;
    gps_lng: number;
    statut: string;
    livreur_id: string | null;
  };
  livreurs: LivreursOption[];
};

const initialState = { ok: false, message: '' };

export default function CommandForm({ initialData, livreurs }: CommandFormProps) {
  const [isEditing] = useState(!!initialData?.id);
  const action = async (state: typeof initialState, payload: FormData) => {
    return isEditing ? updateCommandeAction(payload) : createCommandeAction(payload);
  };
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

      <div>
        <label className="block text-sm font-medium text-zinc-300">Adresse de livraison</label>
        <input
          name="adresse_livraison"
          required
          defaultValue={initialData?.adresse_livraison || ''}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300">Latitude</label>
          <input
            name="gps_lat"
            type="number"
            step="any"
            required
            defaultValue={initialData?.gps_lat || ''}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300">Longitude</label>
          <input
            name="gps_lng"
            type="number"
            step="any"
            required
            defaultValue={initialData?.gps_lng || ''}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300">Statut</label>
        <select
          name="statut"
          defaultValue={initialData?.statut || 'en_attente'}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100"
        >
          <option value="en_attente">En attente</option>
          <option value="en_cours">En cours</option>
          <option value="livré">Livré</option>
          <option value="annulé">Annulé</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300">Livreur assigné</label>
        <select
          name="livreur_id"
          defaultValue={initialData?.livreur_id || ''}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100"
        >
          <option value="">Aucun</option>
          {livreurs.map((l) => (
            <option key={l.id} value={l.id}>
              {l.prenom} {l.nom}
            </option>
          ))}
        </select>
      </div>

      {state.message && (
        <div className={`rounded-2xl p-3 text-sm ${state.ok ? 'bg-green-500/10 text-green-100' : 'bg-red-500/10 text-red-100'}`}>
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[#b08d2a] px-4 py-2 text-sm font-semibold text-black hover:bg-[#c19b32] disabled:opacity-50"
      >
        {pending ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Créer')}
      </button>
    </form>
  );
}
