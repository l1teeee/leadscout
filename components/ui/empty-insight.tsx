import { Compass, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const bodyTextStyle = {
  fontFamily: "var(--font-body), system-ui, sans-serif",
};

interface EmptyInsightProps {
  title: string;
  description: string;
  action?: string;
  compact?: boolean;
  className?: string;
}

export function EmptyInsight({
  title,
  description,
  action,
  compact = false,
  className,
}: EmptyInsightProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-3 px-4 py-5" : "min-h-64 gap-4 px-6 py-10",
        className
      )}
    >
      <div
        className="relative flex h-12 w-12 items-center justify-center border-2 border-[var(--border)] bg-[var(--pixel-highlight)] shadow-[2px_2px_0_var(--pixel-shadow)]"
        aria-label="Claude AI"
      >
        <span className="text-sm font-black" style={{ ...bodyTextStyle, color: "var(--text)" }}>
          C
        </span>
        <Sparkles
          size={14}
          className="absolute -right-2 -top-2 border-2 border-[var(--border)] bg-[var(--surface)] p-0.5"
          style={{ color: "var(--text)" }}
        />
      </div>

      <div className="max-w-md">
        <p className="text-sm font-extrabold" style={{ ...bodyTextStyle, color: "var(--text)" }}>
          {title}
        </p>
        <p className="mt-2 text-xs font-semibold leading-relaxed" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
          {description}
        </p>
      </div>

      {action && (
        <div className="inline-flex items-center gap-2 border-2 border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-bold shadow-[2px_2px_0_var(--pixel-shadow)]">
          <Compass size={14} />
          <span style={{ ...bodyTextStyle, color: "var(--text-2)" }}>{action}</span>
        </div>
      )}
    </div>
  );
}
