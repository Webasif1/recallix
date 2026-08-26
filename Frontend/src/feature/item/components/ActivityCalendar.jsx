import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cx } from "../../../shared/lib/cx";

/**
 * Which days you actually saved something.
 *
 * A dark month grid built from item.createdAt — no new data, no new endpoint.
 * Rendered as a real <table> with scope="col" weekday headers so the grid is
 * navigable and announced properly rather than being a mouse-only picture.
 */

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

const monthKey = (d) => `${d.getFullYear()}-${d.getMonth()}`;
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

/** Monday-first offset — getDay() is Sunday-first. */
const leadingBlanks = (date) => (date.getDay() + 6) % 7;

const ActivityCalendar = ({ items, className }) => {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  // day-of-month -> number of saves, for the visible month only
  const { savesByDay, firstSaveMonth } = useMemo(() => {
    const map = new Map();
    let earliest = null;

    for (const item of items) {
      const d = new Date(item.createdAt);
      if (Number.isNaN(d.getTime())) continue;

      if (!earliest || d < earliest) earliest = d;

      if (monthKey(d) === monthKey(cursor)) {
        map.set(d.getDate(), (map.get(d.getDate()) ?? 0) + 1);
      }
    }

    return {
      savesByDay: map,
      firstSaveMonth: earliest ? startOfMonth(earliest) : startOfMonth(today),
    };
  }, [items, cursor, today]);

  const daysInMonth = new Date(
    cursor.getFullYear(),
    cursor.getMonth() + 1,
    0,
  ).getDate();

  // Clamped: nothing to show past this month or before the first save
  const canGoBack = cursor > firstSaveMonth;
  const canGoForward = monthKey(cursor) !== monthKey(today);

  const step = (delta) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  const cells = [
    ...Array.from({ length: leadingBlanks(cursor) }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const activeDays = savesByDay.size;
  const monthLabel = cursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const isThisMonth = monthKey(cursor) === monthKey(today);

  return (
    <div
      className={cx(
        "bg-ink text-white rounded-card p-5 flex flex-col",
        className,
      )}
    >
      {/* Wraps rather than squeezing: at 320px the title and the stepper do
          not fit on one line and the two ran into each other. */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h2 className="text-h3 font-semibold">Your saving days</h2>

        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={!canGoBack}
            aria-label="Previous month"
            className="w-7 h-7 rounded-control flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          <span className="text-small font-medium min-w-[6.5rem] text-center">
            {cursor.toLocaleDateString(undefined, {
              month: "short",
              year: "numeric",
            })}
          </span>

          <button
            type="button"
            onClick={() => step(1)}
            disabled={!canGoForward}
            aria-label="Next month"
            className="w-7 h-7 rounded-control flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <table className="w-full mt-5 border-separate border-spacing-y-1.5">
        <caption className="sr-only">
          Days you saved a link in {monthLabel}
        </caption>

        <thead>
          <tr>
            {WEEKDAYS.map((day, i) => (
              <th
                key={`${day}-${i}`}
                scope="col"
                className="text-caption font-normal text-white/55 pb-1"
              >
                <span aria-hidden="true">{day}</span>
                <span className="sr-only">
                  {
                    [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ][i]
                  }
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((day, di) => {
                if (day === null) return <td key={`b-${di}`} />;

                const saves = savesByDay.get(day) ?? 0;
                const isToday = isThisMonth && day === today.getDate();

                return (
                  <td key={day} className="text-center">
                    <span
                      className={cx(
                        "inline-flex items-center justify-center w-8 h-8 rounded-full text-small tabular-nums transition-colors",
                        isToday
                          ? "bg-white text-ink font-semibold"
                          : saves > 0
                            ? "bg-accent text-white font-medium"
                            : "text-white/55",
                      )}
                      title={
                        saves > 0
                          ? `${saves} ${saves === 1 ? "save" : "saves"}`
                          : undefined
                      }
                    >
                      {day}
                      <span className="sr-only">
                        {saves > 0
                          ? ` — ${saves} ${saves === 1 ? "save" : "saves"}`
                          : " — nothing saved"}
                        {isToday ? ", today" : ""}
                      </span>
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="flex items-center gap-1.5 text-caption text-white/60">
          <span className="w-2.5 h-2.5 rounded-full bg-white" aria-hidden="true" />
          Today
        </span>
        <span className="flex items-center gap-1.5 text-caption text-white/60">
          <span
            className="w-2.5 h-2.5 rounded-full bg-accent"
            aria-hidden="true"
          />
          Saved
        </span>
        <span className="flex items-center gap-1.5 text-caption text-white/60">
          <span
            className="w-2.5 h-2.5 rounded-full border border-white/30"
            aria-hidden="true"
          />
          Nothing
        </span>
      </div>

      {/* Text equivalent of the grid */}
      <p className="mt-3 text-small text-white/80">
        {activeDays > 0
          ? `Saved on ${activeDays} of ${daysInMonth} days this month`
          : "Nothing saved this month"}
      </p>
    </div>
  );
};

export default ActivityCalendar;
