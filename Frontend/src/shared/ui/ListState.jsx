import ErrorState from "./ErrorState";

/**
 * One place that decides which of the four list states renders.
 *
 * Views wrap their content in this instead of hand-writing
 * loading/error/empty branches, so none of them can forget one.
 *
 * Precedence: error > first load > empty > content. An error while stale
 * content is on screen keeps the content and lets the view show the message
 * inline, rather than yanking the list away.
 */
const ListState = ({
  status, // idle | loading | succeeded | failed
  isEmpty,
  error,
  onRetry,
  skeleton,
  empty,
  children,
  hasContent = false,
}) => {
  if (status === "failed" && !hasContent) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  // Only show skeletons on a first load; a background refresh keeps the list.
  if (status === "loading" && !hasContent) {
    return skeleton ?? null;
  }

  if (isEmpty) return empty ?? null;

  return children;
};

export default ListState;
