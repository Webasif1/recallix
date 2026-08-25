/**
 * Join class names, dropping falsy values.
 * Small enough not to warrant a `clsx` dependency.
 */
export const cx = (...parts) => parts.filter(Boolean).join(" ");

export default cx;
