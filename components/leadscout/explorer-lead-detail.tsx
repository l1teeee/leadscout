"use client";

import { useEffect, useState } from "react";
import { X, Phone, Globe, Sparkles, Copy, Check, MapPin, EyeOff, ExternalLink, Plus, Trash2 } from "lucide-react";
import { StatusBadge, PriorityBadge, Tag } from "@/components/ui/badge";
import { ScoreBar, ScoreBig } from "@/components/ui/score-bar";
import { Button } from "@/components/ui/button";
import { EmptyInsight } from "@/components/ui/empty-insight";
import { SCRAPING_ZONES } from "@/lib/explorer-data";
import { updateLeadStatus, updateLeadSocialProfiles } from "@/lib/api/leads";
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

const PLATFORM_META: Record<string, { abbr: string; color: string }> = {
  facebook:  { abbr: "FB", color: "#1877F2" },
  instagram: { abbr: "IG", color: "#E1306C" },
  linkedin:  { abbr: "LI", color: "#0077B5" },
  tiktok:    { abbr: "TK", color: "#010101" },
  x:         { abbr: "X",  color: "#14171A" },
  youtube:   { abbr: "YT", color: "#FF0000" },
  whatsapp:  { abbr: "WA", color: "#25D366" },
};

const PLATFORM_OPTIONS = [
  "facebook", "instagram", "linkedin", "tiktok", "x", "youtube", "whatsapp", "otro",
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

export function ExplorerLeadDetail({ lead, onClose, onStatusChange, onHide }: ExplorerLeadDetailProps) {
  const { lang } = useLanguage();
  const tr = translations[lang].explorer.detail;
  const [socialProfiles, setSocialProfiles] = useState<SocialProfile[]>([]);
  const hasIssues = lead.issues.length > 0;
  const hasContact = Boolean(lead.phone || lead.website);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Social edit state
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [newPlatform, setNewPlatform] = useState("facebook");
  const [newUrl, setNewUrl] = useState("");
  const [isSavingProfiles, setIsSavingProfiles] = useState(false);

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
      setIsAddingProfile(false);
      setNewPlatform("facebook");
      setNewUrl("");
      setSocialProfiles(lead.social_profiles ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [lead.id]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Build merged social links (website detection + persisted profiles), deduped by URL
  const socialLinks: SocialProfile[] = [];
  const seenSocial = new Set<string>();
  if (lead.website && websiteSocial) {
    // Check if this website URL has a persisted entry (to carry contacted state)
    const persisted = socialProfiles.find(p => p.url === lead.website);
    socialLinks.push({ platform: websiteSocial, url: lead.website, contacted: persisted?.contacted });
    seenSocial.add(lead.website);
  }
  for (const p of socialProfiles) {
    if (!seenSocial.has(p.url)) {
      socialLinks.push(p);
      seenSocial.add(p.url);
    }
  }

  // Profiles that can be deleted (not from website field)
  const websiteUrl = lead.website ?? null;
  function isDeletable(url: string): boolean {
    return url !== websiteUrl;
  }

  async function persistProfiles(profiles: SocialProfile[]) {
    setIsSavingProfiles(true);
    try {
      await updateLeadSocialProfiles(lead.id, profiles);
      setSocialProfiles(profiles);
    } catch {
    } finally {
      setIsSavingProfiles(false);
    }
  }

  async function handleAddProfile() {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    const newProfile: SocialProfile = { platform: newPlatform, url: trimmed, contacted: false };
    const nextPersistedProfiles = [...socialProfiles.filter(p => p.url !== trimmed), newProfile];
    await persistProfiles(nextPersistedProfiles);
    setNewUrl("");
    setNewPlatform("facebook");
    setIsAddingProfile(false);
  }

  async function handleRemoveProfile(url: string) {
    const nextPersistedProfiles = socialProfiles.filter(p => p.url !== url);
    await persistProfiles(nextPersistedProfiles);
  }

  async function handleToggleContacted(url: string) {
    // For website-derived profile: it's not in socialProfiles state, add it with contacted flag
    const existing = socialProfiles.find(p => p.url === url);
    let next: SocialProfile[];
    if (existing) {
      next = socialProfiles.map(p => p.url === url ? { ...p, contacted: !p.contacted } : p);
    } else {
      // website-classified profile not yet persisted — add it with contacted:true
      const platform = classifySocial(url) ?? "otro";
      next = [...socialProfiles, { platform, url, contacted: true }];
    }
    await persistProfiles(next);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 overflow-y-auto animate-slide-in p-5 pl-0 md:relative md:inset-auto md:w-[384px] md:shrink-0 md:p-5 md:pl-0"
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

            {/* Social section — always visible */}
            <div className="border-t-2 border-[var(--border)] pt-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <p className="retro pixel-text-xs uppercase font-bold" style={{ color: "var(--text-2)" }}>
                    {tr.social}
                  </p>
                  {socialLinks.length > 0 && (
                    <span
                      className="retro pixel-text-xs inline-flex items-center justify-center rounded-none border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-0.5 leading-none"
                      style={{ color: "var(--text-2)" }}
                    >
                      {socialLinks.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { setIsAddingProfile(v => !v); setNewUrl(""); setNewPlatform("facebook"); }}
                  disabled={isSavingProfiles}
                  className="flex h-6 w-6 items-center justify-center rounded-none border-2 border-[var(--border)] bg-[var(--surface-2)] transition-transform hover:bg-[var(--pixel-highlight)] active:translate-x-px active:translate-y-px active:shadow-none disabled:opacity-40"
                  aria-label={tr.addSocialProfile}
                >
                  <Plus size={11} style={{ color: "var(--text)" }} />
                </button>
              </div>

              {socialLinks.length === 0 && !isAddingProfile && (
                <EmptyInsight
                  title={tr.noSocialProfiles}
                  description=""
                  compact
                />
              )}

              {socialLinks.length > 0 && (
                <div className="grid gap-2 mb-2">
                  {socialLinks.map((p) => {
                    const meta = PLATFORM_META[p.platform];
                    const href = safeHref(p.url);
                    const isContacted = Boolean(p.contacted);
                    return (
                      <div
                        key={p.url}
                        className="pixel-inset flex items-center gap-2 px-3 py-2 transition-colors"
                        style={isContacted ? { borderColor: "var(--score-good)", background: "color-mix(in srgb, var(--score-good) 8%, var(--surface))" } : undefined}
                      >
                        {/* Contacted checkbox */}
                        <button
                          onClick={() => handleToggleContacted(p.url)}
                          disabled={isSavingProfiles}
                          title={tr.socialContacted}
                          aria-label={tr.socialContacted}
                          className="shrink-0 flex h-4 w-4 items-center justify-center rounded-none border-2 transition-colors disabled:opacity-40"
                          style={{
                            borderColor: isContacted ? "var(--score-good)" : "var(--border)",
                            background: isContacted ? "var(--score-good)" : "var(--surface)",
                          }}
                        >
                          {isContacted && <Check size={9} style={{ color: "#fff" }} />}
                        </button>
                        {/* Platform badge */}
                        <span
                          className="retro pixel-text-xs shrink-0 inline-flex items-center justify-center rounded-none px-1.5 py-0.5 font-bold leading-none"
                          style={{
                            background: meta?.color ?? "var(--text-3)",
                            color: "#fff",
                            minWidth: "2rem",
                            opacity: isContacted ? 1 : 0.85,
                          }}
                        >
                          {meta?.abbr ?? p.platform.slice(0, 2).toUpperCase()}
                        </span>
                        {/* Platform name + link */}
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-0 truncate text-sm capitalize underline underline-offset-2 hover:opacity-70"
                            style={{ ...bodyTextStyle, color: isContacted ? "var(--score-good)" : "var(--text)" }}
                            title={tr.openProfile}
                          >
                            {p.platform}
                          </a>
                        ) : (
                          <span
                            className="flex-1 min-w-0 truncate text-sm capitalize"
                            style={{ ...bodyTextStyle, color: isContacted ? "var(--score-good)" : "var(--text)" }}
                          >
                            {p.platform}
                          </span>
                        )}
                        {href && (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            tabIndex={-1}
                            aria-hidden
                          >
                            <ExternalLink size={11} style={{ color: "var(--text-2)" }} />
                          </a>
                        )}
                        {/* Remove button — only for non-website entries */}
                        {isDeletable(p.url) && (
                          <button
                            onClick={() => handleRemoveProfile(p.url)}
                            disabled={isSavingProfiles}
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-none border border-(--border) bg-surface transition-transform hover:bg-(--pixel-highlight) active:translate-x-px active:translate-y-px disabled:opacity-40"
                            aria-label={tr.removeSocial}
                          >
                            <Trash2 size={10} style={{ color: "var(--text-2)" }} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Inline add form */}
              {isAddingProfile && (
                <div className="pixel-inset px-3 py-3 space-y-2 mt-1">
                  <div className="flex gap-2">
                    <select
                      value={newPlatform}
                      onChange={e => setNewPlatform(e.target.value)}
                      className="retro pixel-text-xs rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--text)] focus:outline-none"
                      style={{ fontFamily: "var(--font-pixel), monospace" }}
                    >
                      {PLATFORM_OPTIONS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                    placeholder={tr.socialUrl}
                    className="w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--text-2)]"
                    style={bodyTextStyle}
                    onKeyDown={e => { if (e.key === "Enter") handleAddProfile(); if (e.key === "Escape") setIsAddingProfile(false); }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddProfile}
                      disabled={isSavingProfiles || !newUrl.trim()}
                      className={`${pixelButtonClass} flex-1 py-1.5 bg-[var(--surface-2)] hover:bg-[var(--pixel-highlight)] disabled:opacity-40`}
                    >
                      {tr.saveSocial}
                    </button>
                    <button
                      onClick={() => setIsAddingProfile(false)}
                      disabled={isSavingProfiles}
                      className={`${pixelButtonClass} px-3 py-1.5 bg-[var(--surface)] hover:bg-[var(--pixel-highlight)] disabled:opacity-40`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
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
                onClick={() => setShowHistory((v) => !v)}
                className={`${pixelButtonClass} h-10 w-full justify-center hover:bg-(--pixel-highlight) ${showHistory ? "bg-[var(--border)] text-[var(--surface)]" : "bg-[var(--surface-2)] text-text"}`}
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

            {showHistory && (
              <div className="space-y-3 border-t-2 border-[var(--border)] pt-5">
                <p className="retro pixel-text-xs uppercase font-bold" style={{ color: "var(--text-2)" }}>
                  {tr.historyTitle}
                </p>
                {lead.lastContact ? (
                  <div className="pixel-inset px-3 py-2">
                    <p className="retro pixel-text-xs uppercase mb-1" style={{ color: "var(--text-3)" }}>
                      {tr.lastContact}
                    </p>
                    <p className="text-sm" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                      {lead.lastContact}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                    {tr.noContact}
                  </p>
                )}
                {lead.ai_analysis ? (
                  <div className="pixel-inset px-3 py-3 space-y-2">
                    <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                      {tr.prevAnalysis}
                    </p>
                    <p className="text-xs leading-relaxed whitespace-pre-line" style={{ ...bodyTextStyle, color: "var(--text-2)" }}>
                      {lead.ai_analysis}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                    {tr.noAnalysis}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <ExplorerAnalysisModal
        lead={lead}
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        onSocialProfiles={(profiles) => {
          setSocialProfiles(prev => {
            const seenUrls = new Set(prev.map(p => p.url));
            const merged = [...prev];
            for (const p of profiles) {
              if (!seenUrls.has(p.url)) {
                merged.push(p);
                seenUrls.add(p.url);
              }
            }
            return merged;
          });
        }}
      />
    </>
  );
}
