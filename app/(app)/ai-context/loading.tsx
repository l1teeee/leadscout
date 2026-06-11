import { SkeletonBlock } from "@/components/shared/module-skeleton";

export default function AiContextLoading() {
  return (
    <div className="w-full animate-pulse p-4 sm:p-6 lg:p-8">
      <SkeletonBlock height="h-40" className="mb-5" />
      <div className="grid gap-5">
        <SkeletonBlock height="h-56" />
        <SkeletonBlock height="h-56" />
      </div>
    </div>
  );
}
