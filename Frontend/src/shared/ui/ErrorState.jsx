import { CloudOff, RotateCw } from "lucide-react";
import Button from "./Button";

/**
 * Failure state for a list or panel.
 *
 * Answers the three things a user needs: what happened, whether their data is
 * safe, and what they can do next.
 */
const ErrorState = ({
  title = "We couldn't load this",
  message,
  onRetry,
  retrying = false,
  reassurance = "Nothing you saved has been lost.",
}) => (
  <div
    role="alert"
    className="flex flex-col items-center justify-center text-center bg-surface border border-line rounded-card px-6 py-14"
  >
    <span className="w-12 h-12 rounded-card bg-danger-soft flex items-center justify-center mb-4">
      <CloudOff className="w-5 h-5 text-danger" aria-hidden="true" />
    </span>

    <h3 className="text-h2 font-semibold text-ink">{title}</h3>

    {message && (
      <p className="mt-2 text-base text-muted max-w-sm">{message}</p>
    )}

    {reassurance && (
      <p className="mt-1.5 text-small text-faint">{reassurance}</p>
    )}

    {onRetry && (
      <Button
        variant="secondary"
        size="md"
        icon={RotateCw}
        onClick={onRetry}
        loading={retrying}
        className="mt-6"
      >
        Try again
      </Button>
    )}
  </div>
);

export default ErrorState;
