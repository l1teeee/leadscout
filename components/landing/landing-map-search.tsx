"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ListFilter, MapPin, Search, SlidersHorizontal } from "lucide-react";
import {
  Map as LeadScoutMap,
  SearchAreaLayer,
  type SearchArea,
} from "@/components/ui/mapcn-layer-markers";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

type LandingMapSearchProps = {
  eyebrow?: string;
  title?: string;
  status?: string;
  query?: string;
  filterLabel?: string;
  filters?: readonly string[];
  mapLabel?: string;
  resultsLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  children?: ReactNode;
};

const sanSalvadorCenter: [number, number] = [-89.2182, 13.6929];

export function LandingMapSearch({
  eyebrow = "Map search",
  title = "Busqueda local en mapa",
  status = "Explorando zona",
  query = "Cafeterias cerca de oficinas",
  filterLabel = "Filtros cualitativos",
  filters = ["Perfil incompleto", "Buena ubicacion", "Seguimiento"],
  mapLabel = "Vista de mapa",
  resultsLabel = "Senales encontradas",
  emptyTitle = "No saved preview data",
  emptyDescription = "Results appear here after a real search runs inside a workspace.",
  className = "",
  children,
}: LandingMapSearchProps) {
  const [activeFilters, setActiveFilters] = useState<readonly string[]>(() => filters.slice(0, 1));

  const activeFilterSet = useMemo(() => new Set(activeFilters), [activeFilters]);
  const activeSearchArea = useMemo<SearchArea>(
    () => ({
      center: sanSalvadorCenter,
      radiusKm: 1.25,
      label: mapLabel,
    }),
    [mapLabel]
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
              <SearchAreaLayer area={activeSearchArea} />
            </LeadScoutMap>
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
              <div
                className="p-3"
                style={{ background: "var(--surface)", border: "2px solid var(--border)" }}
              >
                <p className="text-sm font-extrabold leading-5" style={{ ...bodyFont, color: "var(--text)" }}>
                  {emptyTitle}
                </p>
                <p className="mt-2 text-xs font-semibold leading-5" style={{ ...bodyFont, color: "var(--text-2)" }}>
                  {emptyDescription}
                </p>
              </div>
            </div>
          </div>
          {children ? <div className="mt-4">{children}</div> : null}
        </aside>
      </div>
    </figure>
  );
}
