import { SkeletonBlock, SkeletonCards } from "@/components/shared/module-skeleton";

export default function OpportunitiesLoading() {
  return (
    <div className="w-full animate-pulse p-4 sm:p-6 lg:p-8">
      <SkeletonBlock height="h-16" className="mb-5" />
      <SkeletonCards count={6} cols="md:grid-cols-2 xl:grid-cols-3" height="h-40" />
    </div>
  );
}
