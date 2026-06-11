import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "ls_token";

function isSafeRedirect(raw: string): boolean {
  if (!raw.startsWith("/")) return false;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return false;
  try {
    new URL(raw);
    return false;
  } catch {
    return true;
  }
}

function applySecurityHeaders(response: NextResponse): void {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self)"
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (pathname === "/") {
    const destination = token ? "/dashboard" : "/login";
    const url = request.nextUrl.clone();
    url.pathname = destination;
    url.search = "";
    const response = NextResponse.redirect(url);
    applySecurityHeaders(response);
    return response;
  }

  if (pathname === "/login" || pathname === "/register") {
    const next = request.nextUrl.searchParams.get("next");
    if (next && !isSafeRedirect(next)) {
      const url = request.nextUrl.clone();
      url.searchParams.set("next", "/dashboard");
      const response = NextResponse.redirect(url);
      applySecurityHeaders(response);
      return response;
    }
  }

  const response = NextResponse.next();
  applySecurityHeaders(response);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
