/** Display host for a saved link: "react.dev", no scheme, no "www.". */
export const getDomain = (url) => {
  if (!url) return "";

  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0];
  }
};

/**
 * Favicon URL for a saved link.
 *
 * Google's service is used because saved links point at arbitrary hosts, many
 * of which serve no predictable icon path. Callers must handle onError — see
 * LinkCard, which falls back to a lettered tile.
 */
export const getFaviconUrl = (url, size = 64) => {
  const domain = getDomain(url);
  if (!domain) return null;

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
};

/** Deterministic tint per domain, so a source looks the same everywhere. */
export const getDomainTint = (url) => {
  const domain = getDomain(url);
  if (!domain) return "hsl(220 12% 92%)";

  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = (hash * 31 + domain.charCodeAt(i)) % 360;
  }

  return `hsl(${hash} 52% 93%)`;
};
