const LS_KEY = "ls_ai_context";

// Backend caps business_context at 2000 chars; keep both fields well under that
// once combined with the prefixes added in buildContextString().
export const BUSINESS_MAX = 1000;
export const CONSTRAINTS_MAX = 800;

export interface AiContext {
  businessContext: string;
  constraints: string;
  updatedAt?: string;
}

const EMPTY: AiContext = { businessContext: "", constraints: "" };

export function getAiContext(): AiContext {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    return {
      businessContext: typeof parsed?.businessContext === "string" ? parsed.businessContext : "",
      constraints: typeof parsed?.constraints === "string" ? parsed.constraints : "",
      updatedAt: typeof parsed?.updatedAt === "string" ? parsed.updatedAt : undefined,
    };
  } catch {
    return { ...EMPTY };
  }
}

export function setAiContext(v: { businessContext: string; constraints: string }): void {
  if (typeof window === "undefined") return;
  try {
    const payload: AiContext = {
      businessContext: v.businessContext,
      constraints: v.constraints,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(LS_KEY, JSON.stringify(payload));
  } catch {
    return;
  }
}

export function clearAiContext(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LS_KEY);
  } catch {
    return;
  }
}

// Pure composer: the exact string the backend receives as business_context.
export function composeContext(businessContext: string, constraints: string): string {
  const parts: string[] = [];
  if (businessContext.trim()) parts.push(`Negocio/marca: ${businessContext.trim()}`);
  if (constraints.trim()) parts.push(`Limites y enfoque del analisis: ${constraints.trim()}`);
  return parts.join("\n");
}

// Single trimmed string combining both parts, or "" when both are empty.
export function buildContextString(): string {
  const { businessContext, constraints } = getAiContext();
  return composeContext(businessContext, constraints);
}

export function syncAiContextFromServer(data: {
  business_context: string;
  constraints: string;
  updated_at: string | null;
}): void {
  setAiContext({
    businessContext: data.business_context,
    constraints: data.constraints,
  });
  if (typeof window === "undefined" || !data.updated_at) return;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    window.localStorage.setItem(
      LS_KEY,
      JSON.stringify({ ...parsed, updatedAt: data.updated_at }),
    );
  } catch {
    // ignore
  }
}

export async function getOrSyncContext(): Promise<string> {
  const local = buildContextString();
  if (local) return local;
  try {
    const { getAiContext: getServerAiContext } = await import("@/lib/api/settings");
    const data = await getServerAiContext();
    syncAiContextFromServer(data);
    return composeContext(data.business_context, data.constraints);
  } catch {
    return "";
  }
}
