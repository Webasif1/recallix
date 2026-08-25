import { useState } from "react";
import {
  ExternalLink,
  Trash2,
  Copy,
  Check,
  FileText,
  Play,
  Image as ImageIcon,
  FileType,
  Link2,
} from "lucide-react";
import { Badge, Tag } from "./Badge";
import { cx } from "../lib/cx";
import { getDomain, getFaviconUrl, getDomainTint } from "../lib/domain";
import { timeAgo, formatDate } from "../lib/formatDate";
import notify from "../lib/notify";

const TYPE_ICON = {
  article: FileText,
  video: Play,
  image: ImageIcon,
  pdf: FileType,
  other: Link2,
};

/** Favicon with a lettered fallback — saved links point at arbitrary hosts. */
const SourceMark = ({ url }) => {
  const [failed, setFailed] = useState(false);
  const domain = getDomain(url);
  const src = getFaviconUrl(url);

  if (!src || failed) {
    return (
      <span
        className="w-6 h-6 rounded-md flex items-center justify-center text-caption font-semibold text-body shrink-0"
        style={{ background: getDomainTint(url) }}
        aria-hidden="true"
      >
        {domain.charAt(0).toUpperCase() || "?"}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={24}
      height={24}
      loading="lazy"
      onError={() => setFailed(true)}
      className="w-6 h-6 rounded-md shrink-0 bg-raised object-contain"
    />
  );
};

/**
 * The single saved-link card.
 *
 * Replaces five near-identical inline card blocks that had drifted apart
 * (different padding, different absolutely-positioned buttons overlapping
 * their own content, one calling an undefined handler).
 *
 * Priority order, per the redesign: title, source, tags, primary action.
 * The whole card opens the link; the row actions stop propagation.
 */
const LinkCard = ({
  item,
  onDelete,
  onTagClick,
  onCollectionClick,
  deleting = false,
  highlight = false,
  // Cards sit under an <h2> section heading in some views and directly under
  // the page <h1> in others. Defaulting to h3 and letting the caller drop to
  // h2 keeps the document outline from skipping a level.
  headingLevel = 3,
}) => {
  const [copied, setCopied] = useState(false);
  const Heading = `h${headingLevel}`;

  const domain = getDomain(item.url);
  const TypeIcon = TYPE_ICON[item.type] ?? Link2;
  const savedAt = item.createdAt || item.updatedAt;

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      notify.success("Link copied", { id: `item-copy-${item._id}` });
      setTimeout(() => setCopied(false), 1600);
    } catch {
      notify.error("Couldn't copy the link", { id: `item-copy-${item._id}` });
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(item);
  };

  return (
    <article
      className={cx(
        "group relative flex flex-col bg-surface border rounded-card shadow-card",
        "transition-[border-color,box-shadow,opacity] duration-150",
        "focus-within:border-accent/50 hover:border-line-strong",
        highlight ? "border-accent-line ring-1 ring-accent/15" : "border-line",
        deleting && "opacity-50 pointer-events-none",
      )}
    >
      <div className="p-5 flex-1 flex flex-col">
        {/* Source row */}
        <div className="flex items-center gap-2.5 min-w-0">
          <SourceMark url={item.url} />

          <span className="text-caption text-muted truncate">{domain}</span>

          <TypeIcon
            className="w-3 h-3 text-faint shrink-0"
            aria-label={item.type}
          />
        </div>

        {/*
          No "% match" badge here on purpose. Raw cosine similarity from
          mistral-embed sits around 0.6 for ANY query — an unrelated phrase
          can outscore a relevant one — so a percentage reads as precision the
          number does not have. Only the relative ranking is meaningful, and
          RecallView expresses that through ordering and headings instead.
        */}

        {/* Title — the primary target, so the whole card is clickable via
            this stretched link while other actions sit above it. */}
        <Heading className="mt-3 text-h3 font-semibold text-ink leading-snug line-clamp-2">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="after:absolute after:inset-0 after:rounded-card hover:text-accent transition-colors"
          >
            {item.title || "Untitled"}
          </a>
        </Heading>

        {item.summary && (
          <p className="mt-2 text-small text-muted line-clamp-2">
            {item.summary}
          </p>
        )}

        {/* Tags */}
        {item.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5 relative z-10">
            {item.tags.slice(0, 3).map((tag) => (
              <Tag
                key={tag}
                onClick={onTagClick ? () => onTagClick(tag) : undefined}
              >
                {tag}
              </Tag>
            ))}

            {item.tags.length > 3 && (
              <span className="text-caption text-faint self-center">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer: collection + date + actions */}
        <div className="mt-auto pt-4 flex items-center gap-2">
          <div className="relative z-10 min-w-0">
            {item.collection &&
              (onCollectionClick ? (
                <button
                  type="button"
                  onClick={() => onCollectionClick(item.collection)}
                  className="max-w-full"
                >
                  <Badge tone="accent" className="max-w-full truncate">
                    {item.collection}
                  </Badge>
                </button>
              ) : (
                <Badge tone="accent">{item.collection}</Badge>
              ))}
          </div>

          <time
            className="text-caption text-faint whitespace-nowrap"
            dateTime={savedAt}
            title={formatDate(savedAt)}
          >
            {timeAgo(savedAt)}
          </time>

          {/* Actions: revealed on hover for the mouse, always present for
              keyboard and touch (no hover on touch devices). */}
          <div
            className={cx(
              "ml-auto flex items-center gap-0.5 relative z-10",
              "opacity-100 md:opacity-0",
              "md:group-hover:opacity-100 md:group-focus-within:opacity-100",
              "transition-opacity duration-150",
            )}
          >
            <button
              type="button"
              onClick={handleCopy}
              aria-label={`Copy link to ${item.title || "this item"}`}
              className="w-8 h-8 rounded-control flex items-center justify-center text-muted hover:text-ink hover:bg-raised transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-success" aria-hidden="true" />
              ) : (
                <Copy className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${item.title || "this item"} in a new tab`}
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded-control flex items-center justify-center text-muted hover:text-accent hover:bg-accent-soft transition-colors"
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>

            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                aria-label={`Delete ${item.title || "this item"}`}
                className="w-8 h-8 rounded-control flex items-center justify-center text-muted hover:text-danger hover:bg-danger-soft transition-colors"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default LinkCard;
