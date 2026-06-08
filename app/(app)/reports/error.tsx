"use client";

import { PageError } from "@/components/shared/page-error";

export default function ReportsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError moduleKey="reports" message={error.message} onRetry={reset} />;
}
