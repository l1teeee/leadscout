"use client";

import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

interface BarPoint { label: string; value: number; }
interface ChartBarsProps { title?: string; eyebrow?: string; data: BarPoint[]; }

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

export function ChartBars({ title, eyebrow, data }: ChartBarsProps) {
  const { lang } = useLanguage();
  const tr = translations[lang].common;
  const max = Math.max(1, ...data.map(d => d.value));
  const hasData = data.some(d => d.value > 0);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="pixel-card-sm bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
            {eyebrow}
          </p>
          <h2 className="retro pixel-text-sm mt-2 font-black uppercase" style={{ color: "var(--text)" }}>
            {title}
          </h2>
        </div>
        <div className="pixel-inset min-w-16 bg-white px-3 py-2 text-right">
          <span className="block text-xs font-medium" style={{ color: "var(--text-3)" }}>
            {tr.leadsLabel}
          </span>
          <span className="retro pixel-text-sm" style={{ color: "var(--text)" }}>
            {total}
          </span>
        </div>
      </div>

      {!hasData ? (
        <div className="flex h-24 items-center justify-center border-2 border-dashed border-[var(--border)]">
          <p className="text-xs font-semibold" style={{ ...bodyFont, color: "var(--text-3)" }}>
            {tr.chartEmpty.title}
          </p>
        </div>
      ) : (
        <div className="flex items-end gap-1" style={{ height: "120px" }}>
          {data.map((d) => {
            const heightPct = max > 0 ? Math.max(4, Math.round((d.value / max) * 100)) : 4;
            return (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                <span
                  className="retro pixel-text-xs tabular-nums"
                  style={{ color: d.value > 0 ? "var(--text)" : "var(--text-3)", fontSize: "7px" }}
                >
                  {d.value > 0 ? d.value : ""}
                </span>
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full border-2 border-[var(--border)]"
                    style={{
                      height: `${heightPct}%`,
                      background: d.value > 0 ? "var(--text)" : "var(--surface-2)",
                    }}
                  />
                </div>
                <span className="retro tabular-nums" style={{ color: "var(--text-3)", fontSize: "7px" }}>
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
