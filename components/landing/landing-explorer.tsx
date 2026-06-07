"use client";

import { LocateFixed, Play } from "lucide-react";
import { LandingMapSearch } from "@/components/landing/landing-map-search";
import { useIntersection } from "@/hooks/use-intersection";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

export function LandingExplorer() {
  const { lang } = useLanguage();
  const tr = translations[lang].landing.explorer;
  const { ref: textRef, isVisible: isTextVisible } = useIntersection<HTMLDivElement>();
  const { ref: mockRef, isVisible: isMockVisible } = useIntersection<HTMLDivElement>();

  return (
    <section
      id="demo"
      className="w-full px-4 py-14 sm:px-6 lg:px-8 lg:py-16"
      style={{ background: "var(--bg)" }}
    >
      <div className="mx-auto grid max-w-[1380px] items-center gap-6 xl:grid-cols-[0.3fr_0.7fr]">
        <div ref={textRef} className={`reveal-right ${isTextVisible ? "is-visible" : ""}`}>
          <p className="retro pixel-text-sm uppercase" style={{ color: "var(--text-2)" }}>
            {tr.eyebrow}
          </p>
          <h2
            className="retro mt-4 text-2xl font-black uppercase leading-tight sm:text-3xl"
            style={{ color: "var(--text)" }}
          >
            {tr.title}
          </h2>
          <p
            className="mt-5 max-w-md text-sm font-semibold leading-7"
            style={{ ...bodyFont, color: "var(--text-2)" }}
          >
            {tr.description}
          </p>
          <ul data-stagger className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {tr.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex gap-3 text-xs font-bold leading-6 sm:text-sm"
                style={{ ...bodyFont, color: "var(--text)" }}
              >
                <span
                  className="mt-2 size-2 shrink-0"
                  style={{ background: "var(--c-qualified)", border: "1px solid var(--border)" }}
                />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div ref={mockRef} className={`reveal-left ${isMockVisible ? "is-visible" : ""}`}>
          <LandingMapSearch
            eyebrow={tr.map.eyebrow}
            title={tr.map.title}
            status={tr.map.status}
            query={tr.map.query}
            filterLabel={tr.map.filterLabel}
            filters={tr.map.filters}
            mapLabel={tr.map.mapLabel}
            resultsLabel={tr.map.resultsLabel}
            results={tr.map.results}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <button
                type="button"
                className="lnd-btn-primary retro pixel-text-sm inline-flex h-10 items-center justify-center gap-2 px-4 font-bold active:translate-x-0.5 active:translate-y-0.5"
              >
                <Play size={15} />
                {tr.run}
              </button>
              <button
                type="button"
                className="lnd-btn-secondary retro pixel-text-sm inline-flex h-10 items-center justify-center gap-2 px-4 font-bold active:translate-x-0.5 active:translate-y-0.5"
              >
                <LocateFixed size={15} />
                {tr.myLocation}
              </button>
            </div>
          </LandingMapSearch>
        </div>
      </div>
    </section>
  );
}
