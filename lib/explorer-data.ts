import { LEADS } from "@/lib/data";
import { ARGENTINA_PLACES } from "@/lib/location-service";
import type { LeadStatus } from "@/lib/data";
import type { MapPoint, SearchArea, UndiscoveredPoint } from "@/components/ui/mapcn-layer-markers";

// Coordenadas de barrios de CABA [longitude, latitude]
export const SCRAPING_COORDS: Record<string, [number, number]> = {
  "1":  [-58.4228, -34.5886], // Palermo
  "2":  [-58.3940, -34.5874], // Recoleta
  "3":  [-58.3731, -34.6212], // San Telmo
  "4":  [-58.4392, -34.5978], // Villa Crespo
  "5":  [-58.4555, -34.5566], // Belgrano
  "6":  [-58.4165, -34.6098], // Almagro
  "7":  [-58.4412, -34.6188], // Caballito
  "8":  [-58.4620, -34.6353], // Flores
  "9":  [-58.4180, -34.6276], // Boedo
  "10": [-58.4614, -34.5431], // Núñez
};

export const SCRAPING_ZONES: Record<string, string> = {
  "1":  "Palermo, CABA",
  "2":  "Recoleta, CABA",
  "3":  "San Telmo, CABA",
  "4":  "Villa Crespo, CABA",
  "5":  "Belgrano, CABA",
  "6":  "Almagro, CABA",
  "7":  "Caballito, CABA",
  "8":  "Flores, CABA",
  "9":  "Boedo, CABA",
  "10": "Núñez, CABA",
};

export const SCRAPING_POINTS: MapPoint[] = LEADS.map((lead) => {
  const [longitude, latitude] = SCRAPING_COORDS[lead.id] ?? [-58.4228, -34.5886];
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
  { id: "la-boca-poi",      label: "Zona por escanear: La Boca",      center: [-58.3625, -34.6345] },
  { id: "villa-urquiza-poi", label: "Zona por escanear: Villa Urquiza", center: [-58.4891, -34.5721] },
  { id: "mataderos-poi",    label: "Zona por escanear: Mataderos",    center: [-58.5135, -34.6558] },
  { id: "villa-lugano-poi", label: "Zona por escanear: Villa Lugano",  center: [-58.4748, -34.6713] },
];

export const DEFAULT_SEARCH_AREA: SearchArea = {
  center: [-58.4228, -34.5886], // Palermo, CABA
  radiusKm: 2,
  label: "Palermo, CABA",
};

export const DEFAULT_PLACE = ARGENTINA_PLACES[0];
export const MIN_SEARCH_RADIUS_KM = 0.5;
export const MAX_SEARCH_RADIUS_KM = 10;

export const STATUS_FILTERS: { value: LeadStatus | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "calificado", label: "Calificado" },
  { value: "perdido", label: "Perdido" },
];
