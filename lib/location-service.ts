export interface PlaceSuggestion {
  id: string;
  label: string;
  municipality: string;
  department: string;
  center: [number, number]; // [longitude, latitude]
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

export function getBusinessCategory(categoryId: string) {
  return BUSINESS_CATEGORIES.find((c) => c.id === categoryId);
}

export function categoryMatchesLead(categoryId: string, leadCategory: string) {
  if (categoryId === 'all') return true;
  if (!leadCategory || leadCategory === 'all') return true;
  const category = getBusinessCategory(categoryId);
  if (!category) return false;
  if (category.match.includes(leadCategory)) return true;
  return leadCategory === categoryId;
}

interface NominatimItem {
  place_id: string;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

function nominatimToSuggestion(item: NominatimItem): PlaceSuggestion {
  const addr = item.address ?? {};
  const municipality =
    addr.city || addr.town || addr.village || item.display_name.split(",")[0].trim();
  const department = addr.state || addr.county || addr.country || "";
  const parts = item.display_name.split(",").slice(0, 3).map((s) => s.trim());
  return {
    id: String(item.place_id),
    label: parts.join(", "),
    municipality,
    department,
    center: [parseFloat(item.lon), parseFloat(item.lat)],
  };
}

/**
 * Search Nominatim for place suggestions matching a free-text query.
 * Returns an empty array if the query is too short or the request fails.
 */
export async function suggestPlaces(query: string, limit = 5): Promise<PlaceSuggestion[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=${limit}&addressdetails=1`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "es", "User-Agent": "ScoutIA/1.0" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as NominatimItem[];
    return data.map(nominatimToSuggestion);
  } catch {
    return [];
  }
}

/**
 * Reverse-geocode a [lng, lat] center to a PlaceSuggestion using Nominatim.
 */
export async function findNearestPlace(
  center: [number, number]
): Promise<PlaceSuggestion | null> {
  const [lng, lat] = center;
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "es", "User-Agent": "ScoutIA/1.0" },
    });
    if (!res.ok) return null;
    const item = (await res.json()) as NominatimItem;
    const suggestion = nominatimToSuggestion(item);
    suggestion.center = center;
    return suggestion;
  } catch {
    return null;
  }
}

/**
 * Geocodifica una ciudad+país usando Nominatim (OpenStreetMap).
 * Retorna [longitude, latitude] o null si no se encuentra.
 */
export async function geocodeCity(
  city: string,
  country: string
): Promise<{ center: [number, number]; label: string } | null> {
  try {
    const q = encodeURIComponent(`${city}, ${country}`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&addressdetails=0`,
      { headers: { "Accept-Language": "es", "User-Agent": "ScoutIA/1.0" } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;
    if (!data.length) return null;
    const { lat, lon, display_name } = data[0];
    return {
      center: [parseFloat(lon), parseFloat(lat)],
      label: display_name.split(",").slice(0, 2).join(",").trim(),
    };
  } catch {
    return null;
  }
}

export function getBrowserLocation(): Promise<BrowserLocationResult> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("La geolocalización no está disponible en este navegador."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const center: [number, number] = [
          position.coords.longitude,
          position.coords.latitude,
        ];
        const nearestPlace = await findNearestPlace(center);

        resolve({
          center,
          accuracy: position.coords.accuracy,
          label: nearestPlace
            ? `Mi ubicación actual (${nearestPlace.municipality})`
            : `${center[1].toFixed(4)}, ${center[0].toFixed(4)}`,
          nearestPlace: nearestPlace ?? undefined,
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
