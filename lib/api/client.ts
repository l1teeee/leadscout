const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

function getStoredToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )ls_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  });
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      document.cookie = "ls_token=; path=/; max-age=0";
      window.location.href = "/login";
    }
    throw new Error(`API ${res.status} on ${path}`);
  }
  return res.json() as Promise<T>;
}
