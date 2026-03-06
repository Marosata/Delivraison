import { redirect } from 'next/navigation';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { getKPIGlobaux } from '@/lib/kpi/queries';
import WelcomeBanner from '@/components/WelcomeBanner';
import KPICard from '@/components/admin/KPICard';
import StatusBadge from '@/components/admin/StatusBadge';
import ListeLivreursDisponibles from '@/components/admin/ListeLivreursDisponibles';

type CommandeRow = {
  id: string;
  statut: string | null;
  adresse_livraison: string | null;
  livreur_id: string | null;
  created_at: string | null;
};

type Stats = {
  en_attente: number;
  en_cours: number;
  livrees_today: number;
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect('/auth/login');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('prenom, email, role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    redirect('/livreur/dashboard');
  }

  // Fetch KPI data
  const [kpiToday, kpiYesterday] = await Promise.all([
    getKPIGlobaux('jour'),
    // For variation, we can use semaine as approximation for previous
    getKPIGlobaux('semaine'),
  ]);

  const { data: commandes, error: commandesError } = await supabase
    .from('commandes')
    .select('id, statut, adresse_livraison, livreur_id, created_at')
    .order('created_at', { ascending: false })
    .limit(10)
    .returns<CommandeRow[]>();

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex">
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <WelcomeBanner prenom={profile?.prenom ?? null} role="admin" email={profile?.email ?? user.email ?? null} />

          {/* KPI Mini-cards */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Aperçu des performances</h2>
              <Link href="/admin/kpi" className="text-[#b08d2a] hover:text-[#d4af37] text-sm underline">
                Voir tous les Indicateur de performances →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <KPICard
                title="Total commandes"
                value={kpiToday.total_commandes}
                previous={kpiYesterday.total_commandes}
                icon="📦"
              />
              <KPICard
                title="En cours"
                value={kpiToday.commandes_en_cours}
                previous={kpiYesterday.commandes_en_cours}
                icon="⚡"
                live
              />
              <KPICard
                title="Livrées"
                value={kpiToday.commandes_livrees}
                previous={kpiYesterday.commandes_livrees}
                icon="✅"
              />
              <KPICard
                title="Taux livraison"
                value={`${kpiToday.taux_livraison}%`}
                previous={`${kpiYesterday.taux_livraison}%`}
                icon="📈"
                isPercentage
              />
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Recent Commands */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold mb-4">Commandes récentes</h3>
              <div className="space-y-3">
                {(commandes ?? []).map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{c.adresse_livraison ?? '-'}</div>
                      <div className="text-xs text-zinc-400">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}
                      </div>
                    </div>
                    <StatusBadge status={c.statut} />
                  </div>
                ))}
                {commandes?.length === 0 && (
                  <div className="text-zinc-400 text-sm">Aucune commande récente.</div>
                )}
              </div>
            </div>

            {/* Active Delivery Drivers */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold mb-4">Livreurs actifs</h3>
              <ListeLivreursDisponibles />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
