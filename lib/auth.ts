const COOKIE = "ls_token";
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export function setToken(token: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${MAX_AGE}; SameSite=Strict`;
}

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearToken(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=; path=/; max-age=0`;
}

export interface TokenUser {
  id: string;
  email: string;
}

export function parseTokenUser(token: string): TokenUser | null {
  try {
    if (token.startsWith("mock::")) {
      return { id: "mock-user", email: token.slice(6) };
    }
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { id: payload.sub ?? "", email: payload.email ?? "" };
  } catch {
    return null;
  }
}
