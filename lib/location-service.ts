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

export const ARGENTINA_PLACES: PlaceSuggestion[] = [
  // CABA — barrios
  {
    id: "palermo",
    label: "Palermo, CABA",
    municipality: "Palermo",
    department: "Ciudad de Buenos Aires",
    center: [-58.4228, -34.5886],
  },
  {
    id: "recoleta",
    label: "Recoleta, CABA",
    municipality: "Recoleta",
    department: "Ciudad de Buenos Aires",
    center: [-58.3940, -34.5874],
  },
  {
    id: "san-telmo",
    label: "San Telmo, CABA",
    municipality: "San Telmo",
    department: "Ciudad de Buenos Aires",
    center: [-58.3731, -34.6212],
  },
  {
    id: "villa-crespo",
    label: "Villa Crespo, CABA",
    municipality: "Villa Crespo",
    department: "Ciudad de Buenos Aires",
    center: [-58.4392, -34.5978],
  },
  {
    id: "belgrano",
    label: "Belgrano, CABA",
    municipality: "Belgrano",
    department: "Ciudad de Buenos Aires",
    center: [-58.4555, -34.5566],
  },
  {
    id: "almagro",
    label: "Almagro, CABA",
    municipality: "Almagro",
    department: "Ciudad de Buenos Aires",
    center: [-58.4165, -34.6098],
  },
  {
    id: "caballito",
    label: "Caballito, CABA",
    municipality: "Caballito",
    department: "Ciudad de Buenos Aires",
    center: [-58.4412, -34.6188],
  },
  {
    id: "flores",
    label: "Flores, CABA",
    municipality: "Flores",
    department: "Ciudad de Buenos Aires",
    center: [-58.4620, -34.6353],
  },
  {
    id: "boedo",
    label: "Boedo, CABA",
    municipality: "Boedo",
    department: "Ciudad de Buenos Aires",
    center: [-58.4180, -34.6276],
  },
  {
    id: "nunez",
    label: "Núñez, CABA",
    municipality: "Núñez",
    department: "Ciudad de Buenos Aires",
    center: [-58.4614, -34.5431],
  },
  {
    id: "villa-urquiza",
    label: "Villa Urquiza, CABA",
    municipality: "Villa Urquiza",
    department: "Ciudad de Buenos Aires",
    center: [-58.4891, -34.5721],
  },
  {
    id: "chacarita",
    label: "Chacarita, CABA",
    municipality: "Chacarita",
    department: "Ciudad de Buenos Aires",
    center: [-58.4530, -34.5841],
  },
  {
    id: "montserrat",
    label: "Montserrat, CABA",
    municipality: "Montserrat",
    department: "Ciudad de Buenos Aires",
    center: [-58.3800, -34.6158],
  },
  {
    id: "balvanera",
    label: "Balvanera, CABA",
    municipality: "Balvanera",
    department: "Ciudad de Buenos Aires",
    center: [-58.4080, -34.6107],
  },
  {
    id: "villa-del-parque",
    label: "Villa del Parque, CABA",
    municipality: "Villa del Parque",
    department: "Ciudad de Buenos Aires",
    center: [-58.4972, -34.6031],
  },
  // GBA y ciudades del interior
  {
    id: "la-plata",
    label: "La Plata, Buenos Aires",
    municipality: "La Plata",
    department: "Buenos Aires",
    center: [-57.9536, -34.9205],
  },
  {
    id: "mar-del-plata",
    label: "Mar del Plata, Buenos Aires",
    municipality: "Mar del Plata",
    department: "Buenos Aires",
    center: [-57.5575, -38.0023],
  },
  {
    id: "rosario",
    label: "Rosario, Santa Fe",
    municipality: "Rosario",
    department: "Santa Fe",
    center: [-60.6505, -32.9442],
  },
  {
    id: "cordoba",
    label: "Córdoba, Córdoba",
    municipality: "Córdoba",
    department: "Córdoba",
    center: [-64.1888, -31.4201],
  },
  {
    id: "mendoza",
    label: "Mendoza, Mendoza",
    municipality: "Mendoza",
    department: "Mendoza",
    center: [-68.8272, -32.8908],
  },
  {
    id: "tucuman",
    label: "San Miguel de Tucumán, Tucumán",
    municipality: "San Miguel de Tucumán",
    department: "Tucumán",
    center: [-65.2176, -26.8083],
  },
  {
    id: "salta",
    label: "Salta, Salta",
    municipality: "Salta",
    department: "Salta",
    center: [-65.4117, -24.7829],
  },
  {
    id: "santa-fe",
    label: "Santa Fe, Santa Fe",
    municipality: "Santa Fe",
    department: "Santa Fe",
    center: [-60.7000, -31.6333],
  },
  {
    id: "bahia-blanca",
    label: "Bahía Blanca, Buenos Aires",
    municipality: "Bahía Blanca",
    department: "Buenos Aires",
    center: [-62.2663, -38.7183],
  },
  {
    id: "neuquen",
    label: "Neuquén, Neuquén",
    municipality: "Neuquén",
    department: "Neuquén",
    center: [-68.0591, -38.9516],
  },
];

// Mantener alias para compatibilidad con cualquier import existente
export const EL_SALVADOR_PLACES = ARGENTINA_PLACES;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
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
  if (!normalizedQuery) return ARGENTINA_PLACES.slice(0, limit);

  return ARGENTINA_PLACES.filter((place) => {
    const haystack = normalize(
      `${place.label} ${place.municipality} ${place.department}`
    );
    return haystack.includes(normalizedQuery);
  }).slice(0, limit);
}

export function findNearestPlace(center: [number, number]) {
  return ARGENTINA_PLACES.reduce((nearest, place) => {
    const nearestDistance = distanceKm(center, nearest.center);
    const placeDistance = distanceKm(center, place.center);
    return placeDistance < nearestDistance ? place : nearest;
  }, ARGENTINA_PLACES[0]);
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
      { headers: { "Accept-Language": "es", "User-Agent": "LeadScout-AI/1.0" } }
    );
    if (!res.ok) return null;
    const data = await res.json() as Array<{ lat: string; lon: string; display_name: string }>;
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
