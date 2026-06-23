"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Download, FileSpreadsheet, Mail } from "lucide-react";
import { downloadReport, emailReport } from "@/lib/api/reports";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Range = 7 | 30 | 90;
type Busy = "pdf" | "xlsx" | "email" | null;

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

interface ReportToolbarProps {
  hasData: boolean;
  onRangeChange?: (days: Range) => void;
}

export function ReportToolbar({ hasData, onRangeChange }: ReportToolbarProps) {
  const { lang } = useLanguage();
  const tr = translations[lang].reportes.toolbar;
  const [range, setRange] = useState<Range>(30);
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const [busy, setBusy] = useState<Busy>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const rangeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isRangeOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rangeMenuRef.current?.contains(event.target as Node)) {
        setIsRangeOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isRangeOpen]);

  function showMsg(text: string, ok: boolean) {
    setMessage({ text, ok });
    setTimeout(() => setMessage(null), 3000);
  }

  function handleRangeSelect(days: Range) {
    setRange(days);
    onRangeChange?.(days);
    setIsRangeOpen(false);
  }

  async function handlePdf() {
    if (!hasData || busy) return;
    setBusy("pdf");
    try {
      await downloadReport("pdf", range);
    } catch {
      showMsg(tr.exportError, false);
    } finally {
      setBusy(null);
    }
  }

  async function handleExcel() {
    if (!hasData || busy) return;
    setBusy("xlsx");
    try {
      await downloadReport("xlsx", range);
    } catch {
      showMsg(tr.exportError, false);
    } finally {
      setBusy(null);
    }
  }

  async function handleEmail() {
    if (!hasData || busy) return;
    setBusy("email");
    try {
      await emailReport(range);
      showMsg(tr.emailSent, true);
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : "";
      showMsg(detail.includes("configurado") ? tr.emailError : tr.emailError, false);
    } finally {
      setBusy(null);
    }
  }

  const ranges: Range[] = [7, 30, 90];
  const rangeLabel: Record<Range, string> = { 7: tr.range7, 30: tr.range30, 90: tr.range90 };

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div ref={rangeMenuRef} className="relative">
        <button
          type="button"
          onClick={() => setIsRangeOpen((open) => !open)}
          aria-label={`${tr.calendarAria}: ${rangeLabel[range]}`}
          className="retro pixel-text-xs inline-flex cursor-pointer items-center gap-1.5 border-2 border-(--border) bg-white px-3 py-1.5 uppercase text-(--text) shadow-[2px_2px_0_0_var(--pixel-shadow)] transition-transform active:translate-x-px active:translate-y-px"
          style={bodyFont}
        >
          <CalendarDays size={12} />
          {rangeLabel[range]}
        </button>

        {isRangeOpen && (
          <div className="absolute left-0 top-[calc(100%+6px)] z-30 min-w-full border-2 border-(--border) bg-white shadow-[2px_2px_0_0_var(--pixel-shadow)]">
            <p
              className="retro pixel-text-xs border-b-2 border-(--border) px-3 py-2 uppercase text-(--text-3)"
              style={bodyFont}
            >
              {tr.calendarLabel}
            </p>
            {ranges.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRangeSelect(r)}
                className={cn(
                  "retro pixel-text-xs block w-full cursor-pointer px-3 py-2 text-left uppercase transition-colors",
                  r === range
                    ? "bg-(--pixel-highlight) text-[#17110D]"
                    : "text-(--text-3) hover:bg-(--surface-2)"
                )}
                style={bodyFont}
              >
                {rangeLabel[r]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePdf}
            disabled={!hasData || busy !== null}
            className="retro pixel-text-xs cursor-pointer inline-flex items-center gap-1.5 border-2 border-(--border) px-3 py-1.5 uppercase transition-transform hover:bg-(--surface-2) active:translate-x-px active:translate-y-px disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ ...bodyFont, background: "var(--surface)", color: "var(--text)" }}
          >
            <Download size={11} />
            {busy === "pdf" ? "..." : tr.exportPdf}
          </button>
          <button
            type="button"
            onClick={handleExcel}
            disabled={!hasData || busy !== null}
            className="retro pixel-text-xs cursor-pointer inline-flex items-center gap-1.5 border-2 border-(--border) px-3 py-1.5 uppercase transition-transform hover:bg-(--surface-2) active:translate-x-px active:translate-y-px disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ ...bodyFont, background: "var(--surface)", color: "var(--text)" }}
          >
            <FileSpreadsheet size={11} />
            {busy === "xlsx" ? "..." : tr.exportExcel}
          </button>
          <button
            type="button"
            onClick={handleEmail}
            disabled={!hasData || busy !== null}
            className="retro pixel-text-xs cursor-pointer inline-flex items-center gap-1.5 border-2 border-(--border) bg-(--pixel-highlight) px-3 py-1.5 uppercase transition-transform hover:opacity-90 active:translate-x-px active:translate-y-px disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: "#17110D" }}
          >
            <Mail size={11} />
            {busy === "email" ? "..." : tr.sendEmail}
          </button>
        </div>
        {message && (
          <p
            className="text-xs font-semibold"
            style={{ ...bodyFont, color: message.ok ? "var(--c-qualified)" : "var(--c-lost)" }}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
