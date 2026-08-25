import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Clock, Plus } from "lucide-react";
import PageHeader from "../../../shared/ui/PageHeader";
import LinkCard from "../../../shared/ui/LinkCard";
import EmptyState from "../../../shared/ui/EmptyState";
import ErrorState from "../../../shared/ui/ErrorState";
import { LinkGridSkeleton } from "../../../shared/ui/Skeleton";
import { resurfaceAPI } from "../service/itemAPI";
import { getApiErrorMessage } from "../../../shared/lib/apiClient";
import { cx } from "../../../shared/lib/cx";

const RANGES = [
  { days: 30, label: "30 days" },
  { days: 90, label: "3 months" },
  { days: 180, label: "6 months" },
];

/**
 * Older saves worth a second look.
 *
 * Uses GET /api/items/resurface, which has existed on the server all along —
 * the previous version faked it with items.slice(0, 6), so the "resurfaced"
 * list was just the six most RECENT saves, the opposite of the intent.
 */
const ResurfacedView = ({ onDelete, onTagClick, onCollectionClick, onQuickSave }) => {
  const [days, setDays] = useState(30);
  const [fetched, setFetched] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const abortRef = useRef(null);

  // This list is fetched separately from the store, so a delete elsewhere
  // would leave a ghost card here. Reconcile against the canonical library.
  const libraryIds = useSelector((state) => state.items.items);

  const items = useMemo(() => {
    const known = new Set(libraryIds.map((i) => i._id));
    return fetched.filter((item) => known.has(item._id));
  }, [fetched, libraryIds]);

  const load = useCallback(async (range) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setError(null);

    try {
      const res = await resurfaceAPI(range, { signal: controller.signal });
      setFetched(res.data.data ?? []);
      setStatus("succeeded");
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;

      setError(getApiErrorMessage(err, "Couldn't load older saves"));
      setStatus("failed");
    }
  }, []);

  useEffect(() => {
    load(days);
  }, [days, load]);

  useEffect(() => () => abortRef.current?.abort(), []);

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        icon={Clock}
        title="Resurfaced"
        subtitle="Things you saved a while ago and probably forgot"
      />

      <div
        className="flex gap-2 mb-6"
        role="group"
        aria-label="How far back to look"
      >
        {RANGES.map((range) => (
          <button
            key={range.days}
            type="button"
            onClick={() => setDays(range.days)}
            aria-pressed={days === range.days}
            className={cx(
              "px-3.5 py-2 rounded-control text-small border transition-colors min-h-10",
              days === range.days
                ? "bg-accent-soft text-accent border-accent-line font-medium"
                : "bg-surface text-body border-line hover:border-line-strong",
            )}
          >
            Older than {range.label}
          </button>
        ))}
      </div>

      {status === "loading" && <LinkGridSkeleton count={6} />}

      {status === "failed" && (
        <ErrorState message={error} onRetry={() => load(days)} />
      )}

      {status === "succeeded" && items.length === 0 && (
        <EmptyState
          icon={Clock}
          title="Nothing has aged yet"
          description={`No saved link is older than ${
            RANGES.find((r) => r.days === days)?.label
          }. Come back later, or widen the range.`}
          action={{ label: "Save a link", icon: Plus, onClick: onQuickSave }}
        />
      )}

      {status === "succeeded" && items.length > 0 && (
        <>
          <p className="text-small text-muted mb-4">
            {items.length} {items.length === 1 ? "link" : "links"}, oldest first
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((item) => (
              <LinkCard
                key={item._id}
                item={item}
                onDelete={onDelete}
                onTagClick={onTagClick}
                onCollectionClick={onCollectionClick}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ResurfacedView;
