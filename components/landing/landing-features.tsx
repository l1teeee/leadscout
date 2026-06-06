"use client";

import { BarChart2, Mail, MapPin, TrendingUp, Users, Zap } from "lucide-react";
import type { ElementType } from "react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

const featureIcons: ElementType[] = [MapPin, Users, TrendingUp, Mail, BarChart2, Zap];

export function LandingFeatures() {
  const { lang } = useLanguage();
  const tr = translations[lang].landing.features;
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
            }, i * 180);
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
      className="w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      style={{ background: "var(--surface)" }}
    >
      <div className="mx-auto max-w-7xl">
        <p className="retro pixel-text-sm uppercase" style={{ color: "var(--text-2)" }}>
          {tr.eyebrow}
        </p>
        <h2 className="retro mt-4 max-w-3xl text-2xl font-black uppercase leading-tight sm:text-4xl" style={{ color: "var(--text)" }}>
          {tr.title}
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tr.items.map((feature, i) => {
            const Icon = featureIcons[i];
            const isActive = visible[i];

            return (
              <article
                key={feature.name}
                className="lnd-feature-card pixel-card-sm p-5"
                style={{
                  background: "var(--surface)",
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? "translateY(0)" : "translateY(20px)",
                  transition: "opacity 400ms var(--ease-out), transform 400ms var(--ease-out)",
                }}
              >
                <div
                  className="lnd-feature-icon mb-5 flex size-11 items-center justify-center"
                  style={{
                    background: isActive ? "var(--text)" : "var(--surface-2)",
                    border: "2px solid var(--border)",
                    color: isActive ? "var(--pixel-highlight)" : "var(--text-3)",
                    transition: "background-color 350ms linear, color 350ms linear",
                  }}
                >
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <h3 className="text-base font-extrabold" style={{ ...bodyFont, color: "var(--text)" }}>
                  {feature.name}
                </h3>
                <p className="mt-3 text-sm font-medium leading-6" style={{ ...bodyFont, color: "var(--text-2)" }}>
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
