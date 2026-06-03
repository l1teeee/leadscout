import { getLeads } from "@/lib/api/leads";
import { PriorityBadge, Tag } from "@/components/ui/badge";
import { ScoreBar } from "@/components/ui/score-bar";
import { EmptyInsight } from "@/components/ui/empty-insight";
import type { LeadStatus } from "@/lib/data";

const bodyTextStyle = {
  fontFamily: "var(--font-body), system-ui, sans-serif",
};

const COLUMNS: { id: LeadStatus; label: string }[] = [
  { id: "nuevo",      label: "Nuevos" },
  { id: "contactado", label: "Contactados" },
  { id: "calificado", label: "Calificados" },
  { id: "perdido",    label: "Perdidos" },
];

export async function Oportunidades() {
  const leads = await getLeads().catch(() => []);

  return (
    <div className="w-full animate-fade-up p-4 sm:p-6 lg:p-8">
      <div data-stagger className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.id);
          return (
            <div key={col.id} className="pixel-card-sm bg-[#FAFAF9] p-3">
              <div
                className="mb-3 flex items-center justify-between bg-white px-3 py-2"
                style={{ border: "2px solid var(--pixel-border, #18181B)" }}
              >
                <div className="flex items-center gap-2">
                  <h2
                    className="retro pixel-text-xs font-black uppercase"
                    style={{ color: "var(--text-2)" }}
                  >
                    {col.label}
                  </h2>
                  <span
                    className="retro inline-flex h-6 min-w-6 items-center justify-center px-1 text-[10px] font-black"
                    style={{
                      background: "#FFFFFF",
                      border: "2px solid var(--pixel-border, #18181B)",
                      color: "#18181B",
                      boxShadow: "1px 1px 0 #18181B",
                    }}
                  >
                    {colLeads.length}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="group cursor-pointer bg-white p-4 transition-transform hover:-translate-y-0.5 hover:bg-[#F4F4F5]"
                    style={{
                      border: "2px solid var(--pixel-border, #18181B)",
                      boxShadow: "2px 2px 0 var(--pixel-shadow, #18181B)",
                    }}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <p
                        className="text-sm font-bold leading-snug"
                        style={{ ...bodyTextStyle, color: "var(--text)" }}
                      >
                        {lead.name}
                      </p>
                      <PriorityBadge priority={lead.priority} className="shrink-0" />
                    </div>

                    <p
                      className="mb-3 text-xs"
                      style={{ ...bodyTextStyle, color: "var(--text-3)" }}
                    >
                      {lead.category} · {lead.location}
                    </p>

                    <div className="pixel-inset mb-3 bg-white p-1">
                      <ScoreBar score={lead.score} />
                    </div>

                    <div className="mb-3 flex flex-wrap gap-1">
                      {lead.issues.length > 0 ? (
                        lead.issues.slice(0, 2).map((issue) => (
                          <Tag key={issue} className="rounded-none border border-[#18181B] text-[10px]">
                            {issue}
                          </Tag>
                        ))
                      ) : (
                        <p className="text-[11px] font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                          Brechas por confirmar.
                        </p>
                      )}
                      {lead.issues.length > 2 && (
                        <Tag className="rounded-none border border-[#18181B] text-[10px]">
                          +{lead.issues.length - 2}
                        </Tag>
                      )}
                    </div>

                    {lead.lastContact && (
                      <p
                        className="text-xs font-medium"
                        style={{ ...bodyTextStyle, color: "var(--text-3)" }}
                      >
                        Contacto: {lead.lastContact}
                      </p>
                    )}
                  </div>
                ))}

                {colLeads.length === 0 && (
                  <div
                    className="bg-white p-4 text-center"
                    style={{
                      border: "2px dashed var(--pixel-border, #18181B)",
                      color: "var(--text-3)",
                    }}
                  >
                    <EmptyInsight
                      title="Esta etapa esta lista"
                      description="Cuando clasifiques leads, apareceran aqui para mantener claro el avance comercial."
                      compact
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
