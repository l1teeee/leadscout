"use client";

import { PageError } from "@/components/shared/page-error";

export default function OpportunitiesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError module="Oportunidades" message={error.message} onRetry={reset} />;
}
