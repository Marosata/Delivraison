'use client';

import { useEffect, useState } from 'react';
import { KPIGlobaux, KPILivreur } from '@/lib/kpi/queries';
import { createClient } from '@/lib/supabase/client';

interface AlertesKPIProps {
  kpiGlobaux: KPIGlobaux;
  livreurs: KPILivreur[];
}

interface Alerte {
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  action: string;
}

export default function AlertesKPI({ kpiGlobaux, livreurs }: AlertesKPIProps) {
  const [alertes, setAlertes] = useState<Alerte[]>([]);

  useEffect(() => {
    const checkAlertes = async () => {
      const newAlertes: Alerte[] = [];

      // Check commandes en attente non assignées > 30min
      const supabase = createClient();
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { data: enAttente } = await supabase
        .from('commandes')
        .select('id')
        .eq('statut', 'en_attente')
        .is('livreur_id', null)
        .lt('created_at', thirtyMinAgo);

      if (enAttente && enAttente.length > 5) {
        newAlertes.push({
          type: 'error',
          title: 'Commandes en attente urgentes',
          description: `${enAttente.length} commandes non assignées depuis plus de 30 minutes`,
          action: 'Lancer attribution automatique',
        });
      }

      // Check livreurs surchargés
      const surcharges = livreurs.filter(l => l.en_cours > 3);
      if (surcharges.length > 0) {
        newAlertes.push({
          type: 'warning',
          title: 'Livreurs surchargés',
          description: `${surcharges.length} livreur(s) ont plus de 3 commandes en cours`,
          action: 'Redistribuer les charges',
        });
      }

      // Check taux livraison < 70%
      if (kpiGlobaux.taux_livraison < 70 && kpiGlobaux.total_commandes > 10) {
        newAlertes.push({
          type: 'error',
          title: 'Performance faible',
          description: `Taux de livraison à ${kpiGlobaux.taux_livraison}%`,
          action: 'Analyser les causes d\'échec',
        });
      }

      // Check aucun livreur disponible
      const disponibles = livreurs.filter(l => l.statut_livreur === 'disponible').length;
      if (disponibles === 0 && kpiGlobaux.commandes_en_attente > 0) {
        newAlertes.push({
          type: 'error',
          title: 'Aucun livreur disponible',
          description: 'Tous les livreurs sont hors ligne ou en livraison',
          action: 'Contacter l\'équipe',
        });
      }

      setAlertes(newAlertes);
    };

    checkAlertes();
  }, [kpiGlobaux, livreurs]);

  if (alertes.length === 0) {
    return (
      <div className="bg-green-900/20 border border-green-800 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="text-green-400 text-xl">✅</div>
          <div>
            <h3 className="font-semibold text-green-400">Tout va bien</h3>
            <p className="text-sm text-green-300">Aucune anomalie détectée</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Alertes & Anomalies</h3>
      {alertes.map((alerte, index) => (
        <div
          key={index}
          className={`border rounded-lg p-6 ${
            alerte.type === 'error'
              ? 'bg-red-900/20 border-red-800'
              : alerte.type === 'warning'
              ? 'bg-yellow-900/20 border-yellow-800'
              : 'bg-blue-900/20 border-blue-800'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`text-xl ${
              alerte.type === 'error'
                ? 'text-red-400'
                : alerte.type === 'warning'
                ? 'text-yellow-400'
                : 'text-blue-400'
            }`}>
              {alerte.type === 'error' ? '🔴' : alerte.type === 'warning' ? '🟠' : '🔵'}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">{alerte.title}</h4>
              <p className="text-sm text-zinc-300 mb-2">{alerte.description}</p>
              <button className="text-sm text-[#b08d2a] hover:text-[#d4af37] underline">
                {alerte.action}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
