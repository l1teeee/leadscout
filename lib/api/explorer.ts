import { apiFetch } from "./client";

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

export async function searchExplorer(body: ExplorerSearchRequest): Promise<ExplorerSearchResponse> {
  return apiFetch<ExplorerSearchResponse>("/api/explorer/search", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
