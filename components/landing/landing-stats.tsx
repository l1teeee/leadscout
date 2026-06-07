"use client";

import { CheckCircle2, ClipboardList, Eye, ShieldCheck } from "lucide-react";
import type { ElementType } from "react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };
const icons: ElementType[] = [ShieldCheck, Eye, ClipboardList, CheckCircle2];

export function LandingStats() {
  const { lang } = useLanguage();
  const tr = translations[lang].landing.proof;
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState<boolean[]>(Array(tr.items.length).fill(false));

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          tr.items.forEach((_, i) => {
            setTimeout(() => {
              setVisible((prev) => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, i * 90);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [tr.items]);

  return (
    <section
      ref={sectionRef}
      className="w-full px-4 py-14 sm:px-6 lg:px-8"
      style={{ background: "var(--sidebar)", color: "var(--pixel-highlight)" }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="retro pixel-text-sm uppercase" style={{ color: "#A1A1AA" }}>
            {tr.eyebrow}
          </p>
          <h2 className="retro mt-4 text-2xl font-black uppercase leading-tight sm:text-4xl">
            {tr.title}
          </h2>
          <p className="mt-4 text-sm font-semibold leading-6" style={{ ...bodyFont, color: "#D4D4D8" }}>
            {tr.description}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tr.items.map((item, i) => {
            const Icon = icons[i] ?? CheckCircle2;
            const isActive = visible[i];

            return (
              <article
                key={item.title}
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
                    "opacity 280ms var(--ease-out), transform 280ms var(--ease-out), box-shadow 220ms var(--ease-out)",
                }}
              >
                <span
                  className="mb-4 flex size-10 items-center justify-center"
                  style={{
                    background: "var(--pixel-highlight)",
                    border: "2px solid #000",
                    color: "var(--sidebar)",
                  }}
                >
                  <Icon size={18} strokeWidth={2.5} />
                </span>
                <p className="retro pixel-text-sm uppercase" style={{ color: "var(--pixel-highlight)" }}>
                  {item.title}
                </p>
                <p
                  className="mt-3 text-sm font-semibold leading-6"
                  style={{ ...bodyFont, color: "#D4D4D8" }}
                >
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
