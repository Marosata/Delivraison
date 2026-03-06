'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Livreur = {
  id: string;
  prenom: string;
  nom: string;
  disponible: boolean;
  statut_livreur: string;
};

type ListeLivreursDisponiblesProps = {
  onSelect?: (livreurId: string) => void;
  selectedId?: string;
};

export default function ListeLivreursDisponibles({ onSelect, selectedId }: ListeLivreursDisponiblesProps) {
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    const fetchLivreurs = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, prenom, nom, disponible, statut_livreur')
        .eq('role', 'livreur')
        .order('prenom');

      setLivreurs(data ?? []);
    };

    fetchLivreurs();

    // Subscribe to changes
    const channel = supabase
      .channel('livreurs_status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `role=eq.livreur`,
        },
        (payload) => {
          console.log('Realtime livreur update:', payload);
          fetchLivreurs(); // Refetch on change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'disponible':
        return { emoji: '🟢', label: 'Disponible' };
      case 'en_livraison':
        return { emoji: '🟡', label: 'En livraison' };
      case 'hors_ligne':
        return { emoji: '🔴', label: 'Hors ligne' };
      default:
        return { emoji: '⚪', label: 'Inconnu' };
    }
  };

  return (
    <div className="space-y-2">
      {livreurs.map((l) => {
        const { emoji, label } = getStatusBadge(l.statut_livreur);
        return (
          <div
            key={l.id}
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedId === l.id
                ? 'bg-blue-500/20 border-blue-500'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
            onClick={() => onSelect?.(l.id)}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{emoji}</span>
              <div>
                <div className="font-medium">{l.prenom} {l.nom}</div>
                <div className="text-sm text-zinc-400">{label}</div>
              </div>
            </div>
            {l.disponible && <span className="text-green-400 text-sm">✓ Disponible</span>}
          </div>
        );
      })}
      {livreurs.length === 0 && (
        <div className="text-zinc-400 text-sm">Aucun livreur trouvé.</div>
      )}
    </div>
  );
}
