import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
// force-graph runs its simulation on d3-force-3d, so the collision force has
// to come from the same package to share the node objects. It ships with
// react-force-graph-2d — no new dependency.
import { forceCollide } from "d3-force-3d";
import { Network, Hash, Plus, Maximize2, ExternalLink, X } from "lucide-react";
import PageHeader from "../../../shared/ui/PageHeader";
import EmptyState from "../../../shared/ui/EmptyState";
import ListState from "../../../shared/ui/ListState";
import { Skeleton } from "../../../shared/ui/Skeleton";
import Button from "../../../shared/ui/Button";
import { Badge, Tag } from "../../../shared/ui/Badge";
import { getDomain } from "../../../shared/lib/domain";
import { timeAgo } from "../../../shared/lib/formatDate";

const MAX_TOPICS = 16;

// Read from the stylesheet so the canvas matches the design tokens instead of
// carrying its own hardcoded palette.
const readToken = (name, fallback) => {
  if (typeof window === "undefined") return fallback;

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  return value || fallback;
};

/**
 * Knowledge graph: tags as topic hubs, saved links orbiting the topics they
 * share.
 *
 * The previous implementation never rendered. Three bugs compounded:
 *   1. graph data was written to a ref, but the render body read that ref to
 *      decide whether to show the "no tags" empty state — ref writes do not
 *      re-render, so it showed the empty state permanently;
 *   2. the canvas effect bailed out while the ref was empty (always true
 *      before items loaded) and did not depend on items, so it never re-ran;
 *   3. it called setDimensions with a fresh object while depending on
 *      dimensions, looping and restarting the animation frame each pass.
 *
 * The fix is structural: graph data is STATE, and the simulation/rendering is
 * delegated to react-force-graph-2d (already a dependency, previously unused),
 * which brings zoom, pan, drag and touch with it.
 */
const GraphView = ({
  items,
  listStatus,
  error,
  onRetry,
  onTagClick,
  onQuickSave,
}) => {
  const wrapRef = useRef(null);
  const graphRef = useRef(null);

  const [size, setSize] = useState({ width: 0, height: 480 });
  const [selected, setSelected] = useState(null);

  // Read once — calling getComputedStyle inside the per-node draw callback
  // would force a style recalculation on every frame.
  const font = useMemo(
    () =>
      typeof document === "undefined"
        ? "sans-serif"
        : getComputedStyle(document.body).fontFamily,
    [],
  );

  const colors = useMemo(
    () => ({
      accent: readToken("--color-accent", "#4f46e5"),
      accentSoft: readToken("--color-accent-soft", "#eef0fe"),
      ink: readToken("--color-ink", "#12131a"),
      muted: readToken("--color-muted", "#6b7280"),
      line: readToken("--color-line", "#e7e8ec"),
      surface: readToken("--color-surface", "#ffffff"),
    }),
    [],
  );

  // Graph data in STATE, so the view re-renders when it changes.
  const graph = useMemo(() => {
    const tagCounts = new Map();

    for (const item of items) {
      for (const tag of item.tags ?? []) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }

    const topics = [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_TOPICS)
      .map(([tag]) => tag);

    const topicSet = new Set(topics);

    const nodes = topics.map((tag) => ({
      id: `topic:${tag}`,
      kind: "topic",
      label: tag,
      count: tagCounts.get(tag),
      // 6–16px, scaled by how often the tag is used
      radius: Math.min(16, 6 + tagCounts.get(tag) * 1.6),
    }));

    const links = [];

    for (const item of items) {
      const connected = (item.tags ?? []).filter((tag) => topicSet.has(tag));
      if (connected.length === 0) continue;

      nodes.push({
        id: `item:${item._id}`,
        kind: "item",
        label: item.title || "Untitled",
        radius: 4.5,
        item,
      });

      for (const tag of connected) {
        links.push({ source: `item:${item._id}`, target: `topic:${tag}` });
      }
    }

    return { nodes, links, topicCount: topics.length };
  }, [items]);

  // Track the container size; ResizeObserver instead of a state-writing effect
  // that depended on its own output.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((prev) =>
        prev.width === width && prev.height === height
          ? prev // identical values bail out; no render loop
          : { width, height },
      );
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const drawNode = useCallback(
    (node, ctx, globalScale) => {
      const isSelected = selected?.id === node.id;

      if (node.kind === "topic") {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? colors.accent : colors.accentSoft;
        ctx.fill();
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();

        const fontSize = 11 / globalScale;
        ctx.font = `600 ${fontSize}px ${font}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        // Knock the label out of the background first — tag labels sit close
        // together and overlapped into an unreadable smear without this.
        const width = ctx.measureText(node.label).width;
        const padX = 3 / globalScale;
        const top = node.y + node.radius + 3 / globalScale;

        ctx.fillStyle = colors.surface;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(
          node.x - width / 2 - padX,
          top - 1 / globalScale,
          width + padX * 2,
          fontSize * 1.2,
        );
        ctx.globalAlpha = 1;

        ctx.fillStyle = colors.ink;
        ctx.fillText(node.label, node.x, top);

        return;
      }

      // Item node — filled, so it reads as a distinct dot rather than a
      // near-invisible hollow ring on a white canvas.
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? colors.accent : colors.muted;
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 3 / globalScale;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Titles are long; only worth drawing when zoomed well in
      if (globalScale > 2.2) {
        ctx.font = `400 ${9 / globalScale}px ${font}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = colors.muted;

        const label =
          node.label.length > 22 ? `${node.label.slice(0, 20)}…` : node.label;

        ctx.fillText(label, node.x, node.y + node.radius + 2 / globalScale);
      }
    },
    [colors, font, selected],
  );

  const handleNodeClick = useCallback((node) => {
    setSelected(node);

    // Centre on what was clicked so the selection is visible
    graphRef.current?.centerAt(node.x, node.y, 400);
  }, []);

  const fitToView = useCallback(() => graphRef.current?.zoomToFit(400, 70), []);

  // Tune the simulation once the instance exists.
  //
  // A library where few links share tags produces several DISCONNECTED
  // clusters. With the default forces they repel each other to the far corners
  // and zoomToFit then renders everything too small to read. Weaker repulsion
  // plus a stronger centring pull keeps the islands close, and a collision
  // force stops nodes (and their labels) from stacking.
  // NOTE the size.width dependency: the canvas only mounts once the container
  // has been measured, so on the first pass graphRef.current is still null.
  // Without it this effect ran once, bailed, and never applied anything.
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg || graph.nodes.length === 0 || size.width === 0) return;

    fg.d3Force("charge")?.strength(-55).distanceMax(220);
    fg.d3Force("link")?.distance(32).strength(1);
    fg.d3Force("center")?.strength(0.35);

    fg.d3Force(
      "collide",
      forceCollide().radius((node) => node.radius + 12),
    );

    fg.d3ReheatSimulation?.();
  }, [graph, size.width]);

  const itemNodeCount = graph.nodes.filter((n) => n.kind === "item").length;

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        icon={Network}
        title="Graph"
        subtitle={
          graph.topicCount
            ? `${itemNodeCount} links across ${graph.topicCount} topics`
            : "How your saved links connect"
        }
        actions={
          graph.topicCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              icon={Maximize2}
              onClick={fitToView}
            >
              Fit
            </Button>
          )
        }
      />

      <ListState
        status={listStatus}
        error={error}
        onRetry={onRetry}
        hasContent={items.length > 0}
        isEmpty={graph.topicCount === 0}
        skeleton={<Skeleton className="h-[520px] rounded-card" />}
        empty={
          items.length === 0 ? (
            <EmptyState
              icon={Network}
              title="Nothing to connect yet"
              description="Save a few links and Recallix will map how their topics relate."
              action={{ label: "Save a link", icon: Plus, onClick: onQuickSave }}
            />
          ) : (
            <EmptyState
              icon={Hash}
              title="No topics to map"
              description="None of your saved links picked up tags, so there is nothing to connect yet. Newly saved links are tagged automatically."
              action={{ label: "Save a link", icon: Plus, onClick: onQuickSave }}
            />
          )
        }
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div
            ref={wrapRef}
            className="relative flex-1 min-w-0 h-[420px] sm:h-[520px] bg-surface border border-line rounded-card overflow-hidden"
          >
            {size.width > 0 && (
              <ForceGraph2D
                ref={graphRef}
                width={size.width}
                height={size.height}
                graphData={graph}
                backgroundColor="transparent"
                nodeCanvasObject={drawNode}
                nodePointerAreaPaint={(node, color, ctx) => {
                  ctx.fillStyle = color;
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2);
                  ctx.fill();
                }}
                nodeLabel={(node) => node.label}
                linkColor={() => colors.line}
                linkWidth={1}
                onNodeClick={handleNodeClick}
                onBackgroundClick={() => setSelected(null)}
                cooldownTicks={90}
                onEngineStop={fitToView}
                d3VelocityDecay={0.28}
                enableNodeDrag
              />
            )}

            <div className="absolute top-3 left-3 flex items-center gap-3 bg-surface/90 backdrop-blur border border-line rounded-control px-3 py-1.5 text-caption text-muted pointer-events-none">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-soft border border-accent" />
                Topics
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-surface border border-muted" />
                Links
              </span>
            </div>

            <p className="absolute bottom-3 left-3 text-caption text-faint pointer-events-none">
              Scroll to zoom · drag to move · tap a node
            </p>
          </div>

          {/* Detail panel — click, not hover, so it works on touch and the
              selection stays put while you read it. */}
          {selected && (
            <aside className="lg:w-80 shrink-0 bg-surface border border-line rounded-card p-5 shadow-card rx-fade-up">
              <div className="flex items-start justify-between gap-2">
                <Badge tone="accent">
                  {selected.kind === "topic" ? "Topic" : "Saved link"}
                </Badge>

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close details"
                  className="w-7 h-7 -mr-1 -mt-1 rounded-control flex items-center justify-center text-muted hover:text-ink hover:bg-raised transition-colors"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              {selected.kind === "topic" ? (
                <>
                  <h2 className="mt-3 text-h2 font-semibold text-ink break-words">
                    {selected.label}
                  </h2>
                  <p className="mt-1 text-small text-muted">
                    On {selected.count} saved{" "}
                    {selected.count === 1 ? "link" : "links"}
                  </p>

                  <Button
                    variant="soft"
                    size="md"
                    className="w-full mt-4"
                    onClick={() => onTagClick(selected.label)}
                  >
                    See everything tagged “{selected.label}”
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="mt-3 text-h3 font-semibold text-ink leading-snug">
                    {selected.item.title || "Untitled"}
                  </h2>

                  <p className="mt-1 text-caption text-muted">
                    {getDomain(selected.item.url)} · saved{" "}
                    {timeAgo(selected.item.createdAt)}
                  </p>

                  {selected.item.summary && (
                    <p className="mt-3 text-small text-muted line-clamp-4">
                      {selected.item.summary}
                    </p>
                  )}

                  {selected.item.tags?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {selected.item.tags.map((tag) => (
                        <Tag key={tag} onClick={() => onTagClick(tag)}>
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  )}

                  <a
                    href={selected.item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 min-h-11 rounded-control bg-accent text-white text-base font-medium hover:bg-accent-hover transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    Open link
                  </a>
                </>
              )}
            </aside>
          )}
        </div>
      </ListState>
    </div>
  );
};

export default GraphView;
