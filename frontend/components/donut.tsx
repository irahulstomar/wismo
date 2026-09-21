// Donut chart — segments as stroked arcs on a single circle, with a 2px surface gap between them.
export type DonutSegment = { label: string; value: number; color: string };

export function Donut({
  segments,
  size = 132,
  thickness = 16,
}: {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const gap = 2; // px surface gap between segments

  let offset = 0;
  const arcs = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const frac = s.value / total;
      const len = Math.max(frac * c - gap, 0);
      const arc = (
        <circle
          key={s.label}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={s.color}
          strokeWidth={thickness}
          strokeDasharray={`${len} ${c - len}`}
          strokeDashoffset={-offset}
        />
      );
      offset += frac * c;
      return arc;
    });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--inset)" strokeWidth={thickness} />
      {arcs}
    </svg>
  );
}
