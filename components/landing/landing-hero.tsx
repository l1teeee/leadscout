"use client";

import Link from "next/link";
import { ArrowRight, CheckSquare, MapPinned, Radar, Rows3 } from "lucide-react";
import { useIntersection } from "@/hooks/use-intersection";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

const statColors = ["var(--c-new)", "var(--c-qualified)", "var(--c-hi)", "var(--text)"];

const workflowIcons = [MapPinned, Radar, CheckSquare, Rows3];

export function LandingHero() {
  const { lang } = useLanguage();
  const tr = translations[lang].landing.hero;
  const { ref: mockRef, isVisible: isMockVisible } = useIntersection<HTMLDivElement>();

  return (
    <section
      className="flex min-h-screen w-full items-center pt-14"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-20">
        <div className="is-visible">
          <div data-stagger className="max-w-3xl">
          <p className="retro pixel-text-sm mb-5 uppercase" style={{ color: "var(--text-2)" }}>
            {tr.eyebrow}
          </p>
          <h1 className="retro text-2xl font-black uppercase leading-tight sm:text-5xl lg:text-6xl" style={{ color: "var(--text)" }}>
            {tr.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base font-medium leading-7 sm:text-lg" style={{ ...bodyFont, color: "var(--text-2)" }}>
            {tr.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="lnd-btn-primary retro pixel-text-sm inline-flex h-12 items-center justify-center gap-2 px-5 font-bold active:translate-x-0.5 active:translate-y-0.5"
            >
              {tr.primary}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="#demo"
              className="lnd-btn-secondary retro pixel-text-sm inline-flex h-12 items-center justify-center px-5 font-bold active:translate-x-0.5 active:translate-y-0.5"
            >
              {tr.secondary}
            </Link>
          </div>
          </div>
        </div>

        <div
          id="demo"
          ref={mockRef}
          className={`pixel-card reveal-left w-full min-w-0 p-4 sm:p-5 ${isMockVisible ? "is-visible" : ""}`}
          style={{ background: "var(--surface)" }}
        >
          <div className="mb-4 flex items-center justify-between gap-3" style={{ borderBottom: "2px solid var(--border)", paddingBottom: "1rem" }}>
            <div>
              <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                {tr.weeklyPipeline}
              </p>
              <h2 className="retro pixel-text-sm mt-2 uppercase" style={{ color: "var(--text)" }}>
                {tr.radar}
              </h2>
            </div>
            <span className="retro pixel-text-xs px-2 py-1" style={{ background: "var(--surface-2)", border: "2px solid var(--border)", color: "var(--text)" }}>
              {tr.active}
            </span>
          </div>

          <div
            data-stagger
            className="grid grid-cols-2 gap-x-4 gap-y-3 pb-5 sm:grid-cols-4"
            style={{ borderBottom: "2px solid var(--border)" }}
          >
            {tr.stats.map((stat, index) => (
              <div
                key={stat.label}
                className="min-w-0"
                style={{
                  opacity: isMockVisible ? 1 : 0,
                  transform: isMockVisible ? "translateY(0)" : "translateY(8px)",
                  transition: `opacity 240ms var(--ease-out) ${index * 60}ms, transform 240ms var(--ease-out) ${index * 60}ms`,
                }}
              >
                <div className="mb-2 h-2 w-9" style={{ background: statColors[index] }} />
                <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text)" }}>
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] font-bold leading-4" style={{ ...bodyFont, color: "var(--text-2)" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-2)" }}>
              {tr.zoneLeads}
            </p>
            <ol className="mt-3">
              {tr.workflow.map((item, index) => {
                const Icon = workflowIcons[index] ?? CheckSquare;
                const isLast = index === tr.workflow.length - 1;

                return (
                  <li
                    key={item.title}
                    className="grid grid-cols-[2rem_1fr] items-start gap-3 py-3"
                    style={{
                      borderBottom: isLast ? "none" : "2px solid var(--surface-2)",
                      opacity: isMockVisible ? 1 : 0,
                      transform: isMockVisible ? "translateY(0)" : "translateY(10px)",
                      transition: `opacity 280ms var(--ease-out) ${index * 80}ms, transform 280ms var(--ease-out) ${index * 80}ms`,
                    }}
                  >
                    <span
                      className="flex size-8 shrink-0 items-center justify-center"
                      style={{
                        background: statColors[index],
                        border: "2px solid var(--border)",
                        color: "var(--pixel-highlight)",
                      }}
                    >
                      <Icon size={15} strokeWidth={2.5} />
                    </span>
                    <div>
                      <p className="text-sm font-extrabold" style={{ ...bodyFont, color: "var(--text)" }}>
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-5" style={{ ...bodyFont, color: "var(--text-2)" }}>
                        {item.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
