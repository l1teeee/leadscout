import { X, Phone, Globe } from "lucide-react";
import { StatusBadge, PriorityBadge, Tag } from "@/components/ui/badge";
import { ScoreBar, ScoreBig } from "@/components/ui/score-bar";
import { Button } from "@/components/ui/button";
import { EmptyInsight } from "@/components/ui/empty-insight";
import { SCRAPING_ZONES } from "@/lib/explorer-data";
import type { ExplorerLeadDetailProps } from "@/types/explorer";

const bodyTextStyle = { fontFamily: "var(--font-body), system-ui, sans-serif" };
const pixelBadgeClass =
  "retro rounded-none border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 pixel-text-xs text-[var(--text)] shadow-none";
const pixelButtonClass =
  "retro rounded-none border-2 border-[var(--border)] pixel-text-xs uppercase transition-transform active:translate-x-px active:translate-y-px active:shadow-none";

export function ExplorerLeadDetail({ lead, onClose }: ExplorerLeadDetailProps) {
  const hasIssues = lead.issues.length > 0;
  const hasContact = Boolean(lead.phone || lead.website);

  return (
    <div
      className="w-[384px] shrink-0 overflow-y-auto animate-slide-in p-5 pl-0"
      style={{ background: "transparent" }}
    >
      <div className="pixel-card-sm h-full overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b-2 border-[var(--border)] bg-[var(--surface-2)] px-5 py-4">
          <div>
            <h2
              className="text-base font-bold leading-snug"
              style={{ ...bodyTextStyle, color: "var(--text)" }}
            >
              {lead.name}
            </h2>
            <p className="mt-1 text-sm" style={{ ...bodyTextStyle, color: "var(--text-2)" }}>
              {lead.category} / {SCRAPING_ZONES[lead.id] ?? lead.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-none border-2 border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-[1px_1px_0_0_var(--pixel-shadow)] transition-transform hover:bg-[var(--pixel-highlight)] active:translate-x-px active:translate-y-px active:shadow-none"
            aria-label="Cerrar detalle"
          >
            <X size={13} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          <div className="pixel-inset p-4">
            <p
              className="retro pixel-text-xs uppercase font-bold mb-2"
              style={{ color: "var(--text-2)" }}
            >
              Score digital
            </p>
            <ScoreBig score={lead.score} />
            <div className="mt-3">
              <ScoreBar score={lead.score} />
            </div>
          </div>

          <div className="border-t-2 border-[var(--border)] pt-5">
            <p
              className="retro pixel-text-xs uppercase font-bold mb-2"
              style={{ color: "var(--text-2)" }}
            >
              Estado
            </p>
            <div className="flex gap-2">
              <StatusBadge status={lead.status} className={pixelBadgeClass} />
              <PriorityBadge priority={lead.priority} className={pixelBadgeClass} />
            </div>
          </div>

          <div className="border-t-2 border-[var(--border)] pt-5">
            <p
              className="retro pixel-text-xs uppercase font-bold mb-2"
              style={{ color: "var(--text-2)" }}
            >
              Brechas detectadas
            </p>
            <div className="flex flex-wrap gap-2">
              {hasIssues ? (
                lead.issues.map((issue) => (
                  <Tag key={issue} className={pixelBadgeClass}>
                    {issue}
                  </Tag>
                ))
              ) : (
                <EmptyInsight
                  title="Aun estamos leyendo senales"
                  description="Cuando detectemos brechas digitales claras, apareceran aqui para priorizar este negocio."
                  compact
                />
              )}
            </div>
          </div>

          <div className="border-t-2 border-[var(--border)] pt-5">
            <p
              className="retro pixel-text-xs uppercase font-bold mb-2"
              style={{ color: "var(--text-2)" }}
            >
              Contacto
            </p>
            {!hasContact && (
              <EmptyInsight
                title="Contacto por confirmar"
                description="Seguiremos explorando fuentes para encontrar telefono, sitio web o canales confiables."
                compact
              />
            )}
            {lead.phone && (
              <div className="pixel-inset mb-2 flex items-center gap-2 px-3 py-2">
                <Phone size={12} style={{ color: "var(--text)" }} />
                <span className="text-sm" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                  {lead.phone}
                </span>
              </div>
            )}
            {lead.website && (
              <div className="pixel-inset flex items-center gap-2 px-3 py-2">
                <Globe size={12} style={{ color: "var(--text)" }} />
                <span className="text-sm" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                  {lead.website}
                </span>
              </div>
            )}
          </div>

          {lead.lastContact && (
            <div className="border-t-2 border-[var(--border)] pt-5">
              <p
                className="retro pixel-text-xs uppercase font-bold mb-1"
                style={{ color: "var(--text-2)" }}
              >
                Ultimo contacto
              </p>
              <p className="text-sm" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                {lead.lastContact}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t-2 border-[var(--border)] pt-5">
            <Button
              variant="primary"
              className={`${pixelButtonClass} h-10 w-full justify-center`}
            >
              Marcar como contactado
            </Button>
            <Button
              variant="secondary"
              className={`${pixelButtonClass} h-10 w-full justify-center bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--pixel-highlight)]`}
            >
              Ver historial
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
