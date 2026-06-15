"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  Check,
  Clock,
  Edit3,
  Eye,
  FileText,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";
import {
  generateAiContextExample,
  getAiContext as getServerAiContext,
  getSettingsData,
  importAiContextJson,
  updateAiContext,
} from "@/lib/api/settings";
import {
  BUSINESS_MAX,
  CONSTRAINTS_MAX,
  EXAMPLE_SEED_MAX,
  JSON_IMPORT_MAX_CHARS,
  clearAiContext,
  composeContext,
  getAiContext as getLocalAiContext,
  sanitizeAiContextText,
  sanitizeExampleSeed,
  syncAiContextFromServer,
  validateAiContext,
} from "@/lib/ai-context";
import { cn } from "@/lib/utils";

const bodyTextStyle = { fontFamily: "var(--font-body), system-ui, sans-serif" };

const textareaCls =
  "w-full resize-y rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text)] focus:border-[var(--text)] focus:outline-none disabled:cursor-not-allowed disabled:bg-[var(--surface-2)] disabled:text-[var(--text-2)]";

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

function buildWorkspaceSeed(workspace: {
  workspace_name: string;
  industry: string;
  country: string;
  city: string;
}): string {
  return [workspace.workspace_name, workspace.industry, workspace.city, workspace.country]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" / ")
    .slice(0, EXAMPLE_SEED_MAX);
}

function valuesMatch(
  left: { businessContext: string; constraints: string },
  right: { businessContext: string; constraints: string },
): boolean {
  return left.businessContext === right.businessContext && left.constraints === right.constraints;
}

export function AiContextPage() {
  const { lang } = useLanguage();
  const copy = translations[lang].aiContext;

  const [businessContext, setBusinessContext] = useState("");
  const [constraints, setConstraints] = useState("");
  const [persisted, setPersisted] = useState({ businessContext: "", constraints: "" });
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [exampleSeed, setExampleSeed] = useState("");
  const [generatingExample, setGeneratingExample] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isJsonDragging, setIsJsonDragging] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [jsonFileName, setJsonFileName] = useState("");
  const [analyzingJson, setAnalyzingJson] = useState(false);
  const [jsonImportNotice, setJsonImportNotice] = useState<string | null>(null);
  const [jsonImportError, setJsonImportError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const local = getLocalAiContext();
    const localValue = {
      businessContext: local.businessContext,
      constraints: local.constraints,
    };
    setBusinessContext(localValue.businessContext);
    setConstraints(localValue.constraints);
    setPersisted(localValue);
    setUpdatedAt(local.updatedAt ?? null);
    setIsEditing(!composeContext(localValue.businessContext, localValue.constraints));

    getSettingsData()
      .then((data) => {
        const seed = buildWorkspaceSeed(data.workspace);
        if (seed) setExampleSeed(seed);
      })
      .catch(() => undefined);

    getServerAiContext()
      .then((data) => {
        const serverValue = {
          businessContext: sanitizeAiContextText(data.business_context, BUSINESS_MAX),
          constraints: sanitizeAiContextText(data.constraints, CONSTRAINTS_MAX),
        };
        setBusinessContext(serverValue.businessContext);
        setConstraints(serverValue.constraints);
        setPersisted(serverValue);
        setUpdatedAt(data.updated_at);
        setIsEditing(!composeContext(serverValue.businessContext, serverValue.constraints));
        syncAiContextFromServer({
          business_context: serverValue.businessContext,
          constraints: serverValue.constraints,
          updated_at: data.updated_at,
        });
      })
      .catch(() => undefined);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!isJsonModalOpen) return undefined;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !analyzingJson) setIsJsonModalOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [analyzingJson, isJsonModalOpen]);

  const currentValue = useMemo(
    () => ({
      businessContext: sanitizeAiContextText(businessContext, BUSINESS_MAX),
      constraints: sanitizeAiContextText(constraints, CONSTRAINTS_MAX),
    }),
    [businessContext, constraints],
  );
  const composed = composeContext(currentValue.businessContext, currentValue.constraints);
  const persistedComposed = composeContext(persisted.businessContext, persisted.constraints);
  const isActive = persistedComposed.trim().length > 0;
  const hasDraft = composed.trim().length > 0;
  const hasChanges = !valuesMatch(currentValue, persisted);
  const validation = validateAiContext(currentValue.businessContext, currentValue.constraints);
  const canSave = isEditing && hasChanges && validation.canSave && !saving && !clearing;
  const approxTokens = Math.ceil(composed.length / 4);
  const jsonChars = jsonText.trim().length;

  const validationItems = [
    { ok: validation.hasBusinessDescription, label: copy.validationBusiness },
    { ok: validation.hasAudience, label: copy.validationAudience },
    { ok: validation.hasChannels, label: copy.validationChannels },
    { ok: validation.hasMetrics, label: copy.validationMetrics },
  ];

  async function handleSave() {
    if (!validation.canSave) {
      setError(copy.validationFixRequired);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const data = await updateAiContext({
        business_context: currentValue.businessContext,
        constraints: currentValue.constraints,
      });
      const savedValue = {
        businessContext: sanitizeAiContextText(data.business_context, BUSINESS_MAX),
        constraints: sanitizeAiContextText(data.constraints, CONSTRAINTS_MAX),
      };
      syncAiContextFromServer({
        business_context: savedValue.businessContext,
        constraints: savedValue.constraints,
        updated_at: data.updated_at,
      });
      setBusinessContext(savedValue.businessContext);
      setConstraints(savedValue.constraints);
      setPersisted(savedValue);
      setUpdatedAt(data.updated_at);
      setIsEditing(false);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch {
      setError(copy.saveError);
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    setClearing(true);
    setError(null);
    try {
      const data = await updateAiContext({ business_context: "", constraints: "" });
      clearAiContext();
      setBusinessContext("");
      setConstraints("");
      setPersisted({ businessContext: "", constraints: "" });
      setUpdatedAt(data.updated_at);
      setIsEditing(true);
      setSaved(false);
    } catch {
      setError(copy.clearError);
    } finally {
      setClearing(false);
    }
  }

  async function handleGenerateExample() {
    const seed = sanitizeExampleSeed(exampleSeed);
    if (seed.length < 3) {
      setError(copy.exampleSeedRequired);
      return;
    }

    setGeneratingExample(true);
    setError(null);
    try {
      const data = await generateAiContextExample({
        business_type: seed,
        lang,
      });
      setBusinessContext(sanitizeAiContextText(data.business_context, BUSINESS_MAX));
      setConstraints(sanitizeAiContextText(data.constraints, CONSTRAINTS_MAX));
      setIsEditing(true);
      setSaved(false);
    } catch {
      setError(copy.generateError);
    } finally {
      setGeneratingExample(false);
    }
  }

  function getJsonPayload(): unknown | null {
    const trimmed = jsonText.trim();
    if (!trimmed) {
      setJsonImportError(copy.jsonImportEmpty);
      return null;
    }
    if (trimmed.length > JSON_IMPORT_MAX_CHARS) {
      setJsonImportError(copy.jsonImportTooLarge);
      return null;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(trimmed);
    } catch {
      setJsonImportError(copy.jsonImportInvalid);
      return null;
    }

    const isEmptyArray = Array.isArray(payload) && payload.length === 0;
    const isEmptyObject =
      typeof payload === "object" &&
      payload !== null &&
      !Array.isArray(payload) &&
      Object.keys(payload as Record<string, unknown>).length === 0;
    if (typeof payload !== "object" || payload === null || isEmptyArray || isEmptyObject) {
      setJsonImportError(copy.jsonImportUnsupported);
      return null;
    }

    return payload;
  }

  async function readJsonFile(file: File): Promise<boolean> {
    if (file.size > JSON_IMPORT_MAX_CHARS * 4) {
      setJsonImportError(copy.jsonImportTooLarge);
      return false;
    }

    try {
      const text = await file.text();
      if (text.trim().length > JSON_IMPORT_MAX_CHARS) {
        setJsonImportError(copy.jsonImportTooLarge);
        return false;
      }
      setJsonText(text);
      setJsonFileName(file.name);
      setJsonImportNotice(null);
      setJsonImportError(null);
      return true;
    } catch {
      setJsonImportError(copy.jsonImportInvalid);
      return false;
    }
  }

  async function handleJsonFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    const loaded = await readJsonFile(file);
    if (!loaded) {
      event.currentTarget.value = "";
    }
  }

  function handleJsonTextChange(value: string) {
    setJsonText(value);
    setJsonImportNotice(null);
    setJsonImportError(null);
    if (!value.trim()) setJsonFileName("");
  }

  function handleClearJsonImport() {
    setJsonText("");
    setJsonFileName("");
    setJsonImportNotice(null);
    setJsonImportError(null);
    if (jsonFileInputRef.current) jsonFileInputRef.current.value = "";
  }

  function handleOpenJsonModal() {
    setIsJsonModalOpen(true);
    setJsonImportError(null);
  }

  async function handleJsonDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsJsonDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await readJsonFile(file);
  }

  async function handleAnalyzeJson() {
    const payload = getJsonPayload();
    if (!payload) return;

    setAnalyzingJson(true);
    setJsonImportError(null);
    setJsonImportNotice(null);
    try {
      const data = await importAiContextJson({
        json_payload: payload,
        lang,
      });
      setBusinessContext(sanitizeAiContextText(data.business_context, BUSINESS_MAX));
      setConstraints(sanitizeAiContextText(data.constraints, CONSTRAINTS_MAX));
      setIsEditing(true);
      setSaved(false);
      setJsonImportNotice(copy.jsonImportApplied);
      setIsJsonModalOpen(false);
    } catch {
      setJsonImportError(copy.jsonImportAnalyzeError);
    } finally {
      setAnalyzingJson(false);
    }
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
            <div className="pixel-inset p-3">
              <label className="block">
                <span className="block text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-2)" }}>
                  {copy.exampleSeedLabel}
                </span>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={exampleSeed}
                    onChange={(event) => setExampleSeed(event.target.value)}
                    maxLength={EXAMPLE_SEED_MAX}
                    placeholder={copy.exampleSeedPlaceholder}
                    className="h-9 min-w-0 flex-1 rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text)] outline-none"
                    style={bodyTextStyle}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateExample}
                    disabled={generatingExample}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-2 border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-bold text-[var(--text)] shadow-[1px_1px_0_var(--pixel-shadow)] transition-colors hover:bg-[var(--pixel-highlight)] disabled:cursor-not-allowed disabled:opacity-50"
                    style={bodyTextStyle}
                  >
                    <Sparkles size={13} />
                    {generatingExample ? copy.generatingExample : copy.generateExample}
                  </button>
                </div>
                <p className="mt-2 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                  {copy.exampleSeedHelper}
                </p>
              </label>
            </div>

            <label className="block">
              <FieldHeader label={copy.businessLabel} count={currentValue.businessContext.length} max={BUSINESS_MAX} />
              <textarea
                value={businessContext}
                onChange={(event) => setBusinessContext(sanitizeAiContextText(event.target.value, BUSINESS_MAX))}
                maxLength={BUSINESS_MAX}
                placeholder={copy.businessPlaceholder}
                rows={6}
                disabled={!isEditing}
                className={textareaCls}
                style={bodyTextStyle}
              />
            </label>

            <label className="block">
              <FieldHeader label={copy.constraintsLabel} count={currentValue.constraints.length} max={CONSTRAINTS_MAX} />
              <textarea
                value={constraints}
                onChange={(event) => setConstraints(sanitizeAiContextText(event.target.value, CONSTRAINTS_MAX))}
                maxLength={CONSTRAINTS_MAX}
                placeholder={copy.constraintsPlaceholder}
                rows={6}
                disabled={!isEditing}
                className={textareaCls}
                style={bodyTextStyle}
              />
            </label>

            {error && (
              <div className="flex items-start gap-2 border-2 border-[var(--c-hi)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--c-hi)" }}>
                <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canSave}
                  className="retro pixel-text-sm inline-flex h-9 items-center justify-center gap-2 border-2 border-[var(--border)] bg-[var(--border)] px-3 font-bold text-[var(--pixel-highlight)] shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_var(--pixel-shadow)] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Sparkles size={13} />
                  {saved ? copy.saved : isActive ? copy.saveChanges : copy.save}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="retro pixel-text-sm inline-flex h-9 items-center justify-center gap-2 border-2 border-[var(--border)] bg-[var(--border)] px-3 font-bold text-[var(--pixel-highlight)] shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_var(--pixel-shadow)]"
                >
                  <Edit3 size={13} />
                  {copy.edit}
                </button>
              )}

              <button
                type="button"
                onClick={handleOpenJsonModal}
                className="inline-flex h-9 items-center justify-center gap-2 border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-bold text-[var(--text)] shadow-[1px_1px_0_var(--pixel-shadow)] transition-colors hover:bg-[var(--pixel-highlight)] active:translate-x-px active:translate-y-px active:shadow-none"
                style={bodyTextStyle}
              >
                <FileText size={13} />
                {copy.jsonImportButton}
              </button>

              {hasDraft && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={clearing || saving}
                  className="inline-flex h-9 items-center justify-center gap-1.5 border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-2)] transition-colors hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
                  style={bodyTextStyle}
                >
                  <Trash2 size={13} />
                  {clearing ? copy.clearing : copy.clear}
                </button>
              )}

              {jsonImportNotice && (
                <p className="text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--c-mid)" }}>
                  {jsonImportNotice}
                </p>
              )}

              {!hasDraft && (
                <p className="text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                  {copy.emptyHint}
                </p>
              )}
              {isEditing && hasDraft && !hasChanges && (
                <p className="text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                  {copy.noChanges}
                </p>
              )}
              {isEditing && hasChanges && validation.canSave && (
                <p className="text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--c-mid)" }}>
                  {copy.unsavedChanges}
                </p>
              )}
            </div>
          </div>
        </section>

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

            <div className="mt-4 border-t-2 border-[var(--border)] pt-4">
              <div className="flex items-center gap-2">
                <ShieldAlert size={13} style={{ color: "var(--text-2)" }} />
                <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-2)" }}>
                  {copy.validationTitle}
                </p>
              </div>
              <div className="mt-3 grid gap-2">
                {validationItems.map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-start gap-2 border-2 px-2 py-1.5 text-xs font-semibold",
                      item.ok
                        ? "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-2)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-3)]",
                    )}
                    style={bodyTextStyle}
                  >
                    <Check size={12} className="mt-0.5 shrink-0" style={{ color: item.ok ? "var(--c-qualified)" : "var(--text-3)" }} />
                    <span>{item.label}</span>
                  </div>
                ))}
                {(validation.hasSensitiveData || validation.hasPromptInjection) && (
                  <div className="flex items-start gap-2 border-2 border-[var(--c-hi)] bg-[var(--surface-2)] px-2 py-1.5 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--c-hi)" }}>
                    <ShieldAlert size={12} className="mt-0.5 shrink-0" />
                    <span>
                      {validation.hasSensitiveData ? copy.validationSensitive : copy.validationPromptInjection}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {isJsonModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(28,25,23,0.42)] p-4"
          role="presentation"
          onClick={() => {
            if (!analyzingJson) setIsJsonModalOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="json-import-title"
            className="animate-scale-in max-h-[92vh] w-full max-w-2xl overflow-auto border-2 border-[var(--border)] bg-[var(--surface)] shadow-[4px_4px_0_var(--pixel-shadow)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b-2 border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <FileText size={15} style={{ color: "var(--text-2)" }} />
                  <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                    {copy.jsonImportTitle}
                  </p>
                </div>
                <h2
                  id="json-import-title"
                  className="mt-1 text-lg font-black leading-tight"
                  style={{ ...bodyTextStyle, color: "var(--text)" }}
                >
                  {copy.jsonImportModalTitle}
                </h2>
                <p className="mt-2 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                  {copy.jsonImportHelper}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsJsonModalOpen(false)}
                disabled={analyzingJson}
                aria-label={copy.jsonImportClose}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center border-2 border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-[1px_1px_0_var(--pixel-shadow)] transition-colors hover:bg-[var(--pixel-highlight)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={15} />
              </button>
            </div>

            <div className="grid gap-4 p-4">
              <label
                className={cn(
                  "flex min-h-32 cursor-pointer flex-col items-center justify-center border-2 border-dashed px-4 py-5 text-center transition-colors",
                  isJsonDragging
                    ? "border-[var(--text)] bg-[var(--pixel-highlight)]"
                    : "border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--pixel-highlight)]",
                )}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsJsonDragging(true);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={() => setIsJsonDragging(false)}
                onDrop={handleJsonDrop}
              >
                <input
                  ref={jsonFileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleJsonFileChange}
                />
                <Upload size={20} style={{ color: "var(--text)" }} />
                <span className="mt-2 text-sm font-black" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                  {copy.jsonImportDropTitle}
                </span>
                <span className="mt-1 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                  {copy.jsonImportDropHelper}
                </span>
              </label>

              <label className="block">
                <span className="block text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-2)" }}>
                  {copy.jsonImportPasteLabel}
                </span>
                <textarea
                  value={jsonText}
                  onChange={(event) => handleJsonTextChange(event.target.value)}
                  placeholder={copy.jsonImportPlaceholder}
                  rows={8}
                  className={`${textareaCls} mt-2 min-h-44 font-mono text-xs`}
                  style={bodyTextStyle}
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                    {jsonFileName ? `${copy.jsonImportFileLoaded}: ${jsonFileName}` : copy.jsonImportNoFile}
                  </p>
                  <p
                    className="mt-1 text-xs font-semibold tabular-nums"
                    style={{
                      ...bodyTextStyle,
                      color: jsonChars > JSON_IMPORT_MAX_CHARS ? "var(--c-hi)" : "var(--text-3)",
                    }}
                  >
                    {jsonChars}/{JSON_IMPORT_MAX_CHARS}
                  </p>
                  <p className="mt-1 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                    {copy.jsonImportPrivacy}
                  </p>
                </div>

                {jsonText && (
                  <button
                    type="button"
                    onClick={handleClearJsonImport}
                    disabled={analyzingJson}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-2)] transition-colors hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
                    style={bodyTextStyle}
                  >
                    <Trash2 size={13} />
                    {copy.jsonImportClear}
                  </button>
                )}
              </div>

              {jsonImportError && (
                <div className="flex items-start gap-2 border-2 border-[var(--c-hi)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--c-hi)" }}>
                  <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                  <span>{jsonImportError}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t-2 border-[var(--border)] bg-[var(--surface-2)] p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsJsonModalOpen(false)}
                disabled={analyzingJson}
                className="inline-flex h-9 items-center justify-center border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-2)] transition-colors hover:bg-[var(--pixel-highlight)] disabled:cursor-not-allowed disabled:opacity-50"
                style={bodyTextStyle}
              >
                {copy.jsonImportCancel}
              </button>
              <button
                type="button"
                onClick={handleAnalyzeJson}
                disabled={analyzingJson || jsonChars === 0}
                className="retro pixel-text-sm inline-flex h-9 items-center justify-center gap-2 border-2 border-[var(--border)] bg-[var(--border)] px-3 font-bold text-[var(--pixel-highlight)] shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_var(--pixel-shadow)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Sparkles size={13} />
                {analyzingJson ? copy.jsonImportAnalyzing : copy.jsonImportAnalyze}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
