// lib/attribution/engine.ts

import { getRoadDistanceMatrix, haversineDistance } from '@/lib/utils/geo';

export interface CandidatLivreur {
  id: string;
  nom: string;
  position_lat: number | null;
  position_lng: number | null;
  charge_actuelle: number;
  statut_livreur: string;
}

export interface Commande {
  id: number;
  gps_lat: number;
  gps_lng: number;
  adresse_livraison: string;
}

export interface ResultatScoring {
  livreur: CandidatLivreur;
  score: number;
  details: {
    distanceScore: number;
    chargeScore: number;
    statutScore: number;
  };
}

export async function scorerLivreur(
  livreur: CandidatLivreur,
  commande: Commande
): Promise<ResultatScoring> {
  // Poids : Distance 50%, Charge 30%, Statut 20%

  // Critère 1 — Distance (50%)
  let distanceScore = 0;
  if (livreur.position_lat && livreur.position_lng) {
    // Try OSRM Table API for real road distance
    const matrix = await getRoadDistanceMatrix([
      { lat: livreur.position_lat, lng: livreur.position_lng, id: 'livreur' },
      { lat: commande.gps_lat, lng: commande.gps_lng, id: 'commande' }
    ]);

    if (matrix && matrix[0][1] !== undefined) {
      // Distance en mètres
      const distanceM = matrix[0][1];
      const distanceKm = distanceM / 1000;
      distanceScore = Math.max(0, 100 - (distanceKm * 10)); // 10km = 0pts, 0km = 100pts
    } else {
      // Fallback haversine
      const distanceKm = haversineDistance(
        livreur.position_lat, livreur.position_lng,
        commande.gps_lat, commande.gps_lng
      );
      distanceScore = Math.max(0, 100 - (distanceKm * 10));
    }
  } else {
    distanceScore = 0; // Pas de position = 0pts
  }

  // Critère 2 — Charge (30%)
  const chargeScore = Math.max(0, 100 - (livreur.charge_actuelle * 25));
  // 0 = 100pts, 1 = 75pts, 2 = 50pts, 3 = 25pts, 4+ = 0pts

  // Critère 3 — Statut (20%)
  const statutScore = livreur.statut_livreur === 'disponible' ? 100 : 40;

  // Score final
  const score = (distanceScore * 0.5) + (chargeScore * 0.3) + (statutScore * 0.2);

  return {
    livreur,
    score: Math.round(score),
    details: {
      distanceScore: Math.round(distanceScore),
      chargeScore: Math.round(chargeScore),
      statutScore: Math.round(statutScore),
    }
  };
}

export async function trouverMeilleurLivreur(
  commande: Commande,
  livreurs: CandidatLivreur[]
): Promise<ResultatScoring | null> {
  // Filtre candidats éligibles
  const candidats = livreurs.filter(l =>
    l.position_lat !== null &&
    l.position_lng !== null &&
    l.charge_actuelle < 4 // Max 3 commandes en cours
  );

  if (candidats.length === 0) return null;

  // Score chaque candidat
  const resultats = await Promise.all(
    candidats.map(l => scorerLivreur(l, commande))
  );

  // Retourne le meilleur score
  return resultats.reduce((meilleur, actuel) =>
    actuel.score > meilleur.score ? actuel : meilleur
  );
}
