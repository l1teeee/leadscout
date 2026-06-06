import {
  SkeletonKpiRow,
  SkeletonBlock,
} from "@/components/shared/module-skeleton";

export default function ReportsLoading() {
  return (
    <div className="w-full animate-pulse p-4 sm:p-6 lg:p-8">
      <SkeletonKpiRow count={4} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <SkeletonBlock height="h-72" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} height="h-16" />
          ))}
        </div>
      </div>
    </div>
  );
}
