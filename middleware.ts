import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = new Set(["/login", "/register", "/forgot-password", "/verify-otp", "/reset-password"]);
const APP_PATTERN = /^\/(dashboard|explorer|opportunities|oportunidades|leads|campaigns|campanas|reports|reportes|integrations|integraciones|settings|configuracion|onboarding)(\/|$)/;

export function middleware(request: NextRequest) {
  const token = request.cookies.get("ls_token")?.value;
  const { pathname } = request.nextUrl;

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
