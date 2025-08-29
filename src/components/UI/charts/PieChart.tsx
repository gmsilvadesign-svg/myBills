import React from 'react';

interface Slice { label: string; value: number; color: string; }

interface PieChartProps {
  data: Slice[];
  size?: number;
  paletteType?: 'warm' | 'cool';
  // Optional value formatter (e.g., currency)
  formatValue?: (n: number) => string;
}

function palette(n: number, type: 'warm' | 'cool' = 'warm'): string[] {
  // High-contrast selections (alternating hues and light/dark)
  const warm = [
    '#dc2626', // red-600
    '#ea580c', // orange-600
    '#f59e0b', // amber-500
    '#be185d', // rose-700
    '#b45309', // amber-800
    '#f43f5e', // rose-500
    '#7c2d12', // orange-900 (brownish)
    '#fb923c', // orange-300
    '#d946ef', // fuchsia-500 (warm magenta)
    '#a16207', // amber-700
  ];
  const cool = [
    '#2563eb', // blue-600
    '#0ea5e9', // sky-500
    '#10b981', // emerald-500
    '#22c55e', // green-500
    '#06b6d4', // cyan-500
    '#8b5cf6', // violet-500
    '#16a34a', // green-600
    '#60a5fa', // blue-400
    '#14b8a6', // teal-500
    '#3b82f6', // blue-500
  ];
  const base = type === 'cool' ? cool : warm;
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(base[i % base.length]);
  return out;
}

export default function PieChart({ data, size = 180, paletteType, formatValue }: PieChartProps) {
  const totalRaw = data.reduce((s, d) => s + (d.value || 0), 0);
  const total = totalRaw > 0 ? totalRaw : 1;
  // Ensure distinct colors per item if not provided or if all equal
  const allEqualColor = data.length > 1 && data.every(d => d.color === data[0].color);
  const colors = palette(data.length, paletteType || 'warm');
  const colored = data.map((d, i) => ({ ...d, color: (allEqualColor || !d.color || paletteType) ? colors[i] : d.color }));
  const radius = size / 2;
  const center = size / 2;

  let accum = 0;
  const circles = colored.map((d, i) => {
    const frac = d.value / total;
    const dash = Math.max(0, frac * Math.PI * (size - 10));
    const gap = Math.max(0, Math.PI * (size - 10) - dash);
    const offset = (accum / total) * Math.PI * (size - 10);
    accum += d.value;
    return (
      <circle
        key={i}
        r={radius - 6}
        cx={center}
        cy={center}
        fill="transparent"
        stroke={d.color}
        strokeWidth={12}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${center} ${center})`}
      />
    );
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size}>
        {circles}
        <text x={center} y={center} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#64748b">
          {total === 0 ? '0' : ''}
        </text>
      </svg>
      <div className="text-xs space-y-1">
        {colored.map(d => {
          const pct = (d.value / total) * 100;
          const valueStr = formatValue ? formatValue(d.value) : d.value.toLocaleString();
          const pctStr = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(pct) + '%';
          return (
            <div key={d.label} className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded" style={{ background: d.color }} />
              <span className="text-slate-600 dark:text-slate-300 truncate max-w-[180px]" title={d.label}>{d.label}</span>
              <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">{valueStr}</span>
              <span className="text-slate-400 dark:text-slate-500 whitespace-nowrap">{pctStr}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
