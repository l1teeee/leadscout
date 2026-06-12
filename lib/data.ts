export type LeadStatus = "nuevo" | "contactado" | "calificado" | "perdido" | "desvinculado";
export type LeadPriority = "alta" | "media" | "baja";

export interface Lead {
  id: string;
  name: string;
  category: string;
  location: string;
  score: number;
  status: LeadStatus;
  priority: LeadPriority;
  issues: string[];
  phone?: string;
  website?: string;
  lastContact?: string;
  // fields from API
  address?: string;
  latitude?: number;
  longitude?: number;
  ai_analysis?: string;
  social_profiles?: Array<{ platform: string; url: string }>;
  is_viewed: boolean;
}

// Data now comes from the backend API via lib/api/leads.ts
// These empty exports keep lib/explorer-data.ts from breaking while the
// explorer hook switches to dynamic API data.
export const LEADS: Lead[] = [];

export const STATS = {
  totalLeads: 0,
  newThisWeek: 0,
  contacted: 0,
  avgScore: 0,
  highPriority: 0,
};

export const CHART_DATA: { label: string; value: number }[] = [];
