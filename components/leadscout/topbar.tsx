import { Bell, Search } from "lucide-react";
import type { TopbarProps, View } from "@/types";

const VIEW_TITLES: Record<View, string> = {
  dashboard: "Dashboard",
  explorer: "Explorer",
  oportunidades: "Oportunidades",
  leads: "Leads",
  campanas: "Campañas",
  reportes: "Reportes",
  integraciones: "Integraciones",
  configuracion: "Configuración",
};

export function Topbar({ view }: TopbarProps) {
  return (
    <header
      className="h-14.5 shrink-0 flex items-center justify-between px-8"
      style={{
        background: "var(--surface)",
        borderBottom: "2px solid var(--border)",
      }}
    >
      <div>
        <h1 className="pixel-text-sm" style={{ color: "var(--text)" }}>
          {VIEW_TITLES[view]}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-none transition-transform active:translate-x-0.5 active:translate-y-0.5"
          style={{
            color: "var(--text)",
            background: "var(--surface-2)",
            border: "2px solid var(--border)",
            boxShadow: "2px 2px 0 0 var(--pixel-shadow)",
          }}
        >
          <Search size={15} />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-none transition-transform active:translate-x-0.5 active:translate-y-0.5"
          style={{
            color: "var(--text)",
            background: "var(--surface-2)",
            border: "2px solid var(--border)",
            boxShadow: "2px 2px 0 0 var(--pixel-shadow)",
          }}
        >
          <Bell size={15} />
        </button>
        <div
          className="w-8 h-8 rounded-none flex items-center justify-center pixel-text-xs ml-1"
          style={{
            background: "var(--pixel-highlight)",
            border: "2px solid var(--border)",
            boxShadow: "2px 2px 0 0 var(--pixel-shadow)",
            color: "var(--text)",
          }}
        >
          A
        </div>
      </div>
    </header>
  );
}
