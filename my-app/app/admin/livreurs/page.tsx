// app/admin/livreurs/page.tsx

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getKPILivreurs } from '@/lib/kpi/queries';

export default async function LivreursListPage() {
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

  const livreurs = await getKPILivreurs();

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
        <div className="mb-8">
          <Link href="/admin/kpi" className="text-[#b08d2a] hover:underline text-sm">
            ← Retour aux Indicateur de performances
          </Link>
          <h1 className="text-3xl font-bold mt-4">Livreurs</h1>
          <p className="text-zinc-400 mt-2">Gestion et suivi des livreurs</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Liste des livreurs</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Livreur</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Commandes livrées</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">En cours</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Taux succès</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Score moyen</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {livreurs.map((livreur) => (
                  <tr key={livreur.livreur_id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="py-4 px-4">
                      <div className="font-medium">{livreur.prenom} {livreur.nom}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                        livreur.statut_livreur === 'disponible'
                          ? 'bg-green-500/20 text-green-400'
                          : livreur.statut_livreur === 'en_livraison'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          livreur.statut_livreur === 'disponible'
                            ? 'bg-green-500'
                            : livreur.statut_livreur === 'en_livraison'
                            ? 'bg-blue-500'
                            : 'bg-gray-500'
                        }`}></div>
                        {livreur.statut_livreur.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">{livreur.total_livrees}</td>
                    <td className="py-4 px-4 text-center">{livreur.en_cours}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-zinc-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              livreur.taux_succes >= 80 ? 'bg-green-500' :
                              livreur.taux_succes >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
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
        </div>
      </div>
    </div>
  );
}
