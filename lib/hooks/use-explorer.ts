"use client";
import { useEffect, useMemo, useState } from "react";
import type { Lead, LeadStatus } from "@/lib/data";
import { getLeads, MAX_LEADS_LIMIT } from "@/lib/api/leads";
import { getMe, updateApproximateLocation } from "@/lib/api/auth";
import { searchExplorer } from "@/lib/api/explorer";
import { AppError } from "@/lib/api/errors";
import {
  BUSINESS_CATEGORIES,
  categoryMatchesLead,
  getBrowserLocation,
  geocodeCity,
  suggestPlaces,
  type PlaceSuggestion,
} from "@/lib/location-service";
import { getToken, setUserSignature } from "@/lib/auth";
import {
  DEFAULT_SEARCH_AREA,
  MAX_SEARCH_RADIUS_KM,
  UNDISCOVERED_POINTS,
} from "@/lib/explorer-data";
import type { MapPoint, SearchArea } from "@/components/ui/mapcn-layer-markers";
import type { ExplorerTab } from "@/types";
import type { ExplorerSearchStage, SearchBounds } from "@/types/explorer";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const PREFS_KEY = "ls_explorer_prefs";
const SEARCH_PROGRESS_STAGES: ExplorerSearchStage[] = [
  "preparing",
  "searching",
  "collecting",
  "filtering",
  "validating",
  "saving",
];
const SEARCH_STAGE_INTERVAL_MS = 4_500;

interface ExplorerPrefs {
  searchRadius?: number;
  selectedCategory?: string;
  locationQuery?: string;
  selectedPlace?: PlaceSuggestion | null;
  customCenter?: [number, number] | null;
}

function loadPrefs(): ExplorerPrefs | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? (JSON.parse(raw) as ExplorerPrefs) : null;
  } catch {
    return null;
  }
}

function savePrefs(prefs: ExplorerPrefs) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getSearchBounds({ center, radiusKm }: SearchArea): SearchBounds {
  const [lng, lat] = center;
  const latRadius = radiusKm / 111.32;
  const lngRadius = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  return {
    center: { lat, lng },
    southwest: { lat: lat - latRadius, lng: lng - lngRadius },
    northeast: { lat: lat + latRadius, lng: lng + lngRadius },
  };
}

export function useExplorer() {
  const { lang } = useLanguage();
  const tr = translations[lang].explorer.errors;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStage, setSearchStage] = useState<ExplorerSearchStage | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // SSR-safe: all location state starts empty to avoid hydration mismatch.
  // Prefs are loaded from localStorage in a useEffect after mount.
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "">("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null);
  const [customCenter, setCustomCenter] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState(MAX_SEARCH_RADIUS_KM);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [isEditingSearchArea, setIsEditingSearchArea] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ExplorerTab>("ubicacion");
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);

  const hasLocation = !!(customCenter || selectedPlace);
  const hasStoredLocation = hasLocation;

  // Fetch all leads for the map
  useEffect(() => {
    getLeads({ limit: MAX_LEADS_LIMIT })
      .then(({ leads }) => setLeads(leads.filter((lead) => lead.status !== "desvinculado")))
      .catch(() => setLeads([]));
  }, []);

  useEffect(() => {
    if (!isSearching) return;

    let stageIndex = 0;
    setSearchStage(SEARCH_PROGRESS_STAGES[stageIndex]);

    const timer = window.setInterval(() => {
      setSearchStage((current) => {
        if (current === "refreshing") return current;
        stageIndex = Math.min(stageIndex + 1, SEARCH_PROGRESS_STAGES.length - 1);
        return SEARCH_PROGRESS_STAGES[stageIndex];
      });
    }, SEARCH_STAGE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isSearching]);

  // Single mount effect: load prefs from localStorage, then optionally load profile location
  useEffect(() => {
    const prefs = loadPrefs();
    let hasLocationFromPrefs = false;

    if (prefs) {
      if (prefs.selectedCategory) setSelectedCategory(prefs.selectedCategory);
      if (prefs.searchRadius != null) setSearchRadius(prefs.searchRadius);
      if (prefs.locationQuery) {
        setLocationQuery(prefs.locationQuery);
        hasLocationFromPrefs = true;
      }
      if (prefs.selectedPlace) {
        setSelectedPlace(prefs.selectedPlace);
        hasLocationFromPrefs = true;
      }
      if (prefs.customCenter) {
        setCustomCenter(prefs.customCenter);
        hasLocationFromPrefs = true;
      }
    }

    // Only load profile location if user has no stored prefs location
    if (!hasLocationFromPrefs) {
      const token = getToken();
      if (!token) return;
      getMe(token)
        .then(async (user) => {
          if (user.user_signature) setUserSignature(user.user_signature);
          if (user.approximate_latitude != null && user.approximate_longitude != null) {
            const center: [number, number] = [user.approximate_longitude, user.approximate_latitude];
            const label = user.approximate_location_label || tr.savedApproxZone;
            setLocationQuery(label);
            setSelectedPlace({
              id: "saved-approx-location",
              label,
              municipality: label,
              department: user.country ?? tr.savedZone,
              center,
            });
            setCustomCenter(center);
            return;
          }
          const city = user.city?.trim();
          const country = user.country?.trim();
          if (!city || !country) return;
          const result = await geocodeCity(city, country);
          if (!result) return;
          setLocationQuery(`${city}, ${country}`);
          setSelectedPlace({
            id: "user-location",
            label: `${city}, ${country}`,
            municipality: city,
            department: country,
            center: result.center,
          });
          setCustomCenter(result.center);
        })
        .catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist preferences whenever they change (skip during initial SSR hydration)
  useEffect(() => {
    savePrefs({ searchRadius, selectedCategory, locationQuery, selectedPlace, customCenter });
  }, [searchRadius, selectedCategory, locationQuery, selectedPlace, customCenter]);

  // Async Nominatim suggestions with 400ms debounce
  useEffect(() => {
    const trimmed = locationQuery.trim();
    if (trimmed.length < 3) {
      setPlaceSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      suggestPlaces(trimmed).then(setPlaceSuggestions).catch(() => setPlaceSuggestions([]));
    }, 400);
    return () => clearTimeout(timer);
  }, [locationQuery]);

  const selectedCategoryInfo =
    BUSINESS_CATEGORIES.find((c) => c.id === selectedCategory) ?? BUSINESS_CATEGORIES[0];

  const scrapingPoints: MapPoint[] = useMemo(
    () =>
      leads
        .filter((l) => l.latitude != null && l.longitude != null)
        .map((l) => ({
          id: l.id,
          name: l.name,
          category: l.category,
          score: l.score,
          longitude: l.longitude!,
          latitude: l.latitude!,
        })),
    [leads]
  );

  const zoneScrapingPoints = useMemo(() => {
    if (!hasLocation) return [];
    const [lng, lat] = customCenter ?? selectedPlace?.center ?? [0, 0];
    return scrapingPoints.filter(
      (p) => haversineKm(lat, lng, p.latitude, p.longitude) <= searchRadius
    );
  }, [scrapingPoints, hasLocation, customCenter, selectedPlace, searchRadius]);

  const visibleScrapingPoints = useMemo(() => {
    return scrapingPoints.filter(
      (p) => categoryMatchesLead(selectedCategory, p.category)
    );
  }, [scrapingPoints, selectedCategory]);

  const categoryCounts = useMemo(
    () =>
      BUSINESS_CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
        acc[cat.id] = zoneScrapingPoints.filter((p) =>
          categoryMatchesLead(cat.id, p.category)
        ).length;
        return acc;
      }, {}),
    [zoneScrapingPoints]
  );

  const activeSelectedPoint = useMemo(() => {
    if (selectedPoint && visibleScrapingPoints.some((p) => p.id === selectedPoint.id)) {
      return selectedPoint;
    }
    return null;
  }, [selectedPoint, visibleScrapingPoints]);

  const activeSearchArea: SearchArea = useMemo(
    () => ({
      ...DEFAULT_SEARCH_AREA,
      center: customCenter ?? selectedPlace?.center ?? DEFAULT_SEARCH_AREA.center,
      radiusKm: searchRadius,
      label: locationQuery || selectedPlace?.label || DEFAULT_SEARCH_AREA.label,
    }),
    [customCenter, locationQuery, selectedPlace, searchRadius]
  );

  const searchBounds = useMemo(
    () => getSearchBounds(activeSearchArea),
    [activeSearchArea]
  );

  const zoneLeadIds = useMemo(
    () => new Set(zoneScrapingPoints.map((point) => point.id)),
    [zoneScrapingPoints]
  );

  const filtered = leads.filter((l) => {
    if (l.status === "desvinculado") return false;
    if (!zoneLeadIds.has(l.id)) return false;
    const q = query.toLowerCase();
    const matchQ =
      !q ||
      l.name.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q) ||
      l.location.toLowerCase().includes(q);
    const matchS = !filterStatus || l.status === filterStatus;
    const matchC = categoryMatchesLead(selectedCategory, l.category);
    return matchQ && matchS && matchC;
  });

  function selectScrapingPoint(point: MapPoint) {
    setSelectedPoint(point);
    const lead = leads.find((l) => l.id === point.id);
    if (lead) setSelected(lead);
  }

  function selectPlace(place: PlaceSuggestion) {
    setSelectedPlace(place);
    setCustomCenter(null);
    setLocationQuery(place.label);
    setLocationError(null);
    setPlaceSuggestions([]);
  }

  function selectCategory(categoryId: string) {
    setSelectedCategory(categoryId);
    setSelectedPoint(null);
    setSelected(null);
    setIsCategoryModalOpen(false);
  }

  async function handleBrowserLocation() {
    setIsLocating(true);
    setLocationError(null);
    try {
      const result = await getBrowserLocation();
      setCustomCenter(result.center);
      setSelectedPlace(result.nearestPlace ?? null);
      setLocationQuery(result.label);
      const token = getToken();
      if (token) {
        updateApproximateLocation(token, {
          latitude: result.center[1],
          longitude: result.center[0],
          label: result.label,
        }).catch(() => {});
      }
    } catch (error) {
      setLocationError(
        error instanceof Error ? error.message : tr.locationUnavailable
      );
    } finally {
      setIsLocating(false);
    }
  }

  function moveSearchArea(center: [number, number]) {
    setCustomCenter(center);
    setSelectedPlace(null);
    setLocationQuery(tr.customZone(center[1].toFixed(2), center[0].toFixed(2)));
    setLocationError(null);
  }

  function handleLocationQueryChange(q: string) {
    setLocationQuery(q);
    setCustomCenter(null);
    setSelectedPlace(null);
  }

  function toggleEditArea() {
    setIsEditingSearchArea((v) => !v);
  }

  function selectLead(lead: Lead | null) {
    setSelected(lead);
  }

  function openCategoryModal() {
    setIsCategoryModalOpen(true);
  }

  function closeCategoryModal() {
    setIsCategoryModalOpen(false);
  }

  function getSearchErrorMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : "";
    if (message === "EXPLORER_SEARCH_TIMEOUT") return tr.timeout;
    if (error instanceof AppError) {
      if (error.status === 404) return tr.backendNotFound;
    }

    const normalized = message.toLowerCase();
    if (
      normalized.includes("api 404") ||
      (normalized.includes("not found") && normalized.includes("/api/explorer/search"))
    ) {
      return tr.backendNotFound;
    }
    if (
      normalized.includes("failed to fetch") ||
      normalized.includes("networkerror") ||
      normalized.includes("load failed")
    ) {
      return tr.backendUnavailable;
    }
    if (
      normalized.includes("openai_api_key is invalid") ||
      normalized.includes("401") ||
      normalized.includes("unauthorized")
    ) {
      return tr.openaiInvalidKey;
    }
    if (
      normalized.includes("openai_api_key is required") ||
      normalized.includes("openai is not configured") ||
      normalized.includes("openai no está configurado")
    ) {
      return tr.openaiMissingKey;
    }
    if (normalized.includes("rate limit") || normalized.includes("quota")) {
      return tr.openaiQuota;
    }
    if (
      normalized.includes("openai_model") ||
      normalized.includes("model") && normalized.includes("unavailable")
    ) {
      return tr.openaiModelUnavailable;
    }
    if (normalized.includes("could not reach openai")) {
      return tr.openaiUnavailable;
    }
    if (
      error instanceof AppError &&
      (error.status === 502 || error.status === 503 || error.status === 504)
    ) {
      return tr.backendUnavailable;
    }

    return message || tr.searchFailed;
  }

  async function triggerSearch() {
    if (!hasLocation) return;
    setSearchStage("preparing");
    setIsSearching(true);
    setSearchError(null);
    try {
      const center = customCenter ?? selectedPlace!.center;
      const searchQuery = selectedCategory === "all" ? tr.localBusinesses : selectedCategoryInfo.label;
      const searchCategory = selectedCategory === "all" ? tr.localCommerce : selectedCategoryInfo.label;
      await searchExplorer({
        query: searchQuery,
        location: locationQuery || tr.selectedZone,
        latitude: center[1],
        longitude: center[0],
        radius_km: searchRadius,
        category: searchCategory,
      });
      setSearchStage("refreshing");
      const { leads: fresh } = await getLeads({ limit: MAX_LEADS_LIMIT });
      // Accumulate results: merge by ID, exclude desvinculados
      setLeads(prev => {
        const map = new Map(prev.map(l => [l.id, l]));
        for (const l of fresh) {
          if (l.status !== "desvinculado") map.set(l.id, l);
          else map.delete(l.id);
        }
        return Array.from(map.values());
      });
    } catch (err) {
      setSearchError(getSearchErrorMessage(err));
    } finally {
      setIsSearching(false);
      setSearchStage(null);
    }
  }

  function resetLocation() {
    setLocationQuery("");
    setSelectedPlace(null);
    setCustomCenter(null);
  }

  return {
    activeTab,
    setActiveTab,
    hasLocation,
    hasStoredLocation,
    locationQuery,
    selectedPlace,
    isLocating,
    locationError,
    searchRadius,
    setSearchRadius,
    isEditingSearchArea,
    selectedCategory,
    isCategoryModalOpen,
    selectedCategoryInfo,
    categoryCounts,
    query,
    setQuery,
    filterStatus,
    setFilterStatus,
    selected,
    placeSuggestions,
    visibleScrapingPoints,
    undiscoveredPoints: UNDISCOVERED_POINTS,
    activeSelectedPoint,
    activeSearchArea,
    searchBounds,
    filtered,
    isSearching,
    searchStage,
    searchError,
    selectScrapingPoint,
    selectPlace,
    selectCategory,
    handleBrowserLocation,
    moveSearchArea,
    handleLocationQueryChange,
    toggleEditArea,
    selectLead,
    openCategoryModal,
    closeCategoryModal,
    triggerSearch,
    resetLocation,
  };
}
