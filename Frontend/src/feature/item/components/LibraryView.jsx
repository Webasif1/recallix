import { useEffect, useMemo, useState } from "react";
import { Library, Plus, X, SlidersHorizontal } from "lucide-react";
import PageHeader from "../../../shared/ui/PageHeader";
import SearchInput from "../../../shared/ui/SearchInput";
import LinkCard from "../../../shared/ui/LinkCard";
import EmptyState from "../../../shared/ui/EmptyState";
import ListState from "../../../shared/ui/ListState";
import { LinkGridSkeleton } from "../../../shared/ui/Skeleton";
import { Tag } from "../../../shared/ui/Badge";
import Button from "../../../shared/ui/Button";
import { matchesQuery } from "../item.slice";
import { cx } from "../../../shared/lib/cx";

const SORTS = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "title", label: "A–Z" },
];

/** Everything saved, with filters that narrow rather than hide. */
const LibraryView = ({
  items,
  listStatus,
  error,
  onRetry,
  onDelete,
  onCollectionClick,
  onNavigate,
  onQuickSave,
  activeTag,
}) => {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState(activeTag ?? null);
  const [collection, setCollection] = useState(null);
  const [sort, setSort] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // A tag clicked elsewhere in the app arrives through the URL
  useEffect(() => {
    setTag(activeTag ?? null);
    if (activeTag) setFiltersOpen(true);
  }, [activeTag]);

  const { tags, collections } = useMemo(() => {
    const tagCounts = new Map();
    const collectionCounts = new Map();

    for (const item of items) {
      for (const t of item.tags ?? []) {
        tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
      }
      if (item.collection) {
        collectionCounts.set(
          item.collection,
          (collectionCounts.get(item.collection) ?? 0) + 1,
        );
      }
    }

    const bySize = (a, b) => b[1] - a[1];

    return {
      tags: [...tagCounts.entries()].sort(bySize).slice(0, 14).map(([t]) => t),
      collections: [...collectionCounts.entries()]
        .sort(bySize)
        .map(([c]) => c),
    };
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = items.filter((item) => {
      if (q && !matchesQuery(item, q)) return false;
      if (tag && !item.tags?.includes(tag)) return false;
      if (collection && item.collection !== collection) return false;
      return true;
    });

    const sorted = [...filtered];

    if (sort === "oldest") {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sort === "title") {
      sorted.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
    } else {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return sorted;
  }, [items, query, tag, collection, sort]);

  const hasFilter = Boolean(query || tag || collection);

  const clearFilters = () => {
    setQuery("");
    setTag(null);
    setCollection(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        icon={Library}
        title="Library"
        subtitle={
          items.length
            ? `${items.length} saved ${items.length === 1 ? "link" : "links"}`
            : "Everything you've saved lives here"
        }
        actions={
          <Button variant="primary" size="md" icon={Plus} onClick={onQuickSave}>
            <span className="hidden sm:inline">Save a link</span>
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <SearchInput
          className="flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery("")}
          placeholder="Filter by title, summary, tag or domain…"
          aria-label="Filter saved links"
        />

        <Button
          variant={filtersOpen || tag || collection ? "soft" : "secondary"}
          size="md"
          icon={SlidersHorizontal}
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
        >
          Filters
        </Button>
      </div>

      {filtersOpen && (
        <div className="bg-surface border border-line rounded-card p-4 mb-5 space-y-4 rx-fade-up">
          {collections.length > 0 && (
            <div>
              <p className="text-caption uppercase font-medium tracking-wide text-muted mb-2">
                Collection
              </p>
              <div className="flex flex-wrap gap-2">
                {collections.map((name) => (
                  <Tag
                    key={name}
                    active={collection === name}
                    onClick={() =>
                      setCollection(collection === name ? null : name)
                    }
                  >
                    {name}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          {tags.length > 0 && (
            <div>
              <p className="text-caption uppercase font-medium tracking-wide text-muted mb-2">
                Tag
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Tag
                    key={t}
                    active={tag === t}
                    onClick={() => setTag(tag === t ? null : t)}
                  >
                    {t}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-caption uppercase font-medium tracking-wide text-muted mb-2">
              Sort
            </p>
            <div className="flex gap-2" role="group" aria-label="Sort order">
              {SORTS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSort(option.id)}
                  aria-pressed={sort === option.id}
                  className={cx(
                    "px-3 py-1.5 rounded-control text-small border transition-colors",
                    sort === option.id
                      ? "bg-accent-soft text-accent border-accent-line font-medium"
                      : "bg-surface text-body border-line hover:border-line-strong",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {hasFilter && (
        <div className="flex items-center gap-2 mb-4 text-small text-muted">
          <span>
            {visible.length} of {items.length}
          </span>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-accent hover:underline rounded px-1"
          >
            <X className="w-3 h-3" aria-hidden="true" />
            Clear filters
          </button>
        </div>
      )}

      <ListState
        status={listStatus}
        error={error}
        onRetry={onRetry}
        hasContent={items.length > 0}
        isEmpty={visible.length === 0}
        skeleton={<LinkGridSkeleton />}
        empty={
          items.length === 0 ? (
            <EmptyState
              icon={Library}
              title="Your memory is empty"
              description="Save an article, a video, a tutorial — anything you'd hate to lose track of."
              action={{
                label: "Save your first link",
                icon: Plus,
                onClick: onQuickSave,
              }}
            />
          ) : (
            <EmptyState
              icon={Library}
              title="Nothing matches those filters"
              description="Try a broader term, or clear the filters to see everything again."
              action={{ label: "Clear filters", icon: X, onClick: clearFilters }}
              secondaryAction={{
                label: "Try Recall instead",
                onClick: () => onNavigate("recall"),
              }}
            />
          )
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((item) => (
            <LinkCard
              key={item._id}
              item={item}
              headingLevel={2}
              onDelete={onDelete}
              onTagClick={(t) => setTag(t === tag ? null : t)}
              onCollectionClick={onCollectionClick}
            />
          ))}
        </div>
      </ListState>
    </div>
  );
};

export default LibraryView;
