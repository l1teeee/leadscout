import {
  SkeletonKpiRow,
  SkeletonTable,
  SkeletonBlock,
} from "@/components/shared/module-skeleton";

export default function LeadsLoading() {
  return (
    <div className="w-full animate-pulse p-4 sm:p-6 lg:p-8">
      <SkeletonKpiRow count={4} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SkeletonTable rows={7} />
        <SkeletonBlock height="h-[420px]" />
      </div>
    </div>
  );
}
