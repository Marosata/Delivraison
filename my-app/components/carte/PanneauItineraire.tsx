'use client';

interface PanneauItineraireProps {
  steps: any[];
  distance: number;
  duration: number;
  ordreOptimise?: string[];
}

export default function PanneauItineraire({ steps, distance, duration, ordreOptimise }: PanneauItineraireProps) {
  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes} min`;
  };

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm max-h-96 overflow-y-auto z-[1000]">
      <h3 className="font-semibold text-lg mb-2">Itinéraire</h3>

      {ordreOptimise && ordreOptimise.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-sm mb-2">Ordre optimisé :</h4>
          <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1">
            {ordreOptimise.map((adresse, index) => (
              <li key={index}>{adresse}</li>
            ))}
          </ol>
        </div>
      )}

      <div className="mb-4 text-sm text-gray-600">
        <p>Distance: {formatDistance(distance)}</p>
        <p>Durée: {formatDuration(duration)}</p>
      </div>

      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-2 text-sm">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
              {index + 1}
            </div>
            <div>
              <div className="font-medium">{step.maneuver?.instruction || step.name || 'Continuer'}</div>
              <div className="text-gray-500">{formatDistance(step.distance)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
