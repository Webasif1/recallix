import { cx } from "../lib/cx";

/**
 * Pill toggle — the filter control the dashboard leans on.
 *
 * Rendered as a radio group rather than buttons so arrow keys move between
 * options and screen readers announce "2 of 4 selected", which a row of
 * aria-pressed buttons does not.
 */
const SegmentedControl = ({
  options, // [{ id, label }]
  value,
  onChange,
  label,
  size = "md",
  className,
}) => (
  <div
    role="radiogroup"
    aria-label={label}
    className={cx(
      "inline-flex items-center gap-1 bg-raised border border-line rounded-full p-1",
      className,
    )}
  >
    {options.map((option) => {
      const active = option.id === value;

      return (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(option.id)}
          className={cx(
            "rounded-full font-medium transition-colors duration-150 whitespace-nowrap",
            size === "sm"
              ? "text-caption px-2.5 py-1"
              : "text-small px-3.5 py-1.5",
            active
              ? "bg-ink text-white shadow-card"
              : "text-muted hover:text-ink",
          )}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default SegmentedControl;
