"use client";
import dynamic from "next/dynamic";
import { Trash2 } from "lucide-react";
import { useExplorer } from "@/lib/hooks/use-explorer";
import { ExplorerLocationPanel } from "./explorer-location-panel";
import { ExplorerMapSection } from "./explorer-map-section";
import { ExplorerLeadDetail } from "./explorer-lead-detail";
import { ExplorerCategoryModal } from "./explorer-category-modal";
import { ExplorerOnboardingTour } from "./explorer-onboarding-tour";
import type { ExplorerTab } from "@/types";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function ExplorerMapLoading() {
  const { lang } = useLanguage();

  return (
    <div className="pixel-card-sm flex min-h-0 flex-1 items-center justify-center bg-white p-5">
      <span className="retro pixel-text-xs uppercase text-(--text-3)">
        {translations[lang].common.mapLoading}
      </span>
    </div>
  );
}

const ExplorerResultsMap = dynamic(
  () => import("./explorer-results-map").then((mod) => mod.ExplorerResultsMap),
  {
    loading: () => <ExplorerMapLoading />,
  }
);

export function Explorer() {
  const { lang } = useLanguage();
  const tr = translations[lang].explorer;
  const tabs: { id: ExplorerTab; label: string }[] = [
    { id: "ubicacion", label: tr.tabs.ubicacion },
    { id: "resultados", label: tr.tabs.resultados },
  ];
  const {
    activeTab, setActiveTab,
    hasLocation,
    hasStoredLocation,
    locationQuery, selectedPlace, isLocating, locationError,
    searchRadius, setSearchRadius, isEditingSearchArea,
    selectedCategory, isCategoryModalOpen,
    selectedCategoryInfo, categoryCounts,
    selected,
    placeSuggestions, visibleScrapingPoints, visibleLastSearchPoints,
    activeSelectedPoint, activeSearchArea, filtered, allFiltered,
    cleanFilter, setCleanFilter,
    isSearching, searchStage, searchError,
    selectScrapingPoint, selectPlace, selectCategory,
    handleBrowserLocation, moveSearchArea,
    handleLocationQueryChange, toggleEditArea,
    selectLead, openCategoryModal, closeCategoryModal,
    triggerSearch, resetLocation,
  } = useExplorer();

  return (
    <div className="flex h-full min-h-0 max-h-full overflow-hidden bg-transparent animate-fade-up">
      <ExplorerOnboardingTour setActiveTab={setActiveTab} />

      <div
        className={cn(
          "flex h-full min-h-0 flex-col overflow-hidden p-5 gap-4",
          selected ? "md:w-[calc(100%-384px)]" : "",
          "w-full"
        )}
      >
        <div data-tour="explorer-tabs" className="pixel-card-sm flex shrink-0 items-center gap-2 bg-white p-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-tour={`explorer-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className="retro h-8 cursor-pointer border-2 px-3 pixel-text-xs uppercase transition-colors"
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
          <button
            type="button"
            onClick={() => setCleanFilter((value) => !value)}
            className="retro ml-auto flex h-8 cursor-pointer items-center gap-2 border-2 px-3 pixel-text-xs uppercase transition-colors"
            style={
              cleanFilter
                ? { background: "var(--border)", color: "var(--surface)", borderColor: "var(--border)" }
                : { background: "var(--surface)", color: "var(--text-2)", borderColor: "var(--border)" }
            }
          >
            <Trash2 size={12} />
            {lang === "es" ? "Limpiar" : "Clean"}
          </button>
        </div>

        {activeTab === "ubicacion" && (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden xl:grid-cols-[360px_minmax(0,1fr)]">
            <ExplorerLocationPanel
              locationQuery={locationQuery}
              onLocationQueryChange={handleLocationQueryChange}
              selectedPlace={selectedPlace}
              selectedCategoryInfo={selectedCategoryInfo}
              visiblePointsCount={visibleLastSearchPoints.length}
              placeSuggestions={placeSuggestions}
              onCategoryOpen={openCategoryModal}
              onSelectPlace={selectPlace}
              isLocating={isLocating}
              locationError={locationError}
              searchRadius={searchRadius}
              onSearchRadiusChange={setSearchRadius}
              activeSearchArea={activeSearchArea}
              hasLocation={hasLocation}
              hasStoredLocation={hasStoredLocation}
              onBrowserLocation={handleBrowserLocation}
              onResetLocation={resetLocation}
              onSearch={triggerSearch}
              isSearching={isSearching}
              searchError={searchError}
            />
            <ExplorerMapSection
              activeSearchArea={activeSearchArea}
              hasLocation={hasLocation}
              isEditingSearchArea={isEditingSearchArea}
              onToggleEditArea={toggleEditArea}
              visibleScrapingPoints={visibleLastSearchPoints}
              activeSelectedPoint={activeSelectedPoint}
              onMoveSearchArea={moveSearchArea}
              onPointSelect={selectScrapingPoint}
              isLocating={isLocating}
              isSearching={isSearching}
              searchStage={searchStage}
            />
          </div>
        )}

        {activeTab === "resultados" && (
          <ExplorerResultsMap
            leads={allFiltered}
            selected={selected}
            onSelectLead={selectLead}
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
