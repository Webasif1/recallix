import Button from "./Button";
import { cx } from "../lib/cx";

/**
 * Every empty list renders one of these — never a blank area or a single line
 * of gray text. An empty state must name what is missing and offer the next
 * action.
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  children,
  className,
}) => (
  <div
    className={cx(
      "flex flex-col items-center justify-center text-center",
      "bg-surface border border-line rounded-card px-6 py-14",
      className,
    )}
  >
    {Icon && (
      <span className="w-12 h-12 rounded-card bg-accent-soft border border-accent-line flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-accent" aria-hidden="true" />
      </span>
    )}

    <h3 className="text-h2 font-semibold text-ink">{title}</h3>

    {description && (
      <p className="mt-2 text-base text-muted max-w-sm">{description}</p>
    )}

    {children && <div className="mt-5 w-full max-w-sm">{children}</div>}

    {(action || secondaryAction) && (
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {action && (
          <Button
            variant="primary"
            size="md"
            icon={action.icon}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}

        {secondaryAction && (
          <Button
            variant="ghost"
            size="md"
            icon={secondaryAction.icon}
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    )}
  </div>
);

export default EmptyState;
