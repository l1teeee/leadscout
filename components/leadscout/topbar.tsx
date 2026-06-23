"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, Menu } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";
import { useMobileNav } from "@/contexts/mobile-nav-context";
import { TopbarSearch } from "./topbar-search";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

function UserMenuLoading() {
  const { lang } = useLanguage();

  return (
    <button
      className="ml-1 flex h-8 items-center gap-2 rounded-none border-2 border-[var(--border)] bg-[var(--pixel-highlight)] px-2 shadow-[2px_2px_0_0_var(--pixel-shadow)]"
      aria-label={translations[lang].topbar.userMenu}
    >
      <span className="text-xs font-extrabold tracking-normal text-[var(--text)]" style={bodyFont}>
        LS
      </span>
    </button>
  );
}

const UserMenu = dynamic(
  () => import("./user-menu").then((mod) => mod.UserMenu),
  {
    loading: () => <UserMenuLoading />,
  }
);

export function Topbar({ initialEmail }: { initialEmail?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const tr = translations[lang];
  const title = (tr.topbar.titles as Record<string, string>)[pathname] ?? "ScoutIA";
  const { setIsMobileNavOpen } = useMobileNav();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header
        className="h-[58px] shrink-0 flex items-center justify-between px-3 md:px-8"
        style={{ background: "var(--surface)", borderBottom: "2px solid var(--border)" }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-none border-2 border-[var(--border)] bg-[var(--surface-2)] shadow-[2px_2px_0_0_var(--pixel-shadow)] md:hidden"
            style={{ color: "var(--text)" }}
            aria-label="Abrir menu"
          >
            <Menu size={16} />
          </button>
          <h1 className="truncate text-sm font-semibold tracking-normal" style={{ ...bodyFont, color: "var(--text)" }}>
            {title}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => {
              setLang(lang === "en" ? "es" : "en");
              router.refresh();
            }}
            className="w-8 h-8 flex cursor-pointer items-center justify-center rounded-none transition-transform active:translate-x-0.5 active:translate-y-0.5"
            style={{ ...bodyFont, color: "var(--text)", background: "var(--surface-2)", border: "2px solid var(--border)", boxShadow: "2px 2px 0 0 var(--pixel-shadow)", fontSize: "10px", fontWeight: 700 }}
            title={tr.langToggle.nextTitle}
            aria-label={tr.langToggle.label}
          >
            {tr.langToggle.short}
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-8 h-8 flex cursor-pointer items-center justify-center rounded-none transition-transform active:translate-x-0.5 active:translate-y-0.5"
            style={{ color: "var(--text)", background: "var(--surface-2)", border: "2px solid var(--border)", boxShadow: "2px 2px 0 0 var(--pixel-shadow)" }}
            aria-label={tr.topbar.search}
          >
            <Search size={15} />
          </button>
          <button
            className="w-8 h-8 flex cursor-pointer items-center justify-center rounded-none transition-transform active:translate-x-0.5 active:translate-y-0.5"
            style={{ color: "var(--text)", background: "var(--surface-2)", border: "2px solid var(--border)", boxShadow: "2px 2px 0 0 var(--pixel-shadow)" }}
            aria-label={tr.topbar.notifications}
          >
            <Bell size={15} />
          </button>

          <UserMenu initialEmail={initialEmail} />
        </div>
      </header>
      <TopbarSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
