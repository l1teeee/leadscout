"use client";

import { PageError } from "@/components/shared/page-error";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError moduleKey="settings" message={error.message} onRetry={reset} />;
}
