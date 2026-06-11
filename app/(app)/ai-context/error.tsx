"use client";

import { PageError } from "@/components/shared/page-error";

export default function AiContextError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError moduleKey="aiContext" message={error.message} onRetry={reset} />;
}
