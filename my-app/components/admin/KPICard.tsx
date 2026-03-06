interface KPICardProps {
  title: string;
  value: number | string;
  previous: number | string;
  icon: string;
  live?: boolean;
  isPercentage?: boolean;
}

export default function KPICard({ title, value, previous, icon, live, isPercentage }: KPICardProps) {
  const parseValue = (val: number | string) => {
    if (isPercentage && typeof val === 'string') {
      return parseFloat(val.replace('%', ''));
    }
    return typeof val === 'number' ? val : parseFloat(val.toString());
  };

  const current = parseValue(value);
  const prev = parseValue(previous);

  const variation = prev === 0 ? 0 : Math.round(((current - prev) / prev) * 100);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg">{icon}</div>
        {live && (
          <div className="flex items-center gap-1 text-xs text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Live
          </div>
        )}
      </div>

      <div className="mb-1">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-zinc-400">{title}</div>
      </div>

      {variation !== 0 && (
        <div className={`flex items-center gap-1 text-xs ${
          variation > 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          <span>{variation > 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(variation)}%</span>
        </div>
      )}
    </div>
  );
}
