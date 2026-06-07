"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useIntersection } from "@/hooks/use-intersection";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

export function LandingCta() {
  const { lang } = useLanguage();
  const tr = translations[lang].landing.cta;
  const { ref, isVisible } = useIntersection<HTMLElement>();

  return (
    <section
      ref={ref}
      className={`reveal-up w-full px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20 ${isVisible ? "is-visible" : ""}`}
      style={{ background: "var(--bg)" }}
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="retro text-2xl font-black uppercase leading-tight sm:text-4xl" style={{ color: "var(--text)" }}>
          {tr.title}
        </h2>
        <p className="mt-5 text-base font-medium sm:text-lg" style={{ ...bodyFont, color: "var(--text-2)" }}>
          {tr.description}
        </p>
        <Link
          href="/register"
          className="lnd-cta-btn lnd-cta-btn-pulse retro pixel-text-sm mt-8 inline-flex h-12 items-center justify-center gap-2 px-6 font-bold active:translate-x-0.5 active:translate-y-0.5"
        >
          {tr.action}
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
