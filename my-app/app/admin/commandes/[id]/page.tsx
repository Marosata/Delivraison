import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import StatusBadge from '@/components/admin/StatusBadge';
import { changeStatusAction } from '@/app/admin/commandes/actions';

type PageProps = {
  params: { id: string };
};

type HistoriqueRow = {
  ancien_statut: string | null;
  nouveau_statut: string;
  changed_at: string;
  changed_by_nom: string | null;
};

export default async function DetailCommandePage({ params }: PageProps) {
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
    redirect('/livreur/dashboard');
  }

  const { data: commande } = await supabase
    .from('commandes')
    .select(`
      id, adresse_livraison, gps_lat, gps_lng, statut, livreur_id, created_at,
      profiles:livreur_id (nom, prenom)
    `)
    .eq('id', params.id)
    .single();

  if (!commande) {
    notFound();
  }

  const { data: historiqueRaw } = await supabase
    .from('commande_historique')
    .select(`
      ancien_statut, nouveau_statut, changed_at, changed_by,
      profiles:changed_by (nom, prenom)
    `)
    .eq('commande_id', params.id)
    .order('changed_at', { ascending: false });

  const historique: HistoriqueRow[] = (historiqueRaw ?? []).map((h) => ({
    ...h,
    changed_by_nom: h.profiles?.nom && h.profiles?.prenom ? `${h.profiles.prenom} ${h.profiles.nom}` : null,
  }));

  const mapsLink = commande.gps_lat && commande.gps_lng
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${commande.gps_lat},${commande.gps_lng}`)}`
    : null;

  const livreurNom = commande.profiles?.nom && commande.profiles?.prenom
    ? `${commande.profiles.prenom} ${commande.profiles.nom}`
    : 'Non assigné';

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Détail commande</h1>
            <p className="mt-1 text-sm text-zinc-400 font-mono text-xs">{commande.id}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/commandes" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
              Retour liste
            </Link>
            <Link href={`/admin/commandes/${commande.id}/modifier`} className="rounded-full bg-[#b08d2a] px-4 py-2 text-sm font-semibold text-black">
              Modifier
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Informations</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <span className="text-zinc-400">Adresse:</span> {commande.adresse_livraison}
              </div>
              <div>
                <span className="text-zinc-400">Statut:</span> <StatusBadge status={commande.statut} />
              </div>
              <div>
                <span className="text-zinc-400">Livreur:</span> {livreurNom}
              </div>
              <div>
                <span className="text-zinc-400">Coordonnées:</span> {commande.gps_lat}, {commande.gps_lng}
              </div>
              <div>
                <span className="text-zinc-400">Créée le:</span> {new Date(commande.created_at).toLocaleString()}
              </div>
              {mapsLink && (
                <div>
                  <a href={mapsLink} target="_blank" rel="noreferrer" className="text-[#b08d2a] hover:underline">
                    Ouvrir dans Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Changer statut</h3>
            <form action={async (formData: FormData) => {
              'use server';
              const newStatus = formData.get('status') as string;
              await changeStatusAction(commande.id, newStatus);
            }} className="mt-4 space-y-3">
              <select
                name="status"
                defaultValue={commande.statut}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100"
              >
                <option value="en_attente">En attente</option>
                <option value="en_cours">En cours</option>
                <option value="livré">Livré</option>
                <option value="annulé">Annulé</option>
              </select>
              <button type="submit" className="w-full rounded-xl bg-[#b08d2a] px-4 py-2 text-sm font-semibold text-black">
                Changer statut
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold">Historique des statuts</h3>
          <div className="mt-4 space-y-2">
            {historique.map((h, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                <div>
                  <span className="text-zinc-400">De</span> <StatusBadge status={h.ancien_statut} />
                  <span className="text-zinc-400 mx-2">à</span> <StatusBadge status={h.nouveau_statut} />
                </div>
                <div className="text-xs text-zinc-400">
                  {new Date(h.changed_at).toLocaleString()} par {h.changed_by_nom || 'Système'}
                </div>
              </div>
            ))}
            {historique.length === 0 && (
              <div className="text-sm text-zinc-400">Aucun changement de statut enregistré.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
