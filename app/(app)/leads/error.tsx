"use client";

import { PageError } from "@/components/shared/page-error";

export default function LeadsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError module="Leads" message={error.message} onRetry={reset} />;
}
