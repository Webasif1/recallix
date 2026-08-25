import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cx } from "../lib/cx";

/**
 * Labelled text input with inline error support.
 *
 * The label is always tied to the control via a generated id, and the error is
 * wired through aria-describedby + aria-invalid so screen readers announce it.
 * Password fields get a reveal toggle.
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon: Icon,
    type = "text",
    className,
    containerClassName,
    id: providedId,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && revealed ? "text" : type;

  const describedBy =
    [error && errorId, hint && !error && hintId].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cx("w-full", containerClassName)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-small font-medium text-ink mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint pointer-events-none"
            aria-hidden="true"
          />
        )}

        <input
          ref={ref}
          id={id}
          type={resolvedType}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          className={cx(
            "w-full bg-surface border rounded-control",
            "min-h-11 py-2.5 text-base text-ink placeholder:text-faint",
            "transition-colors duration-150",
            "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15",
            "disabled:bg-raised disabled:text-muted disabled:cursor-not-allowed",
            Icon ? "pl-10" : "pl-3.5",
            isPassword ? "pr-11" : "pr-3.5",
            error ? "border-danger" : "border-line",
            className,
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-control text-muted hover:text-ink hover:bg-raised transition-colors"
            aria-label={revealed ? "Hide password" : "Show password"}
          >
            {revealed ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-small text-danger">
          {error}
        </p>
      )}

      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-small text-muted">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
