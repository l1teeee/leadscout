"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { useIntersection } from "@/hooks/use-intersection";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

const statColors = ["var(--c-new)", "var(--c-qualified)", "var(--c-hi)", "var(--text)"];

const bars = [
  { height: "34%", color: "var(--c-new)" },
  { height: "58%", color: "var(--c-qualified)" },
  { height: "42%", color: "var(--c-new)" },
  { height: "76%", color: "var(--c-hi)" },
  { height: "51%", color: "var(--c-qualified)" },
  { height: "88%", color: "var(--c-hi)" },
  { height: "63%", color: "var(--c-new)" },
];

export function LandingHero() {
  const { lang } = useLanguage();
  const tr = translations[lang].landing.hero;
  const { ref: mockRef, isVisible: isMockVisible } = useIntersection<HTMLDivElement>();
  const [heroReady, setHeroReady] = useState(false);
  useLayoutEffect(() => { setHeroReady(true); }, []);

  return (
    <section
      className="flex min-h-screen w-full items-center pt-14"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-20">
        <div className={heroReady ? "is-visible" : ""}>
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
              href="/login"
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

          <div data-stagger className="grid grid-cols-2 gap-3">
            {tr.stats.map((stat, index) => (
              <div
                key={stat.label}
                className="lnd-kpi-card p-3"
                style={{
                  background: "var(--surface-2)",
                  border: "2px solid var(--border)",
                }}
              >
                <div className="mb-2 h-2 w-8" style={{ background: statColors[index] }} />
                <p className="retro pixel-text-sm" style={{ color: "var(--text)" }}>
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-semibold" style={{ ...bodyFont, color: "var(--text-2)" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 p-4" style={{ background: "var(--bg)", border: "2px solid var(--border)" }}>
            <div className="mb-3 flex items-center justify-between">
              <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-2)" }}>
                {tr.zoneLeads}
              </p>
              <p className="text-xs font-bold" style={{ ...bodyFont, color: "var(--text-3)" }}>
                {tr.last7Days}
              </p>
            </div>
            <div className="flex h-36 items-end gap-3 sm:h-48" style={{ borderBottom: "2px solid var(--border)" }}>
              {bars.map((bar, index) => (
                <div
                  key={`${bar.height}-${index}`}
                  className="lnd-bar flex-1"
                  style={{
                    height: isMockVisible ? bar.height : "0%",
                    background: bar.color,
                    border: "2px solid var(--border)",
                    boxShadow: "2px 2px 0 0 var(--pixel-shadow)",
                    transition: `height 600ms linear ${index * 80}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
