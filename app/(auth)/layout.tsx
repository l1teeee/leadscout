"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { lang, setLang } = useLanguage();
  const tr = translations[lang];

  return (
    <div className="flex h-full w-full flex-col">
      {/* Brand header */}
      <header
        className="shrink-0 w-full flex items-center justify-center gap-3 px-6 py-3 relative"
        style={{ background: "#17110D", borderBottom: "2px solid #000" }}
      >
        <Link href="/landing" className="flex items-center gap-3" aria-label={tr.nav.landingLabel}>
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center"
            style={{
              background: "#FFFFFF",
              border: "2px solid #000",
              boxShadow: "2px 2px 0 0 #000",
            }}
          >
            <Zap size={13} color="#17110D" strokeWidth={2.5} />
          </div>
          <span
            className="retro pixel-text-sm leading-none"
            style={{ color: "#FFFFFF" }}
          >
            ScoutIA
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setLang(lang === "en" ? "es" : "en")}
          className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border-2 border-[#000] bg-[#FFFFFF] text-[10px] font-bold text-[#17110D] shadow-[2px_2px_0_0_#000] active:translate-x-px active:translate-y-[calc(-50%+1px)]"
          title={tr.langToggle.nextTitle}
          aria-label={tr.langToggle.label}
        >
          {tr.langToggle.short}
        </button>
      </header>

      {/* Page content */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="min-w-0 w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
