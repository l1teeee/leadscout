import type { Lead, LeadStatus } from "@/lib/data";

const LS_KEY = "ls_kanban_statuses";

function read(): Record<string, LeadStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, LeadStatus>)
      : {};
  } catch {
    return {};
  }
}

function write(statuses: Record<string, LeadStatus>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(statuses));
  } catch {}
}

export function setStatusOverride(id: string, status: LeadStatus): void {
  write({ ...read(), [id]: status });
}

export function clearStatusOverride(id: string): void {
  const statuses = read();
  if (!(id in statuses)) return;
  delete statuses[id];
  write(statuses);
}

export function applyStatusOverrides(leads: Lead[]): Lead[] {
  const statuses = read();
  return leads.map((lead) => {
    const status = statuses[lead.id];
    return status ? { ...lead, status } : lead;
  });
}
