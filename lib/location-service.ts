export interface PlaceSuggestion {
  id: string;
  label: string;
  municipality: string;
  department: string;
  center: [number, number];
}

export interface BusinessCategory {
  id: string;
  label: string;
  match: string[];
}

export interface BrowserLocationResult {
  center: [number, number];
  accuracy?: number;
  label: string;
  nearestPlace?: PlaceSuggestion;
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  { id: "all", label: "Todas", match: [] },
  { id: "food", label: "Gastronomía", match: ["Gastronomía"] },
  { id: "retail", label: "Retail", match: ["Retail", "Ferretería", "Moda", "Jardín"] },
  { id: "services", label: "Servicios", match: ["Servicios", "Automotriz"] },
  { id: "health", label: "Salud y estética", match: ["Salud", "Estética"] },
  { id: "sports", label: "Deportes", match: ["Deportes"] },
];

export const EL_SALVADOR_PLACES: PlaceSuggestion[] = [
  {
    id: "san-salvador",
    label: "San Salvador, El Salvador",
    municipality: "San Salvador",
    department: "San Salvador",
    center: [-89.2182, 13.6929],
  },
  {
    id: "santa-tecla",
    label: "Santa Tecla, La Libertad",
    municipality: "Santa Tecla",
    department: "La Libertad",
    center: [-89.2894, 13.6769],
  },
  {
    id: "antiguo-cuscatlan",
    label: "Antiguo Cuscatlán, La Libertad",
    municipality: "Antiguo Cuscatlán",
    department: "La Libertad",
    center: [-89.2476, 13.7016],
  },
  {
    id: "soyapango",
    label: "Soyapango, San Salvador",
    municipality: "Soyapango",
    department: "San Salvador",
    center: [-89.1513, 13.7101],
  },
  {
    id: "mejicanos",
    label: "Mejicanos, San Salvador",
    municipality: "Mejicanos",
    department: "San Salvador",
    center: [-89.2137, 13.7403],
  },
  {
    id: "san-miguel",
    label: "San Miguel, El Salvador",
    municipality: "San Miguel",
    department: "San Miguel",
    center: [-88.1779, 13.4833],
  },
  {
    id: "santa-ana",
    label: "Santa Ana, El Salvador",
    municipality: "Santa Ana",
    department: "Santa Ana",
    center: [-89.5597, 13.9942],
  },
  {
    id: "sonsonate",
    label: "Sonsonate, El Salvador",
    municipality: "Sonsonate",
    department: "Sonsonate",
    center: [-89.7242, 13.7189],
  },
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function distanceKm(from: [number, number], to: [number, number]) {
  const [lng1, lat1] = from;
  const [lng2, lat2] = to;
  const earthRadiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getBusinessCategory(categoryId: string) {
  return BUSINESS_CATEGORIES.find((category) => category.id === categoryId);
}

export function categoryMatchesLead(categoryId: string, leadCategory: string) {
  const category = getBusinessCategory(categoryId);
  if (!category || category.id === "all") return true;
  return category.match.includes(leadCategory);
}

export function suggestPlaces(query: string, limit = 5) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return EL_SALVADOR_PLACES.slice(0, limit);

  return EL_SALVADOR_PLACES.filter((place) => {
    const haystack = normalize(
      `${place.label} ${place.municipality} ${place.department}`
    );
    return haystack.includes(normalizedQuery);
  }).slice(0, limit);
}

export function findNearestPlace(center: [number, number]) {
  return EL_SALVADOR_PLACES.reduce((nearest, place) => {
    const nearestDistance = distanceKm(center, nearest.center);
    const placeDistance = distanceKm(center, place.center);
    return placeDistance < nearestDistance ? place : nearest;
  }, EL_SALVADOR_PLACES[0]);
}

export function getBrowserLocation(): Promise<BrowserLocationResult> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("La geolocalización no está disponible en este navegador."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const center: [number, number] = [
          position.coords.longitude,
          position.coords.latitude,
        ];
        const nearestPlace = findNearestPlace(center);

        resolve({
          center,
          accuracy: position.coords.accuracy,
          label: `Mi ubicación actual (${nearestPlace.municipality})`,
          nearestPlace,
        });
      },
      (error) => {
        reject(new Error(error.message || "No se pudo obtener la ubicación."));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: 10_000,
      }
    );
  });
}
