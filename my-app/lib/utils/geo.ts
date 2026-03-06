// lib/utils/geo.ts

export interface Point {
  lat: number;
  lng: number;
  id: string | number;
  adresse?: string;
}

export interface RouteResult {
  geometry: [number, number][];
  distance: number; // in meters
  duration: number; // in seconds
  steps: any[];
}

// ─────────────────────────────────────────────
// Haversine — utilisé uniquement comme fallback
// ─────────────────────────────────────────────
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─────────────────────────────────────────────
// OSRM Table API — matrice de durées réelles
// Renvoie une matrice N×N de durées (secondes)
// ou null en cas d'échec
// ─────────────────────────────────────────────
export async function getRoadDistanceMatrix(
  points: Point[],
): Promise<number[][] | null> {
  if (points.length < 2) return null;

  const coordStr = points
    .map(p => `${p.lng},${p.lat}`)
    .join(';');

  const url =
    `https://router.project-osrm.org/table/v1/driving/${coordStr}` +
    `?annotations=duration,distance`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.code === 'Ok' && data.durations) {
      return data.durations as number[][];
    }
  } catch (err) {
    console.error('OSRM Table API error:', err);
  }

  return null;
}

// ─────────────────────────────────────────────
// Plus proche voisin sur matrice routière réelle
// Retourne l'ordre optimal des points
// ─────────────────────────────────────────────
export async function nearestNeighborByRoad(
  start: Point,
  otherPoints: Point[],
): Promise<Point[]> {
  if (otherPoints.length === 0) return [start];

  const allPoints = [start, ...otherPoints];
  const matrix = await getRoadDistanceMatrix(allPoints);

  // Fallback haversine si l'API échoue
  if (!matrix) {
    console.warn('Fallback vers haversine (OSRM Table API indisponible)');
    return nearestNeighborHaversine(start, otherPoints);
  }

  const n = allPoints.length;
  const visited = new Set<number>();
  const path: Point[] = [start];
  visited.add(0);

  let currentIdx = 0;

  while (path.length < n) {
    let nearestIdx = -1;
    let minDuration = Infinity;

    for (let j = 0; j < n; j++) {
      if (!visited.has(j)) {
        const duration = matrix[currentIdx][j];
        if (duration < minDuration) {
          minDuration = duration;
          nearestIdx = j;
        }
      }
    }

    if (nearestIdx === -1) break;

    path.push(allPoints[nearestIdx]);
    visited.add(nearestIdx);
    currentIdx = nearestIdx;
  }

  return path;
}

// ─────────────────────────────────────────────
// Fallback : plus proche voisin haversine (vol d'oiseau)
// ─────────────────────────────────────────────
function nearestNeighborHaversine(start: Point, points: Point[]): Point[] {
  const visited = new Set<string | number>();
  const path: Point[] = [start];
  visited.add(start.id);
  let current = start;

  while (path.length - 1 < points.length) {
    let nearest: Point | null = null;
    let minDist = Infinity;

    for (const p of points) {
      if (!visited.has(p.id)) {
        const d = haversineDistance(current.lat, current.lng, p.lat, p.lng);
        if (d < minDist) { minDist = d; nearest = p; }
      }
    }

    if (!nearest) break;
    path.push(nearest);
    visited.add(nearest.id);
    current = nearest;
  }

  return path;
}

// ─────────────────────────────────────────────
// OSRM Route API — tracé exact sur les routes
// Accepte un tableau de [lng, lat] (ordre OSRM)
// ─────────────────────────────────────────────
export async function getRoute(
  coordinates: [number, number][],
): Promise<RouteResult | null> {
  if (coordinates.length < 2) return null;

  const coordStr = coordinates
    .map(([lng, lat]) => `${lng},${lat}`)
    .join(';');

  const url =
    `https://router.project-osrm.org/route/v1/driving/${coordStr}` +
    `?overview=full&geometries=geojson&steps=true`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.routes?.length > 0) {
      const route = data.routes[0];
      return {
        // OSRM renvoie [lng, lat] → on inverse en [lat, lng] pour Leaflet/MapBox
        geometry: route.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
        ),
        distance: route.distance,
        duration: route.duration,
        steps: route.legs.flatMap((leg: any) => leg.steps ?? []),
      };
    }
  } catch (err) {
    console.error('OSRM Route API error:', err);
  }

  return null;
}

// ─────────────────────────────────────────────
// Calcule l'itinéraire complet optimisé :
//   1. Ordonne les points par plus proche voisin (routes réelles)
//   2. Récupère le tracé exact de chaque segment
//   3. Concatène toutes les géométries
// ─────────────────────────────────────────────
export async function buildOptimizedRoute(
  start: Point,
  waypoints: Point[],
): Promise<{
  orderedPoints: Point[];
  fullGeometry: [number, number][];
  totalDistance: number;
  totalDuration: number;
  segmentRoutes: (RouteResult | null)[];
} | null> {
  // 1. Ordre optimal via matrice routière
  const orderedPoints = await nearestNeighborByRoad(start, waypoints);

  // 2. Tracé segment par segment
  const segmentRoutes: (RouteResult | null)[] = [];
  let fullGeometry: [number, number][] = [];
  let totalDistance = 0;
  let totalDuration = 0;

  for (let i = 0; i < orderedPoints.length - 1; i++) {
    const from = orderedPoints[i];
    const to = orderedPoints[i + 1];

    const seg = await getRoute([
      [from.lng, from.lat],
      [to.lng, to.lat],
    ]);

    segmentRoutes.push(seg);

    if (seg) {
      // Évite les doublons aux jonctions
      fullGeometry = fullGeometry.concat(
        i === 0 ? seg.geometry : seg.geometry.slice(1),
      );
      totalDistance += seg.distance;
      totalDuration += seg.duration;
    }
  }

  return {
    orderedPoints,
    fullGeometry,
    totalDistance,
    totalDuration,
    segmentRoutes,
  };
}