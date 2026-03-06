// lib/kpi/queries.ts

import { createClient } from '@/lib/supabase/server';

export interface KPIGlobaux {
  total_commandes: number;
  commandes_livrees: number;
  commandes_en_cours: number;
  commandes_en_attente: number;
  commandes_annulees: number;
  taux_livraison: number;
  attribution_auto_pct: number;
}

export interface KPILivreur {
  livreur_id: string;
  nom: string;
  prenom: string;
  statut_livreur: string;
  total_livrees: number;
  en_cours: number;
  taux_succes: number;
  score_moyen: number;
}

export interface EvolutionJour {
  date: string;
  total: number;
  livrees: number;
  annulees: number;
}

export interface TempsLivraison {
  moyen_minutes: number;
  median_minutes: number;
}

export interface CommandesParHeure {
  heure: number;
  nombre: number;
}

export async function getKPIGlobaux(periode: 'jour' | 'semaine' | 'mois'): Promise<KPIGlobaux> {
  const supabase = await createClient();

  // Calculate date range
  const now = new Date();
  let startDate: Date;
  if (periode === 'jour') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (periode === 'semaine') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - now.getDay()); // Monday
    startDate.setHours(0, 0, 0, 0);
  } else { // mois
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const { data: commandes } = await supabase
    .from('commandes')
    .select('statut, attribution_mode')
    .gte('created_at', startDate.toISOString());

  if (!commandes) {
    return {
      total_commandes: 0,
      commandes_livrees: 0,
      commandes_en_cours: 0,
      commandes_en_attente: 0,
      commandes_annulees: 0,
      taux_livraison: 0,
      attribution_auto_pct: 0,
    };
  }

  const total = commandes.length;
  const livrees = commandes.filter(c => c.statut === 'livré').length;
  const en_cours = commandes.filter(c => c.statut === 'en_cours').length;
  const en_attente = commandes.filter(c => c.statut === 'en_attente').length;
  const annulees = commandes.filter(c => c.statut === 'annulé').length;
  const auto = commandes.filter(c => c.attribution_mode === 'automatique').length;

  return {
    total_commandes: total,
    commandes_livrees: livrees,
    commandes_en_cours: en_cours,
    commandes_en_attente: en_attente,
    commandes_annulees: annulees,
    taux_livraison: total > 0 ? Math.round((livrees / total) * 100) : 0,
    attribution_auto_pct: total > 0 ? Math.round((auto / total) * 100) : 0,
  };
}

export async function getKPILivreurs(): Promise<KPILivreur[]> {
  const supabase = await createClient();

  // Fetch livreurs with their commands stats
  const { data: livreurs } = await supabase
    .from('profiles')
    .select(`
      id,
      prenom,
      nom,
      statut_livreur,
      commandes:livreur_id (
        id,
        statut,
        score_attribution
      )
    `)
    .eq('role', 'livreur');

  if (!livreurs) return [];

  return livreurs.map(l => {
    const cmds = l.commandes || [];
    const livrees = cmds.filter(c => c.statut === 'livré');
    const annulees = cmds.filter(c => c.statut === 'annulé');
    const en_cours = cmds.filter(c => c.statut === 'en_cours').length;
    const total_finie = livrees.length + annulees.length;
    const taux_succes = total_finie > 0 ? Math.round((livrees.length / total_finie) * 100) : 100;
    const scores = livrees.map(c => c.score_attribution).filter(s => s !== null);
    const score_moyen = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    return {
      livreur_id: l.id,
      nom: l.nom,
      prenom: l.prenom,
      statut_livreur: l.statut_livreur || 'hors_ligne',
      total_livrees: livrees.length,
      en_cours,
      taux_succes,
      score_moyen,
    };
  });
}

export async function getEvolutionCommandes(jours: number = 30): Promise<EvolutionJour[]> {
  const supabase = await createClient();

  const { data } = await supabase.rpc('get_evolution_commandes', { jours });

  return data || [];
}

// SQL for RPC:
/*
CREATE OR REPLACE FUNCTION get_evolution_commandes(jours INTEGER DEFAULT 30)
RETURNS TABLE (date TEXT, total INTEGER, livrees INTEGER, annulees INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  start_date DATE := CURRENT_DATE - INTERVAL '1 day' * jours;
BEGIN
  RETURN QUERY
  SELECT
    d.date::TEXT,
    COALESCE(c.total, 0)::INTEGER,
    COALESCE(c.livrees, 0)::INTEGER,
    COALESCE(c.annulees, 0)::INTEGER
  FROM generate_series(start_date, CURRENT_DATE, INTERVAL '1 day') AS d(date)
  LEFT JOIN (
    SELECT
      DATE(created_at) AS date,
      COUNT(*) AS total,
      COUNT(CASE WHEN statut = 'livré' THEN 1 END) AS livrees,
      COUNT(CASE WHEN statut = 'annulé' THEN 1 END) AS annulees
    FROM commandes
    WHERE created_at >= start_date
    GROUP BY DATE(created_at)
  ) c ON d.date = c.date
  ORDER BY d.date;
END;
$$;
*/

export async function getTempsLivraisonMoyen(): Promise<TempsLivraison> {
  const supabase = await createClient();

  // Fetch times from historique
  const { data: hist } = await supabase
    .from('commande_historique')
    .select('commande_id, created_at, nouveau_statut')
    .eq('nouveau_statut', 'livré')
    .order('created_at', { ascending: false });

  if (!hist || hist.length === 0) {
    return { moyen_minutes: 0, median_minutes: 0 };
  }

  // Get creation times
  const { data: cmds } = await supabase
    .from('commandes')
    .select('id, created_at')
    .in('id', hist.map(h => h.commande_id));

  const cmdMap = new Map(cmds?.map(c => [c.id, new Date(c.created_at)]) || []);

  const times: number[] = [];
  for (const h of hist) {
    const start = cmdMap.get(h.commande_id);
    if (start) {
      const end = new Date(h.created_at);
      const diff = (end.getTime() - start.getTime()) / (1000 * 60); // minutes
      times.push(diff);
    }
  }

  if (times.length === 0) return { moyen_minutes: 0, median_minutes: 0 };

  const moyen = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  const sorted = times.sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  return { moyen_minutes: moyen, median_minutes: Math.round(median) };
}

export async function getCommandesParHeure(): Promise<CommandesParHeure[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('commandes')
    .select('created_at');

  if (!data) return Array.from({ length: 24 }, (_, h) => ({ heure: h, nombre: 0 }));

  const heures = data.reduce((acc, c) => {
    const h = new Date(c.created_at).getHours();
    acc[h] = (acc[h] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return Array.from({ length: 24 }, (_, h) => ({
    heure: h,
    nombre: heures[h] || 0,
  }));
}
