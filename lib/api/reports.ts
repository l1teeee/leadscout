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

export async function getReportSummary(): Promise<ReportSummary> {
  return apiFetch<ReportSummary>("/api/reports/summary");
}
