"use client";

import { PageError } from "@/components/shared/page-error";

export default function LeadsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError moduleKey="leads" message={error.message} onRetry={reset} />;
}
