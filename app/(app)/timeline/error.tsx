"use client";

import { PageError } from "@/components/shared/page-error";

export default function TimelineError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError moduleKey="timeline" message={error.message} onRetry={reset} />;
}
