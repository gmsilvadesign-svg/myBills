interface RadialProgressProps {
  value: number;
  target?: number | null;
  label: string;
  size?: number;
  valueFormatter?: (value: number) => string;
  targetFormatter?: (value: number) => string;
  percentFormatter?: (ratio: number) => string;
  hideValue?: boolean;
  mode?: "target" | "ceiling";
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const colorForTarget = (ratio: number) => {
  if (ratio >= 1.1) return "#0ea5e9"; // over achievement
  if (ratio >= 1) return "#22c55e";
  if (ratio >= 0.75) return "#65a30d";
  if (ratio >= 0.5) return "#f59e0b";
  return "#ef4444";
};

const colorForCeiling = (ratio: number) => {
  if (ratio >= 1.1) return "#dc2626";
  if (ratio >= 1) return "#f97316";
  if (ratio >= 0.75) return "#facc15";
  if (ratio >= 0.5) return "#65a30d";
  return "#22c55e";
};

export default function RadialProgress({
  value,
  target,
  label,
  size = 148,
  valueFormatter,
  targetFormatter,
  percentFormatter,
  hideValue = false,
  mode = "target",
}: RadialProgressProps) {
  const svgSize = size;
  const strokeWidth = Math.max(8, Math.min(14, size * 0.08));
  const radius = svgSize / 2;
  const innerRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * innerRadius;

  const targetValue = typeof target === "number" && Number.isFinite(target) && target > 0 ? target : undefined;
  const ratio = targetValue ? value / targetValue : null;
  const safeRatio = ratio !== null && Number.isFinite(ratio) ? ratio : null;
  const clampedRatioForStroke = safeRatio !== null ? clamp(safeRatio, 0, 1) : 0;
  const progressLength = clampedRatioForStroke * circumference;
  const dashArray = `${progressLength} ${circumference - progressLength}`;

  const color = safeRatio === null ? "#64748b" : (mode === "ceiling" ? colorForCeiling(safeRatio) : colorForTarget(safeRatio));
  const trackColor = "rgba(148, 163, 184, 0.25)";

  const fallbackPercentFormatter = (value: number) =>
    new Intl.NumberFormat(undefined, {
      style: "percent",
      maximumFractionDigits: value < 1 ? 0 : 1,
    }).format(value);

  const percentText = hideValue
    ? "****"
    : safeRatio !== null
      ? (percentFormatter ?? fallbackPercentFormatter)(safeRatio)
      : "--";

  const valueText = hideValue
    ? "****"
    : valueFormatter
      ? valueFormatter(value)
      : value.toLocaleString();

  const targetText = hideValue
    ? "****"
    : targetValue !== undefined
      ? targetFormatter
        ? targetFormatter(targetValue)
        : targetValue.toLocaleString()
      : null;

  const subText = targetText ? `${valueText} / ${targetText}` : valueText;

  // Função para truncar texto baseado na largura disponível
  const truncateText = (text: string, maxWidth: number, fontSize: number) => {
    const charWidth = fontSize * 0.6; // Estimativa da largura do caractere
    const maxChars = Math.floor(maxWidth / charWidth);
    if (text.length <= maxChars) return text;
    return text.substring(0, Math.max(1, maxChars - 3)) + '...';
  };

  // Melhor cálculo do tamanho da fonte baseado no raio interno disponível
  const availableWidth = innerRadius * 1.4; // Área disponível para o texto (mais conservador)
  const maxFontSize = Math.min(svgSize * 0.14, availableWidth / 4); // Limita baseado no espaço
  const fontSize = Math.max(10, Math.min(maxFontSize, 16)); // Entre 10px e 16px
  const subFontSize = Math.max(8, fontSize * 0.5);

  // Truncar textos se necessário
  const truncatedPercentText = truncateText(percentText, availableWidth, fontSize);
  const truncatedSubText = subText ? truncateText(subText, availableWidth, subFontSize) : null;

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <svg width={svgSize} height={svgSize}>
        <circle
          cx={radius}
          cy={radius}
          r={innerRadius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {safeRatio !== null && (
          <circle
            cx={radius}
            cy={radius}
            r={innerRadius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={dashArray}
            transform={`rotate(-90 ${radius} ${radius})`}
          />
        )}
        <text
          x={radius}
          y={radius - (truncatedSubText ? fontSize * 0.22 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fontSize}
          fontWeight={700}
          fill={color}
        >
          <title>{percentText}</title>
          {truncatedPercentText}
        </text>
        {truncatedSubText && (
          <text
            x={radius}
            y={radius + fontSize * 0.6}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={subFontSize}
            fontWeight={500}
            fill="#475569"
            opacity={0.8}
          >
            <title>{subText}</title>
            {truncatedSubText}
          </text>
        )}
      </svg>
      <div className="text-xs font-medium text-slate-600">{label}</div>
    </div>
  );
}


