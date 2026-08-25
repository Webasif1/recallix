import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Bookmark,
  FolderOpen,
  Hash,
  Clock,
  Plus,
  ArrowRight,
  Search,
  Sparkle,
  Globe,
} from "lucide-react";
import LinkCard from "../../../shared/ui/LinkCard";
import EmptyState from "../../../shared/ui/EmptyState";
import ListState from "../../../shared/ui/ListState";
import { LinkGridSkeleton, Skeleton } from "../../../shared/ui/Skeleton";
import Button from "../../../shared/ui/Button";
import SegmentedControl from "../../../shared/ui/SegmentedControl";
import BarChart from "../../../shared/ui/charts/BarChart";
import DonutChart from "../../../shared/ui/charts/DonutChart";
import Sparkline from "../../../shared/ui/charts/Sparkline";
import { getDomain, getFaviconUrl, getDomainTint } from "../../../shared/lib/domain";
import { timeAgo, formatDate } from "../../../shared/lib/formatDate";
import { cx } from "../../../shared/lib/cx";

const RESURFACE_AFTER_DAYS = 30;
const MONTHS_SHOWN = 6;

const TYPE_FILTERS = [
  { id: "all", label: "All" },
  { id: "article", label: "Articles" },
  { id: "video", label: "Videos" },
  { id: "pdf", label: "PDFs" },
];

/** Card shell — one place so every panel shares padding and radius. */
const Panel = ({ title, action, children, className, bodyClassName }) => (
  <section
    className={cx(
      "bg-surface border border-line rounded-card shadow-card flex flex-col",
      className,
    )}
  >
    {title && (
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
        <h2 className="text-h3 font-semibold text-ink">{title}</h2>
        {action}
      </div>
    )}
    <div className={cx("px-5 pb-5 flex-1 min-h-0", bodyClassName)}>
      {children}
    </div>
  </section>
);

const StatCard = ({ icon: Icon, label, value, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="bg-surface border border-line rounded-card p-4 shadow-card text-left transition-colors hover:border-line-strong flex flex-col gap-3"
  >
    <div className="flex items-center gap-2 text-small text-muted">
      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </div>

    <div className="flex items-end justify-between gap-2">
      <p className="text-h1 font-semibold text-ink tabular-nums leading-none">
        {value}
      </p>
      {children}
    </div>
  </button>
);

/** Bucket saves into the last N calendar months. */
const monthlyBuckets = (items, months) => {
  const now = new Date();
  const buckets = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString(undefined, { month: "short" }),
      value: 0,
    });
  }

  const index = new Map(buckets.map((b, i) => [b.key, i]));

  for (const item of items) {
    const d = new Date(item.createdAt);
    if (Number.isNaN(d.getTime())) continue;

    const slot = index.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (slot !== undefined) buckets[slot].value++;
  }

  return buckets;
};

const SourceChip = ({ url, count, onClick }) => {
  const domain = getDomain(url);
  const favicon = getFaviconUrl(url, 32);

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${domain} — ${count} saved`}
      className="group flex flex-col items-center gap-1.5 w-[4.5rem] shrink-0"
    >
      <span
        className="w-10 h-10 rounded-full border border-line flex items-center justify-center overflow-hidden transition-transform duration-150 group-hover:scale-105"
        style={{ background: getDomainTint(url) }}
      >
        {favicon ? (
          <img
            src={favicon}
            alt=""
            width={20}
            height={20}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-5 h-5 object-contain"
          />
        ) : (
          <span className="text-small font-semibold text-body">
            {domain.charAt(0).toUpperCase()}
          </span>
        )}
      </span>

      <span className="text-caption text-muted truncate w-full text-center">
        {domain.split(".")[0]}
      </span>
    </button>
  );
};

/**
 * The signed-in landing screen.
 *
 * Answers "what have I saved, and what can I find right now" with the shape of
 * the library rather than four bare counters: how saving has trended, where the
 * saves live, and what is most recent.
 */
const HomeView = ({
  items,
  listStatus,
  error,
  onRetry,
  onDelete,
  onTagClick,
  onCollectionClick,
  onNavigate,
  onQuickSave,
}) => {
  const user = useSelector((state) => state.auth.user);
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(
    () =>
      typeFilter === "all"
        ? items
        : items.filter((item) => item.type === typeFilter),
    [items, typeFilter],
  );

  const stats = useMemo(() => {
    const collections = new Set();
    const tags = new Set();
    const cutoff = Date.now() - RESURFACE_AFTER_DAYS * 86_400_000;
    let older = 0;

    for (const item of items) {
      if (item.collection) collections.add(item.collection);
      item.tags?.forEach((t) => tags.add(t));
      if (new Date(item.createdAt).getTime() < cutoff) older++;
    }

    return {
      total: items.length,
      collections: collections.size,
      tags: tags.size,
      resurfaced: older,
    };
  }, [items]);

  const trend = useMemo(
    () => monthlyBuckets(items, MONTHS_SHOWN).map((b) => b.value),
    [items],
  );

  const chartData = useMemo(
    () => monthlyBuckets(filtered, MONTHS_SHOWN),
    [filtered],
  );

  const collectionSplit = useMemo(() => {
    const map = new Map();

    for (const item of items) {
      const name = item.collection || "Unfiled";
      map.set(name, (map.get(name) ?? 0) + 1);
    }

    return [...map.entries()].map(([label, value]) => ({ label, value }));
  }, [items]);

  const topSources = useMemo(() => {
    const map = new Map();

    for (const item of items) {
      const domain = getDomain(item.url);
      if (!domain) continue;

      if (!map.has(domain)) map.set(domain, { url: item.url, count: 0 });
      map.get(domain).count++;
    }

    return [...map.entries()]
      .map(([domain, v]) => ({ domain, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [items]);

  const recent = filtered.slice(0, 3);
  const lastSaved = items.slice(0, 4);

  const greeting = user?.username
    ? `Hello ${user.username}`
    : "Hello";

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h1 font-semibold text-ink">Dashboard</h1>
          <p className="mt-1 text-base text-muted">
            {greeting}
            {stats.total > 0 && (
              <>
                {" · "}
                {stats.total} {stats.total === 1 ? "link" : "links"} in your
                memory
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            icon={Search}
            onClick={() => onNavigate("recall")}
          >
            <span className="hidden sm:inline">Recall</span>
          </Button>

          <Button variant="primary" size="md" icon={Plus} onClick={onQuickSave}>
            Save a link
          </Button>
        </div>
      </div>

      <ListState
        status={listStatus}
        error={error}
        onRetry={onRetry}
        hasContent={items.length > 0}
        isEmpty={items.length === 0}
        skeleton={
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-[104px] rounded-card" />
              ))}
            </div>
            <LinkGridSkeleton count={3} />
          </div>
        }
        empty={
          <EmptyState
            icon={Bookmark}
            title="Your memory is empty"
            description="Save an article, a video, a tutorial — anything you'd hate to lose track of. Recallix handles the filing."
            action={{
              label: "Save your first link",
              icon: Plus,
              onClick: onQuickSave,
            }}
          />
        }
      >
        <div className="space-y-4">
          {/* Stat row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Bookmark}
              label="Saved"
              value={stats.total}
              onClick={() => onNavigate("library")}
            >
              <Sparkline values={trend} label="Saves per month" />
            </StatCard>

            <StatCard
              icon={FolderOpen}
              label="Collections"
              value={stats.collections}
              onClick={() => onNavigate("collections")}
            />

            <StatCard
              icon={Hash}
              label="Tags"
              value={stats.tags}
              onClick={() => onNavigate("graph")}
            />

            <StatCard
              icon={Clock}
              label="Worth revisiting"
              value={stats.resurfaced}
              onClick={() => onNavigate("resurfaced")}
            />
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            {/* --- Column 1 --- */}
            <div className="space-y-4 min-w-0">
              <Panel
                title="Saving over time"
                action={
                  <SegmentedControl
                    size="sm"
                    label="Filter by type"
                    options={TYPE_FILTERS}
                    value={typeFilter}
                    onChange={setTypeFilter}
                  />
                }
              >
                <p className="text-h1 font-semibold text-ink tabular-nums">
                  {filtered.length}
                </p>
                <p className="text-caption text-muted mb-4">
                  {typeFilter === "all"
                    ? "saved in total"
                    : `${TYPE_FILTERS.find((t) => t.id === typeFilter)?.label.toLowerCase()} saved`}
                </p>

                <BarChart
                  data={chartData}
                  emptyLabel={`No ${typeFilter === "all" ? "saves" : typeFilter + "s"} in the last ${MONTHS_SHOWN} months`}
                />
              </Panel>

              <Panel title="Top sources">
                {topSources.length > 0 ? (
                  // Wraps rather than scrolls: a horizontal scrollbar inside a
                  // narrow dashboard panel hid half the sources behind a drag.
                  <div className="flex flex-wrap gap-x-1 gap-y-3">
                    {topSources.map((s) => (
                      <SourceChip
                        key={s.domain}
                        url={s.url}
                        count={s.count}
                        onClick={() => onNavigate("library")}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-small text-muted">No sources yet.</p>
                )}
              </Panel>
            </div>

            {/* --- Column 2 --- */}
            <div className="space-y-4 min-w-0">
              <Panel
                title="Where your saves live"
                action={
                  <button
                    type="button"
                    onClick={() => onNavigate("collections")}
                    className="inline-flex items-center gap-1 text-small text-muted hover:text-accent transition-colors rounded px-1"
                  >
                    All
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                }
              >
                <DonutChart
                  data={collectionSplit}
                  centerLabel="Saved"
                  onSliceClick={(name) =>
                    name !== "Unfiled" && onCollectionClick(name)
                  }
                />
              </Panel>
            </div>

            {/* --- Column 3 --- */}
            <div className="space-y-4 min-w-0">
              {/* Memory card — the one place colour runs free, like the
                  reference's payment card. Every figure on it is real. */}
              <div className="relative overflow-hidden rounded-card p-5 text-white shadow-card bg-gradient-to-br from-accent via-accent-hover to-ink">
                <div
                  className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"
                  aria-hidden="true"
                />

                <div className="relative flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkle className="w-4 h-4" aria-hidden="true" />
                    <span className="text-small font-medium">Recallix</span>
                  </div>
                  <Globe className="w-4 h-4 opacity-70" aria-hidden="true" />
                </div>

                <p className="relative mt-8 text-caption text-white/80">
                  Links remembered
                </p>
                <p className="relative text-display font-bold leading-none tabular-nums">
                  {stats.total}
                </p>

                <div className="relative mt-6 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-caption text-white/80">Keeper</p>
                    <p className="text-small font-medium truncate">
                      {user?.username ?? "—"}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-caption text-white/80">Since</p>
                    <p className="text-small font-medium">
                      {formatDate(user?.createdAt) || "—"}
                    </p>
                  </div>
                </div>
              </div>

              <Panel
                title="Last saved"
                action={
                  <button
                    type="button"
                    onClick={() => onNavigate("library")}
                    className="inline-flex items-center gap-1 text-small text-muted hover:text-accent transition-colors rounded px-1"
                  >
                    View all
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                }
                bodyClassName="divide-y divide-line"
              >
                {lastSaved.map((item) => (
                  <a
                    key={item._id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 group"
                  >
                    <span
                      className="w-9 h-9 rounded-control shrink-0 overflow-hidden flex items-center justify-center"
                      style={{ background: getDomainTint(item.url) }}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-small font-semibold text-body">
                          {getDomain(item.url).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-small font-medium text-ink truncate group-hover:text-accent transition-colors">
                        {item.title || "Untitled"}
                      </span>
                      <span className="block text-caption text-muted truncate">
                        {getDomain(item.url)}
                      </span>
                    </span>

                    <span className="text-caption text-faint shrink-0">
                      {timeAgo(item.createdAt)}
                    </span>
                  </a>
                ))}
              </Panel>
            </div>
          </div>

          {/* Full width: the thumbnails need the room, and keeping this out of
              the three columns is what stops the grid ending on a ragged edge. */}
          <Panel
            title="Recent saves"
            action={
              <button
                type="button"
                onClick={() => onNavigate("library")}
                className="inline-flex items-center gap-1 text-small text-muted hover:text-accent transition-colors rounded px-1"
              >
                View all
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            }
          >
            {recent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {recent.map((item) => (
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
            ) : (
              <p className="text-small text-muted py-6 text-center">
                Nothing matches this filter yet.
              </p>
            )}
          </Panel>
        </div>
      </ListState>
    </div>
  );
};

export default HomeView;
