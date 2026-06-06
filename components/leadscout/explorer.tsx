"use client";
import { useExplorer } from "@/hooks/use-explorer";
import { ExplorerLocationPanel } from "./explorer-location-panel";
import { ExplorerMapSection } from "./explorer-map-section";
import { ExplorerResultsTable } from "./explorer-results-table";
import { ExplorerLeadDetail } from "./explorer-lead-detail";
import { ExplorerCategoryModal } from "./explorer-category-modal";
import { ExplorerOnboardingTour } from "./explorer-onboarding-tour";
import type { ExplorerTab } from "@/types";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

export function Explorer() {
  const { lang } = useLanguage();
  const tr = translations[lang].explorer;
  const tabs: { id: ExplorerTab; label: string }[] = [
    { id: "ubicacion", label: tr.tabs.ubicacion },
    { id: "resultados", label: tr.tabs.resultados },
  ];
  const {
    activeTab, setActiveTab,
    locationQuery, selectedPlace, isLocating, locationError,
    searchRadius, setSearchRadius, isEditingSearchArea,
    selectedCategory, isCategoryModalOpen,
    selectedCategoryInfo, categoryCounts,
    query, setQuery, filterStatus, setFilterStatus,
    selected,
    placeSuggestions, visibleScrapingPoints,
    activeSelectedPoint, activeSearchArea, filtered,
    isSearching, searchError,
    selectScrapingPoint, selectPlace, selectCategory,
    handleBrowserLocation, moveSearchArea,
    handleLocationQueryChange, toggleEditArea,
    selectLead, openCategoryModal, closeCategoryModal,
    triggerSearch,
  } = useExplorer();

  return (
    <div className="flex h-full min-h-0 max-h-full overflow-hidden bg-transparent animate-fade-up">
      <ExplorerOnboardingTour setActiveTab={setActiveTab} />

      <div
        className="flex h-full min-h-0 flex-col overflow-hidden p-5 gap-4"
        style={{ width: selected ? "calc(100% - 384px)" : "100%" }}
      >
        <div data-tour="explorer-tabs" className="pixel-card-sm flex shrink-0 items-center gap-2 bg-white p-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-tour={`explorer-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className="retro h-8 border-2 px-3 pixel-text-xs uppercase transition-colors"
                style={
                  isActive
                    ? { background: "var(--border)", color: "var(--surface)", borderColor: "var(--border)" }
                    : { background: "var(--surface)", color: "var(--text-2)", borderColor: "var(--border)" }
                }
              >
                {tr.tabs[tab.id]}
              </button>
            );
          })}
        </div>

        {activeTab === "ubicacion" && (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden xl:grid-cols-[360px_minmax(0,1fr)]">
            <ExplorerLocationPanel
              locationQuery={locationQuery}
              onLocationQueryChange={handleLocationQueryChange}
              selectedPlace={selectedPlace}
              selectedCategoryInfo={selectedCategoryInfo}
              visiblePointsCount={visibleScrapingPoints.length}
              placeSuggestions={placeSuggestions}
              onCategoryOpen={openCategoryModal}
              onSelectPlace={selectPlace}
              isLocating={isLocating}
              locationError={locationError}
              searchRadius={searchRadius}
              onSearchRadiusChange={setSearchRadius}
              activeSearchArea={activeSearchArea}
              onBrowserLocation={handleBrowserLocation}
              onSearch={triggerSearch}
              isSearching={isSearching}
              searchError={searchError}
            />
            <ExplorerMapSection
              activeSearchArea={activeSearchArea}
              isEditingSearchArea={isEditingSearchArea}
              onToggleEditArea={toggleEditArea}
              visibleScrapingPoints={visibleScrapingPoints}
              activeSelectedPoint={activeSelectedPoint}
              onMoveSearchArea={moveSearchArea}
              onPointSelect={selectScrapingPoint}
              isLocating={isLocating}
              isSearching={isSearching}
            />
          </div>
        )}

        {activeTab === "resultados" && (
          <ExplorerResultsTable
            filtered={filtered}
            visibleCount={visibleScrapingPoints.length}
            selected={selected}
            onSelectLead={selectLead}
            query={query}
            onQueryChange={setQuery}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
          />
        )}
      </div>

      <ExplorerCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={closeCategoryModal}
        selectedCategory={selectedCategory}
        onSelectCategory={selectCategory}
        categoryCounts={categoryCounts}
      />

      {selected && (
        <ExplorerLeadDetail
          lead={selected}
          onClose={() => selectLead(null)}
        />
      )}
    </div>
  );
}
