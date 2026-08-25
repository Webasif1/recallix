/**
 * Validate and canonicalise a saved link.
 *
 * Returns the cleaned absolute URL, or null when the input is not a usable
 * http/https link. Normalising here means the {user, url} unique index treats
 * "example.com/a" and "https://example.com/a/" as the same saved item.
 */
export const normalizeUrl = (input) => {
  if (typeof input !== "string") return null;

  const raw = input.trim();
  if (!raw) return null;

  // Bare domains ("example.com/post") are a common paste; assume https
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  let parsed;
  try {
    parsed = new URL(withScheme);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (!parsed.hostname.includes(".")) return null;

  parsed.hash = "";
  parsed.hostname = parsed.hostname.toLowerCase();

  // Drop a single trailing slash so "/a" and "/a/" collapse to one item
  if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }

  return parsed.toString();
};
