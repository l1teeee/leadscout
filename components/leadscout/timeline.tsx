"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTimeline, type TimelineResponse } from "@/lib/api/reports";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";
import { EmptyInsight } from "@/components/ui/empty-insight";

type Range = 7 | 30 | 90;
type TimelinePoint = TimelineResponse["points"][number];

const bodyTextStyle = {
  fontFamily: "var(--font-body), system-ui, sans-serif",
};

const ranges: Range[] = [7, 30, 90];

function toDate(value: string) {
  return new Date(value + "T12:00:00");
}

function formatDayMonth(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit" }).format(date);
}

function formatPointLabel(date: Date, range: Range, lang: "en" | "es") {
  if (range === 7) {
    return new Intl.DateTimeFormat(lang === "es" ? "es-SV" : "en-US", {
      weekday: "short",
    }).format(date);
  }

  return formatDayMonth(date);
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
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

export default function TimelineView() {
  const { lang } = useLanguage();
  const tr = translations[lang].timeline;
  const common = translations[lang].common;
  const [range, setRange] = useState<Range>(90);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TimelineResponse | null>(null);
  const rangeLabels: Record<Range, string> = {
    7: tr.range7,
    30: tr.range30,
    90: tr.range90,
  };

  useEffect(() => {
    let active = true;

    getTimeline(range)
      .then((response) => {
        if (!active) return;
        setData(response);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setData(null);
        setError(err instanceof Error ? err.message : common.pageError.title);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [common.pageError.title, range]);

  function handleRangeChange(days: Range) {
    if (days === range) return;
    setLoading(true);
    setError(null);
    setData(null);
    setRange(days);
  }

  const points = data?.points ?? [];
  const total = points.reduce((sum, point) => sum + point.count, 0);
  const maxCount = Math.max(1, ...points.map((point) => point.count));
  const positivePoints = points.filter((point) => point.count > 0);
  const peakPoint = positivePoints.reduce<TimelinePoint | null>(
    (peak, point) => (!peak || point.count > peak.count ? point : peak),
    null
  );
  const peakDay = peakPoint ? formatDayMonth(toDate(peakPoint.date)) : "--";
  const average = points.length > 0 ? total / points.length : 0;
  const hasData = total > 0;
  const labelStep = range === 7 ? 1 : range === 30 ? 3 : 7;

  return (
    <div className="w-full animate-fade-up p-4 sm:p-6 lg:p-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
            {tr.eyebrow}
          </p>
          <h1 className="retro pixel-text-sm mt-2 uppercase" style={{ color: "var(--text)" }}>
            {tr.title}
          </h1>
          <p className="mt-2 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
            {tr.subtitle}
          </p>
        </div>

        <div className="flex gap-0">
          {ranges.map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => handleRangeChange(days)}
              className={`retro pixel-text-xs cursor-pointer border-2 border-(--border) px-3 py-1.5 uppercase transition-colors ${
                days === range
                  ? "bg-(--pixel-highlight) text-[#17110D]"
                  : "bg-white text-(--text-3) hover:bg-(--surface-2)"
              }`}
              style={{ marginLeft: days === 7 ? 0 : -2 }}
            >
              {rangeLabels[days]}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label={tr.totalLeads(total)} value={total} />
        <KpiCard label={tr.peakDay} value={peakDay} />
        <KpiCard label={tr.avg} value={average.toFixed(1)} />
      </div>

      <section className="pixel-card-sm bg-white p-5">
        {loading ? (
          <div className="flex h-48 items-center justify-center border-2 border-dashed border-[var(--border)]">
            <p className="text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
              {common.loading}...
            </p>
          </div>
        ) : error ? (
          <EmptyInsight title={common.pageError.title} description={error} compact />
        ) : !hasData ? (
          <Link href="/explorer" className="block">
            <EmptyInsight
              title={tr.noData.title}
              description={tr.noData.description}
              action={tr.noData.action}
            />
          </Link>
        ) : (
          <>
            <div className="flex h-48 w-full items-end gap-px">
              {points.map((point, index) => {
                const date = toDate(point.date);
                const barHeight = point.count > 0 ? Math.max(4, Math.round((point.count / maxCount) * 100)) : 0;
                const label = index % labelStep === 0 ? formatPointLabel(date, range, lang) : "";

                return (
                  <div key={point.date} className="flex h-full min-w-0 flex-1 flex-col items-center gap-1">
                    <div className="group relative flex min-h-0 w-full flex-1 items-end">
                      <div
                        className="w-full bg-[var(--border)] transition-colors group-hover:bg-[#3FAE2A]"
                        style={{ height: point.count > 0 ? `${barHeight}%` : 2 }}
                        title={`${formatDayMonth(date)}: ${point.count}`}
                      />
                      <div
                        className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap border-2 border-[var(--border)] bg-white px-2 py-1 text-[10px] font-bold shadow-[2px_2px_0_0_var(--pixel-shadow)] group-hover:block"
                        style={{ ...bodyTextStyle, color: "var(--text)" }}
                      >
                        {formatDayMonth(date)}: {point.count}
                      </div>
                    </div>
                    <span
                      className="retro h-3 w-full truncate text-center text-[8px] uppercase"
                      style={{ color: "var(--text-3)" }}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 space-y-2">
              {positivePoints.map((point) => {
                const date = toDate(point.date);

                return (
                  <div
                    key={point.date}
                    className="pixel-inset flex items-center justify-between gap-3 bg-[var(--surface-2)] px-3 py-2"
                  >
                    <span className="text-xs font-bold" style={{ ...bodyTextStyle, color: "var(--text-2)" }}>
                      {formatDayMonth(date)}
                    </span>
                    <span className="retro pixel-text-xs tabular-nums" style={{ color: "var(--text)" }}>
                      {point.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
