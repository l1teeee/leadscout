import { NextResponse } from "next/server";

// Auth is now handled by the FastAPI backend.
// This route only handles redirects for any legacy OAuth flows.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const raw = searchParams.get("next") ?? "/dashboard";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
  return NextResponse.redirect(`${origin}${next}`);
}
