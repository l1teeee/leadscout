"use client";

import { useEffect, useState, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/8bit-progress";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

export interface LoadingScreenProps extends ComponentProps<"div"> {
  title?: string;
  tips?: string[];
  progress?: number;
  showPercentage?: boolean;
  tipInterval?: number;
  variant?: "default" | "fullscreen";
  autoProgress?: boolean;
  autoProgressDuration?: number;
}

export default function LoadingScreen({
  className,
  title,
  tips,
  progress = 0,
  showPercentage = true,
  tipInterval = 2400,
  variant = "default",
  autoProgress = false,
  autoProgressDuration = 5000,
  ...props
}: LoadingScreenProps) {
  const { lang } = useLanguage();
  const tr = translations[lang];
  const displayTitle = title ?? tr.loadingScreen.defaultTitle;
  const displayTips = tips ?? tr.loadingScreen.tips;
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [internalProgress, setInternalProgress] = useState(autoProgress ? 0 : progress);

  useEffect(() => {
    if (!autoProgress) return;

    const step = 4;
    const intervalTime = Math.max(80, autoProgressDuration / (100 / step));
    const timer = window.setInterval(() => {
      setInternalProgress((prev) => Math.min(96, prev + step));
    }, intervalTime);

    return () => window.clearInterval(timer);
  }, [autoProgress, autoProgressDuration]);

  useEffect(() => {
    if (!displayTips.length) return;

    const tipTimer = window.setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % displayTips.length);
    }, tipInterval);

    return () => window.clearInterval(tipTimer);
  }, [displayTips, tipInterval]);

  const isFullscreen = variant === "fullscreen";
  const displayProgress = autoProgress ? internalProgress : progress;

  const content = (
    <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
      <div>
        <h2 className="retro pixel-text-sm uppercase animate-fade-up" style={{ color: "var(--text)" }}>
          {displayTitle}
        </h2>
        <p className="mt-2 text-xs font-semibold" style={{ color: "var(--text-3)" }}>
          {tr.common.noCloseWindow}
        </p>
      </div>

      <div className="w-full max-w-md space-y-2">
        {showPercentage && (
          <div className="flex justify-end">
            <span className="retro pixel-text-xs" style={{ color: "var(--text-3)" }}>
              {Math.round(displayProgress)}%
            </span>
          </div>
        )}
        <Progress value={displayProgress} className="h-5" />
      </div>

      {displayTips.length > 0 && (
        <div className="flex min-h-12 w-full max-w-md items-center justify-center">
          <p
            key={currentTipIndex}
            className="animate-fade-up text-xs font-semibold leading-relaxed"
            style={{ color: "var(--text-2)" }}
          >
            {displayTips[currentTipIndex]}
          </p>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]",
          className
        )}
        {...props}
      >
        <div className="w-full max-w-lg px-4">{content}</div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      {content}
    </div>
  );
}
