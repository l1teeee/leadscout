"use client";

import NotFound1 from "@/components/ui/8bit-not-found1";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

export default function AppNotFound() {
  const { lang } = useLanguage();
  const tr = translations[lang].notFound;

  return (
    <div
      className="flex flex-1 items-center justify-center"
      style={{ background: "var(--bg)" }}
    >
      <NotFound1
        title={tr.publicTitle}
        description={tr.appDescription}
        cta={tr.dashboardCta}
        href="/dashboard"
      />
    </div>
  );
}
