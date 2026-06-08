"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

export function LandingNavbar() {
  const { lang, setLang } = useLanguage();
  const tr = translations[lang];

  return (
    <header
      className="fixed left-0 top-0 z-50 h-14 w-full"
      style={{ background: "#17110D", borderBottom: "2px solid #000" }}
    >
      <nav className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand — identical to auth header */}
        <Link href="/landing" className="flex items-center gap-3" aria-label={tr.landing.nav.aria}>
          <div
            className="lnd-logo-icon flex h-7 w-7 shrink-0 items-center justify-center"
            style={{
              background: "#FFFFFF",
              border: "2px solid #000",
            }}
          >
            <Zap size={13} color="#17110D" strokeWidth={2.5} />
          </div>
          <span className="retro pixel-text-sm leading-none" style={{ color: "#FFFFFF" }}>
            ScoutIA
          </span>
        </Link>

        {/* Nav buttons */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            className="lnd-link-ghost inline-flex h-9 items-center justify-center px-2 text-xs font-bold active:translate-x-0.5 active:translate-y-0.5"
            style={{ ...bodyFont, color: "#D4D4D8" }}
            title={tr.langToggle.nextTitle}
            aria-label={tr.langToggle.label}
          >
            {tr.langToggle.short}
          </button>
          <Link
            href="/login"
            className="lnd-link-ghost hidden sm:inline-flex h-9 items-center justify-center px-3 text-xs font-bold active:translate-x-0.5 active:translate-y-0.5"
            style={{
              ...bodyFont,
              color: "#D4D4D8",
            }}
          >
            {tr.landing.nav.login}
          </Link>
          <Link
            href="/register"
            className="lnd-btn-nav retro pixel-text-sm inline-flex h-9 items-center justify-center px-3 font-bold sm:px-4"
          >
            {tr.landing.nav.start}
          </Link>
        </div>
      </nav>
    </header>
  );
}
