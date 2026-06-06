import { SkeletonBlock } from "@/components/shared/module-skeleton";

export default function CampaignsLoading() {
  return (
    <div className="w-full animate-pulse p-4 sm:p-6 lg:p-8">
      <SkeletonBlock height="h-64" />
    </div>
  );
}
