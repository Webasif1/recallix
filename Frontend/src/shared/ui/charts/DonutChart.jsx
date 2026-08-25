import { useId, useState } from "react";
import { cx } from "../../lib/cx";
import { foldSeries } from "../../lib/series";

/**
 * Categorical split — which collections hold the saves.
 *
 * Series colours come from the validated --color-chart-* ramp and are assigned
 * in fixed order, never cycled: anything past the fifth slot folds into a
 * single grey "Other" bucket rather than getting a generated hue.
 *
 * The ramp carries a contrast WARN on one slot against white, so the legend
 * naming every slice with its count in text is required, not decorative — it
 * is what makes the chart readable without relying on colour.
 */

const DonutChart = ({
  data, // [{ label, value }]
  size = 168,
  thickness = 22,
  centerLabel = "Total",
  onSliceClick,
  className,
}) => {
  const titleId = useId();
  const [hovered, setHovered] = useState(null);

  const series = foldSeries(data);
  const total = series.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) return null;

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  // 2px surface gap between segments, per the mark spec
  const GAP = 2;

  let offset = 0;

  const segments = series.map((s) => {
    const fraction = s.value / total;
    const length = Math.max(fraction * circumference - GAP, 1);

    const segment = {
      ...s,
      fraction,
      dash: `${length} ${circumference - length}`,
      offset: -offset,
    };

    offset += fraction * circumference;
    return segment;
  });

  return (
    // Stacked, not side-by-side: this sits in a third-width dashboard column,
    // and a row layout squeezed collection names down to a single letter.
    <div className={cx("flex flex-col items-center gap-5", className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-labelledby={titleId}
          className="-rotate-90"
        >
          <title id={titleId}>
            Saves by collection.{" "}
            {series.map((s) => `${s.label}: ${s.value}`).join(", ")}.
          </title>

          {segments.map((s) => (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={hovered === s.label ? thickness + 4 : thickness}
              strokeDasharray={s.dash}
              strokeDashoffset={s.offset}
              strokeLinecap="butt"
              className={cx(
                "transition-[stroke-width,opacity] duration-150",
                hovered && hovered !== s.label && "opacity-40",
                onSliceClick && "cursor-pointer",
              )}
              onMouseEnter={() => setHovered(s.label)}
              onMouseLeave={() => setHovered(null)}
              onClick={
                onSliceClick && !s.isOther
                  ? () => onSliceClick(s.label)
                  : undefined
              }
            />
          ))}
        </svg>

        {/* Hero figure sits in the hole rather than labelling every slice */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-caption text-muted">
            {hovered ?? centerLabel}
          </span>
          <span className="text-h1 font-semibold text-ink tabular-nums">
            {hovered
              ? series.find((s) => s.label === hovered)?.value
              : total}
          </span>
        </div>
      </div>

      {/* Legend: always present, and the text equivalent of the chart.
          Maps `segments`, not `series` — only the former carries `fraction`,
          and reading it off `series` rendered every share as NaN%. */}
      <ul className="w-full space-y-1.5">
        {segments.map((s) => {
          const Row = onSliceClick && !s.isOther ? "button" : "div";

          return (
            <li key={s.label}>
              <Row
                {...(Row === "button"
                  ? { type: "button", onClick: () => onSliceClick(s.label) }
                  : {})}
                onMouseEnter={() => setHovered(s.label)}
                onMouseLeave={() => setHovered(null)}
                className={cx(
                  "w-full flex items-center gap-2.5 rounded-control px-2 py-1 text-left transition-colors",
                  Row === "button" && "hover:bg-raised",
                )}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: s.color }}
                  aria-hidden="true"
                />

                <span className="text-small text-body truncate flex-1 min-w-0">
                  {s.label}
                  {s.isOther && (
                    <span className="text-faint"> ({s.count})</span>
                  )}
                </span>

                <span className="text-small text-ink font-medium tabular-nums shrink-0">
                  {s.value}
                </span>

                <span className="text-caption text-faint tabular-nums shrink-0 w-9 text-right">
                  {Math.round(s.fraction * 100)}%
                </span>
              </Row>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DonutChart;
