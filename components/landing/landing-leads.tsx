"use client";

import { Filter, PhoneCall, Sparkles, Users } from "lucide-react";
import { useIntersection } from "@/hooks/use-intersection";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

const kpis = [
  { label: "leads", value: "247", color: "var(--c-new)" },
  { label: "prioridad alta", value: "31", color: "var(--c-hi)" },
  { label: "por contactar", value: "89", color: "var(--c-qualified)" },
  { label: "score promedio", value: "74", color: "var(--text)" },
];

const leadRows = [
  { business: "Café Tortoni", score: 91, status: "nuevo", priority: "alta", color: "var(--c-hi)" },
  { business: "Librería El Ateneo", score: 78, status: "contactado", priority: "media", color: "var(--c-new)" },
  { business: "Estudio García", score: 63, status: "calificado", priority: "baja", color: "var(--c-qualified)" },
  { business: "Ferretería Roma", score: 55, status: "nuevo", priority: "media", color: "var(--c-new)" },
];

const leadBullets = [
  "Scoring automático para priorizar cada conversación.",
  "Estados de pipeline visibles en toda la operación.",
  "Brechas digitales detectadas para abrir el contacto.",
  "Panel de contacto con contexto comercial completo.",
  "Filtros rápidos por score, estado y prioridad.",
];

export function LandingLeads() {
  const { ref: mockRef, isVisible: isMockVisible } = useIntersection<HTMLDivElement>();
  const { ref: textRef, isVisible: isTextVisible } = useIntersection<HTMLDivElement>();

  return (
    <section className="w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-20" style={{ background: "var(--surface)" }}>
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div ref={mockRef} className={`pixel-card reveal-right p-4 sm:p-5 ${isMockVisible ? "is-visible" : ""}`}>
          <div className="flex items-center justify-between gap-3 pb-4" style={{ borderBottom: "2px solid var(--border)" }}>
            <div className="flex items-center gap-3">
              <span
                className="flex size-10 items-center justify-center"
                style={{ background: "var(--text)", border: "2px solid var(--border)", color: "var(--pixel-highlight)" }}
              >
                <Users size={18} strokeWidth={2.5} />
              </span>
              <div>
                <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                  LEADS
                </p>
                <p className="text-sm font-extrabold" style={{ ...bodyFont, color: "var(--text)" }}>
                  Prioridad comercial
                </p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center active:translate-x-0.5 active:translate-y-0.5"
              aria-label="Filtrar leads"
              style={{
                background: "var(--surface-2)",
                border: "2px solid var(--border)",
                boxShadow: "2px 2px 0 0 var(--pixel-shadow)",
                color: "var(--text)",
                transition: "transform 150ms var(--ease-out), opacity 150ms var(--ease-out)",
              }}
            >
              <Filter size={16} />
            </button>
          </div>

          <div data-stagger className="mt-5 grid grid-cols-2 gap-3">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="lnd-kpi-card p-3" style={{ background: "var(--surface-2)", border: "2px solid var(--border)" }}>
                <div className="mb-2 h-2 w-8" style={{ background: kpi.color }} />
                <p className="retro text-xl font-black" style={{ color: "var(--text)" }}>
                  {kpi.value}
                </p>
                <p className="mt-1 text-xs font-bold" style={{ ...bodyFont, color: "var(--text-2)" }}>
                  {kpi.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 overflow-x-auto" style={{ border: "2px solid var(--border)" }}>
            <table className="pixel-table w-full min-w-[560px]" style={bodyFont}>
              <thead style={{ background: "var(--surface-2)", color: "var(--text-2)" }}>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-extrabold uppercase">Negocio</th>
                  <th className="px-3 py-3 text-left text-xs font-extrabold uppercase">Score</th>
                  <th className="px-3 py-3 text-left text-xs font-extrabold uppercase">Estado</th>
                  <th className="px-3 py-3 text-left text-xs font-extrabold uppercase">Prior</th>
                </tr>
              </thead>
              <tbody style={{ background: "var(--surface)", color: "var(--text)" }}>
                {leadRows.map((lead) => (
                  <tr key={lead.business} className="lnd-row">
                    <td className="px-3 py-3 text-sm font-extrabold">{lead.business}</td>
                    <td className="px-3 py-3">
                      <span className="retro pixel-text-xs px-2 py-1" style={{ background: "var(--surface-2)", border: "2px solid var(--border)", color: "var(--text)" }}>
                        {lead.score}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs font-bold uppercase" style={{ color: "var(--text-2)" }}>
                      {lead.status}
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-extrabold uppercase" style={{ color: lead.color }}>
                        {lead.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div ref={textRef} className={`reveal-left ${isTextVisible ? "is-visible" : ""}`}>
          <p className="retro pixel-text-sm uppercase" style={{ color: "var(--text-2)" }}>
            SCORE IA
          </p>
          <h2 className="retro mt-4 text-2xl font-black uppercase leading-tight sm:text-4xl" style={{ color: "var(--text)" }}>
            Gestiona cada prospecto con score de IA
          </h2>
          <p className="mt-5 text-base font-medium leading-7" style={{ ...bodyFont, color: "var(--text-2)" }}>
            La IA analiza señales comerciales, presencia digital y contexto local para ordenar tus leads por probabilidad de conversión.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-2 text-xs font-extrabold" style={{ ...bodyFont, background: "var(--surface-2)", border: "2px solid var(--border)", color: "var(--text)" }}>
              <Sparkles size={14} />
              Score vivo
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-2 text-xs font-extrabold" style={{ ...bodyFont, background: "var(--surface-2)", border: "2px solid var(--border)", color: "var(--text)" }}>
              <PhoneCall size={14} />
              Contacto directo
            </span>
          </div>
          <ul data-stagger className="mt-7 space-y-3">
            {leadBullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 text-sm font-semibold leading-6" style={{ ...bodyFont, color: "var(--text)" }}>
                <span className="mt-2 size-2 shrink-0" style={{ background: "var(--c-new)", border: "1px solid var(--border)" }} />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
