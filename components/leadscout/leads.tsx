"use client";

import { CalendarClock, Filter, Globe2, Phone, Search, SlidersHorizontal } from "lucide-react";
import { useLeads } from "@/lib/hooks/use-leads";
import { translations } from "@/lib/i18n";
import type { Lead, LeadPriority, LeadStatus } from "@/lib/data";
import { useLanguage } from "@/contexts/language-context";
import { PriorityBadge, StatusBadge, Tag } from "@/components/ui/badge";
import { ScoreBar, ScoreBig } from "@/components/ui/score-bar";
import { EmptyInsight } from "@/components/ui/empty-insight";

const bodyTextStyle = {
  fontFamily: "var(--font-body), system-ui, sans-serif",
};

function LeadMetric({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="pixel-card-sm bg-white p-4">
      <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
        {label}
      </p>
      <p className="retro mt-3 text-2xl font-black tabular-nums" style={{ color: tone ?? "var(--text)" }}>
        {value}
      </p>
    </div>
  );
}

function LeadDetail({ lead }: { lead: Lead | null }) {
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

      <div className="mt-5 pixel-inset bg-[var(--surface-2)] p-3">
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
          <div className="flex items-center gap-2 border-2 border-[var(--border)] bg-[var(--surface)] px-3 py-2">
            <Phone size={14} />
            <span className="truncate" style={{ color: "var(--text-2)" }}>
              {lead.phone}
            </span>
          </div>
        )}
        {lead.website && (
          <div className="flex items-center gap-2 border-2 border-[var(--border)] bg-[var(--surface)] px-3 py-2">
            <Globe2 size={14} />
            <span className="truncate" style={{ color: "var(--text-2)" }}>
              {lead.website}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 border-2 border-[var(--border)] bg-[var(--surface)] px-3 py-2">
          <CalendarClock size={14} />
          <span className="truncate" style={{ color: "var(--text-2)" }}>
            {lead.lastContact ? `${tr.leads.detail.lastContact}: ${lead.lastContact}` : tr.leads.detail.pendingContact}
          </span>
        </div>
      </div>
    </aside>
  );
}

export function Leads() {
  const { lang } = useLanguage();
  const tr = translations[lang];
  const {
    leads,
    filtered,
    selected,
    loading,
    query, setQuery,
    status, setStatus,
    priority, setPriority,
    setSelectedId,
    highPriorityCount,
    noContactCount,
    avgScore,
  } = useLeads();

  const statusOptions: { value: LeadStatus | ""; label: string }[] = [
    { value: "", label: tr.leads.filters.statusAll },
    { value: "nuevo", label: tr.leadStatus.nuevo },
    { value: "contactado", label: tr.leadStatus.contactado },
    { value: "calificado", label: tr.leadStatus.calificado },
    { value: "perdido", label: tr.leadStatus.perdido },
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
        <LeadMetric label={tr.leads.kpi.visible} value={loading ? "..." : filtered.length} />
        <LeadMetric label={tr.leads.kpi.highPriority} value={loading ? "..." : highPriorityCount} tone="var(--c-hi)" />
        <LeadMetric label={tr.leads.kpi.toContact} value={loading ? "..." : noContactCount} tone="var(--c-mid)" />
        <LeadMetric label={tr.leads.kpi.avgScore} value={loading ? "..." : avgScore} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="pixel-card-sm min-w-0 overflow-hidden bg-white">
          <div className="border-b-2 border-[var(--border)] bg-[var(--surface-2)] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                  {tr.leads.eyebrow}
                </p>
                <h2 className="retro pixel-text-sm mt-1 uppercase" style={{ color: "var(--text)" }}>
                  {tr.leads.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(220px,1fr)_150px_150px]">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" size={14} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={tr.leads.searchPlaceholder}
                    className="h-9 w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--text)] placeholder:text-[var(--text-3)]"
                    style={bodyTextStyle}
                  />
                </label>

                <label className="relative block">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" size={13} />
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as LeadStatus | "")}
                    className="h-9 w-full appearance-none rounded-none border-2 border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-xs font-semibold text-[var(--text)]"
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
                    className="h-9 w-full appearance-none rounded-none border-2 border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-xs font-semibold text-[var(--text)]"
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
                  {tr.leads.tableHeaders.map((heading) => (
                    <th
                      key={heading}
                      className="retro border-b-2 border-[var(--border)] px-4 py-3 text-left text-[10px] uppercase"
                      style={{ color: "var(--text-3)" }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => {
                  const isSelected = selected?.id === lead.id;
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedId(lead.id)}
                      className="cursor-pointer transition-colors hover:bg-[var(--surface-2)]"
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

          {!loading && filtered.length === 0 && (
            <div className="p-8">
              <EmptyInsight
                title={leads.length === 0 ? tr.leads.emptyWorkspace.title : tr.leads.emptyFiltered.title}
                description={
                  leads.length === 0
                    ? tr.leads.emptyWorkspace.description
                    : tr.leads.emptyFiltered.description
                }
                action={leads.length === 0 ? tr.leads.emptyWorkspace.action : tr.leads.emptyFiltered.action}
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
        </section>

        <LeadDetail lead={selected} />
      </div>
    </div>
  );
}
