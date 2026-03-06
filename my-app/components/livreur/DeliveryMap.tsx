'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

type DeliveryMapProps = {
  adresse: string;
  lat: number | null;
  lng: number | null;
};

export default function DeliveryMap({ adresse, lat, lng }: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat, lng } : null
  );

  useEffect(() => {
    if (!coords) {
      // Geocode the address
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`)
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            const { lat: newLat, lon: newLng } = data[0];
            setCoords({ lat: parseFloat(newLat), lng: parseFloat(newLng) });
          }
        })
        .catch(err => console.error('Geocoding error:', err));
    }
  }, [adresse, coords]);

  useEffect(() => {
    if (coords && mapRef.current && !mapLoaded) {
      // Load Leaflet dynamically
      import('leaflet').then(L => {
        const map = L.map(mapRef.current!).setView([coords.lat, coords.lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const marker = L.marker([coords.lat, coords.lng]).addTo(map);
        marker.bindPopup(`<b>Livraison</b><br>${adresse}`).openPopup();

        setMapLoaded(true);
      });
    }
  }, [coords, mapLoaded, adresse]);

  if (!coords) {
    return <div className="h-64 bg-gray-200 rounded flex items-center justify-center text-gray-500">
      Géolocalisation en cours...
    </div>;
  }

  return <div ref={mapRef} className="h-64 rounded" />;
}
