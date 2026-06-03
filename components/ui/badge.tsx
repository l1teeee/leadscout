"use client";
import { cn } from "@/lib/utils";
import type { LeadStatus, LeadPriority } from "@/lib/data";

const STATUS_DOT: Record<LeadStatus, string> = {
  nuevo: "bg-[var(--c-new)]",
  contactado: "bg-[var(--c-contacted)]",
  calificado: "bg-[var(--c-qualified)]",
  perdido: "bg-[var(--c-lost)]",
};

const STATUS_LABEL: Record<LeadStatus, string> = {
  nuevo:      "Nuevo",
  contactado: "Contactado",
  calificado: "Calificado",
  perdido:    "Perdido",
};

const PRIORITY_DOT: Record<LeadPriority, string> = {
  alta: "bg-[var(--c-hi)]",
  media: "bg-[var(--c-mid)]",
  baja: "bg-[var(--c-lo)]",
};

const PRIORITY_LABEL: Record<LeadPriority, string> = {
  alta:  "Alta",
  media: "Media",
  baja:  "Baja",
};

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "retro pixel-text-xs inline-flex items-center gap-1.5 rounded-none border-[2px] px-2 py-1 text-[10px] font-bold tracking-[0px]",
        "border bg-[var(--surface)] border-[var(--border)] text-[var(--text)]",
        className
      )}
    >
      <span className={cn("size-2 shrink-0 rounded-none", STATUS_DOT[status])} />
      {STATUS_LABEL[status]}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: LeadPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "retro pixel-text-xs inline-flex items-center gap-1.5 rounded-none border-[2px] px-2 py-1 text-[10px] font-bold tracking-[0px]",
        "border bg-[var(--surface)] border-[var(--border)] text-[var(--text)]",
        className
      )}
    >
      <span className={cn("size-2 shrink-0 rounded-none", PRIORITY_DOT[priority])} />
      {PRIORITY_LABEL[priority]}
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
