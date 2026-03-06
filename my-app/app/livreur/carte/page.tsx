'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';

// Dynamic import to avoid SSR issues
const CarteLibrelivreur = dynamic(() => import('@/components/carte/CarteLibrelivreur'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center">Chargement de la carte...</div>
});

type Commande = {
  id: number;
  adresse_livraison: string;
  statut: string;
  gps_lat: number;
  gps_lng: number;
};

export default function LivreurCartePage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Fetch assigned orders
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: commandesData } = await supabase
        .from('commandes')
        .select('id, adresse_livraison, statut, gps_lat, gps_lng')
        .eq('livreur_id', user.user.id)
        .in('statut', ['en_attente', 'en_cours']);

      setCommandes(commandesData ?? []);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-zinc-100 flex">
        <main className="flex-1 flex items-center justify-center">
          Chargement...
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex">
      <main className="flex-1 flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Ma carte</h1>
          <div className="flex items-center gap-2">
            <div className="text-sm text-zinc-400">
              Position partagée
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="flex-1 relative">
          <CarteLibrelivreur commandes={commandes} />
        </div>
      </main>
    </div>
  );
}
