import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/admin/Sidebar';

type CommandeRow = {
  id: number;
  statut: string;
  adresse_livraison: string;
  created_at: string;
};

export default async function LivreurHistoriquePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'livreur') {
    redirect('/admin/dashboard');
  }

  const { data: commandes, error: commandesError } = await supabase
    .from('commandes')
    .select('id, statut, adresse_livraison, created_at')
    .eq('livreur_id', user.id)
    .eq('statut', 'livré')
    .order('created_at', { ascending: false })
    .returns<CommandeRow[]>();

  // Stats
  const totalAllTime = commandes?.length ?? 0;
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const totalThisMonth = commandes?.filter(c => new Date(c.created_at) >= thisMonth).length ?? 0;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex">
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">Historique des livraisons</h1>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{totalThisMonth}</div>
              <div className="text-sm text-zinc-300">Ce mois</div>
            </div>
            <div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{totalAllTime}</div>
              <div className="text-sm text-zinc-300">Total</div>
            </div>
          </div>

          <div className="space-y-4">
            {(commandes ?? []).map((c) => (
              <div key={c.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Commande N°00{String(c.id).slice(-4)}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
                    Livré
                  </span>
                </div>
                <p className="text-sm text-zinc-300 mb-2">
                  <strong>Adresse:</strong> {c.adresse_livraison}
                </p>
                <p className="text-sm text-zinc-300">
                  <strong>Date:</strong> {new Date(c.created_at).toLocaleString()}
                </p>
              </div>
            ))}
            {commandes?.length === 0 && (
              <p className="text-zinc-400">Aucune livraison terminée pour le moment.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
