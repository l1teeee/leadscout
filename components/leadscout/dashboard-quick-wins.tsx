"use client";

import { useState } from "react";
import { EmptyInsight } from "@/components/ui/empty-insight";
import { ExplorerLeadDetail } from "@/components/leadscout/explorer-lead-detail";
import type { Lead } from "@/lib/data";

const bodyTextStyle = { fontFamily: "var(--font-body), system-ui, sans-serif" };

function getScoreBadgeStyle(score: number) {
  if (score > 60) return { background: "#3FAE2A", color: "#FFFFFF" };
  if (score > 40) return { background: "#5B5FEF", color: "#FFFFFF" };
  if (score > 20) return { background: "#9A4A00", color: "#FFFFFF" };
  return { background: "#E63946", color: "#FFFFFF" };
}

interface Props {
  leads: Lead[];
  priorityLabels: Record<string, string>;
}

export function DashboardQuickWins({ leads, priorityLabels }: Props) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  return (
    <>
      <section className="pixel-card-sm flex min-h-[420px] flex-col bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="retro pixel-text-xs uppercase" style={{ color: "var(--text)" }}>
              QUICK WINS
            </h2>
            <p className="mt-2 text-sm font-medium" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
              Leads de alto score sin contactar
            </p>
          </div>
          {leads.length > 0 && (
            <p className="text-xs font-bold" style={{ ...bodyTextStyle, color: "var(--text-2)" }}>
              {leads.length} oportunidades listas
            </p>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="pixel-card-sm flex items-center gap-3 bg-(--surface-2) p-3"
            >
              <span
                className="retro pixel-text-xs flex h-10 w-12 shrink-0 items-center justify-center border-2 border-(--border) font-black tabular-nums"
                style={getScoreBadgeStyle(lead.score)}
              >
                {lead.score}
              </span>
              <div className="min-w-0 flex-1">
                <button
                  onClick={() => setSelectedLead(lead)}
                  className="truncate font-bold text-left w-full cursor-pointer hover:underline underline-offset-2"
                  style={{ ...bodyTextStyle, color: "var(--text)" }}
                >
                  {lead.name}
                </button>
                <p className="mt-1 truncate text-xs" style={{ ...bodyTextStyle, color: "var(--text-2)" }}>
                  {lead.category}
                </p>
              </div>
              <span className="retro pixel-text-xs shrink-0 border-2 border-(--border) bg-white px-2 py-1 uppercase text-(--text)">
                {priorityLabels[lead.priority] ?? lead.priority}
              </span>
            </div>
          ))}
          {leads.length === 0 && (
            <EmptyInsight
              title="Sin quick wins"
              description="No hay leads nuevos con score alto por ahora."
              compact
            />
          )}
        </div>
      </section>

      {selectedLead && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setSelectedLead(null)}
          />
          <div className="fixed inset-y-0 right-0 z-50 flex">
            <ExplorerLeadDetail
              lead={selectedLead}
              onClose={() => setSelectedLead(null)}
            />
          </div>
        </>
      )}
    </>
  );
}
