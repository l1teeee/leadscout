import { Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/8bit-spinner";
import {
  Map,
  SearchAreaLayer,
  UndiscoveredPointsLayer,
  LayerMarkers,
} from "@/components/ui/mapcn-layer-markers";
import { UNDISCOVERED_POINTS } from "@/lib/explorer-data";
import type { ExplorerMapSectionProps } from "@/types/explorer";

export function ExplorerMapSection({
  activeSearchArea,
  isEditingSearchArea,
  onToggleEditArea,
  visibleScrapingPoints,
  activeSelectedPoint,
  onMoveSearchArea,
  onPointSelect,
  isLocating,
  isSearching,
}: ExplorerMapSectionProps) {
  return (
    <section data-tour="explorer-map" className="pixel-card-sm flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b-2 border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
        <div>
          <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
            Mapa de búsqueda
          </p>
          <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>
            Zona activa: {activeSearchArea.label}
          </h2>
          <p className="mt-1 text-xs font-semibold" style={{ color: "var(--text-3)" }}>
            Puntos grises con ? son puntos de interés pendientes de escaneo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeSelectedPoint && (
            <div className="hidden text-right md:block">
              <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>
                {activeSelectedPoint.name}
              </p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>
                Score {activeSelectedPoint.score}
              </p>
            </div>
          )}
          <Button
            variant={isEditingSearchArea ? "primary" : "secondary"}
            size="sm"
            className="h-7 px-2"
            onClick={onToggleEditArea}
            data-tour="explorer-edit-zone"
          >
            <Move size={12} />
            {isEditingSearchArea ? "Listo" : "Editar zona"}
          </Button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {isEditingSearchArea && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 pixel-card-sm bg-white"
            style={{ border: "2px solid var(--border)", boxShadow: "2px 2px 0 0 var(--pixel-shadow)" }}
          >
            <p className="retro pixel-text-xs uppercase text-center" style={{ color: "var(--text-2)" }}>
              Arrastrá el círculo para mover la zona
            </p>
          </div>
        )}
        <Map center={activeSearchArea.center} zoom={11.4}>
          <UndiscoveredPointsLayer points={UNDISCOVERED_POINTS} />
          <SearchAreaLayer
            area={activeSearchArea}
            isDraggable={isEditingSearchArea}
            onAreaCenterChange={onMoveSearchArea}
          />
          <LayerMarkers
            points={visibleScrapingPoints}
            selectedId={activeSelectedPoint?.id}
            onPointSelect={onPointSelect}
          />
        </Map>
        {(isLocating || isSearching) && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-200/75 backdrop-grayscale">
            <div className="pixel-card-sm flex items-center gap-3 bg-white px-4 py-3">
              <Spinner variant="diamond" size="md" label={isLocating ? "Ubicando" : "Buscando"} />
              <div>
                <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text)" }}>
                  {isLocating ? "Ubicando" : "Explorando zona"}
                </p>
                <p className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>
                  {isLocating
                    ? "Tomando posicion aproximada del navegador"
                    : "Detectando negocios cerca de la zona activa"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
