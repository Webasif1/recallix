/**
 * Relative save dates.
 * This was copy-pasted in two views; it lives here now.
 */
export const timeAgo = (dateString) => {
  if (!dateString) return "recently";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "recently";

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMs < 0) return "just now";
  if (diffDays === 0) {
    const hours = Math.floor(diffMs / 3_600_000);
    if (hours < 1) return "just now";
    return hours === 1 ? "an hour ago" : `${hours} hours ago`;
  }
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "a week ago" : `${weeks} weeks ago`;
  }

  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? "a month ago" : `${months} months ago`;
  }

  const years = Math.floor(diffDays / 365);
  return years === 1 ? "a year ago" : `${years} years ago`;
};

/** Absolute date for tooltips and profile ("12 Mar 2025"). */
export const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
