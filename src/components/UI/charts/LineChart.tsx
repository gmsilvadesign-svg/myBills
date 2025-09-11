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
  // Optional bar overlay for a secondary metric (e.g., savings)
  barOverlay?: number[];
  barOverlayColor?: string;
  barOverlayLabel?: string;
}

export default function LineChart({ labels, series, height = 220, formatY, barOverlay, barOverlayColor = '#ffffff', barOverlayLabel }: LineChartProps) {
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

  const padding = { top: 12, right: 24, bottom: 24, left: 56 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  // Vertical scale: start at 0 and end 10% above max of line series
  const maxLineVal = Math.max(0, ...series.flatMap(s => s.values));
  const domainMin = 0;
  const domainMax = Math.max(1, maxLineVal * 1.1);

  const x = (i: number) => (labels.length <= 1 ? 0 : (i * innerW) / (labels.length - 1));
  const y = (v: number) => {
    const t = (v - domainMin) / Math.max(1e-6, (domainMax - domainMin));
    return innerH - t * innerH;
  };

  const pathFor = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');

  // Y ticks for values (5 ticks from 0 to domainMax)
  const ticks = Array.from({ length: 5 }, (_, i) => (domainMax * i) / 4);

  return (
    <div ref={wrapRef} className="w-full max-w-5xl mx-auto">
      <svg width={width} height={height} className="block mx-auto">
        <g transform={`translate(${padding.left},${padding.top})`}>
          {/* grid aligned with ticks */}
          {ticks.map((tv, idx) => (
            <line key={`g-${idx}`} x1={0} x2={innerW} y1={y(tv)} y2={y(tv)} stroke="#94a3b8" opacity={0.2} />
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
          {/* zero baseline */}
          <line x1={0} x2={innerW} y1={y(0)} y2={y(0)} stroke="#94a3b8" opacity={0.35} />

          {/* bar overlay (e.g., savings) */}
          {barOverlay && barOverlay.length === labels.length && (
            <>
              {(() => {
                const step = labels.length > 1 ? innerW / (labels.length - 1) : innerW;
                const bw = Math.max(4, Math.min(24, step * 0.5));
                return barOverlay.map((v, i) => {
                  const cx = x(i);
                  const y0 = y(0);
                  const safeV = Math.max(0, v); // never below zero per requirement
                  const yv = y(safeV);
                  const top = Math.min(y0, yv);
                  const h = Math.abs(yv - y0);
                  return <rect key={`bar-${i}`} x={cx - bw / 2} y={top} width={bw} height={h} fill={barOverlayColor} opacity={0.85} rx={bw/6} />;
                });
              })()}
            </>
          )}
          {/* lines */}
          {series.map((s, si) => {
            const clamped = s.values.map(v => Math.max(domainMin, Math.min(domainMax, v)));
            return <path key={si} d={pathFor(clamped)} fill="none" stroke={s.color} strokeWidth={2} />;
          })}
          {/* points */}
          {series.map((s, si) => (
            s.values.map((v, i) => (
              <circle key={`${si}-${i}`} cx={x(i)} cy={y(Math.max(domainMin, Math.min(domainMax, v)))} r={2.5} fill={s.color} />
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
        {barOverlay && (
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="inline-block w-3 h-3 rounded" style={{ background: barOverlayColor }} />
            {barOverlayLabel || 'Economia'}
          </div>
        )}
      </div>
    </div>
  );
}
