"use client";

import { LandingNavbar } from "@/components/landing/landing-navbar";
import NotFound1 from "@/components/ui/8bit-not-found1";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

export default function NotFound() {
  const { lang } = useLanguage();
  const tr = translations[lang].notFound;

  return (
    <main
      className="flex min-h-screen w-full flex-col"
      style={{ background: "var(--bg)" }}
    >
      <LandingNavbar />
      <div className="flex flex-1 items-center justify-center pt-14">
        <NotFound1
          title={tr.publicTitle}
          description={tr.publicDescription}
          cta={tr.cta}
          href="/"
        />
      </div>
    </main>
  );
}
