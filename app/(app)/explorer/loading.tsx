import { SkeletonBlock } from "@/components/shared/module-skeleton";

export default function ExplorerLoading() {
  return (
    <div className="flex h-full min-h-0 animate-pulse gap-4 p-4 sm:p-6 lg:p-8">
      {/* Location panel */}
      <SkeletonBlock height="h-full min-h-[500px]" className="w-72 shrink-0" />
      {/* Map + results */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <SkeletonBlock height="flex-1 min-h-[300px]" />
        <SkeletonBlock height="h-48" />
      </div>
    </div>
  );
}
