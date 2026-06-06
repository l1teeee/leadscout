import {
  SkeletonKpiRow,
  SkeletonBlock,
  SkeletonTable,
} from "@/components/shared/module-skeleton";

export default function DashboardLoading() {
  return (
    <div className="w-full animate-pulse p-4 sm:p-6 lg:p-8">
      <SkeletonKpiRow count={4} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <SkeletonBlock height="h-64" />
        <div className="space-y-4">
          <SkeletonBlock height="h-[118px]" />
          <SkeletonBlock height="h-[118px]" />
        </div>
      </div>
      <div className="mt-5">
        <SkeletonTable rows={5} />
      </div>
    </div>
  );
}
