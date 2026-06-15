import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import {
  BUSINESS_MAX,
  CONSTRAINTS_MAX,
  JSON_IMPORT_MAX_CHARS,
  sanitizeAiContextText,
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

// Inline substitution patterns — never reject, just scrub the offending text
const INJECTION_SUBS: [RegExp, string][] = [
  [/ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/gi, "[removed]"],
  [/jailbreak|prompt\s*injection/gi, "[removed]"],
  [/act\s+as\s+(system|developer|admin|root)/gi, "[removed]"],
  [/disable\s+(safety|guardrails?|filters?)/gi, "[removed]"],
  [/reveal\s+(the\s+)?(prompt|instructions?|secrets?|api\s*keys?)/gi, "[removed]"],
];

const SENSITIVE_SUBS: [RegExp, string][] = [
  [/\bsk-[A-Za-z0-9_-]{20,}\b/g, "[redacted]"],
  [/\bAIza[0-9A-Za-z_-]{20,}\b/g, "[redacted]"],
  [/-----BEGIN\s+(?:RSA\s+|EC\s+|OPENSSH\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END[^-]*KEY-----/gi, "[redacted]"],
];

function sanitizeString(s: string): string {
  let out = s.slice(0, 2000);
  for (const [re, replacement] of INJECTION_SUBS) out = out.replace(re, replacement);
  for (const [re, replacement] of SENSITIVE_SUBS) out = out.replace(re, replacement);
  return out;
}

function sanitizePayload(value: unknown, depth = 0): unknown {
  if (depth > 8) return null;
  if (typeof value === "string") return sanitizeString(value);
  if (Array.isArray(value)) {
    return value.slice(0, 200).map((item) => sanitizePayload(item, depth + 1));
  }
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>).slice(0, 100)) {
      result[k.slice(0, 100)] = sanitizePayload(v, depth + 1);
    }
    return result;
  }
  return value;
}

function isValidPayload(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  if (Array.isArray(value)) return value.length > 0;
  return Object.keys(value as Record<string, unknown>).length > 0;
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

  let body: ImportRequest;
  try {
    body = await request.json() as ImportRequest;
  } catch {
    return NextResponse.json({ detail: "Invalid JSON" }, { status: 400 });
  }

  const raw_payload = body.json_payload;
  const lang = body.lang === "es" ? "es" : "en";

  if (!isValidPayload(raw_payload)) {
    return NextResponse.json({ detail: "JSON object or array is required" }, { status: 400 });
  }

  // Sanitize: scrub injection & sensitive strings inline instead of rejecting
  const sanitized = sanitizePayload(raw_payload);

  let serializedCheck: string;
  try {
    serializedCheck = JSON.stringify(sanitized);
  } catch {
    return NextResponse.json({ detail: "Could not serialize JSON" }, { status: 400 });
  }
  if (serializedCheck.length > JSON_IMPORT_MAX_CHARS) {
    return NextResponse.json({ detail: "Imported JSON is too large" }, { status: 413 });
  }

  // Forward sanitized payload to FastAPI — OpenAI key lives there
  let backendRes: Response;
  try {
    backendRes = await fetch(`${env.apiUrl}/api/settings/ai-context/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ json_payload: sanitized, lang }),
    });
  } catch {
    return NextResponse.json({ detail: "Could not reach backend" }, { status: 502 });
  }

  if (!backendRes.ok) {
    let detail = "Could not analyze JSON";
    try {
      const errBody = await backendRes.json() as { detail?: unknown };
      if (typeof errBody.detail === "string" && errBody.detail.length < 300) {
        detail = errBody.detail;
      }
    } catch { /* keep generic message */ }
    const status = backendRes.status >= 500 ? (backendRes.status === 503 ? 503 : 502) : backendRes.status;
    return NextResponse.json({ detail }, { status });
  }

  let imported: Partial<AiContextImport>;
  try {
    imported = await backendRes.json() as Partial<AiContextImport>;
  } catch {
    return NextResponse.json({ detail: "Invalid backend response" }, { status: 502 });
  }

  const result: AiContextImport = {
    business_context: sanitizeAiContextText(String(imported.business_context ?? ""), BUSINESS_MAX),
    constraints: sanitizeAiContextText(String(imported.constraints ?? ""), CONSTRAINTS_MAX),
  };

  if (!result.business_context || !result.constraints) {
    return NextResponse.json({ detail: "Incomplete AI output" }, { status: 502 });
  }

  return NextResponse.json(result);
}
