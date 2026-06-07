"use client";

import { useEffect, useState } from "react";
import { X, Phone, Globe, Sparkles, Copy, Check, MapPin } from "lucide-react";
import { StatusBadge, PriorityBadge, Tag } from "@/components/ui/badge";
import { ScoreBar, ScoreBig } from "@/components/ui/score-bar";
import { Button } from "@/components/ui/button";
import { EmptyInsight } from "@/components/ui/empty-insight";
import { SCRAPING_ZONES } from "@/lib/explorer-data";
import { updateLead, updateLeadStatus } from "@/lib/api/leads";
import type { ExplorerLeadDetailProps } from "@/types/explorer";
import { ExplorerAnalysisModal } from "./explorer-analysis-modal";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const bodyTextStyle = { fontFamily: "var(--font-body), system-ui, sans-serif" };
const pixelBadgeClass =
  "retro rounded-none border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 pixel-text-xs text-text shadow-none";
const pixelButtonClass =
  "retro rounded-none border-2 border-[var(--border)] pixel-text-xs uppercase transition-transform active:translate-x-px active:translate-y-px active:shadow-none";

export function ExplorerLeadDetail({ lead, onClose }: ExplorerLeadDetailProps) {
  const { lang } = useLanguage();
  const tr = translations[lang].explorer.detail;
  const hasIssues = lead.issues.length > 0;
  const hasContact = Boolean(lead.phone || lead.website);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updated, setUpdated] = useState(false);

  const mapsUrl = lead.latitude != null && lead.longitude != null
    ? `https://www.google.com/maps?q=${lead.latitude},${lead.longitude}`
    : lead.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.address)}`
      : lead.name
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name)}`
        : null;
  const [copiedField, setCopiedField] = useState<"phone" | "website" | null>(null);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setIsUpdating(false);
      setUpdated(false);
    });
    return () => {
      cancelled = true;
    };
  }, [lead.id]);

  async function handleLastContactChange(value: string) {
    updateLead(lead.id, { last_contact: value || null }).catch(() => {});
  }

  async function handleMarkContacted() {
    setIsUpdating(true);
    try {
      await updateLeadStatus(lead.id, "contactado");
      setUpdated(true);
    } catch {
    } finally {
      setIsUpdating(false);
    }
  }

  function copyToClipboard(value: string, field: "phone" | "website") {
    if (!navigator?.clipboard) return;

    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    }).catch(() => {});
  }

  return (
    <>
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
              className="flex h-7 w-7 items-center justify-center rounded-none border-2 border-(--border) bg-surface text-text shadow-[1px_1px_0_0_var(--pixel-shadow)] transition-transform hover:bg-(--pixel-highlight) active:translate-x-px active:translate-y-px active:shadow-none"
              aria-label={tr.close}
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
                {tr.digitalScore}
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
                {tr.status}
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
                {tr.gaps}
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
                    title={tr.gapsEmpty.title}
                    description={tr.gapsEmpty.description}
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
                {tr.contact}
              </p>
              {!hasContact && (
                <EmptyInsight
                  title={tr.contactEmpty.title}
                  description={tr.contactEmpty.description}
                  compact
                />
              )}
              {lead.phone && (
                <div className="pixel-inset mb-2 flex items-center gap-2 px-3 py-2">
                  <Phone size={12} style={{ color: "var(--text)" }} />
                  <span className="flex-1 text-sm" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                    {lead.phone}
                  </span>
                  <button
                    onClick={() => copyToClipboard(lead.phone!, "phone")}
                    className="flex h-5 w-5 items-center justify-center rounded-none border border-(--border) bg-surface transition-transform hover:bg-(--pixel-highlight) active:translate-x-px active:translate-y-px"
                    aria-label="Copy phone"
                  >
                    {copiedField === "phone" ? <Check size={10} style={{ color: "var(--text)" }} /> : <Copy size={10} style={{ color: "var(--text-2)" }} />}
                  </button>
                </div>
              )}
              {lead.website && (
                <div className="pixel-inset flex items-center gap-2 px-3 py-2">
                  <Globe size={12} style={{ color: "var(--text)" }} />
                  <span className="flex-1 min-w-0 text-sm truncate" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                    {lead.website}
                  </span>
                  <button
                    onClick={() => copyToClipboard(lead.website!, "website")}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-none border border-(--border) bg-surface transition-transform hover:bg-(--pixel-highlight) active:translate-x-px active:translate-y-px"
                    aria-label="Copy website"
                  >
                    {copiedField === "website" ? <Check size={10} style={{ color: "var(--text)" }} /> : <Copy size={10} style={{ color: "var(--text-2)" }} />}
                  </button>
                </div>
              )}
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 pixel-inset flex items-center gap-2 px-3 py-2 transition-colors hover:bg-(--surface-2)"
                >
                  <MapPin size={12} style={{ color: "var(--text)" }} />
                  <span className="text-sm font-semibold" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                    Ver en Google Maps
                  </span>
                </a>
              )}
            </div>

            <div className="border-t-2 border-[var(--border)] pt-5">
              <button
                onClick={() => setIsAnalysisModalOpen(true)}
                className="w-full pixel-inset flex items-center justify-center gap-2 px-3 py-3 text-xs font-semibold transition-colors hover:bg-(--surface-2) cursor-pointer"
                style={{ ...bodyTextStyle, color: "var(--text-2)" }}
              >
                <Sparkles size={11} />
                <span className="retro pixel-text-xs uppercase">{tr.aiAnalysis.title}</span>
              </button>
            </div>

            <div className="border-t-2 border-(--border) pt-5">
              <p
                className="retro pixel-text-xs uppercase font-bold mb-2"
                style={{ color: "var(--text-2)" }}
              >
                {tr.lastContact}
              </p>
              <input
                type="date"
                defaultValue={lead.lastContact ?? ""}
                onChange={(e) => handleLastContactChange(e.target.value)}
                className="pixel-inset w-full px-3 py-2 text-sm bg-surface border-0 outline-none"
                style={{ ...bodyTextStyle, color: "var(--text)" }}
              />
            </div>

            <div className="flex flex-col gap-3 border-t-2 border-[var(--border)] pt-5">
              <Button
                variant="primary"
                onClick={handleMarkContacted}
                disabled={isUpdating || updated}
                className={`${pixelButtonClass} h-10 w-full justify-center`}
              >
                {isUpdating ? (
                  "Marcando..."
                ) : updated ? (
                  <>
                    <Check size={13} />
                    Contactado
                  </>
                ) : (
                  tr.markContacted
                )}
              </Button>
              <Button
                variant="secondary"
                className={`${pixelButtonClass} h-10 w-full justify-center bg-[var(--surface-2)] text-text hover:bg-(--pixel-highlight)`}
              >
                {tr.history}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ExplorerAnalysisModal
        lead={lead}
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
      />
    </>
  );
}
