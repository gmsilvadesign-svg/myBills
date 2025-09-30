import React, { useEffect, useId, useMemo, useRef, useState } from 'react';

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
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(640);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const clipRawId = useId();
  const clipId = useMemo(
    () => (clipRawId && clipRawId.replace(/[:]/g, '')) || `clip-${Math.random().toString(36).slice(2)}`,
    [clipRawId],
  );

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

  const padding = { top: 36, right: 36, bottom: 44, left: 120 };
  const innerW = Math.max(0, width - padding.left - padding.right);
  const innerH = Math.max(0, height - padding.top - padding.bottom);

  const visibleSeries = series.filter((s) => enabled[s.name] !== false);
  const scaleSeries = visibleSeries.length ? visibleSeries : series;

  const maxLineVal = Math.max(0, ...scaleSeries.flatMap((s) => s.values));
  const domainMin = 0;
  const { domainMax, ticks } = buildRoundedTicks(domainMin, maxLineVal, TICK_COUNT);
  const effectiveMax = Math.max(domainMax, domainMin + 1);

  const stepX = labels.length <= 1 ? innerW : innerW / Math.max(1, labels.length - 1);
  const x = (index: number) => (labels.length <= 1 ? innerW / 2 : index * stepX);
  const y = (value: number) => {
    const clamped = Math.min(effectiveMax, Math.max(domainMin, value));
    const t = (clamped - domainMin) / Math.max(1e-6, effectiveMax - domainMin);
    return innerH - t * innerH;
  };

  const pathFor = (vals: number[]) => {
    if (!vals.length) return '';
    return vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');
  };

  const handleMove = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = event.clientX - rect.left - padding.left;
    const relativeY = event.clientY - rect.top - padding.top;
    if (relativeX < 0 || relativeX > innerW || relativeY < 0 || relativeY > innerH) {
      setHoverIndex(null);
      setTooltipPos(null);
      return;
    }
    const idx = labels.length <= 1
      ? 0
      : Math.min(labels.length - 1, Math.max(0, Math.round(relativeX / Math.max(stepX, 1e-6))));
    setHoverIndex(idx);
    const highest = Math.max(0, ...visibleSeries.map((s) => s.values[idx] ?? 0));
    setTooltipPos({ x: padding.left + x(idx), y: padding.top + y(highest) });
  };

  const handleLeave = () => {
    setHoverIndex(null);
    setTooltipPos(null);
  };

  const tooltipData = useMemo(() => {
    if (hoverIndex === null) return null;
    const items = visibleSeries.map((s) => ({
      name: s.name,
      color: s.color,
      value: s.values[hoverIndex] ?? 0,
    }));
    return {
      label: labels[hoverIndex] ?? '',
      items,
    };
  }, [hoverIndex, labels, visibleSeries]);

  const tooltipStyle = useMemo(() => {
    if (!tooltipPos) return null;
    const TOOLTIP_WIDTH = 176;
    const offsetX = 16;
    const offsetY = 36;
    let left = tooltipPos.x + offsetX;
    if (left + TOOLTIP_WIDTH > width) {
      left = Math.max(8, tooltipPos.x - offsetX - TOOLTIP_WIDTH);
    }
    let top = tooltipPos.y - offsetY;
    if (top < 0) {
      top = tooltipPos.y + 12;
    }
    return { left, top } as const;
  }, [tooltipPos, width]);

  const clipPathId = `${clipId}-chart`;

  return (
    <div ref={wrapRef} className="w-full max-w-5xl mx-auto">
      <div className="relative">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="block mx-auto"
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
        >
          <defs>
            <clipPath id={clipPathId}>
              <rect x={0} y={0} width={innerW} height={innerH} rx={8} />
            </clipPath>
          </defs>
          <g transform={`translate(${padding.left},${padding.top})`}>
            {ticks.map((tv, idx) => (
              <line key={`grid-${idx}`} x1={0} x2={innerW} y1={y(tv)} y2={y(tv)} stroke="#94a3b8" opacity={0.15} />
            ))}
            <line x1={0} x2={0} y1={0} y2={innerH} stroke="#94a3b8" opacity={0.4} />
            {ticks.map((tv, i) => (
              <g key={`tick-${i}`}>
                <line x1={-6} x2={0} y1={y(tv)} y2={y(tv)} stroke="#94a3b8" opacity={0.45} />
                <text
                  x={-12}
                  y={y(tv)}
                  textAnchor="end"
                  dominantBaseline="central"
                  fontSize={10}
                  fill="#64748b"
                >
                  {formatY ? formatY(tv) : Math.round(tv).toString()}
                </text>
              </g>
            ))}
            <line x1={0} x2={innerW} y1={y(domainMin)} y2={y(domainMin)} stroke="#94a3b8" opacity={0.3} />

            <g clipPath={`url(#${clipPathId})`}>
              {hoverIndex !== null && (
                <line
                  x1={x(hoverIndex)}
                  x2={x(hoverIndex)}
                  y1={0}
                  y2={innerH}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  opacity={0.55}
                />
              )}

              {visibleSeries.map((s, si) => {
                const d = pathFor(s.values);
                if (!d) return null;
                return (
                  <path
                    key={`line-${si}`}
                    d={d}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={2.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.95}
                  />
                );
              })}

              {visibleSeries.flatMap((s) =>
                s.values.map((v, i) => (
                  <circle
                    key={`${s.name}-${i}`}
                    cx={x(i)}
                    cy={y(v)}
                    r={hoverIndex === i ? 4.5 : 3}
                    fill={s.color}
                    stroke="#0f172a"
                    strokeWidth={visibleSeries.length > 1 ? 0.6 : 0}
                    opacity={hoverIndex === null || hoverIndex === i ? 0.95 : 0.5}
                  />
                ))
              )}
            </g>

            {labels.map((label, i) => (
              <text key={`label-${i}`} x={x(i)} y={innerH + 22} textAnchor="middle" fontSize={11} fill="#64748b" className="zoom-500:hidden">
                {label}
              </text>
            ))}
          </g>
        </svg>
        {tooltipData && tooltipStyle && (
          <div
            className="pointer-events-none absolute z-10 rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-2 shadow-lg"
            style={tooltipStyle}
          >
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-200 mb-1">
              {tooltipData.label}
            </div>
            <div className="space-y-1">
              {tooltipData.items.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-slate-800 dark:text-slate-100 font-medium">
                    {formatY ? formatY(item.value) : item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-1 mt-2 flex-wrap justify-center">
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
              className={`flex items-center gap-1 text-xs font-medium px-1 py-0.5 rounded-full border transition-colors duration-200 text-[8px] zoom-responsive-legend ${
                active
                  ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200'
                  : 'bg-transparent border-slate-300/60 dark:border-slate-600/60 text-slate-400 dark:text-slate-500'
              }`}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
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

