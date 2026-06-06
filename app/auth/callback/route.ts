import { NextResponse } from "next/server";

// Auth is now handled by the FastAPI backend.
// This route only handles redirects for any legacy OAuth flows.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const raw = searchParams.get("next") ?? "/dashboard";
  // Block protocol-relative URLs: //, /\ (both resolve as external in browsers)
  const isSafe = raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\");
  const next = isSafe ? raw : "/dashboard";
  return NextResponse.redirect(`${origin}${next}`);
}
