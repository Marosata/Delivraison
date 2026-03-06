import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import WelcomeBanner from '@/components/WelcomeBanner';
import DisponibiliteToggle from '@/components/livreur/DisponibiliteToggle';
import CommandesRealtimeCounter from '@/components/livreur/CommandesRealtimeCounter';

type CommandeRow = {
  id: string;
  statut: string | null;
  adresse_livraison: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  created_at: string | null;
};

function googleMapsLink(lat: number | null, lng: number | null): string | null {
  if (lat == null || lng == null) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`;
}

export default async function LivreurDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log('[livreur][dashboard] load', { hasUser: !!user, userError });

  if (!user || userError) {
    redirect('/auth/login');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('prenom, email, role, disponible, statut_livreur')
    .eq('id', user.id)
    .single();

  console.log('[livreur][dashboard] profile', { userId: user.id, profile, profileError });

  if (profileError || profile?.role !== 'livreur') {
    redirect('/admin/dashboard');
  }

  const { data: commandes, error: commandesError } = await supabase
    .from('commandes')
    .select('id, statut, adresse_livraison, gps_lat, gps_lng, created_at')
    .eq('livreur_id', user.id)
    .order('created_at', { ascending: false })
    .returns<CommandeRow[]>();

  const hasEnCoursCommand = (commandes ?? []).some(c => c.statut === 'en_cours');

  console.log('[livreur][dashboard] commandes', { count: commandes?.length ?? 0, commandesError });

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex">
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <WelcomeBanner prenom={profile?.prenom ?? null} role="livreur" email={profile?.email ?? user.email ?? null} />
          <div className="mt-8">
            <DisponibiliteToggle
              initialDisponible={profile.disponible}
              initialStatut={profile.statut_livreur}
              hasEnCoursCommand={hasEnCoursCommand}
            />
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Statut des commandes</h2>
            <CommandesRealtimeCounter userId={user.id} />
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Mes commandes assignées</h2>
            <div className="space-y-4">
              {(commandes ?? []).map((c) => (
                <div key={c.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Commande - N°00 {String(c.id).slice(0, 8)}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      c.statut === 'en_attente' ? 'bg-yellow-500 text-black' :
                      c.statut === 'en_cours' ? 'bg-blue-500 text-white' :
                      c.statut === 'livré' ? 'bg-green-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {c.statut === 'en_attente' ? 'En attente' :
                       c.statut === 'en_cours' ? 'En cours' :
                       c.statut === 'livré' ? 'Livré' : 'Annulé'}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 mb-2">
                    <strong>Adresse:</strong> {c.adresse_livraison ?? '-'}
                  </p>
                  <p className="text-sm text-zinc-300 mb-4">
                    <strong>Date:</strong> {c.created_at ? new Date(c.created_at).toLocaleString() : '-'}
                  </p>
                  {c.gps_lat && c.gps_lng && (
                    <a
                      href={`https://www.google.com/maps?q=${encodeURIComponent(`${c.gps_lat},${c.gps_lng}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-4 py-2 rounded-full bg-[#b08d2a] text-black text-sm font-semibold hover:bg-[#c19b32]"
                    >
                      Ouvrir dans Google Maps
                    </a>
                  )}
                </div>
              ))}
              {commandes?.length === 0 && (
                <p className="text-zinc-400">Aucune commande assignée pour le moment.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
