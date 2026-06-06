"use client";

import { Building2, LocateFixed, MapPin, Play, Search, SlidersHorizontal } from "lucide-react";
import { useIntersection } from "@/hooks/use-intersection";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

const results = [
  { name: "Panadería La Rural", zone: "Palermo", score: 87, color: "var(--c-qualified)" },
  { name: "Ferretería Central", zone: "Villa Crespo", score: 72, color: "var(--c-new)" },
  { name: "Bar El Español", zone: "San Telmo", score: 64, color: "var(--c-new)" },
];

export function LandingExplorer() {
  const { lang } = useLanguage();
  const tr = translations[lang].landing.explorer;
  const { ref: textRef, isVisible: isTextVisible } = useIntersection<HTMLDivElement>();
  const { ref: mockRef, isVisible: isMockVisible } = useIntersection<HTMLDivElement>();

  return (
    <section className="w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-20" style={{ background: "var(--bg)" }}>
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
        <div ref={textRef} className={`reveal-right ${isTextVisible ? "is-visible" : ""}`}>
          <p className="retro pixel-text-sm uppercase" style={{ color: "var(--text-2)" }}>
            {tr.eyebrow}
          </p>
          <h2 className="retro mt-4 text-2xl font-black uppercase leading-tight sm:text-4xl" style={{ color: "var(--text)" }}>
            {tr.title}
          </h2>
          <p className="mt-5 text-base font-medium leading-7" style={{ ...bodyFont, color: "var(--text-2)" }}>
            {tr.description}
          </p>
          <ul data-stagger className="mt-7 space-y-3">
            {tr.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 text-sm font-semibold leading-6" style={{ ...bodyFont, color: "var(--text)" }}>
                <span className="mt-2 size-2 shrink-0" style={{ background: "var(--c-qualified)", border: "1px solid var(--border)" }} />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div ref={mockRef} className={`pixel-card reveal-left p-4 sm:p-5 ${isMockVisible ? "is-visible" : ""}`}>
          <div className="flex items-center justify-between gap-3 pb-4" style={{ borderBottom: "2px solid var(--border)" }}>
            <div className="flex items-center gap-3">
              <span
                className="flex size-10 items-center justify-center"
                style={{ background: "var(--text)", border: "2px solid var(--border)", color: "var(--pixel-highlight)" }}
              >
                <MapPin size={18} strokeWidth={2.5} />
              </span>
              <div>
                <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                  EXPLORER
                </p>
                <p className="text-sm font-extrabold" style={{ ...bodyFont, color: "var(--text)" }}>
                  {tr.localSearch}
                </p>
              </div>
            </div>
            <span className="retro pixel-text-xs px-2 py-1" style={{ background: "var(--surface-2)", border: "2px solid var(--border)", color: "var(--text)" }}>
              {tr.live}
            </span>
          </div>

          <div className="mt-5 flex items-center gap-3 p-3" style={{ background: "var(--surface-2)", border: "2px solid var(--border)" }}>
            <Search size={16} style={{ color: "var(--text-2)" }} />
            <span className="text-sm font-bold" style={{ ...bodyFont, color: "var(--text)" }}>
              Palermo, CABA
            </span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="p-3" style={{ background: "var(--surface)", border: "2px solid var(--border)" }}>
              <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                {tr.category}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-2" style={{ background: "var(--bg)", border: "2px solid var(--border)", color: "var(--text)" }}>
                <Building2 size={15} />
                <span className="text-xs font-extrabold" style={bodyFont}>
                  {tr.restaurants}
                </span>
              </div>
            </div>

            <div className="p-3" style={{ background: "var(--surface)", border: "2px solid var(--border)" }}>
              <div className="flex items-center justify-between gap-3">
                <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                  {tr.radius}
                </p>
                <span className="text-xs font-extrabold" style={{ ...bodyFont, color: "var(--text)" }}>
                  2.5km
                </span>
              </div>
              <div className="mt-4 h-3" style={{ background: "var(--surface-2)", border: "2px solid var(--border)" }}>
                <div className="h-full w-3/5" style={{ background: "var(--c-new)" }} />
              </div>
              <div className="mt-2 flex items-center gap-2" style={{ color: "var(--text-3)" }}>
                <SlidersHorizontal size={14} />
                <span className="text-xs font-bold" style={bodyFont}>
                  {tr.adjustable}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="lnd-btn-primary retro pixel-text-sm inline-flex h-11 items-center justify-center gap-2 px-4 font-bold active:translate-x-0.5 active:translate-y-0.5"
            >
              <Play size={15} />
              {tr.run}
            </button>
            <button
              type="button"
              className="lnd-btn-secondary retro pixel-text-sm inline-flex h-11 items-center justify-center gap-2 px-4 font-bold active:translate-x-0.5 active:translate-y-0.5"
            >
              <LocateFixed size={15} />
              {tr.myLocation}
            </button>
          </div>

          <div className="mt-5 p-4" style={{ background: "var(--bg)", border: "2px solid var(--border)" }}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-2)" }}>
                {tr.results}
              </p>
              <p className="text-xs font-extrabold" style={{ ...bodyFont, color: "var(--text)" }}>
                {tr.businessCount}
              </p>
            </div>
            <div className="space-y-3">
              {results.map((result, i) => (
                <div
                  key={result.name}
                  className="lnd-row p-3"
                  style={{
                    background: "var(--surface)",
                    border: "2px solid var(--border)",
                    opacity: isMockVisible ? 1 : 0,
                    transform: isMockVisible ? "translateX(0)" : "translateX(-12px)",
                    transition: `opacity 400ms var(--ease-out) ${i * 150}ms, transform 400ms var(--ease-out) ${i * 150}ms`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-extrabold" style={{ ...bodyFont, color: "var(--text)" }}>
                        {result.name}
                      </p>
                      <p className="mt-1 text-xs font-semibold" style={{ ...bodyFont, color: "var(--text-3)" }}>
                        {result.zone}
                      </p>
                    </div>
                    <span className="retro pixel-text-xs px-2 py-1" style={{ background: "var(--surface-2)", border: "2px solid var(--border)", color: "var(--text)" }}>
                      {result.score}
                    </span>
                  </div>
                  <div className="mt-3 h-2" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                    <div
                      className="h-full"
                      style={{
                        width: isMockVisible ? `${result.score}%` : "0%",
                        background: result.color,
                        transition: `width 700ms linear ${i * 150 + 200}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
