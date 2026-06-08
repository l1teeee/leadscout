import { apiFetch } from "./client";
import { getUserSignature, getToken, parseTokenUser } from "@/lib/auth";

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
}

export interface LeadAnalyzeResponse {
  analysis: string;
}

export async function analyzeLead(body: LeadAnalyzeRequest): Promise<LeadAnalyzeResponse> {
  return apiFetch<LeadAnalyzeResponse>("/api/explorer/analyze", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function searchExplorer(body: ExplorerSearchRequest): Promise<ExplorerSearchResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

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
