"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type SwitchProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked,
      defaultChecked,
      onCheckedChange,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const isControlled = checked !== undefined;
    const [internal, setInternal] = React.useState<boolean>(!!defaultChecked);
    const value = isControlled ? !!checked : internal;
    const state = value ? "checked" : "unchecked";

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;

      const nextValue = !value;
      if (!isControlled) setInternal(nextValue);
      onCheckedChange?.(nextValue);
      onClick?.(event);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={value}
        data-slot="switch"
        data-state={state}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "relative inline-flex h-5 w-10 shrink-0 items-center rounded-none border-2 border-[var(--border)] p-0.5",
          "motion-retro-control bg-[var(--surface-2)] shadow-[2px_2px_0_var(--pixel-shadow)] will-change-transform",
          "data-[state=checked]:bg-[var(--text)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border)] focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "active:translate-x-px active:translate-y-px active:scale-[0.98] active:shadow-[1px_1px_0_var(--pixel-shadow)]",
          className
        )}
        {...props}
      >
        <span
          data-slot="switch-thumb"
          data-state={state}
          className={cn(
            "pointer-events-none block size-3.5 rounded-none border-2 border-[var(--border)] bg-[var(--surface)]",
            "motion-retro-thumb shadow-[1px_1px_0_var(--pixel-shadow)]",
            "data-[state=checked]:translate-x-5 data-[state=checked]:bg-[var(--pixel-highlight)]",
            "data-[state=unchecked]:translate-x-0"
          )}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
export default Switch;
