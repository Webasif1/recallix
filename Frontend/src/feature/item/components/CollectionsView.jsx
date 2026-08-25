import { useMemo } from "react";
import { FolderOpen, Plus, ArrowRight } from "lucide-react";
import PageHeader from "../../../shared/ui/PageHeader";
import EmptyState from "../../../shared/ui/EmptyState";
import ListState from "../../../shared/ui/ListState";
import { Skeleton } from "../../../shared/ui/Skeleton";
import { Badge } from "../../../shared/ui/Badge";
import { getDomain } from "../../../shared/lib/domain";
import { timeAgo } from "../../../shared/lib/formatDate";

/**
 * Collections are derived, not stored: the AI files each save into a folder
 * name and this groups by it. There is no collection CRUD in the API, so none
 * is offered here — the screen shows what genuinely exists.
 */
const CollectionsView = ({
  items,
  listStatus,
  error,
  onRetry,
  onCollectionClick,
  onQuickSave,
}) => {
  const collections = useMemo(() => {
    const map = new Map();

    for (const item of items) {
      const name = item.collection || "Unfiled";

      if (!map.has(name)) {
        map.set(name, { name, items: [], domains: new Set() });
      }

      const entry = map.get(name);
      entry.items.push(item);
      entry.domains.add(getDomain(item.url));
    }

    return [...map.values()]
      .map((entry) => ({
        ...entry,
        domains: [...entry.domains].slice(0, 3),
        recent: entry.items.slice(0, 3),
        latest: entry.items[0]?.createdAt,
      }))
      .sort((a, b) => b.items.length - a.items.length);
  }, [items]);

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        icon={FolderOpen}
        title="Collections"
        subtitle={
          collections.length
            ? `${collections.length} topics, organised as you saved`
            : "Topics appear automatically as you save"
        }
      />

      <ListState
        status={listStatus}
        error={error}
        onRetry={onRetry}
        hasContent={items.length > 0}
        isEmpty={collections.length === 0}
        skeleton={
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-44 rounded-card" />
            ))}
          </div>
        }
        empty={
          <EmptyState
            icon={FolderOpen}
            title="Start grouping the things worth remembering"
            description="Every link you save is filed into a topic automatically. Save a couple and your collections build themselves."
            action={{ label: "Save a link", icon: Plus, onClick: onQuickSave }}
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {collections.map((col) => (
            <button
              key={col.name}
              type="button"
              onClick={() => onCollectionClick(col.name)}
              className="group text-left bg-surface border border-line rounded-card p-5 shadow-card hover:border-line-strong transition-colors flex flex-col"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-h3 font-semibold text-ink truncate group-hover:text-accent transition-colors">
                    {col.name}
                  </h2>
                  <p className="mt-1 text-caption text-muted truncate">
                    {col.domains.join(" · ")}
                  </p>
                </div>

                <Badge tone="accent">{col.items.length}</Badge>
              </div>

              <ul className="mt-4 space-y-1.5 flex-1">
                {col.recent.map((item) => (
                  <li
                    key={item._id}
                    className="text-small text-muted truncate flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-line-strong shrink-0" />
                    {item.title || "Untitled"}
                  </li>
                ))}
              </ul>

              <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                <span className="text-caption text-faint">
                  updated {timeAgo(col.latest)}
                </span>
                <ArrowRight
                  className="w-4 h-4 text-faint group-hover:text-accent transition-colors"
                  aria-hidden="true"
                />
              </div>
            </button>
          ))}
        </div>
      </ListState>
    </div>
  );
};

export default CollectionsView;
