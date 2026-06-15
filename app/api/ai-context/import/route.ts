import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import {
  BUSINESS_MAX,
  CONSTRAINTS_MAX,
  JSON_IMPORT_MAX_CHARS,
  hasPromptInjectionText,
  hasSensitiveText,
  sanitizeAiContextText,
  validateAiContext,
} from "@/lib/ai-context";
import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { env } from "@/lib/env";

const MAX_REQUESTS = 6;
const WINDOW_MS = 60_000;

const buckets = new Map<string, { count: number; resetAt: number }>();

interface ImportRequest {
  json_payload?: unknown;
  lang?: unknown;
}

interface AiContextImport {
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

function stringifyPayload(value: unknown): string | null {
  if (typeof value !== "object" || value === null) return null;
  if (!Array.isArray(value) && Object.keys(value as Record<string, unknown>).length === 0) return null;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token || isTokenExpired(token)) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  if (isRateLimited(getRateLimitKey(request, token))) {
    return NextResponse.json({ detail: "Too many requests" }, { status: 429 });
  }

  let body: ImportRequest;
  try {
    body = await request.json() as ImportRequest;
  } catch {
    return NextResponse.json({ detail: "Invalid JSON" }, { status: 400 });
  }

  const serializedJson = stringifyPayload(body.json_payload);
  const lang = body.lang === "es" ? "es" : "en";

  if (!serializedJson) {
    return NextResponse.json({ detail: "JSON object or array is required" }, { status: 400 });
  }
  if (serializedJson.length > JSON_IMPORT_MAX_CHARS) {
    return NextResponse.json({ detail: "Imported JSON is too large" }, { status: 413 });
  }
  if (hasPromptInjectionText(serializedJson) || hasSensitiveText(serializedJson)) {
    return NextResponse.json({ detail: "Unsafe JSON content" }, { status: 400 });
  }

  // Forward to FastAPI backend — OpenAI key lives there, not here
  let backendRes: Response;
  try {
    backendRes = await fetch(`${env.apiUrl}/api/settings/ai-context/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ json_payload: body.json_payload, lang }),
    });
  } catch {
    return NextResponse.json({ detail: "Could not reach backend" }, { status: 502 });
  }

  if (!backendRes.ok) {
    const status = backendRes.status === 503 ? 503 : 502;
    return NextResponse.json({ detail: "Could not analyze JSON" }, { status });
  }

  let raw: Partial<AiContextImport>;
  try {
    raw = await backendRes.json() as Partial<AiContextImport>;
  } catch {
    return NextResponse.json({ detail: "Invalid backend response" }, { status: 502 });
  }

  const imported: AiContextImport = {
    business_context: sanitizeAiContextText(String(raw.business_context ?? ""), BUSINESS_MAX),
    constraints: sanitizeAiContextText(String(raw.constraints ?? ""), CONSTRAINTS_MAX),
  };

  if (!imported.business_context || !imported.constraints) {
    return NextResponse.json({ detail: "Incomplete AI output" }, { status: 502 });
  }

  // Final output safety gate before sending to client
  const validation = validateAiContext(imported.business_context, imported.constraints);
  if (validation.hasSensitiveData || validation.hasPromptInjection) {
    return NextResponse.json({ detail: "Unsafe AI output" }, { status: 502 });
  }

  return NextResponse.json(imported);
}
