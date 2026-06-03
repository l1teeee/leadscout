"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  BarChart3,
  Building2,
  Cable,
  LayoutDashboard,
  Search,
  Send,
  Target,
  Settings,
  Zap,
} from "lucide-react";
import type {
  SidebarProps,
  SidebarSection,
  SidebarNavItemProps,
  SidebarMenuSectionProps,
} from "@/types";

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

function SidebarNavItem({ item, isActive, isExpanded, onClick }: SidebarNavItemProps) {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      title={item.label}
      aria-label={item.label}
      className={cn(
        "w-full flex items-center rounded-none pixel-text-xs transition-colors duration-150 text-left",
        isExpanded ? "gap-2 px-2 py-2" : "justify-center px-0 py-2",
        isActive ? "text-[#17110D]" : "text-[#D4D4D8] hover:text-[#FFFFFF]"
      )}
      style={
        isActive
          ? {
              background: "var(--pixel-highlight)",
              border: "2px solid #1C1917",
              boxShadow: "2px 2px 0 0 #000",
            }
          : { border: "2px solid transparent" }
      }
      onMouseEnter={
        isActive
          ? undefined
          : (e) => {
              (e.currentTarget as HTMLElement).style.background = "#2A1B12";
            }
      }
      onMouseLeave={
        isActive
          ? undefined
          : (e) => {
              (e.currentTarget as HTMLElement).style.background = "";
            }
      }
    >
      <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
      {isExpanded && <span className="truncate">{item.label}</span>}
    </button>
  );
}

function SidebarMenuSection({
  section,
  active,
  isExpanded,
  onChange,
}: SidebarMenuSectionProps) {
  return (
    <div>
      {isExpanded && (
        <p className="px-2 mb-2 mt-1 uppercase pixel-text-xs" style={{ color: "#A1A1AA" }}>
          {section.label}
        </p>
      )}
      <div className="flex flex-col gap-0.5">
        {section.items.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            isActive={active === item.id}
            isExpanded={isExpanded}
            onClick={() => onChange(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function Sidebar({ active, onChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      className={cn(
        "shrink-0 flex flex-col h-full overflow-hidden transition-[width] duration-200 ease-out",
        isExpanded ? "w-[232px]" : "w-[58px]"
      )}
      style={{
        background: "var(--sidebar)",
        borderRight: "2px solid var(--border)",
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        className={cn(
          "h-[58px] flex items-center shrink-0",
          isExpanded ? "px-4 gap-2.5" : "justify-center px-0"
        )}
        style={{ borderBottom: "2px solid #000" }}
      >
        <div
          className="w-8 h-8 rounded-none flex items-center justify-center shrink-0"
          style={{
            background: "var(--pixel-highlight)",
            border: "2px solid #000",
            boxShadow: "2px 2px 0 0 #000",
          }}
        >
          <Zap size={15} color="#17110D" strokeWidth={2.5} />
        </div>
        {isExpanded && (
          <span className="pixel-text-sm text-[#FFFFFF] truncate">LeadScout</span>
        )}
      </div>

      <nav
        className={cn(
          "flex-1 px-2 py-2 flex flex-col overflow-y-auto",
          isExpanded ? "gap-5" : "gap-3"
        )}
      >
        {SIDEBAR_SECTIONS.map((section) => (
          <SidebarMenuSection
            key={section.label}
            section={section}
            active={active}
            isExpanded={isExpanded}
            onChange={onChange}
          />
        ))}
      </nav>

      <div className="px-2 pb-3 pt-3" style={{ borderTop: "2px solid #000" }}>
        <button
          onClick={() => onChange("configuracion")}
          title="Configuración"
          aria-label="Configuración"
          className={cn(
            "w-full flex items-center py-2 rounded-none pixel-text-xs transition-colors duration-150 text-left",
            isExpanded ? "gap-2 px-2" : "justify-center px-0"
          )}
          style={
            active === "configuracion"
              ? {
                  background: "var(--pixel-highlight)",
                  border: "2px solid #1C1917",
                  boxShadow: "2px 2px 0 0 #000",
                  color: "#17110D",
                }
              : { color: "#D4D4D8", border: "2px solid transparent" }
          }
          onMouseEnter={(e) => {
            if (active === "configuracion") return;
            (e.currentTarget as HTMLElement).style.background = "#2A1B12";
            (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            if (active === "configuracion") return;
            (e.currentTarget as HTMLElement).style.background = "";
            (e.currentTarget as HTMLElement).style.color = "#D4D4D8";
          }}
        >
          <Settings size={15} strokeWidth={active === "configuracion" ? 2.5 : 2} />
          {isExpanded && <span className="truncate">Configuración</span>}
        </button>
      </div>
    </aside>
  );
}
