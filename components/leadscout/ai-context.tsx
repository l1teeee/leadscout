"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";
import { getAiContext, setAiContext } from "@/lib/ai-context";

const bodyTextStyle = {
  fontFamily: "var(--font-body), system-ui, sans-serif",
};

function SectionHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center border-2 border-[var(--border)] bg-[var(--pixel-highlight)] shadow-[2px_2px_0_var(--pixel-shadow)]">
        <Sparkles size={18} />
      </div>
      <div className="min-w-0">
        <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
          {eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-black leading-tight" style={{ ...bodyTextStyle, color: "var(--text)" }}>
          {title}
        </h1>
      </div>
    </div>
  );
}

export function AiContextPage() {
  const { lang } = useLanguage();
  const copy = translations[lang].aiContext;
  const [businessContext, setBusinessContext] = useState("");
  const [constraints, setConstraints] = useState("");
  const [saved, setSaved] = useState(false);
  const isEmpty = !businessContext.trim() && !constraints.trim();

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const context = getAiContext();
    setBusinessContext(context.businessContext);
    setConstraints(context.constraints);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleSave() {
    setAiContext({ businessContext, constraints });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="w-full animate-fade-up p-4 sm:p-6 lg:p-8" style={bodyTextStyle}>
      <section className="pixel-card-sm overflow-hidden bg-[var(--surface)]">
        <div className="border-b-2 border-[var(--border)] bg-[var(--surface-2)] p-5">
          <SectionHeader eyebrow={copy.eyebrow} title={copy.title} />
          <p className="max-w-3xl text-sm font-semibold" style={{ color: "var(--text-2)" }}>
            {copy.subtitle}
          </p>
        </div>

        <div className="grid gap-5 p-5">
          <p className="text-xs font-semibold" style={{ color: "var(--text-3)" }}>
            {copy.helper}
          </p>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold" style={{ color: "var(--text-2)" }}>
              {copy.businessLabel}
            </span>
            <textarea
              value={businessContext}
              onChange={(event) => setBusinessContext(event.target.value)}
              placeholder={copy.businessPlaceholder}
              rows={7}
              className="w-full resize-y rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text)] focus:border-[var(--text)] focus:outline-none"
              style={bodyTextStyle}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold" style={{ color: "var(--text-2)" }}>
              {copy.constraintsLabel}
            </span>
            <textarea
              value={constraints}
              onChange={(event) => setConstraints(event.target.value)}
              placeholder={copy.constraintsPlaceholder}
              rows={7}
              className="w-full resize-y rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text)] focus:border-[var(--text)] focus:outline-none"
              style={bodyTextStyle}
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleSave}
              className="retro pixel-text-sm inline-flex h-9 items-center justify-center gap-2 self-start border-2 border-[var(--border)] bg-[var(--border)] px-3 font-bold text-[var(--pixel-highlight)] shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_var(--pixel-shadow)]"
            >
              <Sparkles size={13} />
              {saved ? copy.saved : copy.save}
            </button>
            {isEmpty && (
              <p className="text-xs font-semibold" style={{ color: "var(--text-3)" }}>
                {copy.emptyHint}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
