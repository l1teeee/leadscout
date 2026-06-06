/** Primitive skeleton blocks used by all loading.tsx files. */

export function SkeletonBlock({
  height = "h-24",
  className = "",
}: {
  height?: string;
  className?: string;
}) {
  return <div className={`pixel-card-sm bg-[var(--surface-2)] ${height} ${className}`} />;
}

export function SkeletonKpiRow({ count = 4 }: { count?: number }) {
  return (
    <div className={`mb-5 grid gap-4 grid-cols-2 xl:grid-cols-${count}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} height="h-24" />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="pixel-card-sm overflow-hidden bg-white">
      <div className="h-10 border-b-2 border-[var(--border)] bg-[var(--surface-2)]" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 border-b border-[#E4E4E7] bg-[var(--surface)]" />
      ))}
    </div>
  );
}

export function SkeletonCards({
  count = 6,
  cols = "md:grid-cols-2 xl:grid-cols-3",
  height = "h-40",
}: {
  count?: number;
  cols?: string;
  height?: string;
}) {
  return (
    <div className={`grid gap-4 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} height={height} />
      ))}
    </div>
  );
}
