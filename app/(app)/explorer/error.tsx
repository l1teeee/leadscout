"use client";

import { PageError } from "@/components/shared/page-error";

export default function ExplorerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError moduleKey="explorer" message={error.message} onRetry={reset} />;
}
