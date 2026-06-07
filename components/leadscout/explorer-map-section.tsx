"use client";

import { MapPin, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/8bit-spinner";
import {
  Map,
  SearchAreaLayer,
  LayerMarkers,
} from "@/components/ui/mapcn-layer-markers";
import type { ExplorerMapSectionProps } from "@/types/explorer";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

export function ExplorerMapSection({
  activeSearchArea,
  hasLocation,
  isEditingSearchArea,
  onToggleEditArea,
  visibleScrapingPoints,
  activeSelectedPoint,
  onMoveSearchArea,
  onPointSelect,
  isLocating,
  isSearching,
  searchStage,
}: ExplorerMapSectionProps) {
  const { lang } = useLanguage();
  const tr = translations[lang].explorer.map;
  const activeStage = searchStage ? tr.searchStages[searchStage] : null;
  const currentStageIndex = searchStage ? tr.searchStageOrder.indexOf(searchStage) : -1;
  const loaderTitle = isLocating ? tr.locatingTitle : activeStage?.title ?? tr.searchingTitle;
  const loaderDescription = isLocating
    ? tr.locatingDescription
    : activeStage?.description ?? tr.searchingDescription;

  return (
    <section data-tour="explorer-map" className="pixel-card-sm flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b-2 border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
        <div>
          <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
            {tr.eyebrow}
          </p>
          <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>
            {hasLocation
              ? tr.activeZone(activeSearchArea.label ?? translations[lang].explorer.location.activeZone)
              : tr.noLocationTitle}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {activeSelectedPoint && (
            <div className="hidden text-right md:block">
              <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>
                {activeSelectedPoint.name}
              </p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>
                {tr.score} {activeSelectedPoint.score}
              </p>
            </div>
          )}
          {hasLocation && (
            <Button
              variant={isEditingSearchArea ? "primary" : "secondary"}
              size="sm"
              className="h-7 px-2"
              onClick={onToggleEditArea}
              data-tour="explorer-edit-zone"
            >
              <Move size={12} />
              {isEditingSearchArea ? tr.done : tr.editZone}
            </Button>
          )}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {/* Empty state: no location set */}
        {!hasLocation && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-surface">
            <div
              className="flex h-14 w-14 items-center justify-center border-2 border-(--border)"
              style={{ background: "var(--surface-2)", boxShadow: "3px 3px 0 0 var(--pixel-shadow)" }}
            >
              <MapPin size={24} style={{ color: "var(--text-3)" }} />
            </div>
            <div className="text-center px-6">
              <p className="retro pixel-text-xs uppercase font-bold" style={{ color: "var(--text-2)" }}>
                {tr.noLocationTitle}
              </p>
              <p className="mt-2 text-xs font-semibold leading-relaxed" style={{ ...bodyFont, color: "var(--text-3)" }}>
                {tr.noLocationDescription}
              </p>
            </div>
          </div>
        )}

        {isEditingSearchArea && hasLocation && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 pixel-card-sm bg-white"
            style={{ border: "2px solid var(--border)", boxShadow: "2px 2px 0 0 var(--pixel-shadow)" }}
          >
            <p className="retro pixel-text-xs uppercase text-center" style={{ color: "var(--text-2)" }}>
              {tr.dragHelp}
            </p>
          </div>
        )}

        {hasLocation ? (
          <Map center={activeSearchArea.center} zoom={13}>
            <SearchAreaLayer
              area={activeSearchArea}
              isDraggable={isEditingSearchArea}
              onAreaCenterChange={onMoveSearchArea}
            />
            <LayerMarkers
              points={visibleScrapingPoints}
              selectedId={activeSelectedPoint?.id}
              onPointSelect={onPointSelect}
              clustered
            />
          </Map>
        ) : (
          <div className="h-full w-full bg-(--surface-2)" />
        )}

        {(isLocating || isSearching) && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-200/75 backdrop-grayscale">
            <div className="pixel-card-sm w-[min(28rem,calc(100%-2rem))] bg-white px-4 py-3" aria-live="polite">
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  <Spinner
                    variant="diamond"
                    size="md"
                    label={isLocating ? translations[lang].common.locating : loaderTitle}
                  />
                </div>
                <div className="min-w-0">
                  <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text)" }}>
                    {loaderTitle}
                  </p>
                  <p className="text-xs font-semibold leading-relaxed" style={{ color: "var(--text-2)" }}>
                    {loaderDescription}
                  </p>
                </div>
              </div>

              {isSearching && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {tr.searchStageOrder.map((stage, index) => {
                    const isActive = stage === searchStage;
                    const isComplete = currentStageIndex > index;
                    const stageText = tr.searchStages[stage].short;

                    return (
                      <div key={stage} className="flex min-w-0 items-center gap-2">
                        <span
                          className="block h-2.5 w-2.5 shrink-0 border"
                          style={{
                            background: isActive || isComplete ? "var(--c-qualified)" : "var(--surface-2)",
                            borderColor: "var(--border)",
                            boxShadow: isActive ? "0 0 0 2px rgba(47, 178, 38, 0.18)" : "none",
                          }}
                        />
                        <span
                          className="truncate text-[11px] font-bold uppercase"
                          style={{
                            ...bodyFont,
                            color: isActive ? "var(--text)" : "var(--text-3)",
                            letterSpacing: 0,
                          }}
                        >
                          {stageText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
