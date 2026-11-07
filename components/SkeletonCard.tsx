export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface" aria-hidden="true">
      <div className="aspect-video animate-pulse bg-surface-2" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-4 w-4/5 animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
