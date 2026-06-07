"use client";
import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";

export function RefreshButton({ label }: { label: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={isPending}
      title={label}
      className="flex items-center gap-1.5 border-2 border-(--border) bg-white px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-(--surface-2) disabled:opacity-40"
      style={{
        fontFamily: "var(--font-body), system-ui, sans-serif",
        color: "var(--text-2)",
      }}
    >
      <RefreshCcw
        size={12}
        style={{ animation: isPending ? "pixelSpin 0.8s steps(8, end) infinite" : "none" }}
      />
      {label}
    </button>
  );
}
