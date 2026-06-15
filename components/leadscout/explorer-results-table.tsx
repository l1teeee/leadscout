"use client";

import { Map, Search, SlidersHorizontal } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { ScoreBar } from "@/components/ui/score-bar";
import { Button } from "@/components/ui/button";
import { EmptyInsight } from "@/components/ui/empty-insight";
import { SCRAPING_ZONES } from "@/lib/explorer-data";
import type { ExplorerResultsTableProps } from "@/types/explorer";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";
import type { LeadStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

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
  onViewInMap,
}: ExplorerResultsTableProps) {
  const { lang } = useLanguage();
  const tr = translations[lang].explorer.results;
  const rootTr = translations[lang];
  const statusFilters: { value: LeadStatus | ""; label: string }[] = [
    { value: "", label: rootTr.common.all },
    { value: "nuevo", label: rootTr.leadStatus.nuevo },
    { value: "contactado", label: rootTr.leadStatus.contactado },
    { value: "calificado", label: rootTr.leadStatus.calificado },
    { value: "perdido", label: rootTr.leadStatus.perdido },
    { value: "desvinculado", label: rootTr.leadStatus.desvinculado },
  ];

  return (
    <section className="pixel-card-sm flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b-2 border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
        <div>
          <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
            {tr.eyebrow}
          </p>
          <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>
            {tr.title}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span data-tour="explorer-results-summary" className="retro pixel-text-xs" style={{ color: "var(--text-2)" }}>
            {tr.summary(filtered.length, visibleCount)}
          </span>
          <button
            type="button"
            onClick={onViewInMap}
            className="flex cursor-pointer items-center gap-1.5 border-2 border-(--border) bg-white px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-(--surface-2)"
            style={{ fontFamily: "var(--font-body), system-ui, sans-serif", color: "var(--text-2)" }}
          >
            <Map size={12} />
            {tr.viewInMap}
          </button>
        </div>
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
            placeholder={tr.searchPlaceholder}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="h-9 w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface-2)] pl-9 pr-3 text-sm text-[var(--text)] shadow-[2px_2px_0_0_var(--pixel-shadow)] placeholder:text-[var(--text-3)]"
            style={bodyTextStyle}
          />
        </div>

        <div data-tour="explorer-results-filters" className="flex items-center gap-2">
          {statusFilters.map((s) => (
            <button
              key={s.value}
              onClick={() => onFilterStatusChange(s.value)}
              className={`${pixelButtonClass} h-8 cursor-pointer px-2.5 hover:-translate-y-0.5`}
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
          {tr.filters}
        </Button>
      </div>

      <div className="mx-3 mb-3 pixel-inset shrink-0 px-3 py-2">
        <span className="retro pixel-text-xs uppercase" style={{ color: "var(--text-2)" }}>
          {tr.count(filtered.length)}
        </span>
      </div>

      <div data-tour="explorer-results-list" className="min-h-0 flex-1 overflow-auto">
        <div className="overflow-x-auto">
          <table className="pixel-table w-full text-sm" style={bodyTextStyle}>
          <thead className="sticky top-0 z-10">
            <tr style={{ background: "var(--surface-2)" }}>
              {tr.headers.map((h) => (
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
                    title={tr.empty.title}
                    description={tr.empty.description}
                    action={tr.empty.action}
                    compact
                  />
                </td>
              </tr>
            )}
            {filtered.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onSelectLead(selected?.id === lead.id ? null : lead)}
                className={cn(
                  "cursor-pointer transition-colors",
                  selected?.id === lead.id
                    ? "bg-[var(--surface-2)]"
                    : "hover:bg-[var(--surface-2)]",
                )}
              >
                <td className="px-5 py-3" style={{ maxWidth: "200px", overflow: "hidden" }}>
                  <p className="font-semibold leading-snug truncate" style={{ color: "var(--text)" }}>
                    {lead.name}
                  </p>
                </td>
                <td className="px-5 py-3" style={{ maxWidth: "140px", overflow: "hidden", color: "var(--text-2)" }}>
                  <span className="block truncate">{lead.category}</span>
                </td>
                <td className="px-5 py-3" style={{ maxWidth: "140px", overflow: "hidden", color: "var(--text-2)" }}>
                  <span className="block truncate">{SCRAPING_ZONES[lead.id] ?? lead.location}</span>
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
      </div>
    </section>
  );
}
