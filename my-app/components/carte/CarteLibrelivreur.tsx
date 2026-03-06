'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { createMarqueurCommande } from './MarqueurCommande';
import PanneauItineraire from './PanneauItineraire';
import { getRoute, nearestNeighborByRoad, type Point } from '@/lib/utils/geo';
import { mettreAJourPositionLivreur } from '@/lib/actions/attribution';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Commande {
  id: number;
  adresse_livraison: string;
  statut: string;
  gps_lat: number;
  gps_lng: number;
}

interface CarteLibrelivreurProps {
  commandes: Commande[];
}

function MapContent({ commandes }: CarteLibrelivreurProps) {
  const map = useMap();
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [optimizedOrder, setOptimizedOrder] = useState<string[]>([]);
  const [routeData, setRouteData] = useState<any>(null);
  const [selectedDestination, setSelectedDestination] = useState<Point | null>(null);
  const [gpsActive, setGpsActive] = useState(false);

  // GPS watching
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserPosition([latitude, longitude]);
          setGpsActive(true);

          // Update position every 30 seconds
          const now = Date.now();
          const lastUpdate = localStorage.getItem('lastPositionUpdate');
          if (!lastUpdate || now - parseInt(lastUpdate) > 30000) {
            await mettreAJourPositionLivreur(latitude, longitude);
            localStorage.setItem('lastPositionUpdate', now.toString());
          }
        },
        (error) => {
          console.error('GPS watch error:', error);
          setGpsActive(false);
        },
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, []);

  // Set map view when position available
  useEffect(() => {
    if (userPosition && !routePoints.length) {
      map.setView(userPosition, 13);
    }
  }, [userPosition, map, routePoints.length]);

  // Calculate route when destination selected
  useEffect(() => {
    if (userPosition && selectedDestination) {
      const coordinates: [number, number][] = [
        [userPosition[1], userPosition[0]], // lng, lat
        [selectedDestination.lng, selectedDestination.lat],
      ];

      getRoute(coordinates).then((route) => {
        if (route) {
          setRoutePoints(route.geometry);
          setRouteData(route);
        }
      });
    }
  }, [userPosition, selectedDestination]);

  const handleSetDestination = (lat: number, lng: number, adresse: string) => {
    setSelectedDestination({ lat, lng, id: adresse, adresse });
  };

  const handleOptimizeRoute = async () => {
    if (!userPosition || commandes.length === 0) return;

    const points: Point[] = commandes.map(c => ({
      lat: c.gps_lat,
      lng: c.gps_lng,
      id: c.id,
      adresse: c.adresse_livraison,
    }));

    const start: Point = {
      lat: userPosition[0],
      lng: userPosition[1],
      id: 'start',
      adresse: 'Position actuelle',
    };

    const optimized = nearestNeighborByRoad(start, points);
    const optimizedAddresses = (await optimized).slice(1).map(p => p.adresse!);

    setOptimizedOrder(optimizedAddresses);

    // Calculate route for optimized order
    const coordinates: [number, number][] = (await optimized).map(p => [p.lng, p.lat]);

    getRoute(coordinates).then((route) => {
      if (route) {
        setRoutePoints(route.geometry);
        setRouteData(route);
      }
    });
  };

  // Custom truck icon for user position
  const truckIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 8H18V6C18 4.9 17.1 4 16 4H6C4.9 4 4 4.9 4 6V16H3C2.45 16 2 16.45 2 17S2.45 18 3 18H4.09C4.04 18.33 4 18.66 4 19C4 20.66 5.34 22 7 22S10 20.66 10 19C10 18.66 9.96 18.33 9.91 18H14.09C14.04 18.33 14 18.66 14 19C14 20.66 15.34 22 17 22S20 20.66 20 19C20 18.66 19.96 18.33 19.91 18H19V12H21V8H19ZM7 20C6.45 20 6 19.55 6 19S6.45 18 7 18 8 18.45 8 19 7.55 20 7 20ZM17 20C16.45 20 16 19.55 16 19S16.45 18 17 18 18 18.45 18 19 17.55 20 17 20ZM16 10H6V6H16V10Z" fill="#2563EB"/>
      </svg>
    `),
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  return (
    <>
      {userPosition && (
        <Marker position={userPosition} icon={truckIcon}>
          <Popup>Position actuelle</Popup>
        </Marker>
      )}

      {/* Command markers */}
      {commandes.map((commande) => (
        <Marker
          key={commande.id}
          position={[commande.gps_lat, commande.gps_lng]}
          icon={createMarqueurCommande(commande, handleSetDestination)}
        >
          <Popup>
            <div className="text-sm">
              <h4 className="font-semibold mb-2">{commande.adresse_livraison}</h4>
              <p className="text-gray-600 mb-2">Statut: {commande.statut === 'en_attente' ? 'En attente' : 'En cours'}</p>
              <button
                onClick={() => handleSetDestination(commande.gps_lat, commande.gps_lng, commande.adresse_livraison)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
              >
                Définir comme destination
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Route polyline */}
      {routePoints.length > 0 && (
        <Polyline
          positions={routePoints}
          color="#3B82F6"
          weight={4}
          opacity={0.8}
        />
      )}

      {/* Optimize route button */}
      {commandes.filter(c => c.statut === 'en_attente').length > 1 && (
        <div className="absolute top-4 left-4 z-[1000]">
          <button
            onClick={handleOptimizeRoute}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            Optimiser mon itinéraire
          </button>
        </div>
      )}

      {/* Itinerary panel */}
      {routeData && (
        <PanneauItineraire
          steps={routeData.steps || []}
          distance={routeData.distance}
          duration={routeData.duration}
          ordreOptimise={optimizedOrder}
        />
      )}
    </>
  );
}

export default function CarteLibrelivreur({ commandes }: CarteLibrelivreurProps) {
  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[48.8566, 2.3522]} // Default Paris
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapContent commandes={commandes} />
      </MapContainer>
    </div>
  );
}
