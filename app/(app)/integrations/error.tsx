"use client";

import { PageError } from "@/components/shared/page-error";

export default function IntegrationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError module="Integraciones" message={error.message} onRetry={reset} />;
}
