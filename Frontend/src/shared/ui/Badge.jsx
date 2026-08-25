import { cx } from "../lib/cx";

const TONES = {
  neutral: "bg-raised text-body border-line",
  accent: "bg-accent-soft text-accent border-accent-line",
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-warning border-warning/20",
  danger: "bg-danger-soft text-danger border-danger/20",
  info: "bg-info-soft text-info border-info/20",
};

/** Small status/label pill. */
export const Badge = ({
  tone = "neutral",
  icon: Icon,
  children,
  className,
}) => (
  <span
    className={cx(
      "inline-flex items-center gap-1 border rounded-full",
      "px-2 py-0.5 text-caption font-medium whitespace-nowrap",
      TONES[tone],
      className,
    )}
  >
    {Icon && <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />}
    {children}
  </span>
);

/**
 * A tag. Interactive when `onClick` is given, so tags stay keyboard
 * reachable rather than being click-handled divs.
 */
export const Tag = ({ children, onClick, active = false, className }) => {
  const base = cx(
    "inline-flex items-center rounded-full border px-2 py-0.5",
    "text-caption whitespace-nowrap transition-colors",
    active
      ? "bg-accent-soft text-accent border-accent-line"
      : "bg-raised text-body border-line",
    onClick && !active && "hover:border-line-strong hover:text-ink",
    className,
  );

  if (!onClick) return <span className={base}>{children}</span>;

  return (
    <button type="button" onClick={onClick} className={base}>
      {children}
    </button>
  );
};

export default Badge;
