const COOKIE = "ls_token";
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days
const SIG_KEY = "ls_user_sig";

export function setToken(token: string): void {
  if (typeof document === "undefined") return;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${MAX_AGE}; SameSite=Strict${secure}`;
}

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearToken(): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE}=; path=/; max-age=0; SameSite=Strict${secure}`;
  sessionStorage.removeItem(SIG_KEY);
}

// Stores the HMAC-signed user signature returned by the backend.
// Lives in sessionStorage: tab-isolated, cleared on tab close, never sent in cookies.
export function setUserSignature(sig: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SIG_KEY, sig);
}

export function getUserSignature(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SIG_KEY);
}

export interface TokenUser {
  id: string;
  email: string;
}

export function parseTokenUser(token: string): TokenUser | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { id: payload.sub ?? "", email: payload.email ?? "" };
  } catch {
    return null;
  }
}
