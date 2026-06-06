"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

function formatStat(original: string, count: number): string {
  if (original.includes("+")) return `${count.toLocaleString("es-AR")}+`;
  if (original.includes("%")) return `${count}%`;
  if (original.includes("x")) return `${count}x`;
  if (original.includes("min")) return `< ${count}min`;
  return original;
}

export function LandingStats() {
  const { lang } = useLanguage();
  const stats = translations[lang].landing.stats;
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState<boolean[]>(Array(stats.length).fill(false));
  const [counts, setCounts] = useState<number[]>(stats.map(() => 0));

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          stats.forEach((stat, i) => {
            setTimeout(() => {
              setVisible((prev) => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
              const target = parseFloat(stat.number.replace(/[^0-9.]/g, ""));
              if (!target) return;
              const duration = 800;
              const start = performance.now();
              const tick = (now: number) => {
                const progress = Math.min((now - start) / duration, 1);
                setCounts((prev) => {
                  const next = [...prev];
                  next[i] = Math.floor(target * progress);
                  return next;
                });
                if (progress < 1) {
                  requestAnimationFrame(tick);
                } else {
                  setCounts((prev) => {
                    const next = [...prev];
                    next[i] = target;
                    return next;
                  });
                }
              };
              requestAnimationFrame(tick);
            }, i * 150);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full px-4 py-14 sm:px-6 lg:px-8"
      style={{ background: "var(--sidebar)", color: "var(--pixel-highlight)" }}
    >
      <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const isActive = visible[i];
          return (
            <div
              key={stat.label}
              className="lnd-stat-card p-5"
              style={{
                background: "var(--sidebar-item)",
                border: "2px solid var(--pixel-highlight)",
                boxShadow: isActive
                  ? "4px 4px 0 0 var(--pixel-highlight)"
                  : "2px 2px 0 0 var(--pixel-highlight)",
                opacity: isActive ? 1 : 0,
                transform: isActive ? "translateY(0)" : "translateY(20px)",
                transition:
                  "opacity 400ms var(--ease-out), transform 400ms var(--ease-out), box-shadow 350ms linear",
              }}
            >
              <div
                className="mb-4 h-1"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: isActive ? "100%" : "0%",
                    background: "var(--pixel-highlight)",
                    transition: "width 700ms linear",
                  }}
                />
              </div>
              <p
                className="retro text-2xl font-black sm:text-3xl"
                style={{ color: "var(--pixel-highlight)" }}
              >
                {formatStat(stat.number, counts[i])}
              </p>
              <p
                className="mt-3 text-sm font-semibold leading-6"
                style={{ ...bodyFont, color: "var(--pixel-highlight)" }}
              >
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
