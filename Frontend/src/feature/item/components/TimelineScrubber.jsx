import { cx } from "../../../shared/lib/cx";

/**
 * The dark rail along the bottom: every month of the save history at a glance.
 *
 * Months with nothing saved are kept and greyed rather than skipped — the gaps
 * are the point, they show when the habit lapsed.
 */
const TimelineScrubber = ({ months, activeKeys, onJump, className }) => {
  if (months.length === 0) return null;

  const active = new Set(activeKeys);
  const total = months.reduce((sum, m) => sum + m.count, 0);

  return (
    <div
      className={cx(
        "bg-ink rounded-card px-3 py-2.5 overflow-x-auto",
        className,
      )}
    >
      <div className="flex items-stretch gap-1 min-w-max">
        {months.map((month) => {
          const isActive = active.has(month.key);
          const hasSaves = month.count > 0;

          return (
            <button
              key={month.key}
              type="button"
              onClick={() => hasSaves && onJump(month.key)}
              disabled={!hasSaves}
              aria-current={isActive ? "true" : undefined}
              aria-label={
                hasSaves
                  ? `${month.longLabel}: ${month.count} saved. Jump to it.`
                  : `${month.longLabel}: nothing saved`
              }
              className={cx(
                "group relative shrink-0 rounded-control px-2.5 py-1.5 transition-colors",
                "flex flex-col items-center gap-1 min-w-14",
                hasSaves
                  ? "hover:bg-white/10 cursor-pointer"
                  : "cursor-default",
                // The visible "window" over the months currently on screen
                isActive && "bg-white/15",
              )}
            >
              <span
                className={cx(
                  "text-caption tabular-nums",
                  hasSaves ? "text-white/90" : "text-white/55",
                )}
              >
                {month.shortLabel}
              </span>

              {hasSaves ? (
                // Highlight is a FILL with ink on top — never coloured text
                <span className="min-w-5 px-1 h-5 rounded-full bg-highlight text-ink text-caption font-semibold tabular-nums flex items-center justify-center">
                  {month.count}
                </span>
              ) : (
                <span
                  className="w-1 h-1 rounded-full bg-white/25"
                  aria-hidden="true"
                />
              )}

              {month.startsYear && (
                <span className="text-caption text-white/60 tabular-nums">
                  {month.year}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="sr-only">
        {total} saved across {months.filter((m) => m.count > 0).length} months.
      </p>
    </div>
  );
};

export default TimelineScrubber;
