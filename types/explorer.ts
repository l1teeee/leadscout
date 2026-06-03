import type { Lead, LeadStatus } from "@/lib/data";
import type { PlaceSuggestion, BusinessCategory } from "@/lib/location-service";
import type { MapPoint, SearchArea } from "@/components/ui/mapcn-layer-markers";

export interface SearchBounds {
  center: { lat: number; lng: number };
  southwest: { lat: number; lng: number };
  northeast: { lat: number; lng: number };
}

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
  onBrowserLocation: () => void;
}

export interface ExplorerMapSectionProps {
  activeSearchArea: SearchArea;
  isEditingSearchArea: boolean;
  onToggleEditArea: () => void;
  visibleScrapingPoints: MapPoint[];
  activeSelectedPoint: MapPoint | null;
  onMoveSearchArea: (center: [number, number]) => void;
  onPointSelect: (point: MapPoint) => void;
  isLocating: boolean;
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
}

export interface ExplorerLeadDetailProps {
  lead: Lead;
  onClose: () => void;
}

export interface ExplorerCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  categoryCounts: Record<string, number>;
}
