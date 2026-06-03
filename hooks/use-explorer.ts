"use client";
import { useEffect, useMemo, useState } from "react";
import type { Lead, LeadStatus } from "@/lib/data";
import { getLeads } from "@/lib/api/leads";
import { searchExplorer } from "@/lib/api/explorer";
import {
  BUSINESS_CATEGORIES,
  categoryMatchesLead,
  getBrowserLocation,
  suggestPlaces,
  type PlaceSuggestion,
} from "@/lib/location-service";
import {
  DEFAULT_PLACE,
  DEFAULT_SEARCH_AREA,
  MAX_SEARCH_RADIUS_KM,
  UNDISCOVERED_POINTS,
} from "@/lib/explorer-data";
import type { MapPoint, SearchArea } from "@/components/ui/mapcn-layer-markers";
import type { ExplorerTab } from "@/types";
import type { SearchBounds } from "@/types/explorer";

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
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "">("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [locationQuery, setLocationQuery] = useState(
    DEFAULT_PLACE?.label ?? DEFAULT_SEARCH_AREA.label
  );
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(
    DEFAULT_PLACE ?? null
  );
  const [customCenter, setCustomCenter] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState(MAX_SEARCH_RADIUS_KM);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [isEditingSearchArea, setIsEditingSearchArea] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ExplorerTab>("ubicacion");

  useEffect(() => {
    getLeads().then(setLeads).catch(() => setLeads([]));
  }, []);

  const selectedCategoryInfo =
    BUSINESS_CATEGORIES.find((c) => c.id === selectedCategory) ?? BUSINESS_CATEGORIES[0];

  const placeSuggestions = useMemo(
    () => suggestPlaces(locationQuery),
    [locationQuery]
  );

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

  const visibleScrapingPoints = useMemo(
    () => scrapingPoints.filter((p) => categoryMatchesLead(selectedCategory, p.category)),
    [scrapingPoints, selectedCategory]
  );

  const categoryCounts = useMemo(
    () =>
      BUSINESS_CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
        acc[cat.id] = scrapingPoints.filter((p) =>
          categoryMatchesLead(cat.id, p.category)
        ).length;
        return acc;
      }, {}),
    [scrapingPoints]
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

  const filtered = leads.filter((l) => {
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
    } catch (error) {
      setLocationError(
        error instanceof Error ? error.message : "No se pudo obtener la ubicacion."
      );
    } finally {
      setIsLocating(false);
    }
  }

  function moveSearchArea(center: [number, number]) {
    setCustomCenter(center);
    setSelectedPlace(null);
    setLocationQuery(`Zona personalizada (${center[1].toFixed(2)}, ${center[0].toFixed(2)})`);
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

  async function triggerSearch() {
    setIsSearching(true);
    setSearchError(null);
    try {
      const center = customCenter ?? selectedPlace?.center ?? DEFAULT_SEARCH_AREA.center;
      await searchExplorer({
        query: selectedCategoryInfo.label,
        location: locationQuery || DEFAULT_SEARCH_AREA.label || "San Salvador, El Salvador",
        latitude: center[1],
        longitude: center[0],
        radius_km: searchRadius,
        category: selectedCategoryInfo.label,
      });
      const fresh = await getLeads();
      setLeads(fresh);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Error al buscar negocios.");
    } finally {
      setIsSearching(false);
    }
  }

  return {
    activeTab,
    setActiveTab,
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
  };
}
