'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { createMarqueurLivreur } from './MarqueurLivreur';
import { createMarqueurCommandeAdmin } from './MarqueurCommandeAdmin';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Livreur {
  id: string;
  prenom: string;
  nom: string;
  disponible: boolean;
  statut_livreur: string;
  // Assume we have location, but for demo, use random or fixed
  lat: number;
  lng: number;
}

interface Commande {
  id: number;
  adresse_livraison: string;
  statut: string;
  gps_lat: number;
  gps_lng: number;
  livreur_id: string | null;
}

interface CarteAdminProps {
  livreurs: Livreur[];
  commandes: Commande[];
}

function MapContent({ livreurs, commandes }: CarteAdminProps) {
  const map = useMap();

  // Fit bounds to show all markers
  useEffect(() => {
    const allPoints: [number, number][] = [];

    livreurs.forEach(l => allPoints.push([l.lat, l.lng]));
    commandes.forEach(c => allPoints.push([c.gps_lat, c.gps_lng]));

    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, livreurs, commandes]);

  return (
    <>
      {/* Livreur markers */}
      {livreurs.map((livreur) => (
        <Marker
          key={livreur.id}
          position={[livreur.lat, livreur.lng]}
          icon={createMarqueurLivreur(livreur.statut_livreur)}
        >
          <Popup>
            <div className="text-sm">
              <h4 className="font-semibold">{livreur.prenom} {livreur.nom}</h4>
              <p>Statut: {livreur.statut_livreur}</p>
              <p>Disponible: {livreur.disponible ? 'Oui' : 'Non'}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Command markers */}
      {commandes.map((commande) => (
        <Marker
          key={commande.id}
          position={[commande.gps_lat, commande.gps_lng]}
          icon={createMarqueurCommandeAdmin(commande.statut, commande.livreur_id)}
        >
          <Popup>
            <div className="text-sm">
              <h4 className="font-semibold">{commande.adresse_livraison}</h4>
              <p>Statut: {commande.statut}</p>
              {commande.livreur_id ? (
                <p>Assigné: {commande.livreur_id} ({livreurs.find(lv => lv.id === commande.livreur_id)?.prenom} {livreurs.find(lv => lv.id === commande.livreur_id)?.nom})</p>
              ) : (
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs mt-2">
                  Assigner manuellement
                </button>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Dashed lines for assigned orders */}
      {commandes
        .filter(c => c.livreur_id)
        .map((commande) => {
          const livreur = livreurs.find(l => l.id === commande.livreur_id);
          if (!livreur) return null;

          return (
            <Polyline
              key={`line-${commande.id}`}
              positions={[
                [livreur.lat, livreur.lng],
                [commande.gps_lat, commande.gps_lng],
              ]}
              color="#DC2626"
              weight={2}
              opacity={0.6}
              dashArray="5, 10"
            />
          );
        })}
    </>
  );
}

export default function CarteAdmin({ livreurs: initialLivreurs, commandes: initialCommandes }: CarteAdminProps) {
  const [livreurs, setLivreurs] = useState(initialLivreurs);
  const [commandes, setCommandes] = useState(initialCommandes);

  // Realtime updates would go here, but for now use props

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[-18.9154, 47.5256]} // Default Antananarivo, Madagascar
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapContent livreurs={livreurs} commandes={commandes} />
      </MapContainer>
    </div>
  );
}
