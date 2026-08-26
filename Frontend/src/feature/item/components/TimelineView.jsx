import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarRange,
  Bookmark,
  FolderOpen,
  Hash,
  TrendingUp,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import PageHeader from "../../../shared/ui/PageHeader";
import LinkCard from "../../../shared/ui/LinkCard";
import EmptyState from "../../../shared/ui/EmptyState";
import ListState from "../../../shared/ui/ListState";
import { LinkGridSkeleton } from "../../../shared/ui/Skeleton";
import SegmentedControl from "../../../shared/ui/SegmentedControl";
import { Tag } from "../../../shared/ui/Badge";
import TimelineScrubber from "./TimelineScrubber";

const TYPE_FILTERS = [
  { id: "all", label: "All" },
  { id: "article", label: "Articles" },
  { id: "video", label: "Videos" },
  { id: "pdf", label: "PDFs" },
  { id: "image", label: "Images" },
];

const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Every month between the first and last save, inclusive — including the empty
 * ones, so the scrubber shows gaps rather than silently closing them up.
 */
const buildMonths = (items) => {
  if (items.length === 0) return [];

  const counts = new Map();
  let earliest = null;
  let latest = null;

  for (const item of items) {
    const d = new Date(item.createdAt);
    if (Number.isNaN(d.getTime())) continue;

    const key = monthKey(d);
    if (!counts.has(key)) counts.set(key, []);
    counts.get(key).push(item);

    if (!earliest || d < earliest) earliest = d;
    if (!latest || d > latest) latest = d;
  }

  if (!earliest) return [];

  const months = [];
  const cursor = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
  const end = new Date(latest.getFullYear(), latest.getMonth(), 1);

  while (cursor <= end) {
    const key = monthKey(cursor);
    const monthItems = (counts.get(key) ?? []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    months.push({
      key,
      year: cursor.getFullYear(),
      startsYear: cursor.getMonth() === 0 || months.length === 0,
      shortLabel: cursor.toLocaleDateString(undefined, { month: "short" }),
      longLabel: cursor.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      }),
      count: monthItems.length,
      items: monthItems,
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
};

/** Top tags within one month, so a column says what it was about. */
const topTags = (items, limit = 3) => {
  const counts = new Map();

  for (const item of items) {
    for (const tag of item.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
};

const Stat = ({ icon: Icon, label, value }) => (
  <div className="min-w-0">
    <p className="flex items-center gap-1.5 text-caption text-muted">
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </p>
    <p className="mt-0.5 text-h2 font-semibold text-ink truncate">{value}</p>
  </div>
);

/**
 * The connector: rail across the top, then a rounded elbow dropping into the
 * column. Drawn per-column rather than as one page-wide SVG, which would need
 * re-measuring whenever a column's content changes its width.
 */
const Connector = ({ isFirst, isLast }) => (
  <svg
    className="w-full h-16 block"
    viewBox="0 0 200 64"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    {/* rail — stops short at the ends so the line doesn't float off */}
    <line
      x1={isFirst ? 28 : 0}
      y1="8"
      x2={isLast ? 28 : 200}
      y2="8"
      stroke="var(--color-line-strong)"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
    />
    {/* elbow down into the column */}
    <path
      d="M 28 8 L 28 44 Q 28 56 40 56 L 64 56"
      fill="none"
      stroke="var(--color-line-strong)"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

const TimelineView = ({
  items,
  listStatus,
  error,
  onRetry,
  onDelete,
  onTagClick,
  onCollectionClick,
  onQuickSave,
}) => {
  const [typeFilter, setTypeFilter] = useState("all");
  const [visibleKeys, setVisibleKeys] = useState([]);

  const scrollerRef = useRef(null);
  const columnRefs = useRef(new Map());

  const filtered = useMemo(
    () =>
      typeFilter === "all"
        ? items
        : items.filter((item) => item.type === typeFilter),
    [items, typeFilter],
  );

  // Both the canvas and the scrubber read from this, so they cannot disagree
  const months = useMemo(() => buildMonths(filtered), [filtered]);
  const populated = useMemo(() => months.filter((m) => m.count > 0), [months]);

  const stats = useMemo(() => {
    const collections = new Set();
    const tags = new Set();

    for (const item of filtered) {
      if (item.collection) collections.add(item.collection);
      item.tags?.forEach((t) => tags.add(t));
    }

    const busiest = populated.reduce(
      (best, m) => (!best || m.count > best.count ? m : best),
      null,
    );

    return {
      total: filtered.length,
      collections: collections.size,
      tags: tags.size,
      busiest,
    };
  }, [filtered, populated]);

  // Which columns are actually on screen. An observer rather than a scroll
  // offset calculation, which would drift as column widths vary with content.
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || populated.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleKeys((prev) => {
          const next = new Set(prev);

          for (const entry of entries) {
            const key = entry.target.dataset.monthKey;
            if (entry.isIntersecting) next.add(key);
            else next.delete(key);
          }

          const list = [...next];
          // Bail out when nothing changed, or this re-renders on every scroll
          if (
            list.length === prev.length &&
            list.every((k) => prev.includes(k))
          ) {
            return prev;
          }

          return list;
        });
      },
      { root, threshold: 0.35 },
    );

    for (const node of columnRefs.current.values()) {
      if (node) observer.observe(node);
    }

    return () => observer.disconnect();
  }, [populated]);

  const jumpTo = useCallback((key) => {
    const node = columnRefs.current.get(key);
    if (!node) return;

    node.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "nearest",
      inline: "start",
    });
  }, []);

  const registerColumn = useCallback((key, node) => {
    if (node) columnRefs.current.set(key, node);
    else columnRefs.current.delete(key);
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        icon={CalendarRange}
        title="Timeline"
        subtitle="Everything you've saved, in the order you saved it"
      />

      {/* Stat strip */}
      <div className="bg-surface border border-line rounded-card shadow-card px-5 py-4 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat icon={Bookmark} label="Saved" value={stats.total} />
          <Stat
            icon={FolderOpen}
            label="Collections"
            value={stats.collections}
          />
          <Stat icon={Hash} label="Tags" value={stats.tags} />
          <Stat
            icon={TrendingUp}
            label="Busiest month"
            value={stats.busiest ? stats.busiest.shortLabel : "—"}
          />
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2.5 mb-5 overflow-x-auto pb-1">
        <span className="w-9 h-9 rounded-full bg-surface border border-line flex items-center justify-center shrink-0">
          <SlidersHorizontal
            className="w-4 h-4 text-muted"
            aria-hidden="true"
          />
        </span>

        <SegmentedControl
          label="Filter timeline by type"
          options={TYPE_FILTERS}
          value={typeFilter}
          onChange={setTypeFilter}
        />
      </div>

      <ListState
        status={listStatus}
        error={error}
        onRetry={onRetry}
        hasContent={items.length > 0}
        isEmpty={populated.length === 0}
        skeleton={<LinkGridSkeleton count={3} />}
        empty={
          items.length === 0 ? (
            <EmptyState
              icon={CalendarRange}
              title="Nothing on the timeline yet"
              description="Save your first link and it starts here."
              action={{ label: "Save a link", icon: Plus, onClick: onQuickSave }}
            />
          ) : (
            <EmptyState
              icon={CalendarRange}
              title="No saves of that kind"
              description="Nothing in your library matches this filter. Try another type."
              action={{
                label: "Show everything",
                onClick: () => setTypeFilter("all"),
              }}
            />
          )
        }
      >
        <div className="space-y-4">
          {/*
            Horizontally scrolling canvas. tabIndex + role make it reachable
            and arrow-key scrollable — otherwise the whole timeline is
            trackpad-only for anyone not using a mouse.
          */}
          <div
            ref={scrollerRef}
            role="region"
            aria-label="Saved links by month, scroll horizontally"
            tabIndex={0}
            className="overflow-x-auto overflow-y-hidden rounded-card focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <p className="sr-only">
              {stats.total} links across {populated.length} months, from{" "}
              {populated[0]?.longLabel} to{" "}
              {populated[populated.length - 1]?.longLabel}.
            </p>

            <ol className="flex items-start min-w-max pb-2">
              {populated.map((month, i) => (
                <li
                  key={month.key}
                  ref={(node) => registerColumn(month.key, node)}
                  data-month-key={month.key}
                  className="w-[19rem] shrink-0"
                >
                  <Connector
                    isFirst={i === 0}
                    isLast={i === populated.length - 1}
                  />

                  <div className="pl-6 pr-4">
                    {/* Node marker — highlight is a fill, the icon on it is ink */}
                    <div className="flex items-center gap-2.5 -mt-[3.25rem] mb-6">
                      <span className="w-8 h-8 rounded-full bg-highlight border border-ink/10 flex items-center justify-center shrink-0 shadow-card">
                        <CalendarRange
                          className="w-4 h-4 text-ink"
                          aria-hidden="true"
                        />
                      </span>
                    </div>

                    <div className="mb-3">
                      <h2 className="text-h2 font-semibold text-ink">
                        {month.shortLabel}
                        <span className="ml-1.5 text-small font-normal text-faint tabular-nums">
                          {month.year}
                        </span>
                      </h2>
                      <p className="text-small text-muted">
                        {month.count} {month.count === 1 ? "save" : "saves"}
                      </p>
                    </div>

                    {topTags(month.items).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {topTags(month.items).map((tag) => (
                          <Tag
                            key={tag.label}
                            onClick={() => onTagClick(tag.label)}
                          >
                            {tag.label}
                            <span className="ml-1 text-faint tabular-nums">
                              ×{tag.count}
                            </span>
                          </Tag>
                        ))}
                      </div>
                    )}

                    <div className="space-y-4">
                      {month.items.map((item) => (
                        <LinkCard
                          key={item._id}
                          item={item}
                          headingLevel={3}
                          onDelete={onDelete}
                          onTagClick={onTagClick}
                          onCollectionClick={onCollectionClick}
                        />
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <TimelineScrubber
            months={months}
            activeKeys={visibleKeys}
            onJump={jumpTo}
          />
        </div>
      </ListState>
    </div>
  );
};

export default TimelineView;
