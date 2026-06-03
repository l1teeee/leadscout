import { Search, SlidersHorizontal } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { ScoreBar } from "@/components/ui/score-bar";
import { Button } from "@/components/ui/button";
import { EmptyInsight } from "@/components/ui/empty-insight";
import { SCRAPING_ZONES, STATUS_FILTERS } from "@/lib/explorer-data";
import type { ExplorerResultsTableProps } from "@/types/explorer";

const bodyTextStyle = { fontFamily: "var(--font-body), system-ui, sans-serif" };
const pixelBadgeClass =
  "retro rounded-none border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 pixel-text-xs text-[var(--text)] shadow-none";
const pixelButtonClass =
  "retro rounded-none border-2 border-[var(--border)] pixel-text-xs uppercase transition-transform active:translate-x-px active:translate-y-px active:shadow-none";

export function ExplorerResultsTable({
  filtered,
  visibleCount,
  selected,
  onSelectLead,
  query,
  onQueryChange,
  filterStatus,
  onFilterStatusChange,
}: ExplorerResultsTableProps) {
  return (
    <section className="pixel-card-sm flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b-2 border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
        <div>
          <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
            Resultados del scraping
          </p>
          <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>
            Tabla de negocios encontrados
          </h2>
        </div>
        <span data-tour="explorer-results-summary" className="retro pixel-text-xs" style={{ color: "var(--text-2)" }}>
          {filtered.length} visibles / {visibleCount} en mapa
        </span>
      </div>

      <div className="shrink-0 p-3 flex items-center gap-3">
        <div data-tour="explorer-results-search" className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-3)" }}
          />
          <input
            type="text"
            placeholder="Buscar negocio, categoria o zona..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="h-9 w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface-2)] pl-9 pr-3 text-sm text-[var(--text)] shadow-[2px_2px_0_0_var(--pixel-shadow)] placeholder:text-[var(--text-3)]"
            style={bodyTextStyle}
          />
        </div>

        <div data-tour="explorer-results-filters" className="flex items-center gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              onClick={() => onFilterStatusChange(s.value)}
              className={`${pixelButtonClass} h-8 px-2.5 hover:-translate-y-0.5`}
              style={
                filterStatus === s.value
                  ? {
                      background: "var(--border)",
                      color: "var(--surface)",
                      borderColor: "var(--border)",
                      boxShadow: "2px 2px 0 0 var(--pixel-highlight)",
                    }
                  : {
                      background: "var(--surface-2)",
                      color: "var(--text)",
                      borderColor: "var(--border)",
                      boxShadow: "2px 2px 0 0 var(--pixel-shadow)",
                    }
              }
            >
              {s.label}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className={`${pixelButtonClass} h-8 bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--pixel-highlight)]`}
        >
          <SlidersHorizontal size={13} />
          Filtros
        </Button>
      </div>

      <div className="mx-3 mb-3 pixel-inset shrink-0 px-3 py-2">
        <span className="retro pixel-text-xs uppercase" style={{ color: "var(--text-2)" }}>
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div data-tour="explorer-results-list" className="min-h-0 flex-1 overflow-auto">
        <table className="pixel-table w-full text-sm" style={bodyTextStyle}>
          <thead className="sticky top-0 z-10">
            <tr style={{ background: "var(--surface-2)" }}>
              {["Negocio", "Categoria", "Zona", "Score", "Prioridad", "Estado"].map((h) => (
                <th
                  key={h}
                  className="retro px-5 py-3 text-left font-bold uppercase pixel-text-xs"
                  style={{ color: "var(--text)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <EmptyInsight
                    title="Primero exploremos una zona"
                    description="Los negocios detectados apareceran aqui listos para revisar. Si ya buscaste, prueba limpiar filtros o cambiar el estado."
                    action="Vuelve a Ubicacion y ejecuta una busqueda"
                    compact
                  />
                </td>
              </tr>
            )}
            {filtered.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onSelectLead(selected?.id === lead.id ? null : lead)}
                className="cursor-pointer transition-colors"
                style={{
                  background: selected?.id === lead.id ? "var(--pixel-highlight)" : undefined,
                }}
                onMouseEnter={(e) => {
                  if (selected?.id !== lead.id)
                    (e.currentTarget as HTMLElement).style.background = "var(--pixel-highlight)";
                }}
                onMouseLeave={(e) => {
                  if (selected?.id !== lead.id)
                    (e.currentTarget as HTMLElement).style.background = "";
                }}
              >
                <td className="px-5 py-3">
                  <p className="font-semibold leading-snug" style={{ color: "var(--text)" }}>
                    {lead.name}
                  </p>
                </td>
                <td className="px-5 py-3" style={{ color: "var(--text-2)" }}>
                  {lead.category}
                </td>
                <td className="px-5 py-3" style={{ color: "var(--text-2)" }}>
                  {SCRAPING_ZONES[lead.id] ?? lead.location}
                </td>
                <td className="px-5 py-3 w-36">
                  <div className="pixel-inset px-2 py-1">
                    <ScoreBar score={lead.score} />
                  </div>
                </td>
                <td className="px-5 py-3">
                  <PriorityBadge priority={lead.priority} className={pixelBadgeClass} />
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={lead.status} className={pixelBadgeClass} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
