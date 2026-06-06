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

export async function getSettingsData(): Promise<SettingsData> {
  const user = await apiFetch<{
    email: string;
    full_name?: string;
    role: string;
    workspace_name?: string;
    industry?: string;
    country?: string;
    city?: string;
  }>("/api/auth/me");

  return {
    workspace: {
      workspace_name: user.workspace_name ?? "",
      industry: user.industry ?? "",
      country: user.country ?? "",
      city: user.city ?? "",
    },
    user: {
      full_name: user.full_name ?? "",
      email: user.email,
      role: user.role,
    },
  };
}

export async function updateWorkspace(payload: UpdateWorkspacePayload): Promise<void> {
  await apiFetch("/api/auth/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
