'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function updateDisponibiliteAction(disponible: boolean): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    return { ok: false, message: 'Utilisateur non authentifié' };
  }

  const newStatut: 'disponible' | 'hors_ligne' = disponible ? 'disponible' : 'hors_ligne';

  const { error } = await supabase
    .from('profiles')
    .update({
      disponible,
      statut_livreur: newStatut,
    })
    .eq('id', user.id);

  if (error) {
    console.error('[livreur][disponibilite] update error', { userId: user.id, error });
    return { ok: false, message: 'Erreur lors de la mise à jour: ' + error.message };
  }

  console.log('[livreur][disponibilite] update success', { userId: user.id, disponible, statut: newStatut });
  return { ok: true, message: 'Disponibilité mise à jour' };
}

export async function updateStatutCommandeAction(commandeId: number, nouveauStatut: 'en_cours' | 'livré'): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    return { ok: false, message: 'Utilisateur non authentifié' };
  }

  // Vérifier que la commande est assignée à ce livreur
  const { data: commande, error: fetchError } = await supabase
    .from('commandes')
    .select('statut, livreur_id')
    .eq('id', commandeId)
    .single();

  if (fetchError || !commande) {
    return { ok: false, message: 'Commande introuvable' };
  }

  if (commande.livreur_id !== user.id) {
    return { ok: false, message: 'Commande non assignée à vous' };
  }

  // Logique de transition
  let nouveauStatutLivreur: 'disponible' | 'en_livraison' | null = null;

  if (nouveauStatut === 'en_cours' && commande.statut === 'en_attente') {
    nouveauStatutLivreur = 'en_livraison';
  } else if (nouveauStatut === 'livré' && commande.statut === 'en_cours') {
    // Vérifier si autres commandes en_cours
    const { count } = await supabase
      .from('commandes')
      .select('*', { count: 'exact', head: true })
      .eq('livreur_id', user.id)
      .eq('statut', 'en_cours');

    nouveauStatutLivreur = count === 1 ? 'disponible' : 'en_livraison'; // Si c'était la dernière
  } else {
    return { ok: false, message: 'Transition invalide' };
  }

  // Transaction: update commande + profil si nécessaire
  const { error: updateError } = await supabase.rpc('update_commande_and_livreur', {
    p_commande_id: commandeId,
    p_nouveau_statut: nouveauStatut,
    p_nouveau_statut_livreur: nouveauStatutLivreur,
  });

  if (updateError) {
    console.error('[livreur][commande] update error', { commandeId, nouveauStatut, error: updateError });
    return { ok: false, message: 'Erreur lors de la mise à jour: ' + updateError.message };
  }

  console.log('[livreur][commande] update success', { commandeId, nouveauStatut, statutLivreur: nouveauStatutLivreur });
  return { ok: true, message: 'Statut mis à jour' };
}
