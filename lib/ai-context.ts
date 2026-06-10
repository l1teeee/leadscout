const LS_KEY = "ls_ai_context";

export interface AiContext {
  businessContext: string;
  constraints: string;
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
    };
  } catch {
    return { ...EMPTY };
  }
}

export function setAiContext(v: AiContext): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(v));
  } catch {
    // ignore
  }
}

// Single trimmed string combining both parts, or "" when both are empty.
export function buildContextString(): string {
  const { businessContext, constraints } = getAiContext();
  const parts: string[] = [];
  if (businessContext.trim()) parts.push(`Negocio/marca: ${businessContext.trim()}`);
  if (constraints.trim()) parts.push(`Limites y enfoque del analisis: ${constraints.trim()}`);
  return parts.join("\n");
}
