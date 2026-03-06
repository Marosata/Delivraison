'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type CommandesRealtimeCounterProps = {
  userId: string;
};

export default function CommandesRealtimeCounter({ userId }: CommandesRealtimeCounterProps) {
  const [counts, setCounts] = useState({ en_attente: 0, en_cours: 0 });

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    const fetchCounts = async () => {
      const { data } = await supabase
        .from('commandes')
        .select('statut')
        .eq('livreur_id', userId);

      const newCounts = { en_attente: 0, en_cours: 0 };
      data?.forEach(c => {
        if (c.statut === 'en_attente') newCounts.en_attente++;
        if (c.statut === 'en_cours') newCounts.en_cours++;
      });
      setCounts(newCounts);
    };

    fetchCounts();

    // Subscribe to changes
    const channel = supabase
      .channel('commandes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'commandes',
          filter: `livreur_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Realtime update:', payload);
          fetchCounts(); // Refetch counts on change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center">
        <div className="text-2xl font-bold text-yellow-400">{counts.en_attente}</div>
        <div className="text-sm text-zinc-300">En attente</div>
      </div>
      <div className="rounded-3xl border border-blue-500/30 bg-blue-500/10 p-4 text-center">
        <div className="text-2xl font-bold text-blue-400">{counts.en_cours}</div>
        <div className="text-sm text-zinc-300">En cours</div>
      </div>
    </div>
  );
}
