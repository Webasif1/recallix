import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cx } from "../lib/cx";

const VARIANTS = {
  primary:
    "bg-accent text-white hover:bg-accent-hover shadow-card disabled:hover:bg-accent",
  secondary:
    "bg-surface text-ink border border-line hover:bg-raised hover:border-line-strong",
  ghost: "text-body hover:bg-raised hover:text-ink",
  soft: "bg-accent-soft text-accent border border-accent-line hover:bg-accent-soft/70",
  danger: "bg-danger text-white hover:bg-danger-hover",
  dangerGhost: "text-danger hover:bg-danger-soft",
};

const SIZES = {
  // min-height keeps every control at a 44px touch target on mobile
  sm: "text-small px-3 py-1.5 gap-1.5 min-h-9 rounded-control",
  md: "text-base px-4 py-2.5 gap-2 min-h-11 rounded-control",
  lg: "text-base px-6 py-3 gap-2 min-h-12 rounded-control font-medium",
  icon: "w-9 h-9 rounded-control justify-center shrink-0",
};

/**
 * The app's only button.
 *
 * `loading` disables the control, swaps in a spinner and sets aria-busy, so a
 * slow action (saving a link waits on scraping + two model calls) can never be
 * double-submitted.
 */
const Button = forwardRef(function Button(
  {
    variant = "secondary",
    size = "md",
    loading = false,
    disabled = false,
    icon: Icon,
    iconRight: IconRight,
    className,
    children,
    type = "button",
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cx(
        "inline-flex items-center justify-center font-medium",
        "transition-colors duration-150",
        "disabled:opacity-55 disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
      ) : (
        Icon && <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      )}

      {children}

      {IconRight && !loading && (
        <IconRight className="w-4 h-4 shrink-0" aria-hidden="true" />
      )}
    </button>
  );
});

export default Button;
