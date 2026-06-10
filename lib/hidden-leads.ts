const LS_KEY = "ls_hidden_leads";

export interface HiddenLeadRecord {
  id: string;
  name: string;
  category: string;
  location: string;
  score: number;
  priority: string;
}

function read(): HiddenLeadRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(records: HiddenLeadRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(records));
  } catch {
    // ignore quota / serialization errors
  }
}

export function getHiddenLeads(): HiddenLeadRecord[] {
  return read();
}

export function getHiddenIds(): Set<string> {
  return new Set(read().map((r) => r.id));
}

export function hideLead(rec: HiddenLeadRecord): void {
  const records = read();
  if (records.some((r) => r.id === rec.id)) return;
  records.push(rec);
  write(records);
}

export function unhideLead(id: string): void {
  write(read().filter((r) => r.id !== id));
}

export function isLeadHidden(id: string): boolean {
  return read().some((r) => r.id === id);
}
