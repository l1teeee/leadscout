"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3, Building2, Cable, LayoutDashboard, Search, Send, Target, Settings, Zap,
} from "lucide-react";
import type { SidebarNavItemProps, SidebarMenuSectionProps, SidebarSection } from "@/types";

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    label: "Principal",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "explorer", label: "Explorer", icon: Search },
      { id: "oportunidades", label: "Oportunidades", icon: Target },
    ],
  },
  {
    label: "Operación",
    items: [
      { id: "leads", label: "Leads", icon: Building2 },
      { id: "campanas", label: "Campañas", icon: Send },
      { id: "reportes", label: "Reportes", icon: BarChart3 },
    ],
  },
  {
    label: "Sistema",
    items: [{ id: "integraciones", label: "Integraciones", icon: Cable }],
  },
];

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

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
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "shrink-0 flex flex-col h-full overflow-hidden transition-[width] duration-200 ease-out",
        isExpanded ? "w-[232px]" : "w-[58px]"
      )}
      style={{ background: "var(--sidebar)", borderRight: "2px solid var(--border)" }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        className={cn("h-[58px] flex items-center shrink-0", isExpanded ? "px-4 gap-2.5" : "justify-center px-0")}
        style={{ borderBottom: "2px solid #000" }}
      >
        <div
          className="w-8 h-8 rounded-none flex items-center justify-center shrink-0"
          style={{ background: "var(--pixel-highlight)", border: "2px solid #000", boxShadow: "2px 2px 0 0 #000" }}
        >
          <Zap size={15} color="#17110D" strokeWidth={2.5} />
        </div>
        {isExpanded && (
          <span
            className="truncate text-sm font-extrabold tracking-normal text-[#FFFFFF]"
            style={bodyFont}
          >
            LeadScout
          </span>
        )}
      </div>

      <nav className={cn("flex-1 px-2 py-2 flex flex-col overflow-y-auto", isExpanded ? "gap-5" : "gap-3")}>
        {SIDEBAR_SECTIONS.map((section) => (
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
          onClick={() => router.push("/configuracion")}
          data-tour="sidebar-configuracion"
          title="Configuración"
          aria-label="Configuración"
          className={cn(
            "w-full flex items-center py-2 rounded-none text-[13px] font-semibold leading-5 tracking-normal transition-colors duration-150 text-left cursor-pointer",
            isExpanded ? "gap-2.5 px-2.5" : "justify-center px-0"
          )}
          style={
            pathname === "/configuracion"
              ? { ...bodyFont, background: "var(--pixel-highlight)", border: "2px solid #1C1917", boxShadow: "2px 2px 0 0 #000", color: "#17110D" }
              : { ...bodyFont, color: "#D4D4D8", border: "2px solid transparent" }
          }
          onMouseEnter={(e) => {
            if (pathname === "/configuracion") return;
            (e.currentTarget as HTMLElement).style.background = "#2A1B12";
            (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            if (pathname === "/configuracion") return;
            (e.currentTarget as HTMLElement).style.background = "";
            (e.currentTarget as HTMLElement).style.color = "#D4D4D8";
          }}
        >
          <Settings size={15} strokeWidth={pathname === "/configuracion" ? 2.5 : 2} />
          {isExpanded && <span className="truncate">Configuración</span>}
        </button>
      </div>
    </aside>
  );
}
