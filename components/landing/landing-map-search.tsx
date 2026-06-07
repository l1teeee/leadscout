"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ListFilter, MapPin, Search, SlidersHorizontal } from "lucide-react";
import {
  LayerMarkers,
  Map as LeadScoutMap,
  SearchAreaLayer,
  UndiscoveredPointsLayer,
  type MapPoint,
  type SearchArea,
  type UndiscoveredPoint,
} from "@/components/ui/mapcn-layer-markers";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

type ResultTone = "new" | "qualified" | "attention";

type LandingMapSearchResult = {
  name: string;
  description: string;
  tag?: string;
  tone?: ResultTone;
};

type LandingMapSearchProps = {
  eyebrow?: string;
  title?: string;
  status?: string;
  query?: string;
  filterLabel?: string;
  filters?: readonly string[];
  mapLabel?: string;
  resultsLabel?: string;
  results?: readonly LandingMapSearchResult[];
  className?: string;
  children?: ReactNode;
};

const toneColors: Record<ResultTone, string> = {
  new: "var(--c-new)",
  qualified: "var(--c-qualified)",
  attention: "var(--c-hi)",
};

const toneScores: Record<ResultTone, number> = {
  new: 54,
  qualified: 74,
  attention: 18,
};

const sanSalvadorCenter: [number, number] = [-89.2182, 13.6929];

const demoCoordinates: [number, number][] = [
  [-89.2409, 13.7037],
  [-89.2242, 13.6906],
  [-89.2029, 13.7094],
  [-89.1857, 13.6945],
];

const demoUndiscoveredPoints: UndiscoveredPoint[] = [
  { id: "landing-zona-san-jacinto", label: "Zona por escanear: San Jacinto", center: [-89.2048, 13.6778] },
  { id: "landing-zona-escalon", label: "Zona por escanear: Escalon", center: [-89.2515, 13.7081] },
  { id: "landing-zona-soyapango", label: "Zona por escanear: Soyapango", center: [-89.1599, 13.7103] },
];

const defaultResults: LandingMapSearchResult[] = [
  {
    name: "Cafeteria local",
    description: "Ficha con senales para revisar",
    tag: "Perfil local",
    tone: "qualified",
  },
  {
    name: "Tienda de servicios",
    description: "Buen candidato para seguimiento",
    tag: "Oportunidad",
    tone: "new",
  },
  {
    name: "Restaurante familiar",
    description: "Presencia digital mejorable",
    tag: "Revisar",
    tone: "attention",
  },
];

export function LandingMapSearch({
  eyebrow = "Map search",
  title = "Busqueda local en mapa",
  status = "Explorando zona",
  query = "Cafeterias cerca de oficinas",
  filterLabel = "Filtros cualitativos",
  filters = ["Perfil incompleto", "Buena ubicacion", "Seguimiento"],
  mapLabel = "Vista de mapa",
  resultsLabel = "Senales encontradas",
  results = defaultResults,
  className = "",
  children,
}: LandingMapSearchProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeFilters, setActiveFilters] = useState<readonly string[]>(() => filters.slice(0, 1));

  const selectedResult = results[selectedIndex] ?? results[0];
  const selectedTone = selectedResult?.tone ?? "new";

  const activeFilterSet = useMemo(() => new Set(activeFilters), [activeFilters]);
  const mapPoints = useMemo<MapPoint[]>(
    () =>
      results.map((result, index) => {
        const [longitude, latitude] = demoCoordinates[index % demoCoordinates.length];
        const tone = result.tone ?? "new";

        return {
          id: `landing-map-point-${index}`,
          name: result.name,
          category: result.tag ?? result.description,
          score: toneScores[tone],
          longitude,
          latitude,
        };
      }),
    [results]
  );
  const activePoint = mapPoints[selectedIndex] ?? mapPoints[0];
  const activeSearchArea = useMemo<SearchArea>(
    () => ({
      center: activePoint
        ? [activePoint.longitude, activePoint.latitude]
        : sanSalvadorCenter,
      radiusKm: 1.25,
      label: selectedResult?.name ?? mapLabel,
    }),
    [activePoint, mapLabel, selectedResult?.name]
  );

  function toggleFilter(filter: string) {
    setActiveFilters((current) =>
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter]
    );
  }

  return (
    <figure
      className={`pixel-card w-full min-w-0 overflow-hidden p-3 sm:p-4 ${className}`}
      aria-label={title}
      style={{ background: "var(--surface)" }}
    >
      <div className="flex items-center justify-between gap-3 pb-3" style={{ borderBottom: "2px solid var(--border)" }}>
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center"
            style={{ background: "var(--text)", border: "2px solid var(--border)", color: "var(--pixel-highlight)" }}
          >
            <MapPin size={18} strokeWidth={2.5} />
          </span>
          <div className="min-w-0">
            <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
              {eyebrow}
            </p>
            <h3 className="retro pixel-text-sm mt-2 truncate uppercase" style={{ color: "var(--text)" }}>
              {title}
            </h3>
          </div>
        </div>
        <span
          className="retro pixel-text-xs shrink-0 px-2 py-1 text-center uppercase"
          style={{ background: "var(--surface-2)", border: "2px solid var(--border)", color: "var(--text)" }}
        >
          {status}
        </span>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[1.42fr_0.58fr]">
        <div className="min-w-0">
          <div
            className="flex min-h-11 items-center gap-3 px-3 py-2"
            style={{ background: "var(--surface-2)", border: "2px solid var(--border)" }}
          >
            <Search size={16} className="shrink-0" style={{ color: "var(--text-2)" }} />
            <span className="min-w-0 truncate text-sm font-extrabold" style={{ ...bodyFont, color: "var(--text)" }}>
              {query}
            </span>
          </div>

          <div
            className="relative mt-3 h-[380px] overflow-hidden sm:h-[460px] xl:h-[540px]"
            style={{
              border: "2px solid var(--border)",
            }}
          >
            <LeadScoutMap center={sanSalvadorCenter} zoom={12.2}>
              <UndiscoveredPointsLayer points={demoUndiscoveredPoints} />
              <SearchAreaLayer area={activeSearchArea} />
              <LayerMarkers
                points={mapPoints}
                selectedId={activePoint?.id}
                onPointSelect={(point) => {
                  const nextIndex = mapPoints.findIndex((item) => item.id === point.id);
                  if (nextIndex >= 0) setSelectedIndex(nextIndex);
                }}
              />
            </LeadScoutMap>
            {selectedResult ? (
              <div
                className="absolute bottom-3 right-3 z-10 max-w-[min(16rem,calc(100%-1.5rem))] p-2.5"
                style={{
                  background: "var(--surface)",
                  border: "2px solid var(--border)",
                  boxShadow: "3px 3px 0 0 var(--pixel-shadow)",
                }}
              >
                <div className="flex items-start gap-2">
                  <span
                    className="mt-1 size-3 shrink-0"
                    style={{ background: toneColors[selectedTone], border: "2px solid var(--border)" }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold leading-5" style={{ ...bodyFont, color: "var(--text)" }}>
                      {selectedResult.name}
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-5" style={{ ...bodyFont, color: "var(--text-2)" }}>
                      {selectedResult.description}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
            <figcaption
              className="retro pixel-text-xs absolute bottom-3 left-3 z-10 px-2 py-1 uppercase"
              style={{ background: "var(--surface)", border: "2px solid var(--border)", color: "var(--text-2)" }}
            >
              {mapLabel}
            </figcaption>
          </div>
        </div>

        <aside className="min-w-0">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="p-2.5" style={{ background: "var(--surface-2)", border: "2px solid var(--border)" }}>
              <div className="flex items-center gap-2" style={{ color: "var(--text)" }}>
                <SlidersHorizontal size={15} />
                <p className="retro pixel-text-xs uppercase">{filterLabel}</p>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {filters.map((filter) => {
                  const isActive = activeFilterSet.has(filter);

                  return (
                  <button
                    key={filter}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => toggleFilter(filter)}
                    className="text-xs font-extrabold"
                    style={{
                      ...bodyFont,
                      background: isActive ? "var(--text)" : "var(--surface)",
                      border: "2px solid var(--border)",
                      color: isActive ? "var(--pixel-highlight)" : "var(--text-2)",
                      cursor: "pointer",
                      padding: "0.35rem 0.5rem",
                      transition: "background-color 150ms ease, color 150ms ease, transform 150ms var(--ease-out)",
                    }}
                  >
                    {filter}
                  </button>
                  );
                })}
              </div>
            </div>

            <div className="p-2.5" style={{ background: "var(--bg)", border: "2px solid var(--border)" }}>
              <div className="mb-2.5 flex items-center gap-2" style={{ color: "var(--text)" }}>
                <ListFilter size={15} />
                <p className="retro pixel-text-xs uppercase">{resultsLabel}</p>
              </div>
              <div className="space-y-3">
                {results.map((result, index) => {
                  const tone = result.tone ?? "new";
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={`${result.name}-${result.description}`}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className="lnd-row block w-full p-2.5 text-left active:translate-x-0.5 active:translate-y-0.5"
                      style={{
                        background: isSelected ? "var(--pixel-highlight)" : "var(--surface)",
                        border: "2px solid var(--border)",
                        boxShadow: isSelected ? "3px 3px 0 0 var(--pixel-shadow)" : "none",
                        cursor: "pointer",
                        transition: "background-color 150ms ease, box-shadow 150ms var(--ease-out), transform 150ms var(--ease-out)",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-1 size-3 shrink-0"
                          style={{ background: toneColors[tone], border: "2px solid var(--border)" }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold leading-5" style={{ ...bodyFont, color: "var(--text)" }}>
                            {result.name}
                          </p>
                          <p className="mt-1 text-xs font-semibold leading-4" style={{ ...bodyFont, color: "var(--text-2)" }}>
                            {result.description}
                          </p>
                          {result.tag ? (
                            <span
                              className="retro pixel-text-xs mt-2 inline-flex px-2 py-1 uppercase"
                              style={{ background: "var(--surface-2)", border: "2px solid var(--border)", color: "var(--text)" }}
                            >
                              {result.tag}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {children ? <div className="mt-4">{children}</div> : null}
        </aside>
      </div>
    </figure>
  );
}
