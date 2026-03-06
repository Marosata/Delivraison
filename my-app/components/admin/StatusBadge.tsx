import type { ReactNode } from 'react';

type StatusBadgeProps = {
  status: string | null;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  let bgColor = 'bg-gray-500';
  let textColor = 'text-white';
  let label = status || 'Inconnu';

  switch (status) {
    case 'en_attente':
      bgColor = 'bg-yellow-500';
      label = 'En attente';
      break;
    case 'en_cours':
      bgColor = 'bg-blue-500';
      label = 'En cours';
      break;
    case 'livré':
      bgColor = 'bg-green-500';
      label = 'Livré';
      break;
    case 'annulé':
      bgColor = 'bg-red-500';
      label = 'Annulé';
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
}
