import { cx } from "../lib/cx";

/** Neutral placeholder block. Shape it with width/height classes. */
export const Skeleton = ({ className }) => (
  <div
    className={cx("bg-raised rounded-control rx-shimmer", className)}
    aria-hidden="true"
  />
);

/**
 * Placeholder shaped like a LinkCard, so content does not jump when it loads.
 */
export const LinkCardSkeleton = ({ thumbnail = true }) => (
  <div className="bg-surface border border-line rounded-card shadow-card overflow-hidden">
    {/* Same 16:9 box the real thumbnail uses, so nothing shifts on load */}
    {thumbnail && <Skeleton className="aspect-video w-full rounded-none" />}

    <div className="p-5">
      <div className="flex items-center gap-2.5">
        <Skeleton className="w-6 h-6 rounded-md" />
        <Skeleton className="h-3 w-24" />
      </div>

      <Skeleton className="h-4 w-[85%] mt-4" />
      <Skeleton className="h-4 w-[60%] mt-2" />

      <Skeleton className="h-3 w-full mt-4" />
      <Skeleton className="h-3 w-[70%] mt-2" />

      <div className="flex gap-2 mt-5">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  </div>
);

/** A grid of link placeholders. */
export const LinkGridSkeleton = ({ count = 6 }) => (
  <div
    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
    role="status"
    aria-label="Loading your saved links"
  >
    {Array.from({ length: count }, (_, i) => (
      <LinkCardSkeleton key={i} />
    ))}
  </div>
);

export default Skeleton;
