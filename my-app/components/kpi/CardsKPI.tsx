'use client';

import { KPIGlobaux } from '@/lib/kpi/queries';

interface CardsKPIProps {
  data: KPIGlobaux;
  previous: KPIGlobaux;
  periode: 'jour' | 'semaine' | 'mois';
}

export default function CardsKPI({ data, previous, periode }: CardsKPIProps) {
  const calculateVariation = (current: number, prev: number) => {
    if (prev === 0) return 0;
    return Math.round(((current - prev) / prev) * 100);
  };

  const cards = [
    {
      title: 'Total commandes',
      value: data.total_commandes,
      variation: calculateVariation(data.total_commandes, previous.total_commandes),
      icon: '📦',
    },
    {
      title: 'En cours',
      value: data.commandes_en_cours,
      variation: calculateVariation(data.commandes_en_cours, previous.commandes_en_cours),
      icon: '⚡',
      live: true,
    },
    {
      title: 'Livrées',
      value: data.commandes_livrees,
      variation: calculateVariation(data.commandes_livrees, previous.commandes_livrees),
      icon: '✅',
    },
    {
      title: 'Taux livraison',
      value: `${data.taux_livraison}%`,
      variation: calculateVariation(data.taux_livraison, previous.taux_livraison),
      icon: '📈',
      progress: data.taux_livraison,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">{card.icon}</div>
            {card.live && (
              <div className="flex items-center gap-1 text-xs text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Live
              </div>
            )}
          </div>

          <div className="mb-2">
            <div className="text-3xl font-bold">{card.value}</div>
            <div className="text-sm text-zinc-400">{card.title}</div>
          </div>

          {card.progress !== undefined && (
            <div className="mb-3">
              <div className="w-full bg-zinc-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${card.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {card.variation !== 0 && (
            <div className={`flex items-center gap-1 text-xs ${
              card.variation > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              <span>{card.variation > 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(card.variation)}%</span>
              <span className="text-zinc-500">vs période précédente</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
