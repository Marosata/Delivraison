'use client';

import Link from 'next/link';
import { KPILivreur } from '@/lib/kpi/queries';

interface TableauLivreursProps {
  data: KPILivreur[];
}

export default function TableauLivreurs({ data }: TableauLivreursProps) {
  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'disponible':
        return 'bg-green-500';
      case 'en_livraison':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTauxColor = (taux: number) => {
    if (taux >= 80) return 'bg-green-500';
    if (taux >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-700">
            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Livreur</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Livrées</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">En cours</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Taux succès</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Score moyen</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((livreur) => (
            <tr key={livreur.livreur_id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatutColor(livreur.statut_livreur)}`}></div>
                  <div>
                    <div className="font-medium">{livreur.prenom} {livreur.nom}</div>
                    <div className="text-xs text-zinc-500 capitalize">{livreur.statut_livreur.replace('_', ' ')}</div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 text-center">{livreur.total_livrees}</td>
              <td className="py-4 px-4 text-center">{livreur.en_cours}</td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-zinc-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getTauxColor(livreur.taux_succes)}`}
                      style={{ width: `${livreur.taux_succes}%` }}
                    ></div>
                  </div>
                  <span className="text-sm">{livreur.taux_succes}%</span>
                </div>
              </td>
              <td className="py-4 px-4 text-center">
                {livreur.score_moyen > 0 ? `${livreur.score_moyen}/100` : '-'}
              </td>
              <td className="py-4 px-4">
                <Link
                  href={`/admin/livreurs/${livreur.livreur_id}`}
                  className="text-[#b08d2a] hover:text-[#d4af37] text-sm underline"
                >
                  Voir détail
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
