"use client";

import { useCallback, useEffect, useState } from "react";
import { History, RefreshCcw, Search } from "lucide-react";
import { Tag } from "@/components/ui/badge";
import { getAudit, getUsage, type AuditEntryData, type UsageData } from "@/lib/api/settings";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const bodyTextStyle = { fontFamily: "var(--font-body), system-ui, sans-serif" };

function relativeTime(iso: string | null, lang: "en" | "es"): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = t - Date.now();
  const abs = Math.abs(diff);
  const min = 60_000;
  const hour = 60 * min;
  const day = 24 * hour;
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  if (abs < hour) return rtf.format(Math.round(diff / min), "minute");
  if (abs < day) return rtf.format(Math.round(diff / hour), "hour");
  if (abs < 30 * day) return rtf.format(Math.round(diff / day), "day");
  return new Date(iso).toLocaleDateString(lang === "es" ? "es-SV" : "en-US", { dateStyle: "medium" });
}

function absTime(iso: string | null, lang: "en" | "es"): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(lang === "es" ? "es-SV" : "en-US", { dateStyle: "medium", timeStyle: "short" });
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="pixel-card-sm bg-white p-4">
      <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
        {label}
      </p>
      <p className="retro mt-3 text-2xl font-black tabular-nums" style={{ color: "var(--text)" }}>
        {value}
      </p>
    </div>
  );
}

export function AuditPage() {
  const { lang } = useLanguage();
  const tr = translations[lang];
  const copy = tr.audit;
  const [entries, setEntries] = useState<AuditEntryData[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.allSettled([getAudit(50), getUsage()]).then(([a, u]) => {
      if (a.status === "fulfilled") setEntries(a.value);
      if (u.status === "fulfilled") setUsage(u.value);
      setLoading(false);
    });
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  return (
    <div className="w-full animate-fade-up p-4 sm:p-6 lg:p-8">
      <section className="pixel-card-sm mb-5 overflow-hidden bg-white">
        <div className="flex flex-col gap-4 border-b-2 border-[var(--border)] bg-[var(--surface-2)] p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-[var(--border)] bg-[var(--pixel-highlight)] shadow-[2px_2px_0_var(--pixel-shadow)]">
              <History size={18} />
            </div>
            <div>
              <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                {copy.eyebrow}
              </p>
              <h1 className="mt-1 text-2xl font-black leading-tight" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                {copy.title}
              </h1>
              <p className="mt-1 text-sm font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                {copy.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="retro pixel-text-xs inline-flex h-9 items-center gap-2 self-start border-2 border-[var(--border)] bg-[var(--surface)] px-3 uppercase transition-colors hover:bg-[var(--surface-2)] disabled:opacity-40"
            style={{ color: "var(--text-2)" }}
          >
            <RefreshCcw size={12} style={{ animation: loading ? "pixelSpin 0.8s steps(8, end) infinite" : "none" }} />
            {copy.refresh}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 p-5">
          <Metric label={copy.thisMonth} value={usage ? usage.searches_used : "..."} />
          <Metric label={copy.totalShown} value={loading ? "..." : entries.length} />
        </div>
      </section>

      <section className="pixel-card-sm bg-white p-5">
        <p className="retro pixel-text-sm uppercase mb-4" style={{ color: "var(--text)" }}>
          {copy.recentTitle}
        </p>
        {!loading && entries.length === 0 && (
          <p className="text-sm font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
            {copy.empty}
          </p>
        )}
        <div className="grid gap-2">
          {entries.map((e, i) => {
            const query = (e.query ?? "").trim() || tr.settings.auditFallback.business;
            const location = (e.location ?? "").trim() || tr.settings.auditFallback.zone;
            return (
              <div
                key={i}
                className="flex items-center gap-3 border-2 border-[var(--border)] bg-[var(--surface)] px-3 py-2.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-[var(--border)] bg-[var(--surface-2)]">
                  <Search size={13} style={{ color: "var(--text-2)" }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                    {copy.searched(query, location)}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {e.category && <Tag>{e.category}</Tag>}
                    <span className="text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                      {copy.resultsCount(e.results_count)}
                    </span>
                  </div>
                </div>
                <span
                  className="shrink-0 text-xs font-semibold tabular-nums"
                  style={{ ...bodyTextStyle, color: "var(--text-3)" }}
                  title={absTime(e.created_at, lang)}
                >
                  {relativeTime(e.created_at, lang)}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
