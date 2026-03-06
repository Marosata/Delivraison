import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/admin/Sidebar';
import StatusBadge from '@/components/admin/StatusBadge';
import DeliveryMap from '@/components/livreur/DeliveryMap';
import { updateStatutCommandeAction } from '@/app/livreur/actions';

type PageProps = {
  params: { id: string };
};

export default async function LivreurCommandeDetailPage({ params }: PageProps) {
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

  const commandeId = parseInt(params.id, 10);
  if (isNaN(commandeId)) {
    notFound();
  }

  const { data: commande } = await supabase
    .from('commandes')
    .select('id, statut, adresse_livraison, gps_lat, gps_lng, created_at, notes')
    .eq('id', commandeId)
    .eq('livreur_id', user.id)
    .single();

  if (!commande) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex">
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Détail commande</h1>
            <p className="text-zinc-400">N°00{String(commande.id).slice(-4)}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold mb-4">Informations</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Adresse:</strong> {commande.adresse_livraison}
                </div>
                <div>
                  <strong>Statut:</strong> <StatusBadge status={commande.statut} />
                </div>
                <div>
                  <strong>Date:</strong> {new Date(commande.created_at).toLocaleString()}
                </div>
                {commande.notes && (
                  <div>
                    <strong>Instructions:</strong> {commande.notes}
                  </div>
                )}
                <div>
                  <strong>Coordonnées:</strong> {commande.gps_lat ?? 'N/A'}, {commande.gps_lng ?? 'N/A'}
                </div>
              </div>

              <div className="mt-6">
                {commande.statut === 'en_attente' && (
                  <form action={async () => {
                    'use server';
                    await updateStatutCommandeAction(commande.id, 'en_cours');
                  }}>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                      Accepter la commande
                    </button>
                  </form>
                )}
                {commande.statut === 'en_cours' && (
                  <form action={async () => {
                    'use server';
                    await updateStatutCommandeAction(commande.id, 'livré');
                  }}>
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                      Marquer comme livré
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold mb-4">Itinéraire</h3>
              <DeliveryMap adresse={commande.adresse_livraison} lat={commande.gps_lat} lng={commande.gps_lng} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
