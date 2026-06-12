import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = new Set(["/login", "/register", "/forgot-password", "/verify-otp", "/reset-password"]);
const APP_PATTERN = /^\/(dashboard|explorer|opportunities|oportunidades|leads|campaigns|campanas|reports|reportes|integrations|integraciones|settings|configuracion|onboarding)(\/|$)/;

function isTokenExpired(token: string): boolean {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(b64));
    return typeof payload.exp !== "number" || payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

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

export function proxy(request: NextRequest) {
  const token = request.cookies.get("ls_token")?.value;
  const { pathname } = request.nextUrl;

  // Redirect root based on auth state
  if (pathname === "/") {
    const destination = token && !isTokenExpired(token) ? "/dashboard" : "/login";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (token && isTokenExpired(token)) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.set("ls_token", "", { maxAge: 0, path: "/", sameSite: "strict" });
    return response;
  }

  if (!token && APP_PATTERN.test(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && AUTH_ROUTES.has(pathname)) {
    // Sanitize open-redirect in ?next= before bouncing to dashboard
    const next = request.nextUrl.searchParams.get("next");
    if (next && !isSafeRedirect(next)) {
      const url = request.nextUrl.clone();
      url.searchParams.set("next", "/dashboard");
      return NextResponse.redirect(url);
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|auth/callback|api).*)"],
};
