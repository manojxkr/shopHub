/**
 * Skeleton Loader Component
 * Shows a loading placeholder with animated shimmer effect
 */
export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="rounded-lg bg-slate-200 h-48 mb-3" />
      <div className="h-4 bg-slate-200 rounded mb-2" />
      <div className="h-4 bg-slate-200 rounded w-3/4" />
    </div>
  );
}

export function SkeletonLine({ width = "100%", height = "1rem" }) {
  return (
    <div
      className="animate-pulse bg-slate-200 rounded"
      style={{ width, height }}
    />
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
