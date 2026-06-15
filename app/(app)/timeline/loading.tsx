import {
  SkeletonKpiRow,
  SkeletonBlock,
} from "@/components/shared/module-skeleton";

export default function TimelineLoading() {
  return (
    <div className="w-full animate-pulse p-4 sm:p-6 lg:p-8">
      <SkeletonKpiRow count={3} />
      <SkeletonBlock height="h-96" />
    </div>
  );
}
