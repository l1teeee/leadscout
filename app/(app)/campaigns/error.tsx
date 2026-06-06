"use client";

import { PageError } from "@/components/shared/page-error";

export default function CampaignsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError module="Campañas" message={error.message} onRetry={reset} />;
}
