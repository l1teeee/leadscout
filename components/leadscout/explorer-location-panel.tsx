"use client";
import { useState } from "react";
import { Info, MapPin, LocateFixed, Play, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/8bit-slider";
import { MIN_SEARCH_RADIUS_KM, MAX_SEARCH_RADIUS_KM } from "@/lib/explorer-data";
import type { ExplorerLocationPanelProps } from "@/types/explorer";

const bodyTextStyle = { fontFamily: "var(--font-body), system-ui, sans-serif" };

function formatKm(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        aria-label="Más información"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex size-4 items-center justify-center"
        style={{ color: "var(--text-3)" }}
      >
        <Info size={11} />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-1.5 w-52 -translate-x-1/2 px-2.5 py-2 text-xs font-medium leading-relaxed animate-scale-in"
          style={{
            background: "var(--sidebar)",
            border: "2px solid var(--border)",
            boxShadow: "3px 3px 0 0 var(--pixel-shadow)",
            color: "var(--pixel-highlight)",
            fontFamily: "var(--font-body), system-ui, sans-serif",
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}

export function ExplorerLocationPanel({
  locationQuery,
  onLocationQueryChange,
  selectedPlace,
  selectedCategoryInfo,
  visiblePointsCount,
  placeSuggestions,
  onCategoryOpen,
  onSelectPlace,
  isLocating,
  locationError,
  searchRadius,
  onSearchRadiusChange,
  activeSearchArea,
  onBrowserLocation,
  onSearch,
  isSearching,
  searchError,
}: ExplorerLocationPanelProps) {
  return (
    <section className="pixel-card-sm min-h-0 overflow-auto bg-white p-4 xl:h-fit xl:max-h-full">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center border-2 border-[var(--border)] bg-[var(--surface-2)]">
          <MapPin size={15} />
        </div>
        <div>
          <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
            Ubicación
          </p>
          <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>
            Configurar scraping
          </h2>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <span className="mb-1 block text-xs font-semibold" style={{ color: "var(--text-2)" }}>
            Categoría de búsqueda
          </span>
          <button
            type="button"
            onClick={onCategoryOpen}
            data-tour="explorer-category"
            className="motion-retro-control flex min-h-12 w-full items-center justify-between rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-left shadow-[2px_2px_0_0_var(--pixel-shadow)] hover:bg-[var(--surface-2)]"
          >
            <div>
              <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                Categoría seleccionada
              </p>
              <p className="text-sm font-bold" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                {selectedCategoryInfo?.label ?? "Todas"}
              </p>
            </div>
            <SlidersHorizontal size={15} style={{ color: "var(--text)" }} />
          </button>
          <div className="mt-2 pixel-inset bg-[var(--surface-2)] px-3 py-2">
            <div className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--text-2)" }}>
              {visiblePointsCount > 0
                ? `${visiblePointsCount} marcador${visiblePointsCount !== 1 ? "es" : ""} para esta categoría.`
                : <>
                    Sin marcadores en esta zona
                    <InfoTooltip text="Ejecutá una búsqueda en esta zona o probá otra categoría para ver negocios en el mapa." />
                  </>
              }
            </div>
          </div>
        </div>

        <label className="block">
          <span className="mb-1 flex items-center gap-1.5">
            <span className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>
              Zona donde se va a buscar
            </span>
            <InfoTooltip text="La zona queda bloqueada para seleccionar comercios. Usá 'Editar zona' en el mapa solo cuando necesites mover el área de búsqueda." />
          </span>
          <input
            data-tour="explorer-location"
            value={locationQuery}
            onChange={(e) => onLocationQueryChange(e.target.value)}
            placeholder="Ej: Palermo, CABA"
            className="h-9 w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)]"
            style={bodyTextStyle}
          />
          <div className="mt-2 max-h-36 overflow-auto pixel-inset bg-[var(--surface)]">
            {placeSuggestions.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => onSelectPlace(place)}
                className="block w-full border-b border-[var(--border)] px-3 py-2 text-left text-xs font-semibold transition-colors last:border-b-0 hover:bg-[var(--surface-2)]"
                style={{ ...bodyTextStyle, color: "var(--text)" }}
              >
                {place.label}
              </button>
            ))}
            {placeSuggestions.length === 0 && locationQuery.trim().length > 2 && (
              <div className="px-3 py-2 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                Pronto encontraremos opciones para &quot;{locationQuery}&quot;. Prueba otra zona cercana.
              </div>
            )}
          </div>
        </label>

        <div data-tour="explorer-actions" className="grid grid-cols-2 gap-2 pt-1">
          <Button
            variant="primary"
            size="sm"
            className="justify-center"
            disabled={isSearching}
            onClick={onSearch}
          >
            <Play size={13} />
            {isSearching ? "Buscando" : "Ejecutar"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="justify-center"
            disabled={isLocating}
            onClick={onBrowserLocation}
          >
            <LocateFixed size={13} />
            {isLocating ? "Ubicando" : "Mi ubicación"}
          </Button>
        </div>

        {locationError && (
          <p className="text-xs font-semibold" style={{ color: "var(--c-hi)" }}>
            {locationError}
          </p>
        )}

        {searchError && (
          <div
            className="border-2 border-[var(--c-hi)] bg-[rgba(230,57,70,0.08)] px-3 py-2 text-xs font-semibold"
            style={{ ...bodyTextStyle, color: "var(--c-hi)" }}
          >
            {searchError}
          </div>
        )}

        <div data-tour="explorer-radius" className="border-t border-[var(--border)] pt-3">
          <p className="retro pixel-text-xs uppercase flex items-center gap-1" style={{ color: "var(--text-3)" }}>
            Rango para tomar datos
            <InfoTooltip text="Un radio menor da resultados más precisos. Aumentalo si querés cubrir más negocios en la zona." />
          </p>
          <div className="mt-3">
            <Slider
              value={[searchRadius]}
              min={MIN_SEARCH_RADIUS_KM}
              max={MAX_SEARCH_RADIUS_KM}
              step={0.5}
              aria-label="Rango de búsqueda en kilómetros"
              onValueChange={(value) => onSearchRadiusChange(value[0] ?? MAX_SEARCH_RADIUS_KM)}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-semibold">
            <span style={{ color: "var(--text-3)" }}>{formatKm(MIN_SEARCH_RADIUS_KM)} km</span>
            <span style={{ color: "var(--text)" }}>
              {formatKm(activeSearchArea.radiusKm)} km desde{" "}
              {selectedPlace?.municipality ?? "la zona activa"}
            </span>
            <span style={{ color: "var(--text-3)" }}>{formatKm(MAX_SEARCH_RADIUS_KM)} km</span>
          </div>
        </div>
      </div>
    </section>
  );
}
