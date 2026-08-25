import { useId, useState } from "react";
import { cx } from "../../lib/cx";

/**
 * Saves per period — one series, magnitude over time.
 *
 * Single series, so there is no legend: the card title names it. Bars carry a
 * 4px rounded top anchored to the baseline, a 2px surface gap between them,
 * and a recessive baseline instead of a full grid.
 *
 * The figures are also rendered as text under each bar, so the chart is never
 * the only way to read a number.
 */
const BarChart = ({
  data, // [{ label, value }]
  height = 132,
  className,
  emptyLabel = "Nothing saved in this period",
}) => {
  const titleId = useId();
  const [hovered, setHovered] = useState(null);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div
        className={cx(
          "flex items-center justify-center text-small text-muted",
          className,
        )}
        style={{ height }}
      >
        {emptyLabel}
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value));
  const peak = data.find((d) => d.value === max);

  return (
    <div className={cx("w-full", className)}>
      <div
        className="flex items-end gap-1.5 w-full"
        style={{ height }}
        role="img"
        aria-labelledby={titleId}
      >
        <span id={titleId} className="sr-only">
          Saves per month.{" "}
          {data.map((d) => `${d.label}: ${d.value}`).join(", ")}.
        </span>

        {data.map((d) => {
          // Floor at 3px so an empty month still reads as a period that
          // exists rather than vanishing from the axis.
          const pct = max === 0 ? 0 : (d.value / max) * 100;
          const isHovered = hovered === d.label;

          return (
            <div
              key={d.label}
              className="relative flex-1 h-full flex items-end"
              onMouseEnter={() => setHovered(d.label)}
              onMouseLeave={() => setHovered(null)}
            >
              {isHovered && d.value > 0 && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-control bg-ink px-2 py-1 text-caption text-white shadow-pop">
                  {d.value} {d.value === 1 ? "save" : "saves"}
                </div>
              )}

              <div
                className={cx(
                  "w-full rounded-t transition-colors duration-150",
                  d.value === 0
                    ? "bg-line"
                    : isHovered
                      ? "bg-accent-hover"
                      : "bg-accent",
                )}
                style={{
                  height: d.value === 0 ? 3 : `max(6px, ${pct}%)`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Axis labels double as the text equivalent of the series */}
      <div className="flex gap-1.5 mt-2">
        {data.map((d) => (
          <div key={d.label} className="flex-1 text-center">
            <p className="text-caption text-muted">{d.label}</p>
            <p
              className={cx(
                "text-caption tabular-nums",
                d.value === max && d.value > 0
                  ? "text-ink font-semibold"
                  : "text-faint",
              )}
            >
              {d.value}
            </p>
          </div>
        ))}
      </div>

      {peak && peak.value > 0 && (
        <p className="mt-3 text-caption text-muted">
          Busiest month:{" "}
          <span className="text-ink font-medium">{peak.label}</span> with{" "}
          {peak.value} {peak.value === 1 ? "save" : "saves"}
        </p>
      )}
    </div>
  );
};

export default BarChart;
