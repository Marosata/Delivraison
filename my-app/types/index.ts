// types/index.ts

// Database types
export interface Profile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'livreur';
  disponible: boolean;
  statut_livreur: 'hors_ligne' | 'disponible' | 'en_livraison';
  derniere_activite: string | null;
  position_lat: number | null;
  position_lng: number | null;
  position_updated_at: string | null;
  charge_actuelle: number;
}

export interface Commande {
  id: number;
  adresse_livraison: string;
  gps_lat: number;
  gps_lng: number;
  statut: 'en_attente' | 'en_cours' | 'livré' | 'annulé';
  livreur_id: string | null;
  created_at: string;
  notes: string | null;
  score_attribution: number | null;
  attribution_mode: 'automatique' | 'manuelle';
}

export interface CommandeHistorique {
  id: number;
  commande_id: number;
  ancien_statut: string;
  nouveau_statut: string;
  utilisateur_id: string;
  notes: string | null;
  created_at: string;
}

// Attribution types
export interface CandidatLivreur {
  id: string;
  nom: string;
  position_lat: number | null;
  position_lng: number | null;
  charge_actuelle: number;
  statut_livreur: string;
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

// Geo types
export interface Point {
  lat: number;
  lng: number;
  id: string | number;
  adresse?: string;
}

export interface RouteResult {
  geometry: [number, number][];
  distance: number;
  duration: number;
  steps: any[];
}

// UI types
export interface CommandeWithLivreur {
  id: string;
  adresse_livraison: string;
  statut: string;
  livreur_id: string | null;
  created_at: string;
  livreur_nom: string | null;
  score_attribution: number | null;
  attribution_mode: string;
}
