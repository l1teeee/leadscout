"use client";

import { useIntersection } from "@/hooks/use-intersection";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

const stats = [
  { number: "10.000+", label: "leads en base de datos" },
  { number: "94%", label: "precisión del score IA" },
  { number: "3x", label: "más conversiones" },
  { number: "< 2min", label: "para encontrar tu primer lead" },
];

export function LandingStats() {
  const { ref, isVisible } = useIntersection<HTMLElement>();

  return (
    <section
      ref={ref}
      className={`reveal-up w-full px-4 py-14 sm:px-6 lg:px-8 ${isVisible ? "is-visible" : ""}`}
      style={{ background: "var(--sidebar)", color: "var(--pixel-highlight)" }}
    >
      <div data-stagger className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="lnd-stat-card p-5"
            style={{
              background: "var(--sidebar-item)",
              border: "2px solid var(--pixel-highlight)",
            }}
          >
            <p className="retro text-2xl font-black sm:text-3xl" style={{ color: "var(--pixel-highlight)" }}>
              {stat.number}
            </p>
            <p className="mt-3 text-sm font-semibold leading-6" style={{ ...bodyFont, color: "var(--pixel-highlight)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
