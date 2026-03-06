'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CommandesParHeure } from '@/lib/kpi/queries';

interface GraphiqueHeuresProps {
  data: CommandesParHeure[];
}

export default function GraphiqueHeures({ data }: GraphiqueHeuresProps) {
  const maxValue = Math.max(...data.map(d => d.nombre));

  const getBarColor = (value: number) => {
    const intensity = value / maxValue;
    if (intensity > 0.7) return '#EF4444'; // red for high
    if (intensity > 0.4) return '#F59E0B'; // orange
    return '#10B981'; // green for low
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-800 border border-zinc-600 rounded-lg p-3 shadow-lg">
          <p className="text-zinc-200 font-medium">{`${label}h: ${payload[0].value} commandes`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="heure"
          stroke="#9CA3AF"
          fontSize={12}
          tickFormatter={(value) => `${value}h`}
        />
        <YAxis
          stroke="#9CA3AF"
          fontSize={12}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="nombre"
          fill="#10B981"
          radius={[4, 4, 0, 0]}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.nombre)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
