'use client';

import { useState, useEffect } from 'react';
import { updateDisponibiliteAction } from '@/app/livreur/actions';

type DisponibiliteToggleProps = {
  initialDisponible: boolean;
  initialStatut: string;
  hasEnCoursCommand: boolean;
};

export default function DisponibiliteToggle({ initialDisponible, initialStatut, hasEnCoursCommand }: DisponibiliteToggleProps) {
  const [disponible, setDisponible] = useState(initialDisponible);
  const [statut, setStatut] = useState(initialStatut);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    if (loading) return;

    // Vérifier si on peut passer hors ligne
    if (disponible && hasEnCoursCommand) {
      setError("Terminez votre livraison en cours d'abord");
      return;
    }

    setLoading(true);
    setError(null);

    const newDisponible = !disponible;
    const result = await updateDisponibiliteAction(newDisponible);

    if (result.ok) {
      setDisponible(newDisponible);
      setStatut(newDisponible ? 'disponible' : 'hors_ligne');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const getBadge = () => {
    if (statut === 'en_livraison') {
      return { label: 'En livraison', bg: 'bg-blue-500', text: 'text-white' };
    } else if (disponible) {
      return { label: 'En service', bg: 'bg-green-500', text: 'text-white' };
    } else {
      return { label: 'Hors ligne', bg: 'bg-red-500', text: 'text-white' };
    }
  };

  const badge = getBadge();

  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-zinc-100">Disponibilité</label>
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            disponible ? 'bg-green-500' : 'bg-gray-600'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              disponible ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </div>

      {error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}
    </div>
  );
}
