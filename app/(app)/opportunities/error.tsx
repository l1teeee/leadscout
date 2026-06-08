"use client";

import { PageError } from "@/components/shared/page-error";

export default function OpportunitiesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError moduleKey="opportunities" message={error.message} onRetry={reset} />;
}
