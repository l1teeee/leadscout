import type { Lead } from "@/lib/data";

const LS_KEY = "ls_junk_leads";

const GENERIC_WORDS = new Set([
  "hotel",
  "bar",
  "cafe",
  "cafeteria",
  "restaurante",
  "restaurant",
  "tienda",
  "shop",
  "store",
  "usa",
  "mexico",
  "guatemala",
  "negocio",
  "empresa",
  "local",
  "otro",
  "otros",
  "servicio",
  "servicios",
  "comercio",
  "consultora",
  "gym",
  "gimnasio",
  "farmacia",
  "panaderia",
  "lavanderia",
  "salon",
  "clinica",
  "consultorio",
  "oficina",
  "centro",
]);

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(ids));
  } catch {}
}

function hasValue(value?: string): boolean {
  return Boolean(value?.trim());
}

function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
}

export function isLowQuality(lead: Lead): boolean {
  if (hasValue(lead.phone) || hasValue(lead.website)) return false;

  const normalized = normalizeName(lead.name);
  if (normalized.length <= 4) return true;

  const words = normalized.split(/\s+/).filter(Boolean);
  return words.length >= 1 && words.length <= 2 && words.every((word) => GENERIC_WORDS.has(word));
}

export function getJunkIds(): Set<string> {
  return new Set(read());
}

export function addJunkIds(ids: string[]): void {
  write(Array.from(new Set([...read(), ...ids.filter(Boolean)])));
}

export function clearJunkIds(): void {
  write([]);
}

export function isJunk(id: string): boolean {
  return getJunkIds().has(id);
}
