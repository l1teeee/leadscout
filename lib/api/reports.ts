import { apiFetch } from "./client";

export interface ReportSummary {
  total_leads: number;
  new_this_week: number;
  contacted: number;
  avg_score: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  by_category: Record<string, number>;
  weekly_activity: { date: string; leads: number }[];
}

export const EMPTY_SUMMARY: ReportSummary = {
  total_leads: 0,
  new_this_week: 0,
  contacted: 0,
  avg_score: 0,
  by_status: {},
  by_priority: {},
  by_category: {},
  weekly_activity: [],
};

export async function getReportSummary(token?: string): Promise<ReportSummary> {
  return apiFetch<ReportSummary>("/api/reports/summary", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export interface TimelineResponse {
  points: Array<{ date: string; count: number }>;
}

export async function getTimeline(range: number): Promise<TimelineResponse> {
  return apiFetch<TimelineResponse>(`/api/reports/timeline?range=${range}`);
}

export async function downloadReport(format: "pdf" | "xlsx", days: number): Promise<void> {
  const { getToken } = await import("@/lib/auth");
  const token = getToken();
  const res = await fetch(`/backend/api/reports/export?format=${format}&days=${days}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const today = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `scoutia-report-${today}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function emailReport(days: number): Promise<{ sent: boolean; to: string }> {
  return apiFetch<{ sent: boolean; to: string }>("/api/reports/email", {
    method: "POST",
    body: JSON.stringify({ days }),
  });
}
