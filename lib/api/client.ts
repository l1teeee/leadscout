const SERVER_API_URL = process.env.API_URL ?? 'http://127.0.0.1:8000';
const BROWSER_API_URL = "/backend";

function getStoredToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )ls_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const baseUrl = typeof window === "undefined" ? SERVER_API_URL : BROWSER_API_URL;
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const isAuthEndpoint = path === "/api/auth/login" || path === "/api/auth/register";
    const isOnboardingEndpoint = path === "/api/auth/onboarding";
    if (res.status === 401 && typeof window !== "undefined" && !isAuthEndpoint) {
      document.cookie = "ls_token=; path=/; max-age=0";
      window.location.href = "/login";
    }
    let detail = "";
    try {
      const body = await res.clone().json();
      detail = typeof body?.detail === "string" ? body.detail : "";
    } catch {
      // Keep the generic API error if the response is not JSON.
    }
    if (
      res.status === 403 &&
      typeof window !== "undefined" &&
      !isOnboardingEndpoint &&
      detail.toLowerCase().includes("onboarding")
    ) {
      window.location.href = "/onboarding";
    }
    throw new Error(detail || `API ${res.status} on ${path}`);
  }
  return res.json() as Promise<T>;
}
