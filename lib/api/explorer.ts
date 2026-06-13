import { apiFetch } from "./client";
import { getUserSignature, getToken, parseTokenUser } from "@/lib/auth";
import { getOrSyncContext } from "@/lib/ai-context";

export const EXPLORER_SEARCH_TIMEOUT_MS = 180_000;

export interface ExplorerSearchRequest {
  query: string;
  location: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  category?: string;
}

export interface ExplorerResultItem {
  google_place_id: string;
  name: string;
  category: string;
  address: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  score: number;
  issues: string[];
  already_saved: boolean;
}

export interface ExplorerSearchResponse {
  results: ExplorerResultItem[];
  total: number;
  saved_new: number;
}

export interface SocialProfile {
  platform: string;
  url: string;
}

export interface LeadAnalyzeRequest {
  lead_id?: string;
  name: string;
  category: string;
  location: string;
  phone?: string;
  website?: string;
  score: number;
  issues: string[];
  force_refresh?: boolean;
  business_context?: string;
}

export interface LeadAnalyzeResponse {
  analysis: string;
  social_profiles?: SocialProfile[];
}

export interface LeadChatRequest {
  lead_id?: string;
  name: string;
  category: string;
  location: string;
  phone?: string;
  website?: string;
  score: number;
  issues: string[];
  analysis?: string;
  question: string;
  business_context?: string;
}

export interface LeadChatResponse {
  answer: string;
}

export interface OutreachRequest {
  lead_id?: string;
  name: string;
  category: string;
  location: string;
  phone?: string;
  website?: string;
  score: number;
  issues: string[];
  platform: string;
  social_profiles?: SocialProfile[];
  business_context?: string;
}

export interface OutreachResponse {
  message: string;
  platform: string;
}

export async function analyzeLead(body: LeadAnalyzeRequest): Promise<LeadAnalyzeResponse> {
  const business_context = body.business_context ?? ((await getOrSyncContext()) || undefined);
  return apiFetch<LeadAnalyzeResponse>("/api/explorer/analyze", {
    method: "POST",
    body: JSON.stringify({ ...body, business_context }),
  });
}

export async function askLeadQuestion(body: LeadChatRequest): Promise<LeadChatResponse> {
  const business_context = body.business_context ?? ((await getOrSyncContext()) || undefined);
  return apiFetch<LeadChatResponse>("/api/explorer/chat", {
    method: "POST",
    body: JSON.stringify({ ...body, business_context }),
  });
}

export async function generateOutreachMessage(body: OutreachRequest): Promise<OutreachResponse> {
  const business_context = body.business_context ?? ((await getOrSyncContext()) || undefined);
  return apiFetch<OutreachResponse>("/api/explorer/outreach", {
    method: "POST",
    body: JSON.stringify({ ...body, business_context }),
  });
}

export async function searchExplorer(body: ExplorerSearchRequest): Promise<ExplorerSearchResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EXPLORER_SEARCH_TIMEOUT_MS);

  const sig = getUserSignature();
  const userId = (() => {
    const t = getToken();
    return t ? parseTokenUser(t)?.id : undefined;
  })();

  try {
    return await apiFetch<ExplorerSearchResponse>("/api/explorer/search", {
      method: "POST",
      body: JSON.stringify(body),
      signal: controller.signal,
      headers: {
        ...(sig ? { "X-User-Signature": sig } : {}),
        ...(userId ? { "X-User-Id": userId } : {}),
      },
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("EXPLORER_SEARCH_TIMEOUT");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

