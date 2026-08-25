import { useId } from "react";
import { cx } from "../../lib/cx";

/**
 * Trend shape for a stat tile — a single series, 2px line, no axes.
 *
 * Deliberately unlabelled: it sits beside a hero number that carries the
 * actual figure, so it is showing direction, not values. The accessible name
 * still describes the series so it is not a mystery to a screen reader.
 */
const Sparkline = ({
  values,
  width = 96,
  height = 28,
  label = "Trend",
  tone = "var(--color-accent)",
  className,
}) => {
  const titleId = useId();
  const gradientId = useId();

  if (!values || values.length < 2) return null;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  // 2px stroke needs 1px of headroom at each edge or it clips
  const pad = 2;
  const stepX = (width - pad * 2) / (values.length - 1);

  const points = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (height - pad * 2) * (1 - (v - min) / range);
    return [x, y];
  });

  const line = points.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `${pad},${height} ${line} ${width - pad},${height}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-labelledby={titleId}
      className={cx("overflow-visible", className)}
    >
      <title id={titleId}>
        {label}: {values.join(", ")}
      </title>

      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity="0.18" />
          <stop offset="100%" stopColor={tone} stopOpacity="0" />
        </linearGradient>
      </defs>

      <polygon points={area} fill={`url(#${gradientId})`} />

      <polyline
        points={line}
        fill="none"
        stroke={tone}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* Only the latest point is marked — never a dot on every value */}
      <circle
        cx={points.at(-1)[0]}
        cy={points.at(-1)[1]}
        r="3"
        fill={tone}
        stroke="var(--color-surface)"
        strokeWidth="2"
      />
    </svg>
  );
};

export default Sparkline;
