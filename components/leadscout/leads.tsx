"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, CalendarClock, Filter, Globe2, Phone, RefreshCcw, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useLeads, PAGE_SIZE, type SortField } from "@/lib/hooks/use-leads";
import { translations } from "@/lib/i18n";
import type { Lead, LeadPriority, LeadStatus } from "@/lib/data";
import { useLanguage } from "@/contexts/language-context";
import { ExplorerLeadDetail } from "@/components/leadscout/explorer-lead-detail";
import { PriorityBadge, StatusBadge, Tag } from "@/components/ui/badge";
import { ScoreBar, ScoreBig } from "@/components/ui/score-bar";
import { EmptyInsight } from "@/components/ui/empty-insight";
import { analyzeLead } from "@/lib/api/explorer";

const bodyTextStyle = {
  fontFamily: "var(--font-body), system-ui, sans-serif",
};

function useAnimatedNumber(target: number, duration = 450) {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    fromRef.current = target;
    const start = performance.now();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // ease-out cubic: fast start, smooth landing
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return display;
}

function LeadMetric({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  const isLoading = value === "...";
  const animated = useAnimatedNumber(typeof value === "number" ? value : 0);
  return (
    <div className="pixel-card-sm bg-white p-4">
      <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
        {label}
      </p>
      <p className="retro mt-3 text-2xl font-black tabular-nums" style={{ color: tone ?? "var(--text)" }}>
        {isLoading ? "..." : animated}
      </p>
    </div>
  );
}

function LeadDetail({ lead }: { lead: Lead | null }) {
  const { lang } = useLanguage();
  const tr = translations[lang];
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!lead) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await analyzeLead({
        name: lead.name,
        category: lead.category,
        location: lead.location,
        phone: lead.phone,
        website: lead.website,
        score: lead.score,
        issues: lead.issues,
      });
      setAnalysis(res.analysis);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("503") || msg.includes("not configurado") || msg.includes("not configured")) {
        setAnalysisError(tr.leads.detail.aiAnalysis.noApiKey);
      } else {
        setAnalysisError(tr.leads.detail.aiAnalysis.error);
      }
    } finally {
      setIsAnalyzing(false);
    }
  }

  if (!lead) {
    return (
      <aside className="pixel-card-sm bg-white p-5">
        <EmptyInsight
          title={tr.leads.detailEmpty.title}
          description={tr.leads.detailEmpty.description}
          compact
        />
      </aside>
    );
  }

  return (
    <aside className="pixel-card-sm h-fit bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
            {tr.leads.detail.profile}
          </p>
          <h2 className="mt-2 text-lg font-extrabold leading-snug" style={{ ...bodyTextStyle, color: "var(--text)" }}>
            {lead.name}
          </h2>
          <p className="mt-1 text-sm font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
            {lead.category} / {lead.location}
          </p>
        </div>
        <ScoreBig score={lead.score} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <StatusBadge status={lead.status} />
        <PriorityBadge priority={lead.priority} />
      </div>

      <div className="mt-5 pixel-inset bg-(--surface-2) p-3">
        <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
          {tr.leads.detail.operationalScore}
        </p>
        <ScoreBar score={lead.score} showLabel className="mt-3" />
      </div>

      <div className="mt-5 space-y-2">
        <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text)" }}>
          {tr.leads.detail.gaps}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {lead.issues.length > 0 ? (
            lead.issues.map((issue) => (
              <Tag key={issue}>{issue}</Tag>
            ))
          ) : (
            <EmptyInsight
              title={tr.leads.detail.gapsEmpty.title}
              description={tr.leads.detail.gapsEmpty.description}
              compact
            />
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-2 text-sm font-semibold" style={bodyTextStyle}>
        {!lead.phone && !lead.website && (
          <EmptyInsight
            title={tr.leads.detail.pendingContact}
            description={tr.leads.detail.contactEmpty}
            compact
          />
        )}
        {lead.phone && (
          <div className="flex items-center gap-2 border-2 border-(--border) bg-surface px-3 py-2">
            <Phone size={14} />
            <span className="truncate" style={{ color: "var(--text-2)" }}>
              {lead.phone}
            </span>
          </div>
        )}
        {lead.website && (
          <div className="flex items-center gap-2 border-2 border-(--border) bg-surface px-3 py-2">
            <Globe2 size={14} />
            <span className="truncate" style={{ color: "var(--text-2)" }}>
              {lead.website}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 border-2 border-(--border) bg-surface px-3 py-2">
          <CalendarClock size={14} />
          <span className="truncate" style={{ color: "var(--text-2)" }}>
            {lead.lastContact ? `${tr.leads.detail.lastContact}: ${lead.lastContact}` : tr.leads.detail.pendingContact}
          </span>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="mt-5 border-t-2 border-(--border) pt-4">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={12} style={{ color: "var(--pixel-highlight)" }} />
          <p className="retro pixel-text-xs uppercase font-bold" style={{ color: "var(--text-2)" }}>
            {tr.leads.detail.aiAnalysis.title}
          </p>
        </div>

        {!analysis && !isAnalyzing && (
          <button
            type="button"
            onClick={handleAnalyze}
            className="w-full pixel-inset flex items-center justify-center gap-2 px-3 py-3 text-xs font-semibold transition-colors hover:bg-(--surface-2) cursor-pointer"
            style={{ ...bodyTextStyle, color: "var(--text-2)" }}
          >
            <Sparkles size={11} />
            {tr.leads.detail.aiAnalysis.cta}
          </button>
        )}

        {isAnalyzing && (
          <div className="pixel-inset flex items-center justify-center gap-2 px-3 py-3">
            <div
              style={{
                width: 12,
                height: 12,
                background: "var(--text)",
                animation: "pixelSpin 1s steps(8, end) infinite",
              }}
            />
            <span className="text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-2)" }}>
              {tr.leads.detail.aiAnalysis.analyzing}
            </span>
          </div>
        )}

        {analysisError && (
          <p className="text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--c-hi)" }}>
            {analysisError}
          </p>
        )}

        {analysis && (
          <div className="space-y-2">
            <div className="pixel-inset p-3">
              <p className="text-xs leading-relaxed whitespace-pre-line" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                {analysis}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAnalyze}
              className="text-xs font-semibold underline underline-offset-2 cursor-pointer"
              style={{ ...bodyTextStyle, color: "var(--text-3)" }}
            >
              {tr.leads.detail.aiAnalysis.cta}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export function Leads() {
  const { lang } = useLanguage();
  const tr = translations[lang];
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const {
    leads,
    selected,
    loading,
    query, setQuery,
    status, setStatus,
    priority, setPriority,
    setSelectedId,
    sortBy,
    sortOrder,
    toggleSort,
    page, setPage,
    total,
    totalPages,
    highPriorityCount,
    noContactCount,
    avgScore,
    refresh,
  } = useLeads();

  const sortableHeaders: { label: string; field: SortField | null }[] = [
    { label: tr.leads.tableHeaders[0], field: "name" },
    { label: tr.leads.tableHeaders[1], field: "score" },
    { label: tr.leads.tableHeaders[2], field: "status" },
    { label: tr.leads.tableHeaders[3], field: "priority" },
    { label: tr.leads.tableHeaders[4], field: null },
  ];

  const statusOptions: { value: LeadStatus | ""; label: string }[] = [
    { value: "", label: tr.leads.filters.statusAll },
    { value: "nuevo", label: tr.leadStatus.nuevo },
    { value: "contactado", label: tr.leadStatus.contactado },
    { value: "calificado", label: tr.leadStatus.calificado },
    { value: "perdido", label: tr.leadStatus.perdido },
    { value: "desvinculado", label: tr.leadStatus.desvinculado },
  ];
  const priorityOptions: { value: LeadPriority | ""; label: string }[] = [
    { value: "", label: tr.leads.filters.priorityAll },
    { value: "alta", label: tr.leadPriority.alta },
    { value: "media", label: tr.leadPriority.media },
    { value: "baja", label: tr.leadPriority.baja },
  ];

  return (
    <div className="w-full animate-fade-up p-4 sm:p-6 lg:p-8">
      <div data-stagger className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <LeadMetric label={tr.leads.kpi.visible} value={loading ? "..." : total} />
        <LeadMetric label={tr.leads.kpi.highPriority} value={loading ? "..." : highPriorityCount} tone="var(--c-hi)" />
        <LeadMetric label={tr.leads.kpi.toContact} value={loading ? "..." : noContactCount} tone="var(--c-mid)" />
        <LeadMetric label={tr.leads.kpi.avgScore} value={loading ? "..." : avgScore} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="pixel-card-sm min-w-0 overflow-hidden bg-white">
          <div className="border-b-2 border-(--border) bg-(--surface-2) p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                    {tr.leads.eyebrow}
                  </p>
                  <h2 className="retro pixel-text-sm mt-1 uppercase" style={{ color: "var(--text)" }}>
                    {tr.leads.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={refresh}
                  disabled={loading}
                  title={tr.leads.refresh}
                  className="flex items-center gap-1.5 border-2 border-(--border) bg-surface px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-(--surface-2) disabled:opacity-40"
                  style={{ ...bodyTextStyle, color: "var(--text-2)" }}
                >
                  <RefreshCcw
                    size={12}
                    style={{ animation: loading ? "pixelSpin 0.8s steps(8, end) infinite" : "none" }}
                  />
                  {tr.leads.refresh}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(220px,1fr)_150px_150px]">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" size={14} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={tr.leads.searchPlaceholder}
                    className="h-9 w-full rounded-none border-2 border-(--border) bg-surface pl-9 pr-3 text-sm text-text placeholder:text-(--text-3)"
                    style={bodyTextStyle}
                  />
                </label>

                <label className="relative block">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" size={13} />
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as LeadStatus | "")}
                    className="h-9 w-full appearance-none rounded-none border-2 border-(--border) bg-surface pl-9 pr-3 text-xs font-semibold text-text"
                    style={bodyTextStyle}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value || "all"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="relative block">
                  <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" size={13} />
                  <select
                    value={priority}
                    onChange={(event) => setPriority(event.target.value as LeadPriority | "")}
                    className="h-9 w-full appearance-none rounded-none border-2 border-(--border) bg-surface pl-9 pr-3 text-xs font-semibold text-text"
                    style={bodyTextStyle}
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value || "all"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-sm" style={bodyTextStyle}>
              <thead>
                <tr className="bg-white">
                  {sortableHeaders.map(({ label, field }) => (
                    <th
                      key={label}
                      className="retro border-b-2 border-(--border) px-4 py-3 text-left text-[10px] uppercase"
                      style={{ color: "var(--text-3)" }}
                    >
                      {field ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(field)}
                          className="inline-flex items-center gap-1 hover:opacity-70 transition-opacity"
                          style={{ color: sortBy === field ? "var(--text)" : "var(--text-3)" }}
                        >
                          {label}
                          {sortBy === field ? (
                            sortOrder === "asc" ? <ArrowUp size={10} /> : <ArrowDown size={10} />
                          ) : (
                            <ArrowUpDown size={10} style={{ opacity: 0.4 }} />
                          )}
                        </button>
                      ) : (
                        label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const isSelected = selected?.id === lead.id;
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => {
                        setSelectedId(lead.id);
                        setSelectedLead(lead);
                      }}
                      className="cursor-pointer transition-colors hover:bg-(--surface-2)"
                      style={{
                        background: isSelected ? "var(--surface-2)" : "var(--surface)",
                        borderBottom: "1px solid #E4E4E7",
                      }}
                    >
                      <td className="px-4 py-3">
                        <p className="font-bold" style={{ color: "var(--text)" }}>
                          {lead.name}
                        </p>
                        <p className="mt-1 text-xs font-semibold" style={{ color: "var(--text-3)" }}>
                          {lead.category} / {lead.location}
                        </p>
                      </td>
                      <td className="w-44 px-4 py-3">
                        <ScoreBar score={lead.score} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={lead.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>
                          {lead.lastContact ?? tr.leads.pending}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!loading && leads.length === 0 && (
            <div className="p-8">
              <EmptyInsight
                title={total === 0 ? tr.leads.emptyWorkspace.title : tr.leads.emptyFiltered.title}
                description={
                  total === 0
                    ? tr.leads.emptyWorkspace.description
                    : tr.leads.emptyFiltered.description
                }
                action={total === 0 ? tr.leads.emptyWorkspace.action : tr.leads.emptyFiltered.action}
                compact
              />
            </div>
          )}

          {loading && (
            <div className="p-8 text-center">
              <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                {tr.leads.loading}
              </p>
            </div>
          )}

          {/* Pagination */}
          {!loading && total > PAGE_SIZE && (
            <div className="flex items-center justify-between border-t-2 border-(--border) bg-(--surface-2) px-4 py-3">
              <p className="text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                {tr.leads.pagination.showing(
                  page * PAGE_SIZE + 1,
                  Math.min((page + 1) * PAGE_SIZE, total),
                  total,
                )}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className="retro pixel-text-xs border-2 border-(--border) px-3 py-1.5 uppercase transition-colors disabled:opacity-40 hover:bg-surface"
                  style={{ color: "var(--text-2)" }}
                >
                  {tr.leads.pagination.prev}
                </button>
                <span className="retro pixel-text-xs" style={{ color: "var(--text)" }}>
                  {tr.leads.pagination.page(page + 1, totalPages)}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="retro pixel-text-xs border-2 border-(--border) px-3 py-1.5 uppercase transition-colors disabled:opacity-40 hover:bg-surface"
                  style={{ color: "var(--text-2)" }}
                >
                  {tr.leads.pagination.next}
                </button>
              </div>
            </div>
          )}
        </section>

        <LeadDetail lead={selected} />
      </div>

      {selectedLead && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" onClick={() => setSelectedLead(null)} />
          <div className="fixed inset-y-0 right-0 z-50 flex">
            <ExplorerLeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} />
          </div>
        </>
      )}
    </div>
  );
}
