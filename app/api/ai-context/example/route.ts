import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import {
  BUSINESS_MAX,
  CONSTRAINTS_MAX,
  sanitizeAiContextText,
  sanitizeExampleSeed,
  hasPromptInjectionText,
  hasSensitiveText,
  validateAiContext,
} from "@/lib/ai-context";
import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { env } from "@/lib/env";

const MAX_REQUESTS = 6;
const WINDOW_MS = 60_000;

const buckets = new Map<string, { count: number; resetAt: number }>();

interface ExampleRequest {
  business_type?: unknown;
  lang?: unknown;
}

interface AiContextExample {
  business_context: string;
  constraints: string;
}

function parseJwtPayload(token: string): { sub?: string; exp?: number } | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(normalized, "base64").toString("utf8")) as {
      sub?: string;
      exp?: number;
    };
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  return typeof payload?.exp !== "number" || payload.exp * 1000 < Date.now();
}

function getRateLimitKey(request: NextRequest, token: string): string {
  const userId = parseJwtPayload(token)?.sub;
  if (userId) return `user:${userId}`;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `ip:${forwarded || "unknown"}`;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (current.count >= MAX_REQUESTS) return true;
  current.count += 1;
  return false;
}

export async function POST(request: NextRequest) {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token || isTokenExpired(token)) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  if (isRateLimited(getRateLimitKey(request, token))) {
    return NextResponse.json({ detail: "Too many requests" }, { status: 429 });
  }

  let body: ExampleRequest;
  try {
    body = await request.json() as ExampleRequest;
  } catch {
    return NextResponse.json({ detail: "Invalid JSON" }, { status: 400 });
  }

  const seed = sanitizeExampleSeed(
    typeof body.business_type === "string" ? body.business_type : "",
  );
  const lang = body.lang === "es" ? "es" : "en";

  if (seed.length < 3) {
    return NextResponse.json({ detail: "Business type is required" }, { status: 400 });
  }
  if (hasPromptInjectionText(seed) || hasSensitiveText(seed)) {
    return NextResponse.json({ detail: "Unsafe business type" }, { status: 400 });
  }

  // Forward to FastAPI backend — OpenAI key lives there, not here
  let backendRes: Response;
  try {
    backendRes = await fetch(`${env.apiUrl}/api/settings/ai-context/example`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ business_type: seed, lang }),
    });
  } catch {
    return NextResponse.json({ detail: "Could not reach backend" }, { status: 502 });
  }

  if (!backendRes.ok) {
    const status = backendRes.status === 503 ? 503 : 502;
    return NextResponse.json({ detail: "Could not generate example" }, { status });
  }

  let raw: Partial<AiContextExample>;
  try {
    raw = await backendRes.json() as Partial<AiContextExample>;
  } catch {
    return NextResponse.json({ detail: "Invalid backend response" }, { status: 502 });
  }

  const example: AiContextExample = {
    business_context: sanitizeAiContextText(String(raw.business_context ?? ""), BUSINESS_MAX),
    constraints: sanitizeAiContextText(String(raw.constraints ?? ""), CONSTRAINTS_MAX),
  };

  if (!example.business_context || !example.constraints) {
    return NextResponse.json({ detail: "Incomplete example" }, { status: 502 });
  }

  // Final output safety check before sending to client
  const validation = validateAiContext(example.business_context, example.constraints);
  if (validation.hasSensitiveData || validation.hasPromptInjection) {
    return NextResponse.json({ detail: "Unsafe AI output" }, { status: 502 });
  }

  return NextResponse.json(example);
}
