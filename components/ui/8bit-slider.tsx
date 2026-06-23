"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type SliderProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> & {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  name?: string;
};

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      disabled,
      name,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<number[]>(defaultValue ?? [min]);
    const current = isControlled ? value : internal;
    const head = current[0] ?? min;
    const range = max - min || 1;
    const pct = Math.min(100, Math.max(0, ((head - min) / range) * 100));

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = [Number(event.target.value)];

      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] p-2",
          "motion-retro-control shadow-[2px_2px_0_var(--pixel-shadow)]",
          "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--border)] has-[:focus-visible]:ring-offset-2",
          disabled && "opacity-50",
          className
        )}
        {...props}
      >
        <div className="relative flex h-6 sm:h-5 w-full touch-none select-none items-center">
          <div className="relative h-2 w-full grow overflow-hidden border border-[var(--border)] bg-[var(--surface-2)]">
            <div
              className="absolute left-0 top-0 h-full bg-[var(--text)] transition-[width,background-color] duration-[var(--motion-fast)] ease-[var(--ease-out)]"
              style={{ width: `${pct}%` }}
            />
          </div>

          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={head}
            disabled={disabled}
            name={name}
            onChange={handleChange}
            aria-label={ariaLabel ?? "Slider"}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:pointer-events-none disabled:cursor-not-allowed"
          />

          <div
            className="motion-retro-thumb pointer-events-none absolute block size-5 sm:size-4 border-2 border-[var(--border)] bg-[var(--pixel-highlight)] shadow-[1px_1px_0_var(--pixel-shadow)]"
            style={{ left: `calc(${pct}% - 8px)` }}
            aria-hidden="true"
          />
        </div>
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
export default Slider;
