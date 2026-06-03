"use client";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  variant?: "default" | "retro";
  progressBg?: string;
}

export function Progress({
  value = 0,
  className,
  progressBg,
  ...props
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn(
        "h-4 w-full overflow-hidden rounded-none border-2 border-[var(--border)] bg-[var(--surface)] p-[2px]",
        className
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      {...props}
    >
      <div
        className={cn("h-full rounded-none transition-[width] duration-200 ease-[var(--ease-out)]", progressBg)}
        style={{
          width: `${pct}%`,
          background: progressBg ? undefined : "var(--text)",
        }}
      />
    </div>
  );
}

export default Progress;
