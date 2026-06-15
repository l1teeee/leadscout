import { apiFetch } from "./client";
import type { Lead, LeadStatus, LeadPriority } from "@/lib/data";

export const MAX_LEADS_LIMIT = 200;

interface ApiLead {
  id: string;
  workspace_id: string;
  name: string;
  category: string;
  location: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  score: number;
  status: LeadStatus;
  priority: LeadPriority;
  issues: string[];
  phone: string | null;
  website: string | null;
  google_place_id: string | null;
  source: string;
  last_contact: string | null;
  ai_analysis: string | null;
  social_profiles: Array<{ platform: string; url: string }> | null;
  is_viewed: boolean;
  created_at: string | null;
  updated_at: string | null;
}

interface LeadListResponse {
  data: ApiLead[];
  total: number;
}

type LeadCreateResponse = ApiLead | { data: ApiLead };

function adapt(a: ApiLead): Lead {
  return {
    id: a.id,
    name: a.name,
    category: a.category,
    location: a.location ?? "",
    address: a.address ?? undefined,
    latitude: a.latitude ?? undefined,
    longitude: a.longitude ?? undefined,
    score: a.score,
    status: a.status,
    priority: a.priority,
    issues: a.issues,
    phone: a.phone ?? undefined,
    website: a.website ?? undefined,
    lastContact: a.last_contact ?? undefined,
    ai_analysis: a.ai_analysis ?? undefined,
    social_profiles: a.social_profiles ?? undefined,
    is_viewed: a.is_viewed,
  };
}

export interface LeadFilters {
  q?: string;
  status?: LeadStatus | "";
  priority?: LeadPriority | "";
  category?: string;
  min_score?: number;
  max_score?: number;
  is_viewed?: boolean;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface LeadListResult {
  leads: Lead[];
  total: number;
}

export interface CreateLeadInput {
  name: string;
  category: string;
  location: string;
  phone?: string;
  website?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  score?: number;
  issues?: string[];
}

export async function getLeads(filters: LeadFilters = {}, signal?: AbortSignal, token?: string): Promise<LeadListResult> {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.category && filters.category !== "all") params.set("category", filters.category);
  if (filters.min_score != null) params.set("min_score", String(filters.min_score));
  if (filters.max_score != null) params.set("max_score", String(filters.max_score));
  if (filters.is_viewed != null) params.set("is_viewed", String(filters.is_viewed));
  if (filters.sort_by) params.set("sort_by", filters.sort_by);
  if (filters.sort_order) params.set("sort_order", filters.sort_order);
  if (filters.limit != null) {
    const limit = Math.min(Math.max(Math.trunc(filters.limit), 1), MAX_LEADS_LIMIT);
    params.set("limit", String(limit));
  }
  if (filters.offset != null) params.set("offset", String(filters.offset));
  const qs = params.toString();
  const res = await apiFetch<LeadListResponse>(`/api/leads${qs ? `?${qs}` : ""}`, {
    signal,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return { leads: res.data.map(adapt), total: res.total };
}

function nullableText(value?: string): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const payload = {
    name: input.name.trim(),
    category: input.category.trim(),
    location: input.location.trim(),
    phone: nullableText(input.phone),
    website: nullableText(input.website),
    status: input.status ?? "nuevo",
    priority: input.priority ?? "media",
    score: input.score ?? 0,
    issues: input.issues ?? [],
    source: "manual",
  };

  const res = await apiFetch<LeadCreateResponse>("/api/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return adapt("data" in res ? res.data : res);
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  await apiFetch(`/api/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function updateLead(id: string, data: Record<string, unknown>): Promise<void> {
  await apiFetch(`/api/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function markLeadViewed(id: string): Promise<void> {
  await apiFetch(`/api/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_viewed: true }),
  });
}

export async function updateLeadSocialProfiles(
  id: string,
  profiles: Array<{ platform: string; url: string }>
): Promise<void> {
  await apiFetch(`/api/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ social_profiles: profiles }),
  });
}

export interface LeadQualityItem {
  id: string;
  name: string;
  phone?: string;
  website?: string;
  category: string;
  score: number;
}

export async function checkLeadQuality(leads: LeadQualityItem[]): Promise<string[]> {
  const res = await apiFetch<{ junk_ids: string[] }>("/api/leads/quality-check", {
    method: "POST",
    body: JSON.stringify({ leads }),
  });
  return res.junk_ids;
}
