"use client";

import { useEffect, useState } from "react";
import { Clock, Eye, Lightbulb, Sparkles, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";
import { getAiContext as getServerAiContext, updateAiContext } from "@/lib/api/settings";
import {
  BUSINESS_MAX,
  CONSTRAINTS_MAX,
  clearAiContext,
  composeContext,
  getAiContext as getLocalAiContext,
  syncAiContextFromServer,
} from "@/lib/ai-context";

const bodyTextStyle = { fontFamily: "var(--font-body), system-ui, sans-serif" };

const textareaCls =
  "w-full resize-y rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text)] focus:border-[var(--text)] focus:outline-none";

function FieldHeader({ label, count, max }: { label: string; count: number; max: number }) {
  const near = count > max * 0.9;
  return (
    <div className="mb-1 flex items-center justify-between">
      <span className="block text-xs font-semibold" style={{ color: "var(--text-2)" }}>
        {label}
      </span>
      <span
        className="text-xs font-semibold tabular-nums"
        style={{ color: near ? "var(--c-hi)" : "var(--text-3)" }}
      >
        {count}/{max}
      </span>
    </div>
  );
}

export function AiContextPage() {
  const { lang } = useLanguage();
  const copy = translations[lang].aiContext;

  const [businessContext, setBusinessContext] = useState("");
  const [constraints, setConstraints] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const c = getLocalAiContext();
    setBusinessContext(c.businessContext);
    setConstraints(c.constraints);
    setUpdatedAt(c.updatedAt ?? null);

    getServerAiContext()
      .then((data) => {
        setBusinessContext(data.business_context);
        setConstraints(data.constraints);
        setUpdatedAt(data.updated_at);
        syncAiContextFromServer(data);
      })
      .catch(() => undefined);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const composed = composeContext(businessContext, constraints);
  const isActive = composed.trim().length > 0;
  const approxTokens = Math.ceil(composed.length / 4);

  async function handleSave() {
    setSaving(true);
    try {
      const data = await updateAiContext({
        business_context: businessContext,
        constraints,
      });
      syncAiContextFromServer(data);
      setUpdatedAt(data.updated_at);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    updateAiContext({ business_context: "", constraints: "" }).catch(() => undefined);
    clearAiContext();
    setBusinessContext("");
    setConstraints("");
    setUpdatedAt(null);
  }

  const lastUpdatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleString(lang === "es" ? "es-SV" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : copy.never;

  return (
    <div className="w-full animate-fade-up p-4 sm:p-6 lg:p-8">
      <div data-stagger className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Editor */}
        <section className="pixel-card-sm overflow-hidden bg-[var(--surface)]">
          <div className="border-b-2 border-[var(--border)] bg-[var(--surface-2)] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-[var(--border)] bg-[var(--pixel-highlight)] shadow-[2px_2px_0_var(--pixel-shadow)]">
                <Sparkles size={18} />
              </div>
              <div className="min-w-0">
                <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                  {copy.eyebrow}
                </p>
                <h1 className="mt-1 text-2xl font-black leading-tight" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                  {copy.title}
                </h1>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-sm font-semibold" style={{ ...bodyTextStyle, color: "var(--text-2)" }}>
              {copy.subtitle}
            </p>
          </div>

          <div className="grid gap-5 p-5">
            <label className="block">
              <FieldHeader label={copy.businessLabel} count={businessContext.length} max={BUSINESS_MAX} />
              <textarea
                value={businessContext}
                onChange={(e) => setBusinessContext(e.target.value.slice(0, BUSINESS_MAX))}
                maxLength={BUSINESS_MAX}
                placeholder={copy.businessPlaceholder}
                rows={6}
                className={textareaCls}
                style={bodyTextStyle}
              />
              <button
                type="button"
                onClick={() => setBusinessContext(copy.exampleBusiness.slice(0, BUSINESS_MAX))}
                className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold underline underline-offset-2 hover:opacity-70"
                style={{ ...bodyTextStyle, color: "var(--text-3)" }}
              >
                <Sparkles size={11} />
                {copy.exampleFill}
              </button>
            </label>

            <label className="block">
              <FieldHeader label={copy.constraintsLabel} count={constraints.length} max={CONSTRAINTS_MAX} />
              <textarea
                value={constraints}
                onChange={(e) => setConstraints(e.target.value.slice(0, CONSTRAINTS_MAX))}
                maxLength={CONSTRAINTS_MAX}
                placeholder={copy.constraintsPlaceholder}
                rows={6}
                className={textareaCls}
                style={bodyTextStyle}
              />
              <button
                type="button"
                onClick={() => setConstraints(copy.exampleConstraints.slice(0, CONSTRAINTS_MAX))}
                className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold underline underline-offset-2 hover:opacity-70"
                style={{ ...bodyTextStyle, color: "var(--text-3)" }}
              >
                <Sparkles size={11} />
                {copy.exampleFill}
              </button>
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="retro pixel-text-sm inline-flex h-9 items-center justify-center gap-2 border-2 border-[var(--border)] bg-[var(--border)] px-3 font-bold text-[var(--pixel-highlight)] shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_var(--pixel-shadow)]"
              >
                <Sparkles size={13} />
                {saved ? copy.saved : copy.save}
              </button>
              {isActive && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex h-9 items-center justify-center gap-1.5 border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-2)] transition-colors hover:bg-[var(--surface-2)]"
                  style={bodyTextStyle}
                >
                  <Trash2 size={13} />
                  {copy.clear}
                </button>
              )}
              {!isActive && (
                <p className="text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                  {copy.emptyHint}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Sidebar: status + preview + tips */}
        <div className="space-y-5">
          <section className="pixel-card-sm bg-[var(--surface)] p-5">
            <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
              {copy.statusTitle}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span
                className="h-2.5 w-2.5"
                style={{ background: isActive ? "var(--c-qualified)" : "var(--text-3)" }}
              />
              <span className="text-sm font-black" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                {isActive ? copy.statusActive : copy.statusGeneric}
              </span>
            </div>
            <p className="mt-1.5 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
              {isActive ? copy.statusActiveDesc : copy.statusGenericDesc}
            </p>
            <div className="mt-4 grid gap-2">
              <div className="flex items-center justify-between gap-2 border-2 border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                  <Clock size={12} />
                  {copy.lastUpdated}
                </span>
                <span className="text-xs font-bold" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                  {lastUpdatedLabel}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 border-2 border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                  <Sparkles size={12} />
                  {copy.previewTitle}
                </span>
                <span className="text-xs font-bold tabular-nums" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                  {copy.approxTokens(approxTokens)}
                </span>
              </div>
            </div>
          </section>

          <section className="pixel-card-sm bg-[var(--surface)] p-5">
            <div className="flex items-center gap-2">
              <Eye size={13} style={{ color: "var(--text-2)" }} />
              <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-2)" }}>
                {copy.previewTitle}
              </p>
            </div>
            <p className="mt-2 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
              {copy.previewHelper}
            </p>
            <div className="pixel-inset mt-3 max-h-64 overflow-auto p-3">
              {composed ? (
                <p className="whitespace-pre-line text-xs leading-relaxed" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                  {composed}
                </p>
              ) : (
                <p className="text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                  {copy.previewEmpty}
                </p>
              )}
            </div>
          </section>

          <section className="pixel-card-sm bg-[var(--surface)] p-5">
            <div className="flex items-center gap-2">
              <Lightbulb size={13} style={{ color: "var(--text-2)" }} />
              <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-2)" }}>
                {copy.tipsTitle}
              </p>
            </div>
            <ul className="mt-3 grid gap-2">
              {copy.tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-2)" }}>
                  <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0" style={{ background: "var(--text-3)" }} />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
