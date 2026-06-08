import { getToken, clearToken } from "@/lib/auth";
import { env } from "@/lib/env";
import { AppError } from "@/lib/api/errors";

const BROWSER_API_PATH = "/backend";

let _loginRedirectAt = 0;
const LOGIN_REDIRECT_COOLDOWN_MS = 5_000;

function resolveBaseUrl(): string {
  return typeof window === "undefined" ? env.apiUrl : BROWSER_API_PATH;
}

async function extractErrorDetail(res: Response): Promise<string> {
  try {
    const body = await res.clone().json() as { detail?: unknown };
    return typeof body?.detail === "string" ? body.detail : "";
  } catch {
    return "";
  }
}

function handleAuthRedirects(
  status: number,
  path: string,
  detail: string,
): void {
  if (typeof window === "undefined") return;
  const isAuthEndpoint = path === "/api/auth/login" || path === "/api/auth/register";
  if (status === 401 && !isAuthEndpoint) {
    const now = Date.now();
    if (now - _loginRedirectAt < LOGIN_REDIRECT_COOLDOWN_MS) return;
    _loginRedirectAt = now;
    clearToken();
    window.location.href = "/login";
    return;
  }
  const isOnboardingEndpoint = path === "/api/auth/onboarding";
  if (
    status === 403 &&
    !isOnboardingEndpoint &&
    detail.toLowerCase().includes("onboarding")
  ) {
    window.location.href = "/onboarding";
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${resolveBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const detail = await extractErrorDetail(res);
    handleAuthRedirects(res.status, path, detail);
    throw new AppError(detail || `API ${res.status} on ${path}`, res.status);
  }

  return res.json() as Promise<T>;
}
