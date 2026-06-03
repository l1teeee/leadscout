import { LEADS } from "@/lib/data";
import { EL_SALVADOR_PLACES } from "@/lib/location-service";
import type { LeadStatus } from "@/lib/data";
import type { MapPoint, SearchArea, UndiscoveredPoint } from "@/components/ui/mapcn-layer-markers";

export const SCRAPING_COORDS: Record<string, [number, number]> = {
  "1": [-89.2093, 13.6989],
  "2": [-89.2894, 13.6769],
  "3": [-89.1792, 13.6924],
  "4": [-89.2476, 13.7016],
  "5": [-89.1872, 13.7216],
  "6": [-89.2354, 13.6661],
  "7": [-89.3008, 13.6732],
  "8": [-89.1507, 13.7386],
  "9": [-89.2261, 13.6893],
  "10": [-89.2047, 13.7068],
};

export const SCRAPING_ZONES: Record<string, string> = {
  "1": "Centro Historico, San Salvador",
  "2": "Santa Tecla, La Libertad",
  "3": "Soyapango, San Salvador",
  "4": "Antiguo Cuscatlan, La Libertad",
  "5": "Mejicanos, San Salvador",
  "6": "San Marcos, San Salvador",
  "7": "Nuevo Cuscatlan, La Libertad",
  "8": "Ilopango, San Salvador",
  "9": "Colonia Escalon, San Salvador",
  "10": "San Salvador, San Salvador",
};

export const SCRAPING_POINTS: MapPoint[] = LEADS.map((lead) => {
  const [longitude, latitude] = SCRAPING_COORDS[lead.id] ?? [-89.2182, 13.6929];
  return {
    id: lead.id,
    name: lead.name,
    category: lead.category,
    score: lead.score,
    longitude,
    latitude,
  };
});

export const UNDISCOVERED_POINTS: UndiscoveredPoint[] = [
  { id: "apopa-poi", label: "Punto de interes: Apopa", center: [-89.1786, 13.8072] },
  { id: "san-marcos-poi", label: "Punto de interes: San Marcos", center: [-89.1835, 13.6583] },
  { id: "lourdes-poi", label: "Punto de interes: Lourdes", center: [-89.3607, 13.7214] },
  { id: "ilopango-poi", label: "Punto de interes: Ilopango", center: [-89.1177, 13.7014] },
];

export const DEFAULT_SEARCH_AREA: SearchArea = {
  center: [-89.2182, 13.6929],
  radiusKm: 2,
  label: "San Salvador, El Salvador",
};

export const DEFAULT_PLACE = EL_SALVADOR_PLACES[0];
export const MIN_SEARCH_RADIUS_KM = 0.5;
export const MAX_SEARCH_RADIUS_KM = 2;

export const STATUS_FILTERS: { value: LeadStatus | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "calificado", label: "Calificado" },
  { value: "perdido", label: "Perdido" },
];
