"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Building2,
  Cable,
  ChevronRight,
  LayoutDashboard,
  Search,
  Send,
  Settings,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

type TopbarSearchProps = {
  isOpen: boolean;
  onClose: () => void;
};

type NavItemKey = keyof typeof translations.en.nav.items;
type SectionKey = keyof typeof translations.en.topbar.searchOverlay.sections;

type SearchNavItem = {
  href: string;
  navKey: NavItemKey;
  icon: LucideIcon;
};

type SearchNavSection = {
  key: SectionKey;
  items: SearchNavItem[];
};

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };
const normalizeSearch = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const sections: SearchNavSection[] = [
  {
    key: "main",
    items: [
      { href: "/dashboard", navKey: "dashboard", icon: LayoutDashboard },
      { href: "/explorer", navKey: "explorer", icon: Search },
      { href: "/opportunities", navKey: "opportunities", icon: Target },
    ],
  },
  {
    key: "operations",
    items: [
      { href: "/leads", navKey: "leads", icon: Building2 },
      { href: "/campaigns", navKey: "campaigns", icon: Send },
      { href: "/reports", navKey: "reports", icon: BarChart3 },
    ],
  },
  {
    key: "system",
    items: [
      { href: "/ai-context", navKey: "aiContext", icon: Sparkles },
      { href: "/integrations", navKey: "integrations", icon: Cable },
      { href: "/settings", navKey: "settings", icon: Settings },
    ],
  },
];

export function TopbarSearch({ isOpen, onClose }: TopbarSearchProps) {
  const router = useRouter();
  const { lang } = useLanguage();
  const tr = translations[lang];
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeSearch(query.trim());
  const visibleSections = sections
    .map((section) => {
      const sectionLabel = tr.topbar.searchOverlay.sections[section.key];
      const items = section.items.filter((item) => {
        const label = tr.nav.items[item.navKey];
        const haystack = normalizeSearch(`${label} ${item.href} ${item.navKey} ${sectionLabel}`);
        return !normalizedQuery || haystack.includes(normalizedQuery);
      });

      return { ...section, items };
    })
    .filter((section) => section.items.length > 0);
  const hasResults = visibleSections.length > 0;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) return;

    const timeout = window.setTimeout(() => setQuery(""), 0);
    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNavigate = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="pixel-card-sm w-full max-w-lg animate-fade-up bg-white"
        style={bodyFont}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b-2 border-[var(--border)] bg-white p-4">
          <div className="flex items-center gap-2 border-2 border-[var(--border)] bg-[var(--surface)] px-3 py-2">
            <Search size={15} className="shrink-0 text-[var(--text-3)]" />
            <input
              autoFocus
              className="w-full rounded-none bg-transparent text-sm font-semibold text-[var(--text)] outline-none"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={tr.topbar.searchOverlay.placeholder}
            />
          </div>
        </div>

        <div className="max-h-[50dvh] overflow-y-auto">
          {normalizedQuery && !hasResults ? (
            <div className="px-4 py-8 text-center text-sm font-semibold text-[var(--text-3)]">
              {tr.topbar.searchOverlay.noResults} &quot;{query.trim()}&quot;
            </div>
          ) : (
            visibleSections.map((section) => (
              <div key={section.key}>
                <div className="bg-[var(--surface-2)] px-4 py-2 text-xs font-extrabold uppercase text-[var(--text-3)]">
                  {tr.topbar.searchOverlay.sections[section.key]}
                </div>
                <div>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.href}
                        type="button"
                        className="flex w-full items-center gap-3 border-t-2 border-[var(--border)] px-4 py-3 text-left text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)]"
                        onClick={() => handleNavigate(item.href)}
                      >
                        <Icon size={16} className="shrink-0" />
                        <span className="min-w-0 flex-1 truncate">
                          {tr.nav.items[item.navKey]}
                        </span>
                        <ChevronRight size={15} className="shrink-0 text-[var(--text-3)]" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
