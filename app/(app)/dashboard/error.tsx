"use client";

import { PageError } from "@/components/shared/page-error";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError moduleKey="dashboard" message={error.message} onRetry={reset} />;
}
