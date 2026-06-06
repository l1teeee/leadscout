"use client";
import { cn } from "@/lib/utils";
import type { LeadStatus, LeadPriority } from "@/lib/data";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const STATUS_DOT: Record<LeadStatus, string> = {
  nuevo: "bg-[var(--c-new)]",
  contactado: "bg-[var(--c-contacted)]",
  calificado: "bg-[var(--c-qualified)]",
  perdido: "bg-[var(--c-lost)]",
};

const PRIORITY_DOT: Record<LeadPriority, string> = {
  alta: "bg-[var(--c-hi)]",
  media: "bg-[var(--c-mid)]",
  baja: "bg-[var(--c-lo)]",
};

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { lang } = useLanguage();
  const tr = translations[lang];

  return (
    <span
      className={cn(
        "retro pixel-text-xs inline-flex items-center gap-1.5 rounded-none border-[2px] px-2 py-1 text-[10px] font-bold tracking-[0px]",
        "border bg-[var(--surface)] border-[var(--border)] text-[var(--text)]",
        className
      )}
    >
      <span className={cn("size-2 shrink-0 rounded-none", STATUS_DOT[status])} />
      {tr.leadStatus[status]}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: LeadPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const { lang } = useLanguage();
  const tr = translations[lang];

  return (
    <span
      className={cn(
        "retro pixel-text-xs inline-flex items-center gap-1.5 rounded-none border-[2px] px-2 py-1 text-[10px] font-bold tracking-[0px]",
        "border bg-[var(--surface)] border-[var(--border)] text-[var(--text)]",
        className
      )}
    >
      <span className={cn("size-2 shrink-0 rounded-none", PRIORITY_DOT[priority])} />
      {tr.leadPriority[priority]}
    </span>
  );
}

interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        "retro pixel-text-xs inline-flex items-center rounded-none border-[2px] px-2 py-1 text-[10px] font-bold tracking-[0px]",
        "border bg-[var(--surface)] border-[var(--border)] text-[var(--text)]",
        className
      )}
    >
      {children}
    </span>
  );
}
