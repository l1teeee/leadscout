import { SkeletonBlock } from "@/components/shared/module-skeleton";

export default function AuditLoading() {
  return (
    <div className="w-full animate-pulse p-4 sm:p-6 lg:p-8">
      <SkeletonBlock height="h-32" className="mb-5" />
      <div className="grid gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBlock key={i} height="h-14" />
        ))}
      </div>
    </div>
  );
}
