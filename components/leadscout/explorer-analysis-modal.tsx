"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Globe,
  Phone,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { StatusBadge, PriorityBadge, Tag } from "@/components/ui/badge";
import { ScoreBig, ScoreBar } from "@/components/ui/score-bar";
import { analyzeLead } from "@/lib/api/explorer";
import { markLeadViewed, updateLead } from "@/lib/api/leads";
import type { Lead } from "@/lib/data";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

interface ExplorerAnalysisModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
}

const bodyTextStyle = { fontFamily: "var(--font-body), system-ui, sans-serif" };
const pixelBadgeClass =
  "retro rounded-none border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 pixel-text-xs text-[var(--text)] shadow-none";

function getScoreBadgeStyle(score: number) {
  if (score > 60) return { background: "#3FAE2A", color: "#FFFFFF" };
  if (score > 40) return { background: "#5B5FEF", color: "#FFFFFF" };
  if (score > 20) return { background: "#9A4A00", color: "#FFFFFF" };
  return { background: "#E63946", color: "#FFFFFF" };
}

export function ExplorerAnalysisModal({
  lead,
  isOpen,
  onClose,
}: ExplorerAnalysisModalProps) {
  const { lang } = useLanguage();
  const tr = translations[lang].explorer.detail;
  const [analysis, setAnalysis] = useState<string | null>(lead.ai_analysis ?? null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isOpen) return;
    setAnalysis(lead.ai_analysis ?? null);
    setAnalysisError(null);
    setShowMore(false);
    if (!lead.is_viewed) {
      markLeadViewed(lead.id).catch(() => {});
    }
  }, [lead.id, lead.ai_analysis, lead.is_viewed, isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null;

  const modalTr = tr.analysisModal;

  async function handleAnalyze() {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await analyzeLead({
        lead_id: lead.id,
        name: lead.name,
        category: lead.category,
        location: lead.location,
        phone: lead.phone,
        website: lead.website,
        score: lead.score,
        issues: lead.issues,
        force_refresh: Boolean(analysis),
      });
      setAnalysis(res.analysis);
      updateLead(lead.id, { ai_analysis: res.analysis }).catch(() => {});
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("503") || msg.includes("not configurado") || msg.includes("not configured")) {
        setAnalysisError(tr.aiAnalysis.noApiKey);
      } else {
        setAnalysisError(tr.aiAnalysis.error);
      }
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="analysis-dialog-title"
        className="pixel-card-sm flex max-h-[90vh] w-full max-w-2xl animate-fade-up flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b-2 border-[var(--border)] bg-[var(--surface-2)] px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p
                className="retro pixel-text-xs uppercase"
                style={{ color: "var(--text-3)" }}
              >
                {tr.aiAnalysis.title}
              </p>
              <h2
                id="analysis-dialog-title"
                className="truncate text-base font-bold leading-snug"
                style={{ ...bodyTextStyle, color: "var(--text)" }}
              >
                {lead.name}
              </h2>
              <p
                className="mt-1 truncate text-sm"
                style={{ ...bodyTextStyle, color: "var(--text-2)" }}
              >
                {lead.category} / {lead.location}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className="retro pixel-text-sm border-2 border-[var(--border)] px-2 py-1 uppercase shadow-[1px_1px_0_0_var(--pixel-shadow)]"
                style={getScoreBadgeStyle(lead.score)}
              >
                {translations[lang].common.score} {lead.score}/100
              </span>
              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-none border-2 border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-[1px_1px_0_0_var(--pixel-shadow)] transition-transform hover:bg-[var(--pixel-highlight)] active:translate-x-px active:translate-y-px active:shadow-none"
                aria-label={tr.close}
              >
                <X size={13} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="pixel-inset grid gap-3 p-4 sm:grid-cols-3">
            <div className="min-w-0">
              <p
                className="retro pixel-text-xs uppercase font-bold"
                style={{ color: "var(--text-3)" }}
              >
                {modalTr.businessInfo}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Phone size={12} style={{ color: "var(--text)" }} />
                <span
                  className="truncate text-xs font-semibold"
                  style={{ ...bodyTextStyle, color: "var(--text)" }}
                >
                  {lead.phone ?? modalTr.unavailable}
                </span>
              </div>
            </div>
            <div className="min-w-0">
              <p
                className="retro pixel-text-xs uppercase font-bold"
                style={{ color: "var(--text-3)" }}
              >
                {tr.website}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Globe size={12} style={{ color: "var(--text)" }} />
                <span
                  className="truncate text-xs font-semibold"
                  style={{ ...bodyTextStyle, color: "var(--text)" }}
                >
                  {lead.website ?? modalTr.unavailable}
                </span>
              </div>
            </div>
            <div>
              <p
                className="retro pixel-text-xs uppercase font-bold"
                style={{ color: "var(--text-3)" }}
              >
                {tr.gaps}
              </p>
              <p
                className="mt-2 text-xs font-semibold"
                style={{ ...bodyTextStyle, color: "var(--text)" }}
              >
                {lead.issues.length}
              </p>
            </div>
          </div>

          <div className="border-t-2 border-[var(--border)] pt-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={13} style={{ color: "var(--pixel-highlight)" }} />
              <p
                className="retro pixel-text-xs uppercase font-bold"
                style={{ color: "var(--text-2)" }}
              >
                {tr.aiAnalysis.title}
              </p>
            </div>

            {!analysis && !isAnalyzing && (
              <button
                type="button"
                onClick={handleAnalyze}
                className="pixel-inset flex w-full cursor-pointer items-center justify-center gap-2 px-3 py-3 text-xs font-semibold transition-colors hover:bg-[var(--surface-2)]"
                style={{ ...bodyTextStyle, color: "var(--text-2)" }}
              >
                <Sparkles size={11} />
                {tr.aiAnalysis.cta}
              </button>
            )}

            {isAnalyzing && (
              <div className="pixel-inset flex items-center justify-center gap-2 px-3 py-4">
                <div
                  style={{
                    width: 12,
                    height: 12,
                    background: "var(--text)",
                    animation: "pixelSpin 1s steps(8, end) infinite",
                  }}
                />
                <span
                  className="text-xs font-semibold"
                  style={{ ...bodyTextStyle, color: "var(--text-2)" }}
                >
                  {tr.aiAnalysis.analyzing}
                </span>
              </div>
            )}

            {analysisError && (
              <p
                className="text-xs font-semibold"
                style={{ ...bodyTextStyle, color: "var(--c-hi)" }}
              >
                {analysisError}
              </p>
            )}

            {analysis && (
              <div className="space-y-3">
                <div className="pixel-inset p-3">
                  <p
                    className="whitespace-pre-line text-xs leading-relaxed"
                    style={{ ...bodyTextStyle, color: "var(--text)" }}
                  >
                    {analysis}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold underline underline-offset-2"
                  style={{ ...bodyTextStyle, color: "var(--text-3)" }}
                >
                  <RefreshCw size={12} />
                  {modalTr.reanalyze}
                </button>
              </div>
            )}
          </div>

          <div className="border-t-2 border-[var(--border)] pt-4">
            <button
              type="button"
              onClick={() => setShowMore((value) => !value)}
              className="flex w-full cursor-pointer items-center justify-between gap-2 px-0 py-1 text-xs font-semibold"
              style={{ ...bodyTextStyle, color: "var(--text-2)" }}
            >
              <span className="retro pixel-text-xs uppercase">
                {showMore ? modalTr.showLess : modalTr.showMore}
              </span>
              {showMore ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showMore && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p
                    className="retro pixel-text-xs uppercase font-bold mb-2"
                    style={{ color: "var(--text-2)" }}
                  >
                    {tr.status}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={lead.status} className={pixelBadgeClass} />
                    <PriorityBadge priority={lead.priority} className={pixelBadgeClass} />
                  </div>
                </div>

                <div>
                  <p
                    className="retro pixel-text-xs uppercase font-bold mb-2"
                    style={{ color: "var(--text-2)" }}
                  >
                    {tr.gaps}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {lead.issues.map((issue) => (
                      <Tag key={issue} className={pixelBadgeClass}>
                        {issue}
                      </Tag>
                    ))}
                  </div>
                </div>

                {lead.address && (
                  <div>
                    <p
                      className="retro pixel-text-xs uppercase font-bold mb-1"
                      style={{ color: "var(--text-2)" }}
                    >
                      {tr.address}
                    </p>
                    <p className="text-sm" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                      {lead.address}
                    </p>
                  </div>
                )}

                {lead.lastContact && (
                  <div>
                    <p
                      className="retro pixel-text-xs uppercase font-bold mb-1"
                      style={{ color: "var(--text-2)" }}
                    >
                      {tr.lastContact}
                    </p>
                    <p className="text-sm" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                      {lead.lastContact}
                    </p>
                  </div>
                )}

                <div className="pixel-inset p-4 sm:col-span-2">
                  <ScoreBig score={lead.score} />
                  <div className="mt-3">
                    <ScoreBar score={lead.score} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
