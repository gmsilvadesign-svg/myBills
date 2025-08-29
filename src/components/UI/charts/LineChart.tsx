import React, { useEffect, useRef, useState } from 'react';

interface Series {
  name: string;
  color: string;
  values: number[]; // one per label
}

interface LineChartProps {
  labels: string[];
  series: Series[];
  height?: number;
}

export default function LineChart({ labels, series, height = 220 }: LineChartProps) {
  // Responsive width using ResizeObserver
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  useEffect(() => {
    if (!wrapRef.current) return;
    const obs = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width || 640;
      setWidth(Math.max(320, Math.floor(w)));
    });
    obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  const padding = { top: 12, right: 16, bottom: 24, left: 36 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  // Vertical scale: start at 0 and go to 4/3 of the max value
  const rawMax = Math.max(1, ...series.flatMap(s => s.values));
  const scaledMax = rawMax * (4 / 3); // leaves headroom (~25%) above peaks

  const x = (i: number) => (labels.length <= 1 ? 0 : (i * innerW) / (labels.length - 1));
  const y = (v: number) => innerH - (v / scaledMax) * innerH;

  const pathFor = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');

  return (
    <div ref={wrapRef} className="w-full max-w-5xl mx-auto">
      <svg width={width} height={height} className="block mx-auto">
        <g transform={`translate(${padding.left},${padding.top})`}>
          {/* grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => (
            <line key={idx} x1={0} x2={innerW} y1={innerH * p} y2={innerH * p} stroke="#94a3b8" opacity={0.2} />
          ))}
          {/* lines */}
          {series.map((s, si) => (
            <path key={si} d={pathFor(s.values)} fill="none" stroke={s.color} strokeWidth={2} />
          ))}
          {/* points */}
          {series.map((s, si) => (
            s.values.map((v, i) => (
              <circle key={`${si}-${i}`} cx={x(i)} cy={y(v)} r={2.5} fill={s.color} />
            ))
          ))}
          {/* x labels */}
          {labels.map((l, i) => (
            <text key={i} x={x(i)} y={innerH + 14} textAnchor="middle" fontSize={10} fill="#64748b">{l}</text>
          ))}
        </g>
      </svg>
      {/* Legend */}
      <div className="flex gap-3 mt-2 flex-wrap justify-center">
        {series.map(s => (
          <div key={s.name} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span className="inline-block w-3 h-3 rounded" style={{ background: s.color }} />
            {s.name}
          </div>
        ))}
      </div>
    </div>
  );
}
