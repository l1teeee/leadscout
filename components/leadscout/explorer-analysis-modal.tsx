"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Copy,
  Globe,
  MessageSquare,
  Phone,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { analyzeLead, askLeadQuestion, generateOutreachMessage, type SocialProfile } from "@/lib/api/explorer";
import { markLeadViewed, updateLead } from "@/lib/api/leads";
import type { Lead } from "@/lib/data";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";
import { hasAiContext, launchAiContextGate } from "@/lib/ai-context-gate";
import { cn } from "@/lib/utils";

interface ExplorerAnalysisModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSocialProfiles?: (profiles: SocialProfile[]) => void;
}

interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

const bodyTextStyle = { fontFamily: "var(--font-body), system-ui, sans-serif" };

function chatStorageKey(leadId: number | string) {
  return `ls_chat_${leadId}`;
}

function loadPersistedMessages(leadId: number | string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(chatStorageKey(leadId));
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function saveMessages(leadId: number | string, msgs: ChatMessage[]) {
  try {
    if (msgs.length === 0) {
      localStorage.removeItem(chatStorageKey(leadId));
    } else {
      localStorage.setItem(chatStorageKey(leadId), JSON.stringify(msgs));
    }
  } catch {}
}

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
  onSocialProfiles,
}: ExplorerAnalysisModalProps) {
  const router = useRouter();
  const { lang } = useLanguage();
  const tr = translations[lang].explorer.detail;
  const modalTr = tr.analysisModal;
  const chatTr = modalTr.chat;

  const [analysis, setAnalysis] = useState<string | null>(lead.ai_analysis ?? null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [socialProfiles, setSocialProfilesLocal] = useState<SocialProfile[]>([]);
  const [outreachPlatform, setOutreachPlatform] = useState<string | null>(null);
  const [outreachMessage, setOutreachMessage] = useState<string | null>(null);
  const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false);
  const [outreachError, setOutreachError] = useState<string | null>(null);
  const [copiedOutreach, setCopiedOutreach] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setAnalysis(lead.ai_analysis ?? null);
    setAnalysisError(null);
    setMessages(loadPersistedMessages(lead.id));
    setChatInput("");
    setChatError(null);
    setSocialProfilesLocal([]);
    setOutreachPlatform(null);
    setOutreachMessage(null);
    setOutreachError(null);
    setCopiedOutreach(false);
    if (!lead.is_viewed) {
      markLeadViewed(lead.id).catch(() => {});
    }
  }, [lead.id, lead.ai_analysis, lead.is_viewed, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    saveMessages(lead.id, messages);
  }, [messages, lead.id, isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatLoading]);

  if (!isOpen) return null;

  function handleClearChat() {
    setMessages([]);
    saveMessages(lead.id, []);
  }

  async function handleAnalyze() {
    if (!hasAiContext()) {
      await launchAiContextGate({
        lang,
        onGoToContext: () => {
          onClose();
          router.push("/ai-context");
        },
      });
      return;
    }

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
      if (res.social_profiles?.length) {
        onSocialProfiles?.(res.social_profiles);
        setSocialProfilesLocal(res.social_profiles);
      }
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

  async function handleGenerateOutreach(platform: string) {
    if (isGeneratingOutreach) return;
    setOutreachPlatform(platform);
    setOutreachMessage(null);
    setOutreachError(null);
    setCopiedOutreach(false);
    setIsGeneratingOutreach(true);
    try {
      const res = await generateOutreachMessage({
        lead_id: lead.id,
        name: lead.name,
        category: lead.category,
        location: lead.location,
        phone: lead.phone ?? undefined,
        website: lead.website ?? undefined,
        score: lead.score,
        issues: lead.issues,
        platform,
        social_profiles: socialProfiles,
      });
      setOutreachMessage(res.message);
    } catch {
      setOutreachError("No se pudo generar el mensaje. Intenta de nuevo.");
    } finally {
      setIsGeneratingOutreach(false);
    }
  }

  function handleCopyOutreach() {
    if (!outreachMessage) return;
    navigator.clipboard?.writeText(outreachMessage).then(() => {
      setCopiedOutreach(true);
      setTimeout(() => setCopiedOutreach(false), 1800);
    }).catch(() => {});
  }

  async function handleSendMessage() {
    const question = chatInput.trim().replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "");
    if (!question || isChatLoading) return;

    setChatInput("");
    setChatError(null);
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setIsChatLoading(true);

    try {
      const res = await askLeadQuestion({
        lead_id: lead.id,
        name: lead.name,
        category: lead.category,
        location: lead.location,
        phone: lead.phone ?? undefined,
        website: lead.website ?? undefined,
        score: lead.score,
        issues: lead.issues,
        analysis: analysis ?? undefined,
        question,
      });
      setMessages((prev) => [...prev, { role: "ai", content: res.answer }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("503")) {
        setChatError(tr.aiAnalysis.noApiKey);
      } else {
        setChatError(chatTr.error);
      }
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsChatLoading(false);
      inputRef.current?.focus();
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="analysis-dialog-title"
        className="pixel-card-sm flex w-full max-w-5xl animate-fade-up flex-col"
        style={{ height: "min(88vh, 720px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 border-b-2 border-(--border) bg-(--surface-2) px-5 py-4">
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
                className="mt-0.5 truncate text-sm"
                style={{ ...bodyTextStyle, color: "var(--text-2)" }}
              >
                {lead.category} / {lead.location}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className="retro pixel-text-sm border-2 border-(--border) px-2 py-1 uppercase shadow-[1px_1px_0_0_var(--pixel-shadow)]"
                style={getScoreBadgeStyle(lead.score)}
              >
                {translations[lang].common.score} {lead.score}/100
              </span>
              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-none border-2 border-(--border) bg-surface text-text shadow-[1px_1px_0_0_var(--pixel-shadow)] transition-transform hover:bg-(--pixel-highlight) active:translate-x-px active:translate-y-px active:shadow-none"
                aria-label={tr.close}
              >
                <X size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Body: analysis (left column) + chat (right column) */}
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">

          {/* Analysis area - scrollable */}
          <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4">
            {/* Business info grid */}
            <div className="pixel-inset grid gap-3 p-4 sm:grid-cols-3">
              <div className="min-w-0">
                <p className="retro pixel-text-xs uppercase font-bold" style={{ color: "var(--text-3)" }}>
                  {modalTr.businessInfo}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Phone size={12} style={{ color: "var(--text)" }} />
                  <span className="truncate text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                    {lead.phone ?? modalTr.unavailable}
                  </span>
                </div>
              </div>
              <div className="min-w-0">
                <p className="retro pixel-text-xs uppercase font-bold" style={{ color: "var(--text-3)" }}>
                  {tr.website}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Globe size={12} style={{ color: "var(--text)" }} />
                  <span className="truncate text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                    {lead.website ?? modalTr.unavailable}
                  </span>
                </div>
              </div>
              <div>
                <p className="retro pixel-text-xs uppercase font-bold" style={{ color: "var(--text-3)" }}>
                  {tr.gaps}
                </p>
                <p className="mt-2 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                  {lead.issues.length}
                </p>
              </div>
            </div>

            {/* AI Analysis section */}
            <div>
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={13} style={{ color: "var(--pixel-highlight)" }} />
                  <p className="retro pixel-text-xs uppercase font-bold" style={{ color: "var(--text-2)" }}>
                    {tr.aiAnalysis.title}
                  </p>
                </div>
                {analysis && (
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold underline underline-offset-2 disabled:opacity-40"
                    style={{ ...bodyTextStyle, color: "var(--text-3)" }}
                  >
                    <RefreshCw size={11} />
                    {modalTr.reanalyze}
                  </button>
                )}
              </div>

              {!analysis && !isAnalyzing && (
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="pixel-inset flex w-full cursor-pointer items-center justify-center gap-2 px-3 py-4 text-xs font-semibold transition-colors hover:bg-(--surface-2)"
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

              {analysis && !isAnalyzing && (
                <div className="pixel-inset p-3">
                  <p className="whitespace-pre-line text-xs leading-relaxed" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                    {analysis}
                  </p>
                </div>
              )}
            </div>

            {/* Outreach message section */}
            {analysis && !isAnalyzing && (() => {
              const websitePlatform = (() => {
                if (!lead.website) return null;
                try {
                  let h = new URL(lead.website, "https://x.invalid").hostname.toLowerCase();
                  if (h.startsWith("www.")) h = h.slice(4);
                  for (const [p, d] of [["facebook","facebook.com"],["instagram","instagram.com"],["tiktok","tiktok.com"]] as [string,string][]) {
                    if (h === d || h.endsWith(`.${d}`)) return p;
                  }
                } catch { return null; }
                return null;
              })();
              const detectedPlatforms = new Set<string>();
              if (websitePlatform) detectedPlatforms.add(websitePlatform);
              for (const p of socialProfiles) detectedPlatforms.add(p.platform);
              const platformsToShow = detectedPlatforms.size > 0
                ? Array.from(detectedPlatforms)
                : ["whatsapp", "facebook", "email"];

              const PLATFORM_LABELS: Record<string, string> = {
                whatsapp: "WhatsApp",
                facebook: "Facebook",
                instagram: "Instagram",
                tiktok: "TikTok",
                linkedin: "LinkedIn",
                x: "X",
                email: "Email",
              };

              return (
                <div className="border-t-2 border-(--border) pt-4 mt-2">
                  <div className="mb-3 flex items-center gap-2">
                    <MessageSquare size={12} style={{ color: "var(--pixel-highlight)" }} />
                    <p className="retro pixel-text-xs uppercase font-bold" style={{ color: "var(--text-2)" }}>
                      Mensaje de contacto
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {platformsToShow.map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => handleGenerateOutreach(platform)}
                        disabled={isGeneratingOutreach}
                        className={cn(
                          "retro pixel-text-xs border-2 px-3 py-1.5 uppercase transition-transform active:translate-x-px active:translate-y-px active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed",
                          outreachPlatform === platform
                            ? "border-(--border) bg-(--pixel-highlight) shadow-none"
                            : "border-(--border) bg-surface shadow-[1px_1px_0_0_var(--pixel-shadow)] hover:bg-(--surface-2)"
                        )}
                        style={{ color: "var(--text)" }}
                      >
                        {isGeneratingOutreach && outreachPlatform === platform ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ width: 8, height: 8, background: "var(--text)", display: "inline-block", animation: "pixelSpin 1s steps(8, end) infinite" }} />
                            {PLATFORM_LABELS[platform] ?? platform}
                          </span>
                        ) : (
                          PLATFORM_LABELS[platform] ?? platform
                        )}
                      </button>
                    ))}
                  </div>

                  {outreachError && (
                    <p className="text-xs" style={{ ...bodyTextStyle, color: "var(--c-hi)" }}>
                      {outreachError}
                    </p>
                  )}

                  {outreachMessage && !isGeneratingOutreach && (
                    <div className="pixel-inset p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                          {PLATFORM_LABELS[outreachPlatform ?? ""] ?? outreachPlatform}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleCopyOutreach}
                            className="flex items-center gap-1 px-2 py-1 border border-(--border) bg-surface text-xs hover:bg-(--surface-2) transition-colors"
                            style={{ ...bodyTextStyle, color: "var(--text-2)" }}
                          >
                            {copiedOutreach ? <Check size={10} /> : <Copy size={10} />}
                            {copiedOutreach ? "Copiado" : "Copiar"}
                          </button>
                        </div>
                      </div>
                      <p className="whitespace-pre-line text-xs leading-relaxed" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                        {outreachMessage}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Chat section - right column on desktop, bottom on mobile */}
          <div
            className={cn(
              "shrink-0 flex flex-col border-t-2 border-(--border) md:border-l-2 md:border-t-0",
              isChatOpen
                ? "h-70 w-full md:h-auto md:w-80"
                : "h-auto w-full md:h-auto md:w-auto"
            )}
          >
            {/* Chat header */}
            <div
              className="flex shrink-0 items-center gap-2 border-b-2 border-(--border) px-4 py-2.5"
              style={{ background: "var(--surface-2)" }}
            >
              <MessageSquare size={12} style={{ color: "var(--text-2)" }} />
              <p className="retro pixel-text-xs flex-1 whitespace-nowrap uppercase" style={{ color: "var(--text-2)" }}>
                {chatTr.title}
              </p>
              {messages.length > 0 && isChatOpen && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  title={chatTr.clearChat}
                  className="flex h-6 w-6 items-center justify-center rounded-none border-2 border-(--border) bg-surface text-text shadow-[1px_1px_0_0_var(--pixel-shadow)] transition-transform hover:bg-(--pixel-highlight) active:translate-x-px active:translate-y-px active:shadow-none"
                >
                  <Trash2 size={10} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsChatOpen((v) => !v)}
                title={isChatOpen ? "Collapse" : "Expand"}
                className="flex h-6 w-6 items-center justify-center rounded-none border-2 border-(--border) bg-surface text-text shadow-[1px_1px_0_0_var(--pixel-shadow)] transition-transform hover:bg-(--pixel-highlight) active:translate-x-px active:translate-y-px active:shadow-none"
              >
                <ChevronRight
                  size={12}
                  className={cn(
                    "transition-transform",
                    isChatOpen ? "rotate-90 md:rotate-0" : "-rotate-90 md:rotate-180"
                  )}
                />
              </button>
            </div>

            {isChatOpen && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ minHeight: 0 }}>
                  {messages.length === 0 && !isChatLoading && (
                    <p className="text-xs" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                      {chatTr.empty}
                    </p>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={cn(
                          "max-w-[82%] px-3 py-2 text-xs leading-relaxed",
                          msg.role === "user"
                            ? "border-2 border-(--border) bg-(--pixel-highlight) shadow-[1px_1px_0_0_var(--pixel-shadow)]"
                            : "pixel-inset"
                        )}
                        style={{ ...bodyTextStyle, color: "var(--text)" }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="pixel-inset flex items-center gap-2 px-3 py-2">
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            background: "var(--text-2)",
                            animation: "pixelSpin 1s steps(8, end) infinite",
                          }}
                        />
                        <span className="text-xs" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                          {chatTr.thinking}
                        </span>
                      </div>
                    </div>
                  )}
                  {chatError && (
                    <p className="text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--c-hi)" }}>
                      {chatError}
                    </p>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input bar */}
                <div className="shrink-0 flex gap-2 border-t-2 border-(--border) p-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={chatTr.placeholder}
                    maxLength={500}
                    disabled={isChatLoading}
                    className="flex-1 pixel-inset px-3 py-2 text-xs bg-surface border-0 outline-none disabled:opacity-50"
                    style={{ ...bodyTextStyle, color: "var(--text)" }}
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || isChatLoading}
                    className="retro pixel-text-xs flex shrink-0 items-center gap-1.5 border-2 border-(--border) bg-(--pixel-highlight) px-3 py-2 uppercase shadow-[1px_1px_0_0_var(--pixel-shadow)] transition-transform active:translate-x-px active:translate-y-px active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ color: "var(--text)" }}
                  >
                    <Send size={11} />
                    {chatTr.send}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
