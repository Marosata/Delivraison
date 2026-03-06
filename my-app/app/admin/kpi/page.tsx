// app/admin/kpi/page.tsx

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getKPIGlobaux, getKPILivreurs, getEvolutionCommandes, getTempsLivraisonMoyen, getCommandesParHeure } from '@/lib/kpi/queries';
import SelecteurPeriode from '@/components/kpi/SelecteurPeriode';
import AlertesKPI from '@/components/kpi/AlertesKPI';
import CardsKPI from '@/components/kpi/CardsKPI';
import GraphiqueEvolution from '@/components/kpi/GraphiqueEvolution';
import GraphiqueHeures from '@/components/kpi/GraphiqueHeures';
import TableauLivreurs from '@/components/kpi/TableauLivreurs';

type PageProps = {
  searchParams: {
    periode?: string;
  };
};

export default async function KPIPage({ searchParams }: PageProps) {
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

  const resolvedSearchParams = await searchParams;
  const periode = (resolvedSearchParams.periode as 'jour' | 'semaine' | 'mois') || 'jour';

  // Fetch all data in parallel
  const [
    kpiGlobaux,
    kpiPrecedent,
    kpiLivreurs,
    evolutionData,
    tempsLivraison,
    commandesParHeure,
  ] = await Promise.all([
    getKPIGlobaux(periode),
    getKPIGlobaux(periode === 'jour' ? 'semaine' : periode === 'semaine' ? 'mois' : 'jour'), // rough previous
    getKPILivreurs(),
    getEvolutionCommandes(30),
    getTempsLivraisonMoyen(),
    getCommandesParHeure(),
  ]);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">KPI & Analytics</h1>
          <p className="text-zinc-400 mt-2">Tableau de bord complet des performances</p>
        </div>

        {/* Sélecteur de période */}
        <div className="mb-8">
          <SelecteurPeriode currentPeriode={periode} />
        </div>

        {/* Cards KPI globaux */}
        <Suspense fallback={<div className="h-32 bg-zinc-800 rounded-lg animate-pulse mb-8" />}>
          <CardsKPI data={kpiGlobaux} previous={kpiPrecedent} periode={periode} />
        </Suspense>

        {/* Graphiques en grille */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Suspense fallback={<div className="h-96 bg-zinc-800 rounded-lg animate-pulse" />}>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Évolution des commandes (30 jours)</h3>
              <GraphiqueEvolution data={evolutionData} />
            </div>
          </Suspense>

          <Suspense fallback={<div className="h-96 bg-zinc-800 rounded-lg animate-pulse" />}>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Activité par heure</h3>
              <GraphiqueHeures data={commandesParHeure} />
            </div>
          </Suspense>
        </div>

        {/* Temps livraison moyen */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Temps de livraison</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-blue-400">{tempsLivraison.moyen_minutes} min</div>
              <div className="text-sm text-zinc-400">Temps moyen</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{tempsLivraison.median_minutes} min</div>
              <div className="text-sm text-zinc-400">Médiane</div>
            </div>
          </div>
        </div>

        {/* Tableau livreurs */}
        <Suspense fallback={<div className="h-96 bg-zinc-800 rounded-lg animate-pulse mb-8" />}>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Performances livreurs</h3>
            <TableauLivreurs data={kpiLivreurs} />
          </div>
        </Suspense>

        {/* Alertes */}
        <Suspense fallback={<div className="h-32 bg-zinc-800 rounded-lg animate-pulse" />}>
          <AlertesKPI kpiGlobaux={kpiGlobaux} livreurs={kpiLivreurs} />
        </Suspense>
      </div>
    </div>
  );
}
