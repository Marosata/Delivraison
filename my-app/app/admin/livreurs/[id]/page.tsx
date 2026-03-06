// app/admin/livreurs/[id]/page.tsx

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getKPILivreurs, getEvolutionCommandes } from '@/lib/kpi/queries';
import StatusBadge from '@/components/admin/StatusBadge';
import GraphiqueEvolution from '@/components/kpi/GraphiqueEvolution';

type PageProps = {
  params: {
    id: string;
  };
};

export default async function LivreurDetailPage({ params }: PageProps) {
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

  if (profile?.role !== 'admin') {
    redirect('/admin/dashboard');
  }

  // Fetch livreur profile
  const { data: livreur } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!livreur) {
    redirect('/admin/kpi');
  }

  // Fetch his commands
  const { data: commandes } = await supabase
    .from('commandes')
    .select(`
      id,
      statut,
      created_at,
      adresse_livraison,
      score_attribution,
      attribution_mode
    `)
    .eq('livreur_id', params.id)
    .order('created_at', { ascending: false })
    .limit(20);

  // Get his KPI
  const livreursKPI = await getKPILivreurs();
  const livreurKPI = livreursKPI.find(l => l.livreur_id === params.id);

  // Evolution for this livreur (last 30 days)
  const evolutionData = await getEvolutionCommandes(30);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <div className="mb-6">
          <Link href="/admin/kpi" className="text-[#b08d2a] hover:underline text-sm">
            ← ← Retour aux Indicateur de performances
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">{livreur.prenom} {livreur.nom}</h1>
          <p className="text-zinc-400 mt-2">Détail du livreur</p>
        </div>

        {/* Profil et KPI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Informations</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-zinc-400">Email</div>
                  <div>{livreur.email}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Statut</div>
                  <div className="capitalize">{livreur.statut_livreur.replace('_', ' ')}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Disponibilité</div>
                  <div>{livreur.disponible ? 'Disponible' : 'Indisponible'}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Dernière activité</div>
                  <div>{livreur.derniere_activite ? new Date(livreur.derniere_activite).toLocaleString() : 'Jamais'}</div>
                </div>
                <div className="pt-4">
                  <form action={async () => {
                    'use server';
                    const supabase = await createClient();
                    await supabase
                      .from('profiles')
                      .update({ disponible: false })
                      .eq('id', params.id);
                  }}>
                    <button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-semibold"
                    >
                      Désactiver ce livreur
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Performances</h3>
              {livreurKPI && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{livreurKPI.total_livrees}</div>
                    <div className="text-sm text-zinc-400">Commandes livrées</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{livreurKPI.en_cours}</div>
                    <div className="text-sm text-zinc-400">En cours</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{livreurKPI.taux_succes}%</div>
                    <div className="text-sm text-zinc-400">Taux de succès</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{livreurKPI.score_moyen}</div>
                    <div className="text-sm text-zinc-400">Score moyen</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Graphique évolution */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Évolution des livraisons (30 jours)</h3>
          <GraphiqueEvolution data={evolutionData} />
        </div>

        {/* Historique commandes */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Historique des commandes (20 dernières)</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Adresse</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Score</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Mode</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {(commandes ?? []).map((cmd) => (
                  <tr key={cmd.id} className="border-b border-zinc-800">
                    <td className="py-3 px-4 font-mono text-sm">{cmd.id}</td>
                    <td className="py-3 px-4">{cmd.adresse_livraison}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={cmd.statut} />
                    </td>
                    <td className="py-3 px-4">{cmd.score_attribution || '-'}</td>
                    <td className="py-3 px-4 text-sm">
                      {cmd.attribution_mode === 'automatique' ? '🤖 Auto' : 'Manuel'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(cmd.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
