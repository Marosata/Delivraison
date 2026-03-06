'use client';

import { useState } from 'react';
import L from 'leaflet';

interface MarqueurCommandeProps {
  commande: {
    id: number;
    adresse_livraison: string;
    statut: string;
    gps_lat: number;
    gps_lng: number;
  };
  onSetDestination: (lat: number, lng: number, adresse: string) => void;
}

export default function MarqueurCommande({ commande, onSetDestination }: MarqueurCommandeProps) {
  const [popupOpen, setPopupOpen] = useState(false);

  // Custom icon based on status
  const iconUrl = commande.statut === 'en_attente'
    ? '/icons/package-orange.svg' // You'll need to add these icons
    : '/icons/package-red.svg';

  const icon = L.icon({
    iconUrl,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  const popupContent = (
    <div className="text-sm">
      <h4 className="font-semibold mb-2">{commande.adresse_livraison}</h4>
      <p className="text-gray-600 mb-2">Statut: {commande.statut === 'en_attente' ? 'En attente' : 'En cours'}</p>
      <button
        onClick={() => onSetDestination(commande.gps_lat, commande.gps_lng, commande.adresse_livraison)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
      >
        Définir comme destination
      </button>
    </div>
  );

  return null; // This component is meant to be used in a map context
}

export function createMarqueurCommande(commande: any, onSetDestination: any) {
  const iconUrl = commande.statut === 'en_attente'
    ? 'data:image/svg+xml;base64,' + btoa(`
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 7H4C3.45 7 3 7.45 3 8V16C3 16.55 3.45 17 4 17H20C20.55 17 21 16.55 21 16V8C21 7.45 20.55 7 20 7Z" fill="#F97316"/>
        <path d="M3 8L12 13L21 8" stroke="#DC2626" stroke-width="2"/>
      </svg>
    `)
    : 'data:image/svg+xml;base64,' + btoa(`
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 7H4C3.45 7 3 7.45 3 8V16C3 16.55 3.45 17 4 17H20C20.55 17 21 16.55 21 16V8C21 7.45 20.55 7 20 7Z" fill="#DC2626"/>
        <path d="M3 8L12 13L21 8" stroke="#B91C1C" stroke-width="2"/>
      </svg>
    `);

  return L.icon({
    iconUrl,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
}
