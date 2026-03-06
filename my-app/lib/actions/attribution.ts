// lib/actions/attribution.ts

'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { trouverMeilleurLivreur, type CandidatLivreur, type Commande } from '@/lib/attribution/engine';

export interface ResultatAttribution {
  succes: boolean;
  livreur?: CandidatLivreur;
  score?: number;
  raison?: string;
}

export interface RapportAttribution {
  attribuees: number;
  echouees: number;
  details: {
    commandeId: number;
    succes: boolean;
    livreur?: string;
    score?: number;
    raison?: string;
  }[];
}

export async function attribuerCommandeAuto(commandeId: string): Promise<ResultatAttribution> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    return { succes: false, raison: 'Utilisateur non authentifié' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { succes: false, raison: 'Accès non autorisé' };
  }

  // Fetch commande
  const { data: commande, error: commandeError } = await supabase
    .from('commandes')
    .select('id, gps_lat, gps_lng, adresse_livraison, livreur_id, statut')
    .eq('id', commandeId)
    .single();

  if (commandeError || !commande) {
    return { succes: false, raison: 'Commande introuvable' };
  }

  if (commande.livreur_id || commande.statut !== 'en_attente') {
    return { succes: false, raison: 'Commande déjà assignée ou non en attente' };
  }

  // Fetch livreurs éligibles
  const { data: livreursData } = await supabase
    .from('profiles')
    .select('id, prenom, nom, position_lat, position_lng, charge_actuelle, statut_livreur')
    .eq('role', 'livreur')
    .eq('disponible', true);

  const livreurs: CandidatLivreur[] = (livreursData ?? []).map(l => ({
    id: l.id,
    nom: `${l.prenom} ${l.nom}`,
    position_lat: l.position_lat,
    position_lng: l.position_lng,
    charge_actuelle: l.charge_actuelle || 0,
    statut_livreur: l.statut_livreur || 'hors_ligne',
  }));

  const commandeTyped: Commande = {
    id: commande.id,
    gps_lat: commande.gps_lat,
    gps_lng: commande.gps_lng,
    adresse_livraison: commande.adresse_livraison,
  };

  const resultat = await trouverMeilleurLivreur(commandeTyped, livreurs);

  if (!resultat) {
    return { succes: false, raison: 'Aucun livreur disponible' };
  }

  // Attribution
  const { error: updateError } = await supabase
    .from('commandes')
    .update({
      livreur_id: resultat.livreur.id,
      attribution_mode: 'automatique',
      score_attribution: resultat.score,
    })
    .eq('id', commandeId);

  if (updateError) {
    console.error('[attribution] update error:', updateError);
    return { succes: false, raison: 'Erreur lors de l\'attribution' };
  }

  // Historique
  await supabase
    .from('commande_historique')
    .insert({
      commande_id: commandeId,
      ancien_statut: 'en_attente',
      nouveau_statut: 'en_cours',
      utilisateur_id: user.id,
      notes: `Attribution automatique à ${resultat.livreur.nom} (score: ${resultat.score})`,
    });

  console.log(`[attribution] Commande ${commandeId} attribuée à ${resultat.livreur.nom} (score: ${resultat.score})`);

  return {
    succes: true,
    livreur: resultat.livreur,
    score: resultat.score,
  };
}

export async function attribuerToutesCommandesEnAttente(): Promise<RapportAttribution> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    return { attribuees: 0, echouees: 0, details: [] };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { attribuees: 0, echouees: 0, details: [] };
  }

  // Fetch commandes en attente non assignées
  const { data: commandes } = await supabase
    .from('commandes')
    .select('id')
    .eq('statut', 'en_attente')
    .is('livreur_id', null);

  if (!commandes || commandes.length === 0) {
    return { attribuees: 0, echouees: 0, details: [] };
  }

  const details: RapportAttribution['details'] = [];

  for (const commande of commandes) {
    const resultat = await attribuerCommandeAuto(commande.id);
    details.push({
      commandeId: commande.id,
      succes: resultat.succes,
      livreur: resultat.livreur?.nom,
      score: resultat.score,
      raison: resultat.raison,
    });
  }

  const attribuees = details.filter(d => d.succes).length;
  const echouees = details.filter(d => !d.succes).length;

  console.log(`[attribution] Rapport: ${attribuees} attribuées, ${echouees} échouées`);

  return { attribuees, echouees, details };
}

export async function mettreAJourPositionLivreur(lat: number, lng: number): Promise<{ succes: boolean; raison?: string }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    return { succes: false, raison: 'Utilisateur non authentifié' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'livreur') {
    return { succes: false, raison: 'Accès non autorisé' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      position_lat: lat,
      position_lng: lng,
      position_updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    console.error('[position] update error:', error);
    return { succes: false, raison: 'Erreur de mise à jour' };
  }

  return { succes: true };
}
