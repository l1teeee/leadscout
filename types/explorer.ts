import type { Lead, LeadStatus } from "@/lib/data";
import type { PlaceSuggestion, BusinessCategory } from "@/lib/location-service";
import type { MapPoint, SearchArea } from "@/components/ui/mapcn-layer-markers";

export interface SearchBounds {
  center: { lat: number; lng: number };
  southwest: { lat: number; lng: number };
  northeast: { lat: number; lng: number };
}

export type ExplorerSearchStage =
  | "preparing"
  | "searching"
  | "collecting"
  | "filtering"
  | "validating"
  | "saving"
  | "refreshing";

export interface ExplorerLocationPanelProps {
  locationQuery: string;
  onLocationQueryChange: (q: string) => void;
  selectedPlace: PlaceSuggestion | null;
  selectedCategoryInfo: BusinessCategory;
  visiblePointsCount: number;
  placeSuggestions: PlaceSuggestion[];
  onCategoryOpen: () => void;
  onSelectPlace: (place: PlaceSuggestion) => void;
  isLocating: boolean;
  locationError: string | null;
  searchRadius: number;
  onSearchRadiusChange: (r: number) => void;
  activeSearchArea: SearchArea;
  hasLocation: boolean;
  hasStoredLocation: boolean;
  onBrowserLocation: () => void;
  onResetLocation: () => void;
  onSearch: () => void;
  isSearching: boolean;
  searchError: string | null;
}

export interface ExplorerMapSectionProps {
  activeSearchArea: SearchArea;
  hasLocation: boolean;
  isEditingSearchArea: boolean;
  onToggleEditArea: () => void;
  visibleScrapingPoints: MapPoint[];
  activeSelectedPoint: MapPoint | null;
  onMoveSearchArea: (center: [number, number]) => void;
  onPointSelect: (point: MapPoint) => void;
  isLocating: boolean;
  isSearching: boolean;
  searchStage: ExplorerSearchStage | null;
}

export interface ExplorerResultsTableProps {
  filtered: Lead[];
  visibleCount: number;
  selected: Lead | null;
  onSelectLead: (lead: Lead | null) => void;
  query: string;
  onQueryChange: (q: string) => void;
  filterStatus: LeadStatus | "";
  onFilterStatusChange: (s: LeadStatus | "") => void;
  onViewInMap: () => void;
}

export interface ExplorerResultsMapProps {
  leads: Lead[];
  selected: Lead | null;
  onSelectLead: (lead: Lead | null) => void;
  onBackToTable?: () => void;
}

export interface ExplorerLeadDetailProps {
  lead: Lead;
  onClose: () => void;
  onStatusChange?: (status: import("@/lib/data").LeadStatus) => void;
  onHide?: () => void;
}

export interface ExplorerCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  categoryCounts: Record<string, number>;
}
