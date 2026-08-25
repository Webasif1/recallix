import { forwardRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { cx } from "../lib/cx";

/**
 * Search field with a clear button and an inline busy indicator.
 * `size="hero"` is the Recall screen's primary control.
 */
const SearchInput = forwardRef(function SearchInput(
  {
    value,
    onChange,
    onClear,
    placeholder = "Search…",
    busy = false,
    size = "md",
    className,
    ...props
  },
  ref,
) {
  const hero = size === "hero";

  return (
    <div className={cx("relative", className)}>
      <Search
        className={cx(
          "absolute left-4 top-1/2 -translate-y-1/2 text-faint pointer-events-none",
          hero ? "w-5 h-5" : "w-4 h-4",
        )}
        aria-hidden="true"
      />

      <input
        ref={ref}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cx(
          "w-full bg-surface border border-line rounded-control",
          "text-ink placeholder:text-faint transition-colors duration-150",
          "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15",
          // the browser's own clear affordance would sit under ours
          "[&::-webkit-search-cancel-button]:hidden",
          hero
            ? "pl-12 pr-24 py-4 text-base min-h-14 shadow-card"
            : "pl-10 pr-20 py-2.5 text-base min-h-11",
        )}
        {...props}
      />

      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {busy && (
          <Loader2
            className="w-4 h-4 text-accent animate-spin"
            aria-label="Searching"
          />
        )}

        {value && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="w-8 h-8 rounded-control flex items-center justify-center text-muted hover:text-ink hover:bg-raised transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
});

export default SearchInput;
