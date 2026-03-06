'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';

type CreateCommandeData = {
  adresse_livraison: string;
  gps_lat: number;
  gps_lng: number;
  statut: 'en_attente' | 'en_cours' | 'livré' | 'annulé';
  livreur_id: string | null;
};

type UpdateCommandeData = CreateCommandeData & { id: string };

export async function createCommandeAction(formData: FormData): Promise<{ ok: boolean; message: string }> {
  const adresse_livraison = String(formData.get('adresse_livraison') ?? '').trim();
  const gps_lat_str = String(formData.get('gps_lat') ?? '').trim();
  const gps_lng_str = String(formData.get('gps_lng') ?? '').trim();
  const statut = String(formData.get('statut') ?? 'en_attente');
  const livreur_id = String(formData.get('livreur_id') ?? '').trim() || null;

  console.log('[admin][commandes] create attempt', { adresse_livraison, statut, livreur_id });

  if (!adresse_livraison) {
    return { ok: false, message: 'Adresse de livraison obligatoire.' };
  }

  const gps_lat = parseFloat(gps_lat_str);
  const gps_lng = parseFloat(gps_lng_str);

  if (isNaN(gps_lat) || isNaN(gps_lng)) {
    return { ok: false, message: 'Coordonnées GPS invalides.' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('commandes')
    .insert({
      adresse_livraison,
      gps_lat,
      gps_lng,
      statut: statut as any,
      livreur_id,
    });

  if (error) {
    console.error('[admin][commandes] create error', { error });
    return { ok: false, message: 'Erreur lors de la création: ' + error.message };
  }

  console.log('[admin][commandes] create success', { adresse_livraison });
  revalidatePath('/admin/commandes');
  redirect('/admin/commandes');
}

export async function updateCommandeAction(formData: FormData): Promise<{ ok: boolean; message: string }> {
  const id = String(formData.get('id') ?? '').trim();
  const adresse_livraison = String(formData.get('adresse_livraison') ?? '').trim();
  const gps_lat_str = String(formData.get('gps_lat') ?? '').trim();
  const gps_lng_str = String(formData.get('gps_lng') ?? '').trim();
  const statut = String(formData.get('statut') ?? 'en_attente');
  const livreur_id = String(formData.get('livreur_id') ?? '').trim() || null;

  console.log('[admin][commandes] update attempt', { id, adresse_livraison, statut });

  if (!id || !adresse_livraison) {
    return { ok: false, message: 'ID et adresse obligatoires.' };
  }

  const gps_lat = parseFloat(gps_lat_str);
  const gps_lng = parseFloat(gps_lng_str);

  if (isNaN(gps_lat) || isNaN(gps_lng)) {
    return { ok: false, message: 'Coordonnées GPS invalides.' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('commandes')
    .update({
      adresse_livraison,
      gps_lat,
      gps_lng,
      statut: statut as any,
      livreur_id,
    })
    .eq('id', id);

  if (error) {
    console.error('[admin][commandes] update error', { id, error });
    return { ok: false, message: 'Erreur lors de la mise à jour: ' + error.message };
  }

  console.log('[admin][commandes] update success', { id });
  revalidatePath('/admin/commandes');
  revalidatePath(`/admin/commandes/${id}`);
  redirect('/admin/commandes');
}

export async function deleteCommandeAction(id: string): Promise<{ ok: boolean; message: string }> {
  console.log('[admin][commandes] delete attempt', { id });

  if (!id) {
    return { ok: false, message: 'ID manquant.' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('commandes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[admin][commandes] delete error', { id, error });
    return { ok: false, message: 'Erreur lors de la suppression: ' + error.message };
  }

  console.log('[admin][commandes] delete success', { id });
  revalidatePath('/admin/commandes');
  return { ok: true, message: 'Commande supprimée avec succès.' };
}

export async function changeStatusAction(commandeId: string, newStatus: string): Promise<{ ok: boolean; message: string }> {
  console.log('[admin][commandes] change status attempt', { commandeId, newStatus });

  if (!commandeId || !newStatus) {
    return { ok: false, message: 'ID et statut obligatoires.' };
  }

  const validStatuses = ['en_attente', 'en_cours', 'livré', 'annulé'];
  if (!validStatuses.includes(newStatus)) {
    return { ok: false, message: 'Statut invalide.' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('commandes')
    .update({ statut: newStatus as any })
    .eq('id', commandeId);

  if (error) {
    console.error('[admin][commandes] change status error', { commandeId, newStatus, error });
    return { ok: false, message: 'Erreur lors du changement: ' + error.message };
  }

  console.log('[admin][commandes] change status success', { commandeId, newStatus });
  revalidatePath(`/admin/commandes/${commandeId}`);
  return { ok: true, message: 'Statut changé avec succès.' };
}
