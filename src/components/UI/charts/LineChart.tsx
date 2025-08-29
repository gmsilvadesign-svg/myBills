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
  // Optional formatter for the Y axis values (e.g., currency)
  formatY?: (v: number) => string;
  // Optional percentage overlay (0..1) to draw with right axis
  percentOverlay?: number[];
}

export default function LineChart({ labels, series, height = 220, formatY, percentOverlay }: LineChartProps) {
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

  const padding = { top: 12, right: 42, bottom: 24, left: 56 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  // Vertical scale: start at 0 and go to 4/3 of the max value
  const rawMax = Math.max(1, ...series.flatMap(s => s.values));
  const scaledMax = rawMax * (4 / 3); // leaves headroom (~25%) above peaks

  const x = (i: number) => (labels.length <= 1 ? 0 : (i * innerW) / (labels.length - 1));
  const y = (v: number) => innerH - (v / scaledMax) * innerH;
  const yPct = (p: number) => innerH - (Math.min(1, Math.max(0, p)) * innerH);

  const pathFor = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');
  const pathForPct = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${yPct(v)}`).join(' ');

  // Y ticks for values (5 ticks including 0 and max)
  const ticks = Array.from({ length: 5 }, (_, i) => (scaledMax * i) / 4);

  return (
    <div ref={wrapRef} className="w-full max-w-5xl mx-auto">
      <svg width={width} height={height} className="block mx-auto">
        <g transform={`translate(${padding.left},${padding.top})`}>
          {/* grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => (
            <line key={idx} x1={0} x2={innerW} y1={innerH * p} y2={innerH * p} stroke="#94a3b8" opacity={0.2} />
          ))}
          {/* left Y axis + labels */}
          <line x1={0} x2={0} y1={0} y2={innerH} stroke="#94a3b8" opacity={0.4} />
          {ticks.map((tv, i) => (
            <g key={`yt-${i}`}>
              <line x1={-4} x2={0} y1={y(tv)} y2={y(tv)} stroke="#94a3b8" opacity={0.5} />
              <text x={-8} y={y(tv)} textAnchor="end" dominantBaseline="central" fontSize={10} fill="#64748b">
                {formatY ? formatY(tv) : Math.round(tv).toString()}
              </text>
            </g>
          ))}

          {/* right Y axis for percent overlay */}
          {percentOverlay && percentOverlay.length === labels.length && (
            <>
              <line x1={innerW} x2={innerW} y1={0} y2={innerH} stroke="#e2e8f0" opacity={0.4} />
              {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => (
                <g key={`rp-${idx}`}>
                  <line x1={innerW} x2={innerW + 4} y1={yPct(p)} y2={yPct(p)} stroke="#e2e8f0" opacity={0.7} />
                  <text x={innerW + 8} y={yPct(p)} textAnchor="start" dominantBaseline="central" fontSize={10} fill="#e2e8f0">{Math.round(p * 100)}%</text>
                </g>
              ))}
            </>
          )}
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
          {/* percent overlay line */}
          {percentOverlay && percentOverlay.length === labels.length && (
            <>
              <path d={pathForPct(percentOverlay)} fill="none" stroke="#ffffff" strokeWidth={2} strokeDasharray="4 3" opacity={0.9} />
              {percentOverlay.map((v, i) => (
                <circle key={`p-${i}`} cx={x(i)} cy={yPct(v)} r={2.5} fill="#ffffff" />
              ))}
            </>
          )}
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
        {percentOverlay && (
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="inline-block w-3 h-3 rounded" style={{ background: '#ffffff' }} />
            Economia (% renda)
          </div>
        )}
      </div>
    </div>
  );
}
