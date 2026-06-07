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

export function proxy(request: NextRequest) {
  const token = request.cookies.get("ls_token")?.value;
  const { pathname } = request.nextUrl;

  if (token && isTokenExpired(token)) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.set("ls_token", "", { maxAge: 0, path: "/", sameSite: "strict" });
    return response;
  }

  if (!token && APP_PATTERN.test(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && AUTH_ROUTES.has(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|auth/callback|api).*)"],
};
