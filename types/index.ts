import type { ElementType } from "react";

export type View =
  | "dashboard"
  | "explorer"
  | "opportunities"
  | "leads"
  | "campaigns"
  | "reports"
  | "integrations"
  | "settings";

export type ExplorerTab = "ubicacion" | "resultados";

export type PendingView = Exclude<View, "dashboard" | "explorer" | "opportunities">;

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

export interface SidebarNavItemProps {
  item: SidebarItem;
  isActive: boolean;
  isExpanded: boolean;
  href: string;
}

export interface SidebarMenuSectionProps {
  section: SidebarSection;
  pathname: string;
  isExpanded: boolean;
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
