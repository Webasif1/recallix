import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Bookmark,
  FolderOpen,
  Hash,
  Clock,
  Plus,
  ArrowRight,
  Search,
} from "lucide-react";
import LinkCard from "../../../shared/ui/LinkCard";
import EmptyState from "../../../shared/ui/EmptyState";
import ListState from "../../../shared/ui/ListState";
import { LinkGridSkeleton, Skeleton } from "../../../shared/ui/Skeleton";
import Button from "../../../shared/ui/Button";
import { Badge } from "../../../shared/ui/Badge";
import { getDomain } from "../../../shared/lib/domain";

const RESURFACE_AFTER_DAYS = 30;

const StatCard = ({ icon: Icon, label, value, onClick }) => {
  const body = (
    <>
      <div className="flex items-center gap-2 text-small text-muted">
        <Icon className="w-4 h-4" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 text-h1 font-semibold text-ink tabular-nums">{value}</p>
    </>
  );

  const className =
    "bg-surface border border-line rounded-card p-4 shadow-card text-left transition-colors";

  if (!onClick) return <div className={className}>{body}</div>;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${className} hover:border-line-strong`}
    >
      {body}
    </button>
  );
};

const Section = ({ title, icon: Icon, action, children }) => (
  <section className="min-w-0">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-accent" aria-hidden="true" />
      <h2 className="text-h3 font-semibold text-ink">{title}</h2>

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="ml-auto inline-flex items-center gap-1 text-small text-muted hover:text-accent transition-colors rounded px-1"
        >
          {action.label}
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
    </div>

    {children}
  </section>
);

/**
 * The signed-in landing screen.
 * Answers: what have I saved, and what can I find right now?
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

  const recent = items.slice(0, 4);

  // Oldest first — the ones most likely to have slipped your mind.
  const resurfaced = useMemo(() => {
    const cutoff = Date.now() - RESURFACE_AFTER_DAYS * 86_400_000;

    return items
      .filter((i) => new Date(i.createdAt).getTime() < cutoff)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(0, 3);
  }, [items]);

  const topCollections = useMemo(() => {
    const map = new Map();

    for (const item of items) {
      if (!item.collection) continue;

      const entry = map.get(item.collection) ?? { count: 0, domains: new Set() };
      entry.count++;
      entry.domains.add(getDomain(item.url));
      map.set(item.collection, entry);
    }

    return [...map.entries()]
      .map(([name, v]) => ({ name, count: v.count, domains: [...v.domains] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [items]);

  const greeting = user?.username ? `Welcome back, ${user.username}` : "Welcome back";

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-7">
        <h1 className="text-h1 font-semibold text-ink">{greeting}</h1>
        <p className="mt-1 text-base text-muted">
          {stats.total > 0
            ? `${stats.total} ${stats.total === 1 ? "link" : "links"} in your memory. Ask for anything.`
            : "Save the first thing you don't want to lose."}
        </p>
      </div>

      {/* Quick save — the single most common action, always one click away */}
      <div className="bg-surface border border-line rounded-card p-4 sm:p-5 shadow-card mb-7">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-h3 font-semibold text-ink">
              Found something worth keeping?
            </h2>
            <p className="mt-1 text-small text-muted">
              Paste the link. Recallix reads it, tags it and files it for you.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <Button variant="primary" size="md" icon={Plus} onClick={onQuickSave}>
              Save a link
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={Search}
              onClick={() => onNavigate("recall")}
              className="hidden sm:inline-flex"
            >
              Recall
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {listStatus === "loading" && items.length === 0 ? (
          Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[92px] rounded-card" />
          ))
        ) : (
          <>
            <StatCard
              icon={Bookmark}
              label="Saved"
              value={stats.total}
              onClick={() => onNavigate("library")}
            />
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
          </>
        )}
      </div>

      <ListState
        status={listStatus}
        error={error}
        onRetry={onRetry}
        hasContent={items.length > 0}
        isEmpty={items.length === 0}
        skeleton={<LinkGridSkeleton count={3} />}
        empty={
          <EmptyState
            icon={Bookmark}
            title="Your memory is empty"
            description="Save an article, a video, a tutorial — anything you'd hate to lose track of. Recallix handles the filing."
            action={{ label: "Save your first link", icon: Plus, onClick: onQuickSave }}
          />
        }
      >
        <div className="space-y-8">
          <Section
            title="Recent saves"
            icon={Bookmark}
            action={{ label: "View all", onClick: () => onNavigate("library") }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {recent.map((item) => (
                <LinkCard
                  key={item._id}
                  item={item}
                  onDelete={onDelete}
                  onTagClick={onTagClick}
                  onCollectionClick={onCollectionClick}
                />
              ))}
            </div>
          </Section>

          {resurfaced.length > 0 && (
            <Section
              title="You saved these a while ago"
              icon={Clock}
              action={{
                label: "See more",
                onClick: () => onNavigate("resurfaced"),
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {resurfaced.map((item) => (
                  <LinkCard
                    key={item._id}
                    item={item}
                    onDelete={onDelete}
                    onTagClick={onTagClick}
                    onCollectionClick={onCollectionClick}
                  />
                ))}
              </div>
            </Section>
          )}

          {topCollections.length > 0 && (
            <Section
              title="Collections"
              icon={FolderOpen}
              action={{
                label: "All collections",
                onClick: () => onNavigate("collections"),
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {topCollections.map((col) => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => onCollectionClick(col.name)}
                    className="text-left bg-surface border border-line rounded-card p-4 shadow-card hover:border-line-strong transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-h3 font-semibold text-ink truncate">
                        {col.name}
                      </h3>
                      <Badge>{col.count}</Badge>
                    </div>

                    <p className="mt-2 text-caption text-muted truncate">
                      {col.domains.slice(0, 3).join(" · ")}
                    </p>
                  </button>
                ))}
              </div>
            </Section>
          )}
        </div>
      </ListState>
    </div>
  );
};

export default HomeView;
