"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Filter, Globe2, Phone, Search, SlidersHorizontal } from "lucide-react";
import { getLeads } from "@/lib/api/leads";
import type { Lead, LeadPriority, LeadStatus } from "@/lib/data";
import { PriorityBadge, StatusBadge, Tag } from "@/components/ui/badge";
import { ScoreBar, ScoreBig } from "@/components/ui/score-bar";
import { EmptyInsight } from "@/components/ui/empty-insight";

const bodyTextStyle = {
  fontFamily: "var(--font-body), system-ui, sans-serif",
};

const STATUS_OPTIONS: { value: LeadStatus | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "calificado", label: "Calificado" },
  { value: "perdido", label: "Perdido" },
];

const PRIORITY_OPTIONS: { value: LeadPriority | ""; label: string }[] = [
  { value: "", label: "Todas" },
  { value: "alta", label: "Alta" },
  { value: "media", label: "Media" },
  { value: "baja", label: "Baja" },
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

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
  if (!lead) {
    return (
      <aside className="pixel-card-sm bg-white p-5">
        <EmptyInsight
          title="Selecciona un lead para ver su historia"
          description="Cuando encuentres oportunidades, acá verás su score, brechas digitales y datos de contacto."
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
            Perfil del lead
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
          Score operativo
        </p>
        <ScoreBar score={lead.score} showLabel className="mt-3" />
      </div>

      <div className="mt-5 space-y-2">
        <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text)" }}>
          Brechas detectadas
        </p>
        <div className="flex flex-wrap gap-1.5">
          {lead.issues.length > 0 ? (
            lead.issues.map((issue) => (
              <Tag key={issue}>{issue}</Tag>
            ))
          ) : (
            <EmptyInsight
              title="Aún estamos leyendo señales"
              description="Cuando exploremos más fuentes, acá aparecerán las brechas digitales detectadas."
              compact
            />
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-2 text-sm font-semibold" style={bodyTextStyle}>
        {!lead.phone && !lead.website && (
          <EmptyInsight
            title="Contacto por confirmar"
            description="Todavía estamos buscando canales confiables para este lead."
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
            {lead.lastContact ? `Último contacto: ${lead.lastContact}` : "Contacto pendiente por confirmar"}
          </span>
        </div>
      </div>
    </aside>
  );
}

export function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [priority, setPriority] = useState<LeadPriority | "">("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    getLeads()
      .then((data) => {
        setLeads(data);
        setSelectedId(data[0]?.id ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return leads.filter((lead) => {
      const haystack = normalize(`${lead.name} ${lead.category} ${lead.location} ${lead.issues.join(" ")}`);
      return (!q || haystack.includes(q)) &&
        (!status || lead.status === status) &&
        (!priority || lead.priority === priority);
    });
  }, [leads, priority, query, status]);

  const selected = filtered.find((lead) => lead.id === selectedId) ?? filtered[0] ?? null;
  const highPriority = filtered.filter((lead) => lead.priority === "alta").length;
  const noContact = filtered.filter((lead) => !lead.lastContact).length;
  const avgScore = filtered.length
    ? Math.round(filtered.reduce((sum, lead) => sum + lead.score, 0) / filtered.length)
    : 0;

  return (
    <div className="w-full animate-fade-up p-4 sm:p-6 lg:p-8">
      <div data-stagger className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <LeadMetric label="Leads visibles" value={loading ? "..." : filtered.length} />
        <LeadMetric label="Prioridad alta" value={loading ? "..." : highPriority} tone="var(--c-hi)" />
        <LeadMetric label="Por contactar" value={loading ? "..." : noContact} tone="var(--c-mid)" />
        <LeadMetric label="Score promedio" value={loading ? "..." : avgScore} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="pixel-card-sm min-w-0 overflow-hidden bg-white">
          <div className="border-b-2 border-[var(--border)] bg-[var(--surface-2)] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                  Gestión comercial
                </p>
                <h2 className="retro pixel-text-sm mt-1 uppercase" style={{ color: "var(--text)" }}>
                  Base de leads
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(220px,1fr)_150px_150px]">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" size={14} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar negocio, rubro o brecha"
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
                    {STATUS_OPTIONS.map((option) => (
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
                    {PRIORITY_OPTIONS.map((option) => (
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
                  {["Negocio", "Score", "Estado", "Prioridad", "Contacto"].map((heading) => (
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
                          {lead.lastContact ?? "Pendiente"}
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
                title={leads.length === 0 ? "Aún no hay leads en tu workspace" : "No encontramos coincidencias"}
                description={
                  leads.length === 0
                    ? "Explorá una zona para empezar a llenar tu base. Pronto aparecerán negocios listos para revisar."
                    : "Probá ampliar estado, prioridad o búsqueda para volver a encontrar oportunidades."
                }
                action={leads.length === 0 ? "Empieza en Explorer" : "Ajusta los filtros activos"}
                compact
              />
            </div>
          )}

          {loading && (
            <div className="p-8 text-center">
              <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                Cargando leads...
              </p>
            </div>
          )}
        </section>

        <LeadDetail lead={selected} />
      </div>
    </div>
  );
}
