import type { MapPoint, SearchArea, UndiscoveredPoint } from "@/components/ui/mapcn-layer-markers";
import type { LeadStatus } from "@/lib/data";

export const SCRAPING_COORDS: Record<string, [number, number]> = {};
export const SCRAPING_ZONES: Record<string, string> = {};
export const SCRAPING_POINTS: MapPoint[] = [];
export const UNDISCOVERED_POINTS: UndiscoveredPoint[] = [];

// Fallback center: world center — replaced immediately by profile location on mount
export const DEFAULT_SEARCH_AREA: SearchArea = {
  center: [0, 0],
  radiusKm: 2,
  label: "",
};

export const DEFAULT_PLACE = null;
export const MIN_SEARCH_RADIUS_KM = 0.5;
export const MAX_SEARCH_RADIUS_KM = 3;

export const STATUS_FILTERS: { value: LeadStatus | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "calificado", label: "Calificado" },
  { value: "perdido", label: "Perdido" },
];
