// A circular progress ring for the headline readiness score.
export function ReadinessRing({
  score,
  size = 160,
  stroke = 12,
}: {
  score: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.min(100, Math.max(0, score)) / 100) * circumference;

  // Color shifts with readiness: red → amber → green.
  const color = score >= 90 ? "#16a34a" : score >= 70 ? "#1eae82" : score >= 45 ? "#d97706" : "#dc2626";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: "stroke-dasharray 700ms ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold tabular-nums text-ink" style={{ color }}>
          {score}
          <span className="text-xl">%</span>
        </span>
        <span className="stat-label mt-0.5">Ready</span>
      </div>
    </div>
  );
}
