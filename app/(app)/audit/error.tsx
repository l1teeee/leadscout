"use client";

import { PageError } from "@/components/shared/page-error";

export default function AuditError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError moduleKey="audit" message={error.message} onRetry={reset} />;
}
