"use client";

import { X } from "lucide-react";
import { usePublicSupport } from "@/lib/hooks/use-public-support";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const bodyTextStyle = { fontFamily: "var(--font-body), system-ui, sans-serif" };
const inputCls =
  "w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:border-[var(--text)] focus:outline-none";

interface LandingSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LandingSupportModal({ isOpen, onClose }: LandingSupportModalProps) {
  const { lang } = useLanguage();
  const tr = translations[lang].landing.support;
  const {
    name, setName,
    email, setEmail,
    subject, setSubject,
    message, setMessage,
    status, error, submit,
  } = usePublicSupport();

  if (!isOpen) return null;

  const canSubmit =
    email.trim().length > 3 &&
    subject.trim().length >= 3 &&
    message.trim().length >= 10 &&
    status !== "sending";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-dialog-title"
        className="pixel-card-sm flex max-h-[90vh] w-full max-w-lg animate-fade-up flex-col bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b-2 border-[var(--border)] bg-[var(--surface-2)] px-5 py-4">
          <div>
            <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
              {tr.eyebrow}
            </p>
            <h2 id="support-dialog-title" className="text-base font-bold" style={{ ...bodyTextStyle, color: "var(--text)" }}>
              {tr.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-none border-2 border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-[1px_1px_0_0_var(--pixel-shadow)] transition-transform hover:bg-[var(--pixel-highlight)] active:translate-x-px active:translate-y-px active:shadow-none"
            aria-label={tr.close}
          >
            <X size={13} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <p className="mb-4 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
            {tr.subtitle}
          </p>

          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold" style={{ color: "var(--text-2)" }}>
                {tr.nameLabel}
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={200}
                placeholder={tr.namePlaceholder}
                className={`${inputCls} h-9`}
                style={bodyTextStyle}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold" style={{ color: "var(--text-2)" }}>
                {tr.emailLabel}
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={320}
                required
                placeholder={tr.emailPlaceholder}
                className={`${inputCls} h-9`}
                style={bodyTextStyle}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold" style={{ color: "var(--text-2)" }}>
                {tr.subjectLabel}
              </span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={150}
                placeholder={tr.subjectPlaceholder}
                className={`${inputCls} h-9`}
                style={bodyTextStyle}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold" style={{ color: "var(--text-2)" }}>
                {tr.messageLabel}
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={4000}
                rows={4}
                placeholder={tr.messagePlaceholder}
                className={`${inputCls} resize-none py-2`}
                style={bodyTextStyle}
              />
            </label>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                className="retro pixel-text-sm inline-flex h-9 items-center justify-center gap-2 border-2 border-[var(--border)] bg-[var(--border)] px-3 font-bold text-[var(--pixel-highlight)] shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {status === "sending" ? tr.sending : tr.submit}
              </button>
              {status === "ok" && (
                <span className="text-xs font-semibold" style={{ color: "var(--c-hi)" }}>
                  {tr.sent}
                </span>
              )}
              {status === "error" && (
                <span className="text-xs font-semibold" style={{ color: "var(--c-lo)" }}>
                  {error ?? tr.error}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
