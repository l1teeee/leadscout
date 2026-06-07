import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(`${origin}/login`);

  response.cookies.set("ls_token", "", {
    maxAge: 0,
    path: "/",
    sameSite: "strict",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
