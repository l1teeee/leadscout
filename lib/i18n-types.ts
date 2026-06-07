import type { LeadPriority, LeadStatus } from "@/lib/data";

export type Lang = "en" | "es";

export const leadStatuses: LeadStatus[] = [
  "nuevo",
  "contactado",
  "calificado",
  "perdido",
  "desvinculado",
];

export const leadPriorities: LeadPriority[] = ["alta", "media", "baja"];
