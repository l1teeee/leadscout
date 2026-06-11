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
