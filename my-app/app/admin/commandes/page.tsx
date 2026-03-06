import { redirect } from 'next/navigation';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import StatusBadge from '@/components/admin/StatusBadge';
import DeleteButton from '@/components/admin/DeleteButton';
import Filters from '@/components/admin/Filters';
import Pagination from '@/components/admin/Pagination';
import { attribuerCommandeAuto, attribuerToutesCommandesEnAttente } from '@/lib/actions/attribution';

type CommandeWithLivreur = {
  id: string;
  adresse_livraison: string;
  statut: string;
  livreur_id: string | null;
  created_at: string;
  livreur_nom: string | null;
  score_attribution: number | null;
  attribution_mode: string;
};

type PageProps = {
  searchParams: {
    page?: string;
    status?: string;
    livreur?: string;
    search?: string;
  };
};

export default async function AdminCommandesPage({ searchParams }: PageProps) {
  const supabase = await createClient();

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const statusFilter = resolvedSearchParams.status || '';
  const livreurFilter = resolvedSearchParams.livreur || '';
  const search = resolvedSearchParams.search || '';
  const perPage = 10;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from('commandes')
    .select(`
      id,
      adresse_livraison,
      statut,
      livreur_id,
      created_at,
      score_attribution,
      attribution_mode,
      profiles:livreur_id (
        prenom,
        nom
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  if (statusFilter) {
    query = query.eq('statut', statusFilter);
  }

  if (livreurFilter) {
    query = query.eq('livreur_id', livreurFilter);
  }

  if (search) {
    query = query.ilike('adresse_livraison', `%${search}%`);
  }

  const { data: commandesRaw, error: commandesError } = await query;
  const commandes: CommandeWithLivreur[] = (commandesRaw ?? []).map((c) => ({
    ...c,
    livreur_nom: (c.profiles as unknown as {nom: string, prenom: string} | null)?.nom && (c.profiles as unknown as {nom: string, prenom: string} | null)?.prenom ? `${(c.profiles as unknown as {nom: string, prenom: string}).prenom} ${(c.profiles as unknown as {nom: string, prenom: string}).nom}` : null,
  }));

  // Comptage total pour pagination
  let countQuery = supabase.from('commandes').select('*', { count: 'exact', head: true });
  if (statusFilter) countQuery = countQuery.eq('statut', statusFilter);
  if (livreurFilter) countQuery = countQuery.eq('livreur_id', livreurFilter);
  if (search) countQuery = countQuery.ilike('adresse_livraison', `%${search}%`);

  const { count } = await countQuery;
  const totalPages = Math.ceil((count || 0) / perPage);

  // Liste livreurs pour filtre
  const { data: livreurs } = await supabase
    .from('profiles')
    .select('id, nom, prenom')
    .eq('role', 'livreur')
    .order('nom');

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Gestion des commandes</h1>
          <Link href="/admin/commandes/nouvelle" className="rounded-full bg-[#b08d2a] px-4 py-2 text-sm font-semibold text-black">
            Nouvelle commande
          </Link>
        </div>

        <Filters currentSearch={search} currentStatus={statusFilter} currentLivreur={livreurFilter} livreurs={livreurs ?? []} />

        <div className="mb-4 flex gap-4">
          <form action={async () => {
            'use server';
            await attribuerToutesCommandesEnAttente();
          }}>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-semibold">
              ⚡ Attribuer automatiquement toutes les commandes
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs text-zinc-400">
                <th className="border-b border-white/10 px-3 py-2">ID</th>
                <th className="border-b border-white/10 px-3 py-2">Adresse</th>
                <th className="border-b border-white/10 px-3 py-2">Statut</th>
                <th className="border-b border-white/10 px-3 py-2">Livreur</th>
                <th className="border-b border-white/10 px-3 py-2">Score</th>
                <th className="border-b border-white/10 px-3 py-2">Mode</th>
                <th className="border-b border-white/10 px-3 py-2">Date</th>
                <th className="border-b border-white/10 px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(commandes ?? []).map((c) => (
                <tr key={c.id}>
                  <td className="border-b border-white/10 px-3 py-2 font-mono text-xs">{c.id}</td>
                  <td className="border-b border-white/10 px-3 py-2">{c.adresse_livraison}</td>
                  <td className="border-b border-white/10 px-3 py-2">
                    <StatusBadge status={c.statut} />
                  </td>
                  <td className="border-b border-white/10 px-3 py-2">{c.livreur_nom || 'Non assigné'}</td>
                  <td className="border-b border-white/10 px-3 py-2 text-xs">
                    {c.score_attribution !== null ? `${c.score_attribution}/100` : '-'}
                  </td>
                  <td className="border-b border-white/10 px-3 py-2 text-xs">
                    {c.attribution_mode === 'automatique' ? '🤖 Auto' : 'Manuel'}
                  </td>
                  <td className="border-b border-white/10 px-3 py-2 text-xs">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="border-b border-white/10 px-3 py-2">
                    <div className="flex gap-2">
                      <Link href={`/admin/commandes/${c.id}`} className="text-[#b08d2a] hover:underline text-xs">
                        Voir
                      </Link>
                      <Link href={`/admin/commandes/${c.id}/modifier`} className="text-blue-400 hover:underline text-xs">
                        Modifier
                      </Link>
                      {c.statut === 'en_attente' && !c.livreur_id && (
                        <form action={async () => {
                          'use server';
                          await attribuerCommandeAuto(c.id);
                        }}>
                          <button type="submit" className="text-green-400 hover:underline text-xs">
                            🤖 Auto
                          </button>
                        </form>
                      )}
                      <DeleteButton commandeId={c.id} adresse={c.adresse_livraison} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination currentPage={page} totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
  );
}
