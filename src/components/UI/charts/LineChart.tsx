import React, { useEffect, useRef, useState } from 'react';

interface Series {
  name: string;
  color: string;
  values: number[];
}

interface LineChartProps {
  labels: string[];
  series: Series[];
  height?: number;
  formatY?: (v: number) => string;
}

const TICK_COUNT = 5;

const niceNumber = (value: number, round: boolean): number => {
  if (!(value > 0)) return 0;
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / Math.pow(10, exponent);
  let niceFraction: number;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }
  return niceFraction * Math.pow(10, exponent);
};

const buildRoundedTicks = (min: number, max: number, desiredCount: number) => {
  if (!(max > min)) {
    const fallbackMax = min === 0 ? 1 : min * 2;
    const step = (fallbackMax - min) / Math.max(1, desiredCount - 1);
    const ticks = Array.from({ length: desiredCount }, (_, i) =>
      parseFloat((min + step * i).toFixed(6)),
    );
    return { domainMax: fallbackMax, ticks };
  }
  const range = max - min;
  const niceRange = niceNumber(range, false);
  const step = niceNumber(niceRange / Math.max(1, desiredCount - 1), true);
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let tick = min; tick <= niceMax + step * 0.5; tick += step) {
    ticks.push(parseFloat(tick.toFixed(6)));
  }
  return { domainMax: niceMax, ticks };
};

export default function LineChart({ labels, series, height = 220, formatY }: LineChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!wrapRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width || 640;
      setWidth(Math.max(320, Math.floor(w)));
    });
    obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    setEnabled((prev) => {
      const next: Record<string, boolean> = {};
      series.forEach((s) => {
        next[s.name] = prev[s.name] ?? true;
      });
      return next;
    });
  }, [series]);

  const padding = { top: 28, right: 32, bottom: 38, left: 68 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const visibleSeries = series.filter((s) => enabled[s.name] !== false);
  const scaleSeries = visibleSeries.length ? visibleSeries : series;

  const maxLineVal = Math.max(0, ...scaleSeries.flatMap((s) => s.values));
  const domainMin = 0;
  const { domainMax, ticks } = buildRoundedTicks(domainMin, maxLineVal, TICK_COUNT);
  const effectiveMax = Math.max(domainMax, domainMin + 1);

  const x = (index: number) => (labels.length <= 1 ? 0 : (index * innerW) / (labels.length - 1));
  const y = (value: number) => {
    const clamped = Math.min(effectiveMax, Math.max(domainMin, value));
    const t = (clamped - domainMin) / Math.max(1e-6, effectiveMax - domainMin);
    return innerH - t * innerH;
  };

  const pathFor = (vals: number[]) => {
    if (!vals.length) return '';
    return vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');
  };

  return (
    <div ref={wrapRef} className="w-full max-w-5xl mx-auto">
      <svg width={width} height={height} className="block mx-auto">
        <g transform={`translate(${padding.left},${padding.top})`}>
          {ticks.map((tv, idx) => (
            <line key={`grid-${idx}`} x1={0} x2={innerW} y1={y(tv)} y2={y(tv)} stroke="#94a3b8" opacity={0.15} />
          ))}
          <line x1={0} x2={0} y1={0} y2={innerH} stroke="#94a3b8" opacity={0.4} />
          {ticks.map((tv, i) => (
            <g key={`tick-${i}`}>
              <line x1={-4} x2={0} y1={y(tv)} y2={y(tv)} stroke="#94a3b8" opacity={0.45} />
              <text
                x={-10}
                y={y(tv)}
                textAnchor="end"
                dominantBaseline="central"
                fontSize={11}
                fill="#64748b"
              >
                {formatY ? formatY(tv) : Math.round(tv).toString()}
              </text>
            </g>
          ))}
          <line x1={0} x2={innerW} y1={y(domainMin)} y2={y(domainMin)} stroke="#94a3b8" opacity={0.3} />

          {visibleSeries.map((s, si) => {
            const d = pathFor(s.values);
            if (!d) return null;
            return (
              <path
                key={`line-${si}`}
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.95}
              />
            );
          })}

          {visibleSeries.flatMap((s, si) =>
            s.values.map((v, i) => (
              <circle
                key={`${s.name}-${i}`}
                cx={x(i)}
                cy={y(v)}
                r={3}
                fill={s.color}
                stroke="#0f172a"
                strokeWidth={visibleSeries.length > 1 ? 0.6 : 0}
                opacity={0.95}
              />
            ))
          )}

          {labels.map((label, i) => (
            <text key={`label-${i}`} x={x(i)} y={innerH + 20} textAnchor="middle" fontSize={11} fill="#64748b">
              {label}
            </text>
          ))}
        </g>
      </svg>
      <div className="flex gap-3 mt-3 flex-wrap justify-center">
        {series.map((s) => {
          const active = enabled[s.name] !== false;
          return (
            <button
              key={s.name}
              type="button"
              onClick={() =>
                setEnabled((prev) => {
                  const next = { ...prev, [s.name]: !active };
                  const anyActive = series.some((entry) => next[entry.name]);
                  if (!anyActive) {
                    return prev;
                  }
                  return next;
                })
              }
              className={`flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full border transition-colors duration-200 ${
                active
                  ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200'
                  : 'bg-transparent border-slate-300/60 dark:border-slate-600/60 text-slate-400 dark:text-slate-500'
              }`}
            >
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{
                  background: active ? s.color : 'transparent',
                  border: `2px solid ${s.color}`,
                  opacity: active ? 1 : 0.35,
                }}
              />
              {s.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
