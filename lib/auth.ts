export const SESSION_COOKIE_NAME = "ls_token";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const SIG_KEY = "ls_user_sig";

function getCookieSecurityAttribute(): string {
  return typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
}

export function setToken(token: string): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toUTCString();
  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${SESSION_MAX_AGE_SECONDS}; expires=${expires}; SameSite=Strict${getCookieSecurityAttribute()}`;
}

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearToken(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict${getCookieSecurityAttribute()}`;
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
