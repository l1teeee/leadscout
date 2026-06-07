"use client";

import { useState } from "react";
import { X, Phone, Globe, Sparkles } from "lucide-react";
import { StatusBadge, PriorityBadge, Tag } from "@/components/ui/badge";
import { ScoreBar, ScoreBig } from "@/components/ui/score-bar";
import { Button } from "@/components/ui/button";
import { EmptyInsight } from "@/components/ui/empty-insight";
import { SCRAPING_ZONES } from "@/lib/explorer-data";
import { analyzeLead } from "@/lib/api/explorer";
import type { ExplorerLeadDetailProps } from "@/types/explorer";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const bodyTextStyle = { fontFamily: "var(--font-body), system-ui, sans-serif" };
const pixelBadgeClass =
  "retro rounded-none border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 pixel-text-xs text-[var(--text)] shadow-none";
const pixelButtonClass =
  "retro rounded-none border-2 border-[var(--border)] pixel-text-xs uppercase transition-transform active:translate-x-px active:translate-y-px active:shadow-none";

export function ExplorerLeadDetail({ lead, onClose }: ExplorerLeadDetailProps) {
  const { lang } = useLanguage();
  const tr = translations[lang].explorer.detail;
  const hasIssues = lead.issues.length > 0;
  const hasContact = Boolean(lead.phone || lead.website);

  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  async function handleAnalyze() {
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
                <span className="text-sm" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                  {lead.phone}
                </span>
              </div>
            )}
            {lead.website && (
              <div className="pixel-inset flex items-center gap-2 px-3 py-2">
                <Globe size={12} style={{ color: "var(--text)" }} />
                <span className="text-sm truncate" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                  {lead.website}
                </span>
              </div>
            )}
          </div>

          {/* AI Analysis */}
          <div className="border-t-2 border-[var(--border)] pt-5">
            <div className="flex items-center gap-2 mb-3">
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
                onClick={handleAnalyze}
                className="w-full pixel-inset flex items-center justify-center gap-2 px-3 py-3 text-xs font-semibold transition-colors hover:bg-(--surface-2) cursor-pointer"
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
                <span className="text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-2)" }}>
                  {tr.aiAnalysis.analyzing}
                </span>
              </div>
            )}

            {analysisError && (
              <p className="text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--c-hi)" }}>
                {analysisError}
              </p>
            )}

            {analysis && (
              <div className="space-y-3">
                <div className="pixel-inset p-3 bg-surface">
                  <p
                    className="text-xs leading-relaxed whitespace-pre-line"
                    style={{ ...bodyTextStyle, color: "var(--text)" }}
                  >
                    {analysis}
                  </p>
                </div>
                <button
                  onClick={handleAnalyze}
                  className="text-xs font-semibold underline-offset-2 underline cursor-pointer"
                  style={{ ...bodyTextStyle, color: "var(--text-3)" }}
                >
                  {tr.aiAnalysis.cta}
                </button>
              </div>
            )}
          </div>

          {lead.lastContact && (
            <div className="border-t-2 border-[var(--border)] pt-5">
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

          <div className="flex flex-col gap-3 border-t-2 border-[var(--border)] pt-5">
            <Button
              variant="primary"
              className={`${pixelButtonClass} h-10 w-full justify-center`}
            >
              {tr.markContacted}
            </Button>
            <Button
              variant="secondary"
              className={`${pixelButtonClass} h-10 w-full justify-center bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--pixel-highlight)]`}
            >
              {tr.history}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
