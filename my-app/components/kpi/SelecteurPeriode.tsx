'use client';

import { useRouter } from 'next/navigation';

interface SelecteurPeriodeProps {
  currentPeriode: 'jour' | 'semaine' | 'mois';
}

export default function SelecteurPeriode({ currentPeriode }: SelecteurPeriodeProps) {
  const router = useRouter();

  const options = [
    { key: 'jour', label: 'Aujourd\'hui' },
    { key: 'semaine', label: 'Cette semaine' },
    { key: 'mois', label: 'Ce mois' },
  ] as const;

  const handleChange = (periode: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('periode', periode);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex gap-2">
      {options.map(option => (
        <button
          key={option.key}
          onClick={() => handleChange(option.key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPeriode === option.key
              ? 'bg-[#b08d2a] text-black'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
