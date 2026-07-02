import { apiFetch } from "./client";

export interface WorkspaceProfile {
  workspace_name: string;
  industry: string;
  country: string;
  city: string;
  phone?: string;
  website?: string;
}

export interface UserProfile {
  full_name: string;
  email: string;
  role: string;
}

export interface SettingsData {
  workspace: WorkspaceProfile;
  user: UserProfile;
}

export interface UpdateWorkspacePayload {
  workspace_name?: string;
  industry?: string;
  country?: string;
  city?: string;
  phone?: string;
  website?: string;
}

interface WorkspaceSettingsResponse {
  id: string;
  name: string;
  slug: string;
  country: string;
  industry?: string | null;
  city?: string | null;
  phone?: string | null;
  website?: string | null;
  timezone?: string;
  currency?: string;
}

interface MeResponse {
  email: string;
  full_name?: string;
  role: string;
}

export async function getSettingsData(): Promise<SettingsData> {
  const [workspace, user] = await Promise.all([
    apiFetch<WorkspaceSettingsResponse>("/api/settings/workspace"),
    apiFetch<MeResponse>("/api/auth/me"),
  ]);

  return {
    workspace: {
      workspace_name: workspace.name ?? "",
      industry: workspace.industry ?? "",
      country: workspace.country ?? "",
      city: workspace.city ?? "",
      phone: workspace.phone ?? "",
      website: workspace.website ?? "",
    },
    user: {
      full_name: user.full_name ?? "",
      email: user.email,
      role: user.role,
    },
  };
}

// Backend WorkspaceUpdate uses `name` (not `workspace_name`); send only provided fields.
export async function updateWorkspace(payload: UpdateWorkspacePayload): Promise<void> {
  const body: Record<string, string> = {};
  if (payload.workspace_name !== undefined) body.name = payload.workspace_name;
  if (payload.industry !== undefined) body.industry = payload.industry;
  if (payload.country !== undefined) body.country = payload.country;
  if (payload.city !== undefined) body.city = payload.city;
  if (payload.phone !== undefined) body.phone = payload.phone;
  if (payload.website !== undefined) body.website = payload.website;

  await apiFetch("/api/settings/workspace", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export interface TeamMemberData {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  avatar_url: string | null;
}

export interface UsageData {
  plan: string;
  searches_used: number;
  searches_limit: number;
  tokens_used: number;
  tokens_limit: number;
}

export interface AuditEntryData {
  query: string | null;
  location: string | null;
  category: string | null;
  results_count: number;
  created_at: string | null;
}

export async function getTeam(): Promise<TeamMemberData[]> {
  const data = await apiFetch<{ members: TeamMemberData[] }>("/api/settings/team");
  return data.members ?? [];
}

export async function getUsage(): Promise<UsageData> {
  return apiFetch<UsageData>("/api/settings/usage");
}

export async function getAudit(limit?: number): Promise<AuditEntryData[]> {
  const qs = limit ? `?limit=${limit}` : "";
  const data = await apiFetch<{ entries: AuditEntryData[] }>(`/api/settings/audit${qs}`);
  return data.entries ?? [];
}

export interface AiContextData {
  business_context: string;
  constraints: string;
  updated_at: string | null;
}

export async function getAiContext(): Promise<AiContextData> {
  return apiFetch<AiContextData>("/api/settings/ai-context");
}

export async function updateAiContext(
  body: Partial<Pick<AiContextData, "business_context" | "constraints">>,
): Promise<AiContextData> {
  return apiFetch<AiContextData>("/api/settings/ai-context", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export interface AiContextExampleData {
  business_context: string;
  constraints: string;
}

export async function generateAiContextExample(body: {
  business_type: string;
  lang: "en" | "es";
}): Promise<AiContextExampleData> {
  const res = await fetch("/api/ai-context/example", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = "Could not generate example";
    try {
      const payload = await res.json() as { detail?: unknown };
      if (typeof payload.detail === "string") detail = payload.detail;
    } catch {
      // keep generic detail
    }
    throw new Error(detail);
  }

  return res.json() as Promise<AiContextExampleData>;
}

export interface SupportRequestPayload {
  subject: string;
  message: string;
}

export async function sendSupportRequest(payload: SupportRequestPayload): Promise<void> {
  await apiFetch("/api/settings/support", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface AiContextJsonImportData {
  business_context: string;
  constraints: string;
}

export async function importAiContextJson(body: {
  json_payload: unknown;
  lang: "en" | "es";
}): Promise<AiContextJsonImportData> {
  const res = await fetch("/api/ai-context/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = "Could not analyze JSON";
    try {
      const payload = await res.json() as { detail?: unknown };
      if (typeof payload.detail === "string") detail = payload.detail;
    } catch {
      // keep generic detail
    }
    throw new Error(detail);
  }

  return res.json() as Promise<AiContextJsonImportData>;
}
