import { NextResponse } from "next/server";

export async function GET() {
  const apiUrl = process.env.API_URL ?? "NOT_SET";
  let meResult: unknown = null;
  let meError: string | null = null;

  try {
    const res = await fetch(`${apiUrl}/api/auth/me`, {
      headers: { Authorization: "Bearer test" },
      cache: "no-store",
    });
    meResult = { status: res.status, ok: res.ok };
  } catch (err) {
    meError = String(err);
  }

  return NextResponse.json({ apiUrl, meResult, meError });
}
