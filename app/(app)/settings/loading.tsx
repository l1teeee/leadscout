import { SkeletonBlock } from "@/components/shared/module-skeleton";

export default function SettingsLoading() {
  return (
    <div className="w-full animate-pulse p-4 sm:p-6 lg:p-8">
      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Workspace form card */}
        <div className="pixel-card-sm overflow-hidden bg-white">
          <div className="h-20 border-b-2 border-[var(--border)] bg-[var(--surface-2)]" />
          <div className="grid gap-4 p-5 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBlock key={i} height="h-9" />
            ))}
          </div>
        </div>
        {/* User card */}
        <SkeletonBlock height="h-48" />
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <SkeletonBlock height="h-40" />
          <SkeletonBlock height="h-56" />
          <div className="grid gap-5 md:grid-cols-2">
            <SkeletonBlock height="h-32" />
            <SkeletonBlock height="h-32" />
          </div>
        </div>
        <div className="space-y-5">
          <SkeletonBlock height="h-48" />
          <SkeletonBlock height="h-36" />
          <SkeletonBlock height="h-36" />
        </div>
      </div>
    </div>
  );
}
