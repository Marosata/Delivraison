'use client';

import L from 'leaflet';

export function createMarqueurLivreur(statut: string) {
  let color = '#6B7280'; // default gray

  if (statut === 'disponible') {
    color = '#10B981'; // green
  } else if (statut === 'en_livraison') {
    color = '#F59E0B'; // yellow
  }

  // Create a colored circle icon
  const svgIcon = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="${color}" stroke="white" stroke-width="2"/>
    </svg>
  `;

  return L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(svgIcon),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
}
