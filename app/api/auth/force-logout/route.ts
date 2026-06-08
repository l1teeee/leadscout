import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const response = NextResponse.redirect(`${proto}://${host}/login`);

  response.cookies.set("ls_token", "", {
    maxAge: 0,
    path: "/",
    sameSite: "strict",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
