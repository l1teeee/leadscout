"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

function scoreColor(score: number) {
  if (score <= 20) return "var(--score-critical)";
  if (score <= 40) return "var(--score-weak)";
  if (score <= 60) return "var(--score-mid)";
  return "var(--score-good)";
}

function scoreLabel(score: number, labels: Record<"critical" | "weak" | "moderate" | "good", string>) {
  if (score <= 20) return labels.critical;
  if (score <= 40) return labels.weak;
  if (score <= 60) return labels.moderate;
  return labels.good;
}

interface ScoreBarProps {
  score: number;
  showLabel?: boolean;
  className?: string;
}

export function ScoreBar({ score, showLabel = false, className }: ScoreBarProps) {
  const { lang } = useLanguage();
  const color = scoreColor(score);
  const label = scoreLabel(score, translations[lang].common.scoreLabels);
  const value = Math.max(0, Math.min(100, score));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-3 flex-1 overflow-hidden rounded-none border-2 border-[var(--border)] bg-[var(--surface)] p-[1px]">
        <div
          className="h-full rounded-none transition-all"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="retro pixel-text-xs shrink-0 tabular-nums text-xs font-bold tracking-[0px]"
        style={{ color }}
      >
        {score}
      </span>
      {showLabel && (
        <span className="retro pixel-text-xs shrink-0 text-[10px] font-bold tracking-[0px] text-[var(--text-2)]">
          {label}
        </span>
      )}
    </div>
  );
}

interface ScoreBigProps {
  score: number;
}

export function ScoreBig({ score }: ScoreBigProps) {
  const { lang } = useLanguage();
  const color = scoreColor(score);
  const label = scoreLabel(score, translations[lang].common.scoreLabels);

  return (
    <div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="retro tabular-nums text-3xl font-bold tracking-[0px]"
          style={{ color }}
        >
          {score}
        </span>
        <span className="text-xs font-semibold text-[var(--text-2)]">
          /100
        </span>
      </div>
      <p className="mt-1 text-xs font-semibold" style={{ color }}>
        {label}
      </p>
    </div>
  );
}
