// A small readiness-trend line chart. Pure SVG, no deps.
export function Sparkline({
  points,
  width = 260,
  height = 64,
  className = "",
}: {
  points: { score: number; capturedAt: Date }[];
  width?: number;
  height?: number;
  className?: string;
}) {
  if (points.length < 2) return null;

  const pad = 4;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const min = 0;
  const max = 100;

  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * w;
    const y = pad + h - ((p.score - min) / (max - min)) * h;
    return [x, y] as const;
  });

  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)},${(height - pad).toFixed(1)} L${coords[0][0].toFixed(1)},${(height - pad).toFixed(1)} Z`;
  const last = coords[coords.length - 1];

  return (
    <svg width={width} height={height} className={className} role="img" aria-label="Readiness trend">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1eae82" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#1eae82" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-fill)" />
      <path d={line} fill="none" stroke="#128e6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill="#128e6b" />
    </svg>
  );
}
