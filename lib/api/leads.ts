import { apiFetch } from "./client";
import type { Lead, LeadStatus, LeadPriority } from "@/lib/data";

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
  created_at: string | null;
  updated_at: string | null;
}

interface LeadListResponse {
  data: ApiLead[];
  total: number;
}

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
  };
}

export interface LeadFilters {
  q?: string;
  status?: LeadStatus | "";
  priority?: LeadPriority | "";
  category?: string;
  min_score?: number;
  max_score?: number;
}

export async function getLeads(filters: LeadFilters = {}): Promise<Lead[]> {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.category && filters.category !== "all") params.set("category", filters.category);
  if (filters.min_score != null) params.set("min_score", String(filters.min_score));
  if (filters.max_score != null) params.set("max_score", String(filters.max_score));
  const qs = params.toString();
  const res = await apiFetch<LeadListResponse>(`/api/leads${qs ? `?${qs}` : ""}`);
  return res.data.map(adapt);
}
