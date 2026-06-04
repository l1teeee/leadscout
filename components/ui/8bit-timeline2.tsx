import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TimelineStep {
  description: string;
  icon: ReactNode;
  title: string;
}

interface Timeline2Props {
  className?: string;
  description?: string;
  steps?: TimelineStep[];
  title?: string;
}

const defaultSteps: TimelineStep[] = [
  {
    icon: "I",
    title: "Design",
    description: "Plan your layout and pick your blocks.",
  },
  {
    icon: "II",
    title: "Develop",
    description: "Install components and wire them up.",
  },
  {
    icon: "III",
    title: "Test",
    description: "Check responsiveness and dark mode.",
  },
  {
    icon: "IV",
    title: "Deploy",
    description: "Push to production. Game over (in a good way).",
  },
];

export default function Timeline2({
  title = "The Quest Line",
  description = "Your path from idea to launch",
  steps = defaultSteps,
  className,
}: Timeline2Props) {
  return (
    <section className={cn("w-full px-4 py-16", className)}>
      <div className="w-full">
        {(title || description) && (
          <div className="mb-10 text-center">
            {title && (
              <h2 className="retro mb-3 font-bold text-2xl tracking-tight md:text-3xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="retro text-[9px]" style={{ color: "var(--text-3)" }}>
                {description}
              </p>
            )}
          </div>
        )}

        {/* Horizontal on desktop, vertical on mobile */}
        <div className="relative flex flex-col gap-8 md:flex-row md:gap-0">
          {/* Horizontal dashed connector (desktop) */}
          <div
            className="absolute top-7 right-0 left-0 hidden h-0 border-t-2 border-dashed md:block"
            style={{ borderColor: "var(--border)" }}
          />

          {steps.map((step) => (
            <article
              className="lnd-step-card relative flex flex-1 flex-col items-center text-center"
              key={step.title}
            >
              {/* Checkpoint box — pixel-card style */}
              <div
                className="lnd-step-icon retro relative z-10 mb-4 flex size-14 items-center justify-center border-2 font-bold"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  boxShadow: "2px 2px 0 0 var(--pixel-shadow)",
                  color: "var(--text)",
                  fontSize: "10px",
                }}
              >
                {step.icon}
              </div>

              <h3
                className="retro mb-1 font-bold text-xs"
                style={{ color: "var(--text)" }}
              >
                {step.title}
              </h3>
              <p
                className="max-w-[160px] text-[10px] leading-relaxed"
                style={{
                  fontFamily: "var(--font-body), system-ui, sans-serif",
                  color: "var(--text-3)",
                }}
              >
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
