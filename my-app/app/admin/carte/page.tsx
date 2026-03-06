'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';

// Dynamic import to avoid SSR issues
const CarteAdmin = dynamic(() => import('@/components/carte/CarteAdmin'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center">Chargement de la carte...</div>
});

type Livreur = {
  id: string;
  prenom: string;
  nom: string;
  disponible: boolean;
  statut_livreur: string;
  lat: number;
  lng: number;
};

type Commande = {
  id: number;
  adresse_livraison: string;
  statut: string;
  gps_lat: number;
  gps_lng: number;
  livreur_id: string | null;
};

export default function AdminCartePage() {
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Fetch active delivery drivers
      const { data: livreursData } = await supabase
        .from('profiles')
        .select('id, prenom, nom, disponible, statut_livreur')
        .eq('role', 'livreur')
        .returns<Omit<Livreur, 'lat' | 'lng'>[]>();

      // For demo, assign random locations in Madagascar area
      const livreursWithLocation: Livreur[] = (livreursData ?? []).map((l, index) => ({
        ...l,
        lat: -18.9154 + (Math.random() - 0.5) * 0.1, // Random around Antananarivo, Madagascar
        lng: 47.5256 + (Math.random() - 0.5) * 0.1,
      }));

      // Fetch all orders
      const { data: commandesData } = await supabase
        .from('commandes')
        .select('id, adresse_livraison, statut, gps_lat, gps_lng, livreur_id')
        .returns<Commande[]>();

      setLivreurs(livreursWithLocation);
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
        <div className="p-4 border-b border-white/10">
          <h1 className="text-2xl font-semibold">Carte globale</h1>
          <p className="text-zinc-400">Vue d'ensemble des livreurs et commandes</p>
        </div>
        <div className="flex-1 relative">
          <CarteAdmin livreurs={livreurs} commandes={commandes} />
        </div>
      </main>
    </div>
  );
}
