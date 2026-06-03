import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md";

const variantStyles: Record<Variant, string> = {
  primary:   "bg-[var(--pixel-highlight)] text-[var(--text)] border-[var(--border)] hover:bg-[#F4F4F5]",
  secondary: "bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--surface-2)]",
  ghost:     "bg-transparent text-[var(--text)] border-[var(--border)] shadow-none hover:bg-[var(--surface-2)] active:shadow-none",
  danger:    "bg-[#F8B4A8] text-[var(--text)] border-[var(--border)] hover:bg-[#F28B7A]",
  outline:   "bg-transparent text-[var(--text)] border-[var(--border)] hover:bg-[var(--surface)]",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-2.5 text-[10px] gap-1.5",
  md: "h-9 px-3 text-xs gap-2",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "retro pixel-text-sm motion-retro-control inline-flex items-center justify-center rounded-none font-bold tracking-[0px] cursor-pointer select-none whitespace-nowrap will-change-transform",
          "border-2 shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px active:scale-[0.98] active:shadow-[1px_1px_0_var(--pixel-shadow)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border)] focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:translate-x-0 disabled:translate-y-0 disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
