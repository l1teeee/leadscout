/** Primitive skeleton blocks used by all loading.tsx files. */

export function PixelSkeleton({
  height = "h-24",
  className = "",
}: {
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={`pixel-skeleton pixel-card-sm ${height} ${className}`}
      style={{ border: "2px solid var(--border)" }}
    />
  );
}

export function SkeletonBlock({
  height = "h-24",
  className = "",
}: {
  height?: string;
  className?: string;
}) {
  return <PixelSkeleton height={height} className={className} />;
}

export function SkeletonKpiRow({ count = 4 }: { count?: number }) {
  return (
    <div className="mb-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <PixelSkeleton key={i} height="h-[88px]" />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden" style={{ border: "2px solid var(--border)", boxShadow: "3px 3px 0 0 var(--pixel-shadow)" }}>
      <div className="h-11 pixel-skeleton" style={{ borderBottom: "2px solid var(--border)" }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-[52px]"
          style={{
            background: i % 2 === 0 ? "var(--surface)" : "var(--surface-2)",
            borderBottom: i < rows - 1 ? "2px solid var(--border)" : undefined,
          }}
        />
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
        <PixelSkeleton key={i} height={height} />
      ))}
    </div>
  );
}

export function SkeletonKanbanCard() {
  return (
    <div
      className="bg-white p-4"
      style={{ border: "2px solid var(--border)", boxShadow: "2px 2px 0 var(--pixel-shadow)" }}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1.5">
          <PixelSkeleton height="h-3" className="w-3/4" />
          <PixelSkeleton height="h-3" className="w-1/2" />
        </div>
        <PixelSkeleton height="h-5" className="w-12 shrink-0" />
      </div>
      <PixelSkeleton height="h-3" className="mb-3 w-4/5" />
      <PixelSkeleton height="h-2" className="mb-3 w-full" />
      <div className="flex gap-1.5">
        <PixelSkeleton height="h-5" className="w-16" />
        <PixelSkeleton height="h-5" className="w-20" />
      </div>
    </div>
  );
}

export function SkeletonKanbanColumn({ cards = 2 }: { cards?: number }) {
  return (
    <div
      className="bg-[#FAFAF9] p-3"
      style={{ border: "2px solid var(--border)", boxShadow: "3px 3px 0 0 var(--pixel-shadow)" }}
    >
      <div
        className="mb-3 flex items-center justify-between bg-white px-3 py-2"
        style={{ border: "2px solid var(--border)" }}
      >
        <PixelSkeleton height="h-3" className="w-24" />
        <PixelSkeleton height="h-6" className="w-6" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: cards }).map((_, i) => (
          <SkeletonKanbanCard key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <SkeletonKpiRow count={4} />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(520px,0.9fr)]">
        <div
          className="overflow-hidden"
          style={{ border: "2px solid var(--border)", boxShadow: "3px 3px 0 0 var(--pixel-shadow)" }}
        >
          <div
            className="h-11 pixel-skeleton"
            style={{ borderBottom: "2px solid var(--border)" }}
          />
          <div className="h-8 pixel-skeleton opacity-60" style={{ borderBottom: "2px solid var(--border)" }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-3"
              style={{ borderBottom: i < 4 ? "2px solid #E4E4E7" : undefined, background: "var(--surface)" }}
            >
              <div className="flex-1 space-y-1.5">
                <PixelSkeleton height="h-3" className="w-2/3" />
                <PixelSkeleton height="h-2.5" className="w-1/3" />
              </div>
              <PixelSkeleton height="h-3" className="w-24" />
              <PixelSkeleton height="h-2" className="w-28" />
              <PixelSkeleton height="h-5" className="w-16" />
            </div>
          ))}
        </div>

        <div
          className="min-h-[420px]"
          style={{ border: "2px solid var(--border)", boxShadow: "3px 3px 0 0 var(--pixel-shadow)" }}
        >
          <div
            className="px-5 py-4"
            style={{ borderBottom: "2px solid var(--border)", background: "var(--surface-2)" }}
          >
            <PixelSkeleton height="h-2.5" className="mb-2 w-28" />
            <PixelSkeleton height="h-4" className="w-44" />
          </div>
          <div className="flex h-[calc(100%-72px)] items-end justify-between gap-1.5 p-5">
            {[55, 80, 40, 95, 65, 70, 50].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <PixelSkeleton height="h-3" className="w-full opacity-50" />
                <div
                  className="w-full pixel-skeleton"
                  style={{ height: `${h}%`, border: "2px solid var(--border)" }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonKanban() {
  const cardCounts = [3, 2, 1, 2];
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cardCounts.map((count, i) => (
          <SkeletonKanbanColumn key={i} cards={count} />
        ))}
      </div>
    </div>
  );
}
