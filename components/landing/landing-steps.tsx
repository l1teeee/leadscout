"use client";

import { Search, Zap, Target, Send, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

interface StepItem {
  number: string;
  Icon: LucideIcon;
  accent: string;
}

const STEPS: StepItem[] = [
  {
    number: "01",
    Icon: Search,
    accent: "var(--c-new)",
  },
  {
    number: "02",
    Icon: Zap,
    accent: "var(--c-hi)",
  },
  {
    number: "03",
    Icon: Target,
    accent: "var(--c-qualified)",
  },
  {
    number: "04",
    Icon: Send,
    accent: "var(--text)",
  },
];

export function LandingSteps() {
  const { lang } = useLanguage();
  const tr = translations[lang].landing.steps;
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState<boolean[]>(Array(STEPS.length).fill(false));

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          STEPS.forEach((_, i) => {
            setTimeout(() => {
              setVisible((prev) => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, i * 220);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const visibleCount = visible.filter(Boolean).length;

  return (
    <section
      ref={sectionRef}
      className="w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
      style={{ background: "var(--surface-2)" }}
    >
      <div className="mx-auto max-w-7xl">
        {/* ── Header ── */}
        <div className="mb-12 lg:mb-16">
          <p className="retro pixel-text-sm mb-3 uppercase" style={{ color: "var(--text-2)" }}>
            {tr.eyebrow}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2
              className="retro text-2xl font-black uppercase leading-tight sm:text-4xl"
              style={{ color: "var(--text)" }}
            >
              {tr.title}
            </h2>
            <p
              className="text-sm font-semibold sm:text-right"
              style={{ ...bodyFont, color: "var(--text-3)" }}
            >
              {tr.subtitleLine1}<br className="hidden sm:block" /> {tr.subtitleLine2}
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════
            DESKTOP  (lg+) — horizontal timeline
            ══════════════════════════════════════ */}
        <div className="hidden lg:block">
          {/* Number row + connecting line */}
          <div className="relative mb-8">
            {/* Track line (behind numbers) */}
            <div
              aria-hidden="true"
              className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2"
              style={{ background: "var(--border)", opacity: 0.15 }}
            />
            {/* Animated fill line */}
            <div
              aria-hidden="true"
              className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 origin-left"
              style={{
                width: visibleCount > 1
                  ? `${((visibleCount - 1) / (STEPS.length - 1)) * 100}%`
                  : "0%",
                background: "var(--border)",
                opacity: 0.45,
                transition: "width 500ms linear",
              }}
            />

            {/* Number badges */}
            <div className="relative grid grid-cols-4">
              {STEPS.map((step, i) => (
                <div key={step.number} className="flex justify-center">
                  <div
                    className="retro flex size-14 items-center justify-center font-bold"
                    style={{
                      background: visible[i] ? step.accent : "var(--surface)",
                      border: "2px solid var(--border)",
                      boxShadow: visible[i]
                        ? "4px 4px 0 0 var(--pixel-shadow)"
                        : "2px 2px 0 0 var(--pixel-shadow)",
                      color: visible[i] ? "var(--pixel-highlight)" : "var(--text-3)",
                      fontSize: "11px",
                      transition: "background-color 350ms linear, color 350ms linear, box-shadow 350ms linear",
                    }}
                  >
                    {step.number}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step cards grid */}
          <div className="grid grid-cols-4 gap-4">
            {STEPS.map((step, i) => {
              const isVisible = visible[i];
              return (
                <div
                  key={step.number}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(20px)",
                    transition: `opacity 400ms var(--ease-out) ${i * 80}ms, transform 400ms var(--ease-out) ${i * 80}ms`,
                  }}
                >
                  <div
                    className="flex h-full flex-col p-5"
                    style={{
                      background: "var(--surface)",
                      border: "2px solid var(--border)",
                      boxShadow: "3px 3px 0 0 var(--pixel-shadow)",
                    }}
                  >
                    {/* Icon + title row */}
                    <div className="mb-4 flex items-center gap-3">
                      <span
                        className="flex size-9 shrink-0 items-center justify-center"
                        style={{
                          background: step.accent,
                          border: "2px solid var(--border)",
                          color: "var(--pixel-highlight)",
                        }}
                      >
                        <step.Icon size={16} strokeWidth={2.5} />
                      </span>
                      <h3
                        className="retro font-bold uppercase leading-tight"
                        style={{ color: "var(--text)", fontSize: "10px" }}
                      >
                        {tr.items[i].title}
                      </h3>
                    </div>

                    {/* Progress bar */}
                    <div
                      className="mb-4 h-1"
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: isVisible ? "100%" : "0%",
                          background: step.accent,
                          transition: `width 700ms linear ${i * 80}ms`,
                        }}
                      />
                    </div>

                    {/* Description */}
                    <p
                      className="mt-auto text-xs font-medium leading-relaxed"
                      style={{ ...bodyFont, color: "var(--text-2)" }}
                    >
                      {tr.items[i].description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════
            MOBILE  (< lg) — vertical stack
            ══════════════════════════════════════ */}
        <div className="flex flex-col lg:hidden">
          {/* Progress dots */}
          <div className="mb-8 flex items-center gap-0">
            {STEPS.map((step, i) => (
              <div key={step.number} className="flex items-center">
                <div
                  className="size-2"
                  style={{
                    background: visible[i] ? step.accent : "var(--border)",
                    opacity: visible[i] ? 1 : 0.25,
                    transition: "background-color 300ms linear, opacity 300ms linear",
                  }}
                />
                {i < STEPS.length - 1 && (
                  <div
                    className="h-0.5 w-10 sm:w-16"
                    style={{
                      background: visible[i + 1] ? step.accent : "var(--border)",
                      opacity: visible[i + 1] ? 0.6 : 0.15,
                      transition: "background-color 300ms linear, opacity 300ms linear",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {STEPS.map((step, i) => {
            const isVisible = visible[i];
            const isLast = i === STEPS.length - 1;

            return (
              <div key={step.number}>
                <div className="flex items-start gap-4">
                  {/* Number badge */}
                  <div className="relative z-10 shrink-0">
                    <div
                      className="retro flex size-11 items-center justify-center font-bold"
                      style={{
                        background: isVisible ? step.accent : "var(--surface)",
                        border: "2px solid var(--border)",
                        boxShadow: "2px 2px 0 0 var(--pixel-shadow)",
                        color: isVisible ? "var(--pixel-highlight)" : "var(--text-3)",
                        fontSize: "9px",
                        transition: "background-color 350ms linear, color 350ms linear",
                      }}
                    >
                      {step.number}
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className="flex-1 min-w-0"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? "translateX(0)" : "translateX(-14px)",
                      transition: "opacity 400ms var(--ease-out), transform 400ms var(--ease-out)",
                    }}
                  >
                    <div
                      className="p-4"
                      style={{
                        background: "var(--surface)",
                        border: "2px solid var(--border)",
                        boxShadow: "2px 2px 0 0 var(--pixel-shadow)",
                      }}
                    >
                      <div className="mb-2 flex items-center gap-3">
                        <span
                          className="flex size-7 shrink-0 items-center justify-center"
                          style={{
                            background: step.accent,
                            border: "2px solid var(--border)",
                            color: "var(--pixel-highlight)",
                          }}
                        >
                          <step.Icon size={13} strokeWidth={2.5} />
                        </span>
                        <h3
                          className="retro font-bold uppercase leading-none"
                          style={{ color: "var(--text)", fontSize: "10px" }}
                        >
                          {tr.items[i].title}
                        </h3>
                      </div>

                      {/* Progress bar */}
                      <div
                        className="mb-3 h-0.5"
                        style={{
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: isVisible ? "100%" : "0%",
                            background: step.accent,
                            transition: "width 600ms linear",
                          }}
                        />
                      </div>

                      <p
                        className="text-xs font-medium leading-relaxed"
                        style={{ ...bodyFont, color: "var(--text-2)" }}
                      >
                        {tr.items[i].description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vertical connector */}
                {!isLast && (
                  <div className="flex gap-4">
                    <div className="w-11 shrink-0 flex justify-center">
                      <div
                        className="w-0.5"
                        style={{
                          height: "1.25rem",
                          background: visible[i + 1] ? step.accent : "var(--border)",
                          opacity: visible[i + 1] ? 0.55 : 0.18,
                          transition: "background-color 350ms linear, opacity 350ms linear",
                        }}
                      />
                    </div>
                    <div className="flex-1" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
