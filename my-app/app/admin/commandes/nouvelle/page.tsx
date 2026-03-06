import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import CommandForm from '@/components/admin/CommandForm';

export default async function NouvelleCommandePage() {
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

  // Fetch disponible livreurs
  const { data: livreurs } = await supabase
    .from('profiles')
    .select('id, prenom, nom')
    .eq('role', 'livreur')
    .order('nom');

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Nouvelle commande</h1>
          <p className="mt-1 text-sm text-zinc-400">Créer une nouvelle commande de livraison</p>
        </div>

        <div className="max-w-2xl">
          <CommandForm livreurs={livreurs ?? []} />
        </div>
      </div>
    </div>
  );
}
