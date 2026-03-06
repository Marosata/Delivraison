import { redirect } from 'next/navigation';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import StatusBadge from '@/components/admin/StatusBadge';
import DisponibiliteToggle from '@/components/livreur/DisponibiliteToggle';
import Sidebar from '@/components/admin/Sidebar';
import { updateStatutCommandeAction } from '@/app/livreur/actions';

type CommandeRow = {
  id: number;
  statut: string;
  adresse_livraison: string;
  gps_lat: number | null;
  gps_lng: number | null;
  created_at: string;
  notes: string | null;
};

export default async function LivreurCommandesPage() {
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
    .select('role, disponible, statut_livreur')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'livreur') {
    redirect('/admin/dashboard');
  }

  const { data: commandes, error: commandesError } = await supabase
    .from('commandes')
    .select('id, statut, adresse_livraison, gps_lat, gps_lng, created_at, notes')
    .eq('livreur_id', user.id)
    .order('created_at', { ascending: false })
    .returns<CommandeRow[]>();

  const hasEnCoursCommand = (commandes ?? []).some(c => c.statut === 'en_cours');

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex">
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <DisponibiliteToggle
              initialDisponible={profile.disponible}
              initialStatut={profile.statut_livreur}
              hasEnCoursCommand={hasEnCoursCommand}
            />
          </div>

          <h1 className="text-2xl font-semibold mb-6">Mes commandes</h1>

          <div className="space-y-4">
            {(commandes ?? []).map((c) => (
              <div key={c.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Commande N°00{String(c.id).slice(-4)}</h3>
                  <StatusBadge status={c.statut} />
                </div>
                <p className="text-sm text-zinc-300 mb-2">
                  <strong>Adresse:</strong> {c.adresse_livraison}
                </p>
                <p className="text-sm text-zinc-300 mb-4">
                  <strong>Date:</strong> {new Date(c.created_at).toLocaleString()}
                </p>
                {c.notes && (
                  <p className="text-sm text-zinc-300 mb-4">
                    <strong>Notes:</strong> {c.notes}
                  </p>
                )}
                <div className="flex gap-3">
                  <Link href={`/livreur/commandes/${c.id}`} className="text-[#b08d2a] hover:underline text-sm">
                    Voir détails
                  </Link>
                  {c.statut === 'en_attente' && (
                    <form action={async () => {
                      'use server';
                      await updateStatutCommandeAction(c.id, 'en_cours');
                    }}>
                      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                        Accepter
                      </button>
                    </form>
                  )}
                  {c.statut === 'en_cours' && (
                    <form action={async () => {
                      'use server';
                      await updateStatutCommandeAction(c.id, 'livré');
                    }}>
                      <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
                        Marquer livré
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
            {commandes?.length === 0 && (
              <p className="text-zinc-400">Aucune commande assignée pour le moment.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
