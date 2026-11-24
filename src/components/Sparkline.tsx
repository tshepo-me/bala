import type { PricePoint } from "@/lib/domain/types";

interface Props {
  points: PricePoint[];
  /** Horizontal reference line, e.g. the fair price. */
  reference?: number | null;
  color?: string;
  width?: number;
  height?: number;
}

/** Server-renderable SVG price history line. */
export function Sparkline({ points, reference, color = "#0b6e4f", width = 160, height = 40 }: Props) {
  if (points.length < 2) return <span className="text-xs text-slate-400">no history</span>;
  const values = points.map((p) => p.price);
  const all = reference != null ? [...values, reference] : values;
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  const pad = 3;
  const x = (i: number) => pad + (i / (points.length - 1)) * (width - pad * 2);
  const y = (v: number) => height - pad - ((v - min) / span) * (height - pad * 2);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p.price).toFixed(1)}`).join(" ");
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={`Price history, latest ${last.price}`}
    >
      {reference != null && (
        <line
          x1={pad}
          x2={width - pad}
          y1={y(reference)}
          y2={y(reference)}
          stroke="#94a3b8"
          strokeDasharray="3 3"
          strokeWidth="1"
        />
      )}
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(points.length - 1)} cy={y(last.price)} r="2.5" fill={color} />
    </svg>
  );
}
