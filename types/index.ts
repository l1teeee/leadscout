import type { ElementType } from "react";

export type View =
  | "dashboard"
  | "explorer"
  | "oportunidades"
  | "leads"
  | "campanas"
  | "reportes"
  | "integraciones"
  | "configuracion";

export type ExplorerTab = "ubicacion" | "resultados";

export type PendingView = Exclude<View, "dashboard" | "explorer" | "oportunidades">;

// Sidebar
export interface SidebarItem {
  id: View;
  label: string;
  icon: ElementType;
}

export interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  active: View;
  onChange: (v: View) => void;
}

export interface SidebarNavItemProps {
  item: SidebarItem;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
}

export interface SidebarMenuSectionProps {
  section: SidebarSection;
  active: View;
  isExpanded: boolean;
  onChange: (v: View) => void;
}

// Topbar
export interface TopbarProps {
  view: View;
}

// Dashboard
export interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

// ModulePlaceholder
export interface ModulePlaceholderProps {
  view: PendingView;
}
