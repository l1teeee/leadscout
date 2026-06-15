"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, EyeOff, Filter, Globe2, Phone, RefreshCcw, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useLeads, PAGE_SIZE, type SortField } from "@/lib/hooks/use-leads";
import { translations } from "@/lib/i18n";
import type { Lead, LeadPriority, LeadStatus } from "@/lib/data";
import { useLanguage } from "@/contexts/language-context";
import { ExplorerLeadDetail } from "@/components/leadscout/explorer-lead-detail";
import { ExplorerAnalysisModal } from "./explorer-analysis-modal";
import { PriorityBadge, StatusBadge, Tag } from "@/components/ui/badge";
import { ScoreBar, ScoreBig } from "@/components/ui/score-bar";
import { EmptyInsight } from "@/components/ui/empty-insight";
import { markLeadViewed } from "@/lib/api/leads";
import { cn, safeHref } from "@/lib/utils";

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

const SOCIAL_HOSTS: Record<string, string> = {
  "facebook.com": "Facebook", "fb.com": "Facebook",
  "instagram.com": "Instagram", "tiktok.com": "TikTok",
  "twitter.com": "X / Twitter", "x.com": "X / Twitter",
  "linkedin.com": "LinkedIn", "youtube.com": "YouTube",
  "youtu.be": "YouTube", "wa.me": "WhatsApp", "whatsapp.com": "WhatsApp",
};

function getSocialName(url?: string | null): string | null {
  if (!url) return null;
  try {
    let host = new URL(url).hostname.toLowerCase();
    if (host.startsWith("www.")) host = host.slice(4);
    for (const [domain, name] of Object.entries(SOCIAL_HOSTS)) {
      if (host === domain || host.endsWith(`.${domain}`)) return name;
    }
    return null;
  } catch {
    return null;
  }
}

function LeadDetail({ lead, onAnalyze }: { lead: Lead | null; onAnalyze: () => void }) {
  const { lang } = useLanguage();
  const tr = translations[lang];

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
        {lead.website && (() => {
          const socialName = getSocialName(lead.website);
          const href = safeHref(lead.website);
          let displayText: string;
          try { displayText = socialName ?? new URL(lead.website).hostname.replace(/^www\./, ""); }
          catch { displayText = lead.website; }
          return (
            <div className="flex items-center gap-2 border-2 border-(--border) bg-surface px-3 py-2">
              <Globe2 size={14} />
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate underline underline-offset-2 hover:opacity-70"
                  style={{ color: "var(--text-2)" }}
                >
                  {displayText}
                </a>
              ) : (
                <span className="truncate" style={{ color: "var(--text-2)" }}>{displayText}</span>
              )}
            </div>
          );
        })()}
      </div>

      {/* AI Analysis */}
      <div className="mt-5 border-t-2 border-(--border) pt-4">
        <button
          type="button"
          onClick={onAnalyze}
          className="w-full pixel-inset flex items-center justify-center gap-2 px-3 py-3 text-xs font-semibold transition-colors hover:bg-(--surface-2) cursor-pointer"
          style={{ ...bodyTextStyle, color: "var(--text-2)" }}
        >
          <Sparkles size={11} />
          <span className="retro pixel-text-xs uppercase">{tr.leads.detail.aiAnalysis.title}</span>
        </button>
      </div>
    </aside>
  );
}

export function Leads() {
  const { lang } = useLanguage();
  const tr = translations[lang];
  const searchParams = useSearchParams();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [analysisLead, setAnalysisLead] = useState<Lead | null>(null);
  const [locallyViewed, setLocallyViewed] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const {
    leads,
    selected,
    loading,
    query, setQuery,
    status, setStatus,
    priority, setPriority,
    viewedFilter, setViewedFilter,
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
    hiddenLeads,
    hideLead,
    unhideLead,
  } = useLeads();
  const qParam = searchParams.get("q") ?? "";
  const appliedQ = useRef<string | null>(null);

  useEffect(() => {
    if (appliedQ.current === qParam) return;
    appliedQ.current = qParam;
    setQuery(qParam);
  }, [qParam, setQuery]);

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
        <LeadMetric label={tr.leads.kpi.highPriority} value={loading ? "..." : highPriorityCount} tone="var(--score-good)" />
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
                <button
                  type="button"
                  onClick={() => setShowHidden((v) => !v)}
                  className="flex items-center gap-1.5 border-2 border-(--border) bg-surface px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-(--surface-2)"
                  style={{ ...bodyTextStyle, color: "var(--text-2)" }}
                >
                  {showHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                  {tr.leads.hidden.toggle}
                  {hiddenLeads.length > 0 && (
                    <span className="retro pixel-text-xs border border-(--border) px-1" style={{ color: "var(--text-3)" }}>
                      {hiddenLeads.length}
                    </span>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(220px,1fr)_150px_150px_auto]">
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

                <div className="flex h-9 items-stretch border-2 border-(--border) bg-surface">
                  {[
                    { label: tr.leads.filters.viewedAll, value: null },
                    { label: tr.leads.filters.viewedNew, value: false },
                    { label: tr.leads.filters.viewedSeen, value: true },
                  ].map((option) => {
                    const isActive = viewedFilter === option.value;
                    const isNew = option.value === false;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => setViewedFilter(option.value)}
                        className="retro pixel-text-xs border-r-2 border-(--border) px-2 uppercase last:border-r-0 transition-colors hover:bg-(--surface-2)"
                        style={
                          isActive
                            ? { background: "var(--border)", color: "var(--surface)" }
                            : { color: isNew ? "var(--c-new)" : "var(--text-2)" }
                        }
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
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
                {showHidden ? (
                  hiddenLeads.map((h) => (
                    <tr
                      key={h.id}
                      className="bg-(--surface) transition-colors"
                      style={{ borderBottom: "1px solid #E4E4E7" }}
                    >
                      <td className="px-4 py-3" style={{ maxWidth: "260px", overflow: "hidden" }}>
                        <p className="font-bold truncate" style={{ color: "var(--text)" }}>{h.name}</p>
                        <p className="mt-1 text-xs font-semibold truncate" style={{ color: "var(--text-3)" }}>
                          {h.category} / {h.location}
                        </p>
                      </td>
                      <td className="w-44 px-4 py-3">
                        <ScoreBar score={h.score} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="retro pixel-text-xs" style={{ color: "var(--text-3)" }}>—</span>
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={h.priority as import("@/lib/data").LeadPriority} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => unhideLead(h.id)}
                          title={tr.leads.hidden.restore}
                          aria-label={tr.leads.hidden.restore}
                          className="retro pixel-text-xs inline-flex items-center gap-1.5 border-2 border-(--border) bg-(--pixel-highlight) px-2.5 py-1.5 uppercase transition-transform active:translate-x-px active:translate-y-px"
                          style={{ color: "var(--text)" }}
                        >
                          <Eye size={12} />
                          {tr.leads.hidden.restore}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  leads.map((lead) => {
                    const isSelected = selected?.id === lead.id;
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => {
                          setSelectedId(lead.id);
                          setSelectedLead(lead);
                          if (!lead.is_viewed && !locallyViewed.has(lead.id)) {
                            setLocallyViewed(prev => new Set(prev).add(lead.id));
                            markLeadViewed(lead.id).catch(() => {});
                          }
                        }}
                        className={cn(
                          "cursor-pointer transition-colors",
                          isSelected ? "bg-[var(--surface-2)]" : "bg-[var(--surface)] hover:bg-[var(--surface-2)]",
                        )}
                        style={{ borderBottom: "1px solid #E4E4E7" }}
                      >
                        <td className="px-4 py-3" style={{ maxWidth: "260px", overflow: "hidden" }}>
                          <p className="font-bold truncate" style={{ color: "var(--text)" }}>
                            {lead.name}
                          </p>
                          {!lead.is_viewed && !locallyViewed.has(lead.id) && (
                            <span className="retro pixel-text-xs ml-1 border border-[var(--c-new)] px-1 py-0.5 uppercase" style={{ color: "var(--c-new)", fontSize: "8px" }}>
                              {tr.leads.newBadge}
                            </span>
                          )}
                          <p className="mt-1 text-xs font-semibold truncate" style={{ color: "var(--text-3)" }}>
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
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              hideLead(lead);
                              if (selectedLead?.id === lead.id) setSelectedLead(null);
                            }}
                            title={tr.leads.hide}
                            aria-label={tr.leads.hide}
                            className="inline-flex h-7 w-7 items-center justify-center border-2 border-(--border) bg-surface text-text transition-colors hover:bg-(--surface-2)"
                          >
                            <EyeOff size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {showHidden && hiddenLeads.length === 0 && (
            <div className="p-8">
              <EmptyInsight title={tr.leads.hidden.empty} description="" compact />
            </div>
          )}

          {!showHidden && !loading && leads.length === 0 && (
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

          {!showHidden && loading && (
            <div className="p-8 text-center">
              <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                {tr.leads.loading}
              </p>
            </div>
          )}

          {/* Pagination */}
          {!showHidden && !loading && total > PAGE_SIZE && (
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

        <LeadDetail lead={selected} onAnalyze={() => selected && setAnalysisLead(selected)} />
      </div>

      {selectedLead && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" onClick={() => setSelectedLead(null)} />
          <div className="fixed inset-y-0 right-0 z-50 flex">
            <ExplorerLeadDetail
              lead={selectedLead}
              onClose={() => setSelectedLead(null)}
              onStatusChange={() => {
                refresh();
                setSelectedLead(null);
              }}
              onHide={() => {
                hideLead(selectedLead);
                setSelectedLead(null);
              }}
            />
          </div>
        </>
      )}

      {analysisLead && (
        <ExplorerAnalysisModal
          lead={analysisLead}
          isOpen
          onClose={() => setAnalysisLead(null)}
        />
      )}
    </div>
  );
}
