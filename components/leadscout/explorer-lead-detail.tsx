"use client";

import { useEffect, useState } from "react";
import { X, Phone, Globe, Sparkles, Copy, Check, MapPin, EyeOff, ExternalLink } from "lucide-react";
import { StatusBadge, PriorityBadge, Tag } from "@/components/ui/badge";
import { ScoreBar, ScoreBig } from "@/components/ui/score-bar";
import { Button } from "@/components/ui/button";
import { EmptyInsight } from "@/components/ui/empty-insight";
import { SCRAPING_ZONES } from "@/lib/explorer-data";
import { updateLeadStatus } from "@/lib/api/leads";
import type { ExplorerLeadDetailProps } from "@/types/explorer";
import type { SocialProfile } from "@/lib/api/explorer";
import { ExplorerAnalysisModal } from "./explorer-analysis-modal";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";
import { safeHref } from "@/lib/utils";
import { hideLead as persistHideLead } from "@/lib/hidden-leads";

const bodyTextStyle = { fontFamily: "var(--font-body), system-ui, sans-serif" };

const SOCIAL_HOSTS: [string, string][] = [
  ["facebook", "facebook.com"],
  ["facebook", "fb.com"],
  ["instagram", "instagram.com"],
  ["linkedin", "linkedin.com"],
  ["tiktok", "tiktok.com"],
  ["x", "x.com"],
  ["x", "twitter.com"],
  ["youtube", "youtube.com"],
  ["youtube", "youtu.be"],
  ["whatsapp", "wa.me"],
  ["whatsapp", "whatsapp.com"],
];

function classifySocial(url?: string | null): string | null {
  if (!url) return null;
  try {
    let host = new URL(url, "https://placeholder.invalid").hostname.toLowerCase();
    if (host.startsWith("www.")) host = host.slice(4);
    for (const [platform, domain] of SOCIAL_HOSTS) {
      if (host === domain || host.endsWith(`.${domain}`)) return platform;
    }
    return null;
  } catch {
    return null;
  }
}
const pixelBadgeClass =
  "retro rounded-none border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 pixel-text-xs text-text shadow-none";
const pixelButtonClass =
  "retro rounded-none border-2 border-[var(--border)] pixel-text-xs uppercase transition-transform active:translate-x-px active:translate-y-px active:shadow-none";

export function ExplorerLeadDetail({ lead, onClose, onStatusChange, onHide }: ExplorerLeadDetailProps & { onHide?: () => void }) {
  const { lang } = useLanguage();
  const tr = translations[lang].explorer.detail;
  const [socialProfiles, setSocialProfiles] = useState<SocialProfile[]>([]);
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
      setSocialProfiles([]);
    });
    return () => {
      cancelled = true;
    };
  }, [lead.id]);

  function handleHide() {
    if (onHide) {
      onHide();
      return;
    }
    persistHideLead({
      id: lead.id,
      name: lead.name,
      category: lead.category,
      location: lead.location,
      score: lead.score,
      priority: lead.priority,
    });
    onClose();
  }

  async function handleMarkContacted() {
    setIsUpdating(true);
    try {
      await updateLeadStatus(lead.id, "contactado");
      setUpdated(true);
      onStatusChange?.("contactado");
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

  const websiteSocial = classifySocial(lead.website);
  const showWebsite = Boolean(lead.website && !websiteSocial);
  const socialLinks: SocialProfile[] = [];
  const seenSocial = new Set<string>();
  if (lead.website && websiteSocial) {
    socialLinks.push({ platform: websiteSocial, url: lead.website });
    seenSocial.add(lead.website);
  }
  for (const p of socialProfiles) {
    if (!seenSocial.has(p.url)) {
      socialLinks.push(p);
      seenSocial.add(p.url);
    }
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
                    aria-label={tr.copyPhone}
                  >
                    {copiedField === "phone" ? <Check size={10} style={{ color: "var(--text)" }} /> : <Copy size={10} style={{ color: "var(--text-2)" }} />}
                  </button>
                </div>
              )}
              {showWebsite && (
                <div className="pixel-inset flex items-center gap-2 px-3 py-2">
                  <Globe size={12} style={{ color: "var(--text)" }} />
                  {safeHref(lead.website) ? (
                    <a
                      href={safeHref(lead.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-0 truncate text-sm underline underline-offset-2 hover:opacity-70"
                      style={{ ...bodyTextStyle, color: "var(--text)" }}
                      title={tr.openSite}
                    >
                      {lead.website}
                    </a>
                  ) : (
                    <span className="flex-1 min-w-0 truncate text-sm" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                      {lead.website}
                    </span>
                  )}
                  <button
                    onClick={() => copyToClipboard(lead.website!, "website")}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-none border border-(--border) bg-surface transition-transform hover:bg-(--pixel-highlight) active:translate-x-px active:translate-y-px"
                    aria-label={tr.copyWebsite}
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
                    {tr.viewInMaps}
                  </span>
                </a>
              )}
            </div>

            {socialLinks.length > 0 && (
              <div className="border-t-2 border-(--border) pt-5">
                <p
                  className="retro pixel-text-xs uppercase font-bold mb-2"
                  style={{ color: "var(--text-2)" }}
                >
                  {tr.socialMedia}
                </p>
                <div className="grid gap-2">
                  {socialLinks.map((p) => (
                    <a
                      key={p.url}
                      href={safeHref(p.url) ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pixel-inset flex items-center gap-2 px-3 py-2 transition-colors hover:bg-(--surface-2)"
                      title={tr.openProfile}
                    >
                      <Globe size={12} style={{ color: "var(--text)" }} />
                      <span
                        className="flex-1 min-w-0 truncate text-sm capitalize"
                        style={{ ...bodyTextStyle, color: "var(--text)" }}
                      >
                        {p.platform}
                      </span>
                      <ExternalLink size={12} style={{ color: "var(--text-2)" }} />
                    </a>
                  ))}
                </div>
              </div>
            )}

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

            <div className="flex flex-col gap-3 border-t-2 border-[var(--border)] pt-5">
              <Button
                variant="primary"
                onClick={handleMarkContacted}
                disabled={isUpdating || updated}
                className={`${pixelButtonClass} h-10 w-full justify-center`}
              >
                {isUpdating ? (
                  tr.markingContacted
                ) : updated ? (
                  <>
                    <Check size={13} />
                    {tr.contacted}
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
              <button
                type="button"
                onClick={handleHide}
                className={`${pixelButtonClass} flex h-10 w-full items-center justify-center gap-2 bg-surface text-text hover:bg-(--pixel-highlight)`}
              >
                <EyeOff size={13} />
                {translations[lang].leads.hide}
              </button>
            </div>
          </div>
        </div>
      </div>
      <ExplorerAnalysisModal
        lead={lead}
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        onSocialProfiles={setSocialProfiles}
      />
    </>
  );
}
