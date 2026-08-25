import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, Sparkle, History, X, Lightbulb } from "lucide-react";
import SearchInput from "../../../shared/ui/SearchInput";
import LinkCard from "../../../shared/ui/LinkCard";
import EmptyState from "../../../shared/ui/EmptyState";
import { Badge, Tag } from "../../../shared/ui/Badge";
import { LinkCardSkeleton } from "../../../shared/ui/Skeleton";
import { semanticSearchAPI } from "../service/itemAPI";
import { matchesQuery } from "../item.slice";
import { getApiErrorMessage } from "../../../shared/lib/apiClient";
import { timeAgo } from "../../../shared/lib/formatDate";
import { getDomain } from "../../../shared/lib/domain";

const RECENTS_KEY = "recallix:recent-searches";
const DEBOUNCE_MS = 300;

const readRecents = () => {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 6) : [];
  } catch {
    return [];
  }
};

const writeRecents = (list) => {
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(list.slice(0, 6)));
  } catch {
    // Private mode / storage disabled — recents are a convenience, not state.
  }
};

/**
 * Recall — the feature that makes this more than a bookmark list.
 *
 * The backend has ranked embeddings all along (GET /api/items/semantic-search)
 * and nothing in the UI ever called it; search was a client-side
 * String.includes over the loaded page. Now:
 *
 *   keystroke -> instant local keyword matches (no wait)
 *              -> debounced semantic request (finds what you MEANT)
 *
 * so the screen is never empty while thinking, and a vague memory still lands.
 */
const RecallView = ({ items, onDelete, onTagClick, onCollectionClick }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState(null);
  const [recents, setRecents] = useState(readRecents);

  const abortRef = useRef(null);
  const inputRef = useRef(null);

  const trimmed = query.trim();

  // Shown immediately, so there is something on screen during the round trip.
  const localMatches = useMemo(() => {
    if (!trimmed) return [];
    return items.filter((item) => matchesQuery(item, trimmed.toLowerCase()));
  }, [items, trimmed]);

  // A few real tags from the user's own library make better prompts than
  // invented examples.
  const suggestions = useMemo(() => {
    const counts = new Map();

    for (const item of items) {
      for (const tag of item.tags ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag]) => tag);
  }, [items]);

  const rememberSearch = useCallback((value) => {
    setRecents((prev) => {
      const next = [value, ...prev.filter((q) => q !== value)].slice(0, 6);
      writeRecents(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!trimmed) {
      abortRef.current?.abort();
      setResults([]);
      setStatus("idle");
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      // Cancel the in-flight request so a slow earlier response can never
      // overwrite the results for what is now typed.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus("loading");
      setError(null);

      try {
        const res = await semanticSearchAPI(trimmed, {
          signal: controller.signal,
        });

        setResults(res.data.data ?? []);
        setStatus("done");
        rememberSearch(trimmed);
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;

        setError(getApiErrorMessage(err, "Recall failed"));
        setStatus("error");
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [trimmed, rememberSearch]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const clearRecents = () => {
    setRecents([]);
    writeRecents([]);
  };

  const runSearch = (value) => {
    setQuery(value);
    inputRef.current?.focus();
  };

  const [best, ...rest] = results;

  /**
   * Is the top semantic hit actually a standout?
   *
   * Absolute cosine scores from mistral-embed are not comparable across
   * queries — everything lands near 0.6, and an unrelated phrase can score
   * higher than a relevant one. What DOES carry signal is the gap between the
   * top hit and the runner-up: a real match pulls clear of the pack.
   *
   * So we only make the "Best match" claim when that gap is meaningful, and
   * otherwise present the same results as "closest", without pretending.
   */
  const CONFIDENT_GAP = 0.08;

  const isConfident =
    best != null &&
    (rest.length === 0 || best.score - rest[0].score >= CONFIDENT_GAP);

  // An exact keyword hit beats any embedding guess, so it leads.
  const exactMatches = localMatches;

  const semanticOnly = results.filter(
    (item) => !exactMatches.some((m) => m._id === item._id),
  );

  const nothingAtAll =
    status === "done" && results.length === 0 && exactMatches.length === 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-h1 font-semibold text-ink">Recall</h1>
        <p className="mt-1 text-base text-muted">
          Describe what you half-remember. You don't need the exact words.
        </p>
      </div>

      <SearchInput
        ref={inputRef}
        size="hero"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery("")}
        busy={status === "loading"}
        placeholder="that article about react re-renders…"
        aria-label="Search your saved links"
        autoFocus
      />

      {/* Idle: recents and the user's own tags as starting points */}
      {!trimmed && (
        <div className="mt-8 space-y-7">
          {recents.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-muted" aria-hidden="true" />
                <h2 className="text-small font-medium text-ink">
                  Recent searches
                </h2>
                <button
                  type="button"
                  onClick={clearRecents}
                  className="ml-auto inline-flex items-center gap-1 text-caption text-muted hover:text-danger transition-colors rounded px-1"
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                  Clear
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {recents.map((q) => (
                  <Tag key={q} onClick={() => runSearch(q)}>
                    {q}
                  </Tag>
                ))}
              </div>
            </section>
          )}

          {suggestions.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-muted" aria-hidden="true" />
                <h2 className="text-small font-medium text-ink">
                  What you save most
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {suggestions.map((tag) => (
                  <Tag key={tag} onClick={() => runSearch(tag)}>
                    {tag}
                  </Tag>
                ))}
              </div>
            </section>
          )}

          {items.length === 0 && (
            <EmptyState
              icon={Search}
              title="Nothing to recall yet"
              description="Save a few links first — then come back and ask for them however you remember them."
            />
          )}
        </div>
      )}

      {/* Results */}
      {trimmed && (
        <div className="mt-7 space-y-7">
          {status === "error" && (
            <div
              role="alert"
              className="bg-danger-soft border border-danger/20 rounded-card px-4 py-3.5"
            >
              <p className="text-small text-danger font-medium">{error}</p>
              <p className="mt-1 text-small text-muted">
                Showing keyword matches from what's already loaded.
              </p>
            </div>
          )}

          {status === "loading" && results.length === 0 && (
            <div className="space-y-4" role="status" aria-label="Recalling">
              <LinkCardSkeleton />
              <LinkCardSkeleton />
            </div>
          )}

          {/* Exact wording wins outright — no need to hedge these. */}
          {exactMatches.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-accent" aria-hidden="true" />
                <h2 className="text-small font-medium text-ink">
                  Contains “{trimmed}”
                </h2>
                <Badge>{exactMatches.length}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exactMatches.slice(0, 6).map((item, i) => (
                  <LinkCard
                    key={item._id}
                    item={item}
                    highlight={i === 0 && exactMatches.length === 1}
                    onDelete={onDelete}
                    onTagClick={onTagClick}
                    onCollectionClick={onCollectionClick}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Confident standout gets the spotlight treatment... */}
          {isConfident && exactMatches.length === 0 && best && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Sparkle className="w-4 h-4 text-accent" aria-hidden="true" />
                <h2 className="text-small font-medium text-ink">Best match</h2>

                <span className="ml-auto text-caption text-muted">
                  saved {timeAgo(best.createdAt)} · {getDomain(best.url)}
                </span>
              </div>

              <LinkCard
                item={best}
                highlight
                onDelete={onDelete}
                onTagClick={onTagClick}
                onCollectionClick={onCollectionClick}
              />
            </section>
          )}

          {/* ...otherwise the same links, honestly labelled. */}
          {semanticOnly.length > 0 && (
            <section>
              <h2 className="text-small font-medium text-ink mb-1">
                {isConfident && exactMatches.length === 0
                  ? "Related memories"
                  : "Closest things in your memory"}
              </h2>

              {!isConfident && exactMatches.length === 0 && (
                <p className="text-caption text-muted mb-3">
                  Nothing stood out clearly — these are the nearest by meaning.
                  Try naming the topic if none of them is it.
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                {semanticOnly
                  .slice(isConfident && exactMatches.length === 0 ? 1 : 0)
                  .map((item) => (
                    <LinkCard
                      key={item._id}
                      item={item}
                      onDelete={onDelete}
                      onTagClick={onTagClick}
                      onCollectionClick={onCollectionClick}
                    />
                  ))}
              </div>
            </section>
          )}

          {nothingAtAll && (
            <EmptyState
              icon={Search}
              title="Nothing surfaced from your memory"
              description={`No saved link matches “${trimmed}”. Try fewer words, or the topic rather than the exact title.`}
              action={{ label: "Clear search", icon: X, onClick: () => setQuery("") }}
            >
              {suggestions.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.slice(0, 4).map((tag) => (
                    <Tag key={tag} onClick={() => runSearch(tag)}>
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}
            </EmptyState>
          )}
        </div>
      )}
    </div>
  );
};

export default RecallView;
