interface PieChartProps {
  completed: number;
  remaining: number;
  size?: number;
}

export function PieChart({ completed, remaining, size = 200 }: PieChartProps) {
  const total = completed + remaining;
  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-3">
        <svg width={size} height={size} viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="#e5e7eb" />
          <text x="100" y="105" textAnchor="middle" fontSize="16" fill="#6b7280" fontWeight="600">No Data</text>
        </svg>
      </div>
    );
  }

  const completedPercent = (completed / total) * 100;
  void remaining; // used in pie chart rendering

  const completedAngle = (completed / total) * 360;

  const startAngle = -90;
  const endAngle = startAngle + completedAngle;

  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const x1 = 100 + 80 * Math.cos(startRad);
  const y1 = 100 + 80 * Math.sin(startRad);
  const x2 = 100 + 80 * Math.cos(endRad);
  const y2 = 100 + 80 * Math.sin(endRad);

  const largeArc = completedAngle > 180 ? 1 : 0;

  const completedPath =
    completedAngle >= 360
      ? `M 100 20 A 80 80 0 1 1 99.99 20 Z`
      : `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width={size} height={size} viewBox="0 0 200 200" className="drop-shadow-lg">
          <defs>
            <linearGradient id="completedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="remainingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          </defs>
          {/* Background circle (remaining) */}
          <circle cx="100" cy="100" r="80" fill="url(#remainingGrad)" filter="url(#shadow)" />
          {/* Completed slice */}
          {completed > 0 && (
            <path d={completedPath} fill="url(#completedGrad)" filter="url(#shadow)" />
          )}
          {/* Center circle for donut effect */}
          <circle cx="100" cy="100" r="50" fill="white" filter="url(#shadow)" />
          <text x="100" y="92" textAnchor="middle" fontSize="22" fill="#1f2937" fontWeight="bold">
            {Math.round(completedPercent)}%
          </text>
          <text x="100" y="112" textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="500">
            Complete
          </text>
        </svg>
      </div>
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm"></div>
          <span className="text-sm text-gray-600">
            Done: <span className="font-bold text-gray-800">{completed}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-red-400 to-red-500 shadow-sm"></div>
          <span className="text-sm text-gray-600">
            Left: <span className="font-bold text-gray-800">{remaining}</span>
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-400">
        {completedPercent >= 80 ? '🎉 Great progress!' : completedPercent >= 50 ? '💪 Keep it up!' : '⏰ Stay on track!'}
      </p>
    </div>
  );
}
