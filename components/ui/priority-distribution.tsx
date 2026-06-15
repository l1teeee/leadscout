import Link from "next/link";
import { cn } from "@/lib/utils";

type PriorityKey = "alta" | "media" | "baja";

interface PriorityDistributionProps {
  variant: "horizontal" | "vertical";
  by_priority: Record<string, number>;
  labels: Record<string, string>;
  title: string;
  className?: string;
}

const bodyTextStyle = {
  fontFamily: "var(--font-body), system-ui, sans-serif",
};

const priorities: { key: PriorityKey; color: string }[] = [
  { key: "alta", color: "#3FAE2A" },
  { key: "media", color: "#F4A261" },
  { key: "baja", color: "#9CA3AF" },
];

export default function PriorityDistribution({
  variant,
  by_priority,
  labels,
  title,
  className,
}: PriorityDistributionProps) {
  const total = priorities.reduce((sum, priority) => sum + (by_priority[priority.key] ?? 0), 0);

  if (variant === "vertical") {
    return (
      <section className={cn("pixel-card-sm bg-white p-5", className)}>
        <h2 className="retro pixel-text-sm uppercase" style={{ color: "var(--text)" }}>
          {title}
        </h2>
        <div className="mt-4 space-y-3">
          {priorities.map((priority) => {
            const count = by_priority[priority.key] ?? 0;
            const label = labels[priority.key] ?? priority.key;
            const width = Math.max(8, Math.round((count / Math.max(1, total)) * 100));

            return (
              <div key={priority.key}>
                <div
                  className="mb-1.5 flex items-center justify-between gap-3 text-xs font-semibold"
                  style={bodyTextStyle}
                >
                  <span style={{ color: "var(--text-2)" }}>{label}</span>
                  <span className="tabular-nums" style={{ color: "var(--text)" }}>
                    {count}
                  </span>
                </div>
                <div className="h-4 border-2 border-[var(--border)] bg-[var(--surface)] p-[2px]">
                  <div
                    className="h-full"
                    style={{ width: `${width}%`, background: priority.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className={cn("pixel-card-sm flex flex-col bg-white p-5", className)}>
      <h2 className="retro pixel-text-xs uppercase" style={{ color: "var(--text)" }}>
        {title}
      </h2>
      <div className="mt-4 flex h-8 overflow-hidden border-2 border-(--border) bg-(--surface-2)">
        {priorities.map((priority) => {
          const count = by_priority[priority.key] ?? 0;
          const width = total > 0 ? (count / total) * 100 : 0;
          const label = labels[priority.key] ?? priority.key;

          return (
            <Link
              key={priority.key}
              href={`/leads?priority=${priority.key}`}
              aria-label={`${title}: ${label} (${count})`}
              className="h-full transition-opacity hover:opacity-80 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-(--border)"
              style={{ width: `${width}%`, background: priority.color }}
            />
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {priorities.map((priority) => {
          const count = by_priority[priority.key] ?? 0;
          const label = labels[priority.key] ?? priority.key;

          return (
            <Link
              key={priority.key}
              href={`/leads?priority=${priority.key}`}
              className="flex items-center gap-2 transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border)"
              aria-label={`${title}: ${label} (${count})`}
            >
              <span
                className="h-3 w-3 shrink-0 border border-(--border)"
                style={{ background: priority.color }}
              />
              <div>
                <p className="retro pixel-text-xs tabular-nums" style={{ color: "var(--text)" }}>
                  {count}
                </p>
                <p
                  className="text-xs font-medium"
                  style={{ ...bodyTextStyle, color: "var(--text-3)" }}
                >
                  {label}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
