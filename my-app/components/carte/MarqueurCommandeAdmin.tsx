'use client';

import L from 'leaflet';

export function createMarqueurCommandeAdmin(statut: string, livreur_id: string | null) {
  let color = '#6B7280'; // default gray

  if (statut === 'en_attente') {
    color = '#F97316'; // orange
  } else if (statut === 'en_cours') {
    color = '#DC2626'; // red
  }

  const svgIcon = livreur_id
    ? // Assigned order: package with dash line
    `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="${color}" stroke="white" stroke-width="2"/>
        <path d="M3 9L21 9" stroke="white" stroke-width="2" stroke-dasharray="2 2"/>
      </svg>
    `
    : // Unassigned: package with exclamation
    `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="12" y="16" text-anchor="middle" fill="white" font-size="16" font-weight="bold">!</text>
      </svg>
    `;

  return L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(svgIcon),
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
}
