"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

type SpinnerVariant = "classic" | "diamond";
type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  label?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: "size-5",
  md: "size-7",
  lg: "size-10",
};

const pixelSizeStyles: Record<SpinnerSize, string> = {
  sm: "size-1.5",
  md: "size-2",
  lg: "size-2.5",
};

function ClassicSpinner({ size }: { size: SpinnerSize }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pixel-spinner-spin relative block border-2 border-[var(--border)] bg-[var(--surface)] shadow-[2px_2px_0_var(--pixel-shadow)]",
        sizeStyles[size]
      )}
    >
      <span className="absolute -right-0.5 -top-0.5 size-2 bg-[var(--pixel-highlight)] border border-[var(--border)]" />
      <span className="absolute bottom-0 left-0 size-1.5 bg-[var(--text)]" />
    </span>
  );
}

function DiamondSpinner({ size }: { size: SpinnerSize }) {
  const pixelClassName = cn(
    "block bg-[var(--text)] shadow-[1px_1px_0_var(--pixel-shadow)]",
    pixelSizeStyles[size]
  );

  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid rotate-45 grid-cols-3 grid-rows-3 place-items-center",
        sizeStyles[size]
      )}
    >
      <span className={cn(pixelClassName, "pixel-spinner-pulse col-start-2 row-start-1")} />
      <span className={cn(pixelClassName, "pixel-spinner-pulse col-start-3 row-start-2 [animation-delay:120ms]")} />
      <span className={cn(pixelClassName, "pixel-spinner-pulse col-start-2 row-start-3 [animation-delay:240ms]")} />
      <span className={cn(pixelClassName, "pixel-spinner-pulse col-start-1 row-start-2 [animation-delay:360ms]")} />
    </span>
  );
}

function Spinner({
  className,
  variant = "classic",
  size = "md",
  label,
  ...props
}: SpinnerProps) {
  const { lang } = useLanguage();
  const displayLabel = label ?? translations[lang].common.loading;

  return (
    <div
      role="status"
      aria-label={displayLabel}
      className={cn("inline-flex items-center justify-center text-[var(--text)]", className)}
      {...props}
    >
      {variant === "diamond" ? <DiamondSpinner size={size} /> : <ClassicSpinner size={size} />}
      <span className="sr-only">{displayLabel}</span>
    </div>
  );
}

export { Spinner };
export default Spinner;
