/**
 * Escape user input before it goes into a $regex query, so characters like
 * ( ) [ ] * + ? are matched literally instead of being parsed as a pattern.
 */
export const escapeRegex = (str = "") =>
  String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
