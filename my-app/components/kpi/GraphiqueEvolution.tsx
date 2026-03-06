'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EvolutionJour } from '@/lib/kpi/queries';

interface GraphiqueEvolutionProps {
  data: EvolutionJour[];
}

export default function GraphiqueEvolution({ data }: GraphiqueEvolutionProps) {
  const formattedData = data.map(d => ({
    ...d,
    date: format(new Date(d.date), 'dd/MM', { locale: fr }),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-800 border border-zinc-600 rounded-lg p-3 shadow-lg">
          <p className="text-zinc-200 font-medium">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="date"
          stroke="#9CA3AF"
          fontSize={12}
        />
        <YAxis
          stroke="#9CA3AF"
          fontSize={12}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#60A5FA"
          strokeWidth={2}
          name="Total"
          dot={{ fill: '#60A5FA', strokeWidth: 2, r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="livrees"
          stroke="#10B981"
          strokeWidth={2}
          name="Livrées"
          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="annulees"
          stroke="#EF4444"
          strokeWidth={2}
          name="Annulées"
          dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
