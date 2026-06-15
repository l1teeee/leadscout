"use client";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3, Building2, Cable, History, LayoutDashboard, LogOut, Search, Send, Sparkles, Target, Settings, Zap, X,
} from "lucide-react";
import { logout } from "@/lib/api/auth";
import { clearToken, getToken } from "@/lib/auth";
import type { SidebarNavItemProps, SidebarMenuSectionProps, SidebarSection } from "@/types";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";
import { useMobileNav } from "@/contexts/mobile-nav-context";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

function useSidebarSections(): SidebarSection[] {
  const { lang } = useLanguage();
  const tr = translations[lang];
  return [
    {
      label: tr.nav.sections.main,
      items: [
        { id: "dashboard", label: tr.nav.items.dashboard, icon: LayoutDashboard },
        { id: "explorer", label: tr.nav.items.explorer, icon: Search },
        { id: "opportunities", label: tr.nav.items.opportunities, icon: Target },
      ],
    },
    {
      label: tr.nav.sections.operations,
      items: [
        { id: "leads", label: tr.nav.items.leads, icon: Building2 },
        { id: "campaigns", label: tr.nav.items.campaigns, icon: Send },
        { id: "reports", label: tr.nav.items.reports, icon: BarChart3 },
      ],
    },
    {
      label: tr.nav.sections.system,
      items: [
        { id: "ai-context", label: tr.nav.items.aiContext, icon: Sparkles },
        { id: "audit", label: tr.nav.items.audit, icon: History },
        { id: "integrations", label: tr.nav.items.integrations, icon: Cable },
      ],
    },
  ];
}

function SidebarNavItem({ item, isActive, isExpanded, href }: SidebarNavItemProps) {
  const router = useRouter();
  const Icon = item.icon;

  return (
    <button
      onClick={() => router.push(href)}
      title={item.label}
      aria-label={item.label}
      data-tour={`sidebar-${item.id}`}
      className={cn(
        "w-full flex items-center rounded-none text-[13px] font-semibold leading-5 tracking-normal transition-colors duration-150 text-left cursor-pointer",
        isExpanded ? "gap-2.5 px-2.5 py-2" : "justify-center px-0 py-2",
        isActive ? "text-[#17110D]" : "text-[#D4D4D8] hover:text-[#FFFFFF]"
      )}
      style={
        isActive
          ? { ...bodyFont, background: "var(--pixel-highlight)", border: "2px solid #1C1917", boxShadow: "2px 2px 0 0 #000" }
          : { ...bodyFont, border: "2px solid transparent" }
      }
      onMouseEnter={isActive ? undefined : (e) => { (e.currentTarget as HTMLElement).style.background = "#2A1B12"; }}
      onMouseLeave={isActive ? undefined : (e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
    >
      <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
      {isExpanded && <span className="truncate">{item.label}</span>}
    </button>
  );
}

function SidebarMenuSection({ section, pathname, isExpanded }: SidebarMenuSectionProps) {
  return (
    <div>
      {isExpanded && (
        <p
          className="mb-2 mt-1 px-2.5 text-[11px] font-bold uppercase leading-4 tracking-[0.08em]"
          style={{ ...bodyFont, color: "#A1A1AA" }}
        >
          {section.label}
        </p>
      )}
      <div className="flex flex-col gap-0.5">
        {section.items.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            isActive={pathname === `/${item.id}`}
            isExpanded={isExpanded}
            href={`/${item.id}`}
          />
        ))}
      </div>
    </div>
  );
}

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const sections = useSidebarSections();
  const { lang } = useLanguage();
  const tr = translations[lang];
  const { isMobileNavOpen, setIsMobileNavOpen } = useMobileNav();

  function handleMouseEnter() {
    expandTimer.current = setTimeout(() => setIsExpanded(true), 500);
  }

  function handleMouseLeave() {
    if (expandTimer.current) {
      clearTimeout(expandTimer.current);
      expandTimer.current = null;
    }
    setIsExpanded(false);
  }

  function handleSidebarLogout() {
    const token = getToken();
    if (token) logout(token).catch(() => {});
    clearToken();
    window.location.href = "/api/auth/force-logout";
  }

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div className={cn("fixed inset-0 z-50 flex md:hidden", isMobileNavOpen ? "pointer-events-auto" : "pointer-events-none")}>
          {/* Backdrop */}
          <div
            className={cn(
              "fixed inset-0 bg-black/50 transition-opacity duration-300",
              isMobileNavOpen ? "opacity-100" : "opacity-0"
            )}
            onClick={() => setIsMobileNavOpen(false)}
          />
          {/* Drawer */}
          <aside
            className={cn(
              "relative z-10 flex h-full w-[232px] flex-col overflow-hidden transition-transform duration-300 ease-in-out",
              isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
            )}
            style={{ background: "var(--sidebar)", borderRight: "2px solid var(--border)" }}
          >
            {/* Close button in header area */}
            <div
              className="h-[58px] flex items-center justify-between px-4 shrink-0"
              style={{ borderBottom: "2px solid #000" }}
            >
              <button
                type="button"
                onClick={() => router.push("/landing")}
                className="flex items-center gap-2.5"
                aria-label={tr.nav.landingLabel}
              >
                <span
                  className="w-8 h-8 rounded-none flex items-center justify-center shrink-0"
                  style={{ background: "var(--pixel-highlight)", border: "2px solid #000", boxShadow: "2px 2px 0 0 #000" }}
                >
                  <Zap size={15} color="#17110D" strokeWidth={2.5} />
                </span>
                <span className="truncate text-sm font-extrabold tracking-normal text-[#FFFFFF]" style={bodyFont}>
                  ScoutIA
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex h-8 w-8 items-center justify-center"
                style={{ color: "#D4D4D8" }}
                aria-label="Cerrar menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav items - same as desktop expanded state */}
            <nav className="flex-1 px-2 py-2 flex flex-col gap-5 overflow-y-auto">
              {sections.map((section) => (
                <SidebarMenuSection
                  key={section.label}
                  section={section}
                  pathname={pathname}
                  isExpanded={true}
                />
              ))}
            </nav>

            {/* Bottom buttons - same as desktop */}
            <div className="px-2 pb-3 pt-3" style={{ borderTop: "2px solid #000" }}>
              <button
                onClick={() => { router.push("/settings"); setIsMobileNavOpen(false); }}
                data-tour="sidebar-settings"
                title={tr.nav.items.settings}
                aria-label={tr.nav.items.settings}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-none text-[13px] font-semibold leading-5 tracking-normal transition-colors duration-150 text-left cursor-pointer"
                style={
                  pathname === "/settings"
                    ? { ...bodyFont, background: "var(--pixel-highlight)", border: "2px solid #1C1917", boxShadow: "2px 2px 0 0 #000", color: "#17110D" }
                    : { ...bodyFont, color: "#D4D4D8", border: "2px solid transparent" }
                }
              >
                <Settings size={15} strokeWidth={pathname === "/settings" ? 2.5 : 2} />
                <span className="truncate">{tr.nav.items.settings}</span>
              </button>
              <button
                onClick={handleSidebarLogout}
                title={tr.topbar.signOut}
                aria-label={tr.topbar.signOut}
                className="mt-0.5 w-full flex items-center gap-2.5 px-2.5 py-2 rounded-none text-[13px] font-semibold leading-5 tracking-normal transition-colors duration-150 text-left cursor-pointer"
                style={{ ...bodyFont, color: "#E63946", border: "2px solid transparent" }}
              >
                <LogOut size={15} strokeWidth={2} />
                <span className="truncate">{tr.topbar.signOut}</span>
              </button>
            </div>
          </aside>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex shrink-0 flex-col h-full overflow-hidden transition-[width] duration-200 ease-out relative z-[45]",
          isExpanded ? "w-[232px]" : "w-[58px]"
        )}
        style={{ background: "var(--sidebar)", borderRight: "2px solid var(--border)" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
      <div
        className={cn("h-[58px] flex items-center shrink-0", isExpanded ? "px-4 gap-2.5" : "justify-center px-0")}
        style={{ borderBottom: "2px solid #000" }}
      >
        <button
          type="button"
          onClick={() => router.push("/landing")}
          className={cn("flex items-center rounded-none text-left", isExpanded ? "gap-2.5" : "justify-center")}
          aria-label={tr.nav.landingLabel}
          title="ScoutIA"
        >
          <span
            className="w-8 h-8 rounded-none flex items-center justify-center shrink-0"
            style={{ background: "var(--pixel-highlight)", border: "2px solid #000", boxShadow: "2px 2px 0 0 #000" }}
          >
            <Zap size={15} color="#17110D" strokeWidth={2.5} />
          </span>
          {isExpanded && (
            <span
              className="truncate text-sm font-extrabold tracking-normal text-[#FFFFFF]"
              style={bodyFont}
            >
              ScoutIA
            </span>
          )}
        </button>
      </div>

      <nav className={cn("flex-1 px-2 py-2 flex flex-col overflow-y-auto", isExpanded ? "gap-5" : "gap-3")}>
        {sections.map((section) => (
          <SidebarMenuSection
            key={section.label}
            section={section}
            pathname={pathname}
            isExpanded={isExpanded}
          />
        ))}
      </nav>

      <div className="px-2 pb-3 pt-3" style={{ borderTop: "2px solid #000" }}>
        <button
          onClick={() => router.push("/settings")}
          data-tour="sidebar-settings"
          title={tr.nav.items.settings}
          aria-label={tr.nav.items.settings}
          className={cn(
            "w-full flex items-center py-2 rounded-none text-[13px] font-semibold leading-5 tracking-normal transition-colors duration-150 text-left cursor-pointer",
            isExpanded ? "gap-2.5 px-2.5" : "justify-center px-0"
          )}
          style={
            pathname === "/settings"
              ? { ...bodyFont, background: "var(--pixel-highlight)", border: "2px solid #1C1917", boxShadow: "2px 2px 0 0 #000", color: "#17110D" }
              : { ...bodyFont, color: "#D4D4D8", border: "2px solid transparent" }
          }
          onMouseEnter={(e) => {
            if (pathname === "/settings") return;
            (e.currentTarget as HTMLElement).style.background = "#2A1B12";
            (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            if (pathname === "/settings") return;
            (e.currentTarget as HTMLElement).style.background = "";
            (e.currentTarget as HTMLElement).style.color = "#D4D4D8";
          }}
        >
          <Settings size={15} strokeWidth={pathname === "/settings" ? 2.5 : 2} />
          {isExpanded && <span className="truncate">{tr.nav.items.settings}</span>}
        </button>
        <button
          onClick={handleSidebarLogout}
          title={tr.topbar.signOut}
          aria-label={tr.topbar.signOut}
          className={cn(
            "mt-0.5 w-full flex items-center py-2 rounded-none text-[13px] font-semibold leading-5 tracking-normal transition-colors duration-150 text-left cursor-pointer",
            isExpanded ? "gap-2.5 px-2.5" : "justify-center px-0"
          )}
          style={{ ...bodyFont, color: "#E63946", border: "2px solid transparent" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#2A1B12";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "";
          }}
        >
          <LogOut size={15} strokeWidth={2} />
          {isExpanded && <span className="truncate">{tr.topbar.signOut}</span>}
        </button>
      </div>
      </aside>
    </>
  );
}
