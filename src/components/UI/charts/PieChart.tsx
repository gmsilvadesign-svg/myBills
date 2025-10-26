import React from 'react';

interface Slice {
  label: string;
  value: number;
  color: string;
  children?: { label: string; value: number }[];
}

interface PieChartProps {
  data: Slice[];
  size?: number;
  paletteType?: 'warm' | 'cool';
  // Optional value formatter (e.g., currency)
  formatValue?: (n: number) => string;
  // Legend control
  showLegend?: boolean;
  // Show contextual legend on hover
  hoverLegend?: boolean;
  // Center content customization
  centerText?: string;
  centerSubText?: string;
  centerTextColor?: string;
  centerBold?: boolean;
  showTotal?: boolean;
  totalLabel?: string;
  // If true, draw a green "check" in the center instead of text
  centerCheck?: boolean;
  // Hover behaviour overrides
  hoverCenterText?: string;
  hoverCenterSubText?: string | null;
  hoverCenterTextColor?: string;
  hoverFontScale?: number;
  onHoverChange?: (hovering: boolean) => void;
}

function palette(n: number, type: 'warm' | 'cool' = 'warm'): string[] {
  // High-contrast selections (alternating hues and light/dark)
  if (type === 'warm') {
    const hues = { start: 8, end: 48 };
    const light = { start: 48, end: 72 };
    const colors: string[] = [];
    for (let i = 0; i < n; i += 1) {
      const t = n <= 1 ? 0 : i / (n - 1);
      const hue = hues.start + (hues.end - hues.start) * t;
      const lightness = light.start + (light.end - light.start) * t;
      colors.push(`hsl(${hue}, 85%, ${lightness}%)`);
    }
    return colors;
  }
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
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(cool[i % cool.length]);
  return out;
}

const DEFAULT_HOVER_FONT_SCALE = 1.18;

export default function PieChart({
  data,
  size = 180,
  paletteType,
  formatValue,
  showLegend = true,
  hoverLegend = true,
  centerText,
  centerSubText,
  centerTextColor = '#ffffff',
  centerBold = true,
  showTotal = false,
  totalLabel,
  centerCheck = false,
  hoverCenterText,
  hoverCenterSubText,
  hoverCenterTextColor,
  hoverFontScale,
  onHoverChange,
}: PieChartProps) {
  const [hovered, setHovered] = React.useState(false);
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    setExpandedIndex(null);
  }, [data]);
  const totalRaw = data.reduce((s, d) => s + (d.value || 0), 0);
  // Use `total` only for arc calculations (avoid divide-by-zero)
  const total = totalRaw > 0 ? totalRaw : 1;
  // Ensure distinct colors per item if not provided or if all equal
  const sortedData = [...data].sort((a, b) => (b.value || 0) - (a.value || 0));
  const allEqualColor = sortedData.length > 1 && sortedData.every((d) => d.color === sortedData[0].color);
  const colors = palette(sortedData.length, paletteType || 'warm');
  const colored = sortedData.map((d, i) => ({
    ...d,
    color: (allEqualColor || !d.color || paletteType) ? colors[i] : d.color,
  }));
  const radius = size / 2;
  const center = size / 2;
  const strokeWidth = 24; // donut thickness
  const ringRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * ringRadius;

  const handleEnter = () => {
    if (!hovered) {
      setHovered(true);
      onHoverChange?.(true);
    }
  };

  const handleLeave = () => {
    if (hovered) {
      onHoverChange?.(false);
    }
    setHovered(false);
    setHoverIndex(null);
  };

  let accum = 0;
  const circles = colored.map((d, i) => {
    const frac = d.value / total;
    const dash = Math.max(0, frac * circumference);
    const gap = Math.max(0, circumference - dash);
    const offset = (accum / total) * circumference;
    accum += d.value;
    return (
      <circle
        key={i}
        r={ringRadius}
        cx={center}
        cy={center}
        fill="transparent"
        stroke={d.color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${center} ${center})`}
        onMouseEnter={() => setHoverIndex(i)}
        onMouseLeave={() => setHoverIndex(prev => (prev === i ? null : prev))}
        style={{ opacity: hoverIndex === null ? 1 : (hoverIndex === i ? 1 : 0.35), cursor: 'pointer' }}
      />
    );
  });

  // Função para truncar valores monetários longos
  const truncateValue = (valueStr: string, maxLength: number = 15) => {
    if (valueStr.length <= maxLength) return valueStr;
    
    // Se for um valor monetário, tenta manter a parte importante
    if (valueStr.includes('R$') || valueStr.includes('$')) {
      // Remove espaços e separa símbolo da moeda do valor
      const cleanStr = valueStr.replace(/\s+/g, '');
      if (cleanStr.length <= maxLength) return cleanStr;
      
      // Se ainda for muito longo, trunca mantendo o símbolo
      const currencyMatch = cleanStr.match(/^([R$€£¥]+)/);
      if (currencyMatch) {
        const symbol = currencyMatch[1];
        const remaining = maxLength - symbol.length - 3; // -3 para "..."
        if (remaining > 0) {
          const numberPart = cleanStr.substring(symbol.length);
          return symbol + numberPart.substring(0, remaining) + '...';
        }
      }
    }
    
    return valueStr.substring(0, maxLength - 3) + '...';
  };

  // Função para truncar texto baseado na largura disponível
  const truncateText = (text: string, maxWidth: number, fontSize: number) => {
    const charWidth = fontSize * 0.6; // Estimativa da largura do caractere
    const maxChars = Math.floor(maxWidth / charWidth);
    if (text.length <= maxChars) return text;
    return text.substring(0, Math.max(1, maxChars - 3)) + '...';
  };
  const fallbackK = `${(totalRaw / 1000).toFixed(1)}K`;
  const formatCompact = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 1 : 2)}k`;
    if (value >= 1) return value.toFixed(value >= 100 ? 0 : 1);
    return value.toFixed(2);
  };
  const totalText = showTotal ? formatCompact(totalRaw) : undefined;
  const baseMainText = centerText ?? totalText ?? fallbackK;
  
  // Keep text inside inner hole
  const innerRadius = radius - strokeWidth; // inner empty hole radius
    
  // Melhor cálculo do tamanho da fonte para evitar overflow
  const availableWidth = innerRadius * 1.4; // Área disponível para o texto (mais conservador)
  const charW = 0.6; // fator de largura do caractere mais conservador
  const maxByWidth = availableWidth / (Math.max(1, baseMainText.length) * charW);
  const maxByHeight = innerRadius * 0.5; // Altura máxima mais conservadora
  const baseFontSize = Math.max(8, Math.min(maxByWidth, maxByHeight, 14)); // Limita entre 8px e 14px
  const hoverActive = hovered && typeof hoverCenterText === 'string';
  const fontScale = hoverActive ? (hoverFontScale ?? DEFAULT_HOVER_FONT_SCALE) : 1;
  const fontSize = Math.min(baseFontSize * fontScale, baseFontSize * 1.3);
  const rawMainText = hoverActive ? (hoverCenterText as string) : baseMainText;
  const mainText = truncateText(rawMainText, availableWidth, fontSize);
  const originalMainText = rawMainText;
  const effectiveCenterSubText = centerSubText ?? (showTotal ? totalLabel : undefined);
  const rawSubText = hoverActive
    ? (hoverCenterSubText === undefined ? effectiveCenterSubText : hoverCenterSubText || undefined)
    : effectiveCenterSubText;
  const subText = rawSubText ? truncateText(rawSubText, availableWidth, fontSize * 0.55) : undefined;
  const resolvedCenterColor =
    showTotal && !centerText && centerTextColor === '#ffffff' ? '#0f172a' : centerTextColor;
  const textColor = hoverActive && hoverCenterTextColor ? hoverCenterTextColor : resolvedCenterColor;
  const showSubText = typeof subText === 'string' && subText.trim().length > 0;

  const breakdownSlice = React.useMemo(() => {
    if (expandedIndex !== null && colored[expandedIndex]?.children?.length) {
      return { index: expandedIndex, slice: colored[expandedIndex] };
    }
    if (hoverIndex !== null && colored[hoverIndex]?.children?.length) {
      return { index: hoverIndex, slice: colored[hoverIndex] };
    }
    return null;
  }, [expandedIndex, hoverIndex, colored]);

  return (
    <div
      className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <svg width={size} height={size}>
        {circles}
        {centerCheck ? (
          <>
            {/* Green filled center with a white check mark */}
            <circle cx={center} cy={center} r={innerRadius * 0.8} fill="#10b981" />
            <path
              d={`M ${center - innerRadius * 0.35} ${center}
                  L ${center - innerRadius * 0.1} ${center + innerRadius * 0.28}
                  L ${center + innerRadius * 0.4} ${center - innerRadius * 0.25}`}
              fill="none"
              stroke="#ffffff"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={Math.max(3, innerRadius * 0.12)}
            />
          </>
        ) : (
          <>
            <text
              x={center}
              y={center - (showSubText ? fontSize * 0.25 : 0)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={fontSize}
              fontWeight={centerBold ? 700 : 500}
              fill={textColor}
              pointerEvents="none"
            >
              <title>{originalMainText}</title>
              {mainText}
            </text>
            {showSubText && (
              <text
                x={center}
                y={center + fontSize * 0.55}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.max(9, fontSize * 0.55)}
                fontWeight={500}
                fill={textColor}
                opacity={0.85}
              >
                <title>{rawSubText}</title>
                {subText}
              </text>
            )}
          </>
        )}
      </svg>
      {showLegend && (
        <div className="flex flex-col md:items-start items-center gap-3">
          <div className="text-xs space-y-1 zoom-responsive-legend flex flex-col md:items-start items-center max-w-[240px]">
            {colored.map((d, i) => {
              const pct = total > 0 ? (d.value / total) * 100 : 0;
              const valueStr = formatValue ? formatValue(d.value) : d.value.toLocaleString();
              const pctStr = `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(pct)}%`;
              const displayValue = truncateValue(valueStr);
              const hasChildren = !!(d.children && d.children.length);
              const isExpanded = breakdownSlice?.index === i;
              return (
                <button
                  key={`${d.label}-${i}`}
                  type="button"
                  className={`w-full flex items-center justify-between gap-2 rounded-lg px-2 py-1 transition-colors ${hasChildren ? 'hover:bg-slate-100 text-left cursor-pointer' : 'cursor-default'} ${isExpanded ? 'bg-slate-100' : ''}`}
                  onClick={() => {
                    if (!hasChildren) return;
                    setExpandedIndex((prev) => (prev === i ? null : i));
                  }}
                  onMouseEnter={() => {
                    if (hasChildren) setHoverIndex(i);
                  }}
                  onMouseLeave={() => {
                    if (hasChildren && hoverIndex === i) setHoverIndex(null);
                  }}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-slate-600 truncate" title={d.label}>
                      {d.label}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-right">
                    <span className="text-slate-600 whitespace-nowrap" title={valueStr}>
                      {displayValue}
                    </span>
                    <span className="text-slate-400 whitespace-nowrap">{pctStr}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {breakdownSlice?.slice.children && (
            <div className="text-xs bg-white/90 backdrop-blur rounded-xl px-3 py-2 shadow-sm border border-slate-200/70 space-y-1 w-full max-w-[240px]">
              <div className="font-semibold text-slate-700">{breakdownSlice.slice.label}</div>
              {breakdownSlice.slice.children.map((child, idx) => {
                const valueStr = formatValue ? formatValue(child.value) : child.value.toLocaleString();
                const pct = total > 0 ? (child.value / total) * 100 : 0;
                const pctStr = `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(pct)}%`;
                return (
                  <div key={`${child.label}-${idx}`} className="flex items-center justify-between gap-2">
                    <span className="text-slate-600 truncate" title={child.label}>
                      {child.label}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-slate-600 whitespace-nowrap" title={valueStr}>
                        {truncateValue(valueStr)}
                      </span>
                      <span className="text-slate-400 whitespace-nowrap">{pctStr}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {!showLegend && hoverLegend && hovered && (
        <div className="text-[8px] space-y-0.5 bg-white/80 backdrop-blur rounded-lg px-2 py-1 shadow border border-slate-200/60 zoom-responsive-legend">
          {colored.map((d, i) => {
            const pct = (d.value / total) * 100;
            const valueStr = formatValue ? formatValue(d.value) : d.value.toLocaleString();
            const pctStr = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(pct) + '%';
            const dim = hoverIndex !== null && hoverIndex !== i;
            const displayValue = truncateValue(valueStr);
            return (
              <div key={d.label} className="flex items-center gap-1" style={{ opacity: dim ? 0.6 : 1 }}>
                <span className="inline-block w-2 h-2 rounded" style={{ background: d.color }} />
                <span className="text-slate-700 truncate max-w-[120px]" title={d.label}>{d.label}</span>
                <span className="text-slate-600 whitespace-nowrap" title={valueStr}>{displayValue}</span>
                <span className="text-slate-600 whitespace-nowrap">{pctStr}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}



