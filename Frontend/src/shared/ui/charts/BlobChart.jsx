import { useId } from "react";
import { cx } from "../../lib/cx";
import { foldSeries } from "../../lib/series";

/**
 * Soft overlapping blobs, area proportional to count.
 *
 * Deliberately overlapping — that overlap blends colours into shades outside
 * the validated ramp, so identity must NOT rest on colour here: every blob
 * carries a surface ring to stay separable, and the legend names each series
 * with its figure as text. The chart is never the only way to read a number.
 */

/** Lay blobs out on a loose ring so they overlap without burying each other. */
const layout = (count, width, height) => {
  const cx0 = width / 2;
  const cy0 = height / 2;

  if (count === 1) return [{ x: cx0, y: cy0 }];

  // Radius scales down as the ring gets busier, keeping overlap consistent
  const spread = Math.min(width, height) * (count <= 3 ? 0.17 : 0.22);

  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    return {
      x: cx0 + Math.cos(angle) * spread,
      y: cy0 + Math.sin(angle) * spread * 0.82,
    };
  });
};

const BlobChart = ({
  data, // [{ label, value }]
  width = 260,
  height = 200,
  className,
}) => {
  const titleId = useId();

  const series = foldSeries(data).filter((s) => s.value > 0);
  const total = series.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) return null;

  const positions = layout(series.length, width, height);

  // Area ∝ value, so radius ∝ sqrt(value) — sizing by radius instead would
  // exaggerate the biggest series by its square.
  const maxValue = Math.max(...series.map((s) => s.value));
  const maxRadius = Math.min(width, height) * 0.3;
  const minRadius = Math.min(width, height) * 0.11;

  const blobs = series.map((s, i) => ({
    ...s,
    ...positions[i],
    r:
      minRadius +
      (maxRadius - minRadius) * Math.sqrt(s.value / maxValue) *
        (maxValue === s.value ? 1 : 0.92),
  }));

  return (
    <div className={cx("flex flex-col items-center gap-4", className)}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={titleId}
        className="max-w-full h-auto"
      >
        <title id={titleId}>
          Saved links by type. {series.map((s) => `${s.label}: ${s.value}`).join(", ")}.
        </title>

        <defs>
          {blobs.map((b, i) => (
            <radialGradient key={b.label} id={`${titleId}-g${i}`}>
              <stop offset="0%" stopColor={b.color} stopOpacity="0.95" />
              <stop offset="65%" stopColor={b.color} stopOpacity="0.72" />
              <stop offset="100%" stopColor={b.color} stopOpacity="0.42" />
            </radialGradient>
          ))}

          <filter id={`${titleId}-blur`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        {/* Diffuse glow behind everything, like the reference's soft edges */}
        <g filter={`url(#${titleId}-blur)`} opacity="0.5">
          {blobs.map((b) => (
            <circle key={`glow-${b.label}`} cx={b.x} cy={b.y} r={b.r} fill={b.color} />
          ))}
        </g>

        {blobs.map((b, i) => (
          <circle
            key={b.label}
            cx={b.x}
            cy={b.y}
            r={b.r}
            fill={`url(#${titleId}-g${i})`}
            // 2px surface ring keeps overlapping marks separable
            stroke="var(--color-surface)"
            strokeWidth="2"
          />
        ))}
      </svg>

      {/* Legend is required, not decorative: it is what makes the blended
          overlaps readable without relying on colour. */}
      {series.length > 1 && (
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {series.map((s) => (
            <li key={s.label} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: s.color }}
                aria-hidden="true"
              />
              <span className="text-caption text-muted">{s.label}</span>
              <span className="text-caption font-medium text-ink tabular-nums">
                {s.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BlobChart;
