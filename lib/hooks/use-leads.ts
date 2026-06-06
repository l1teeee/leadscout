"use client";

import { useState, useEffect, useMemo } from "react";
import { getLeads } from "@/lib/api/leads";
import { parseApiError } from "@/lib/api/errors";
import type { Lead, LeadStatus, LeadPriority } from "@/lib/data";

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function buildLeadHaystack(lead: Lead): string {
  return normalizeText(
    `${lead.name} ${lead.category} ${lead.location} ${lead.issues.join(" ")}`,
  );
}

export interface UseLeadsReturn {
  leads: Lead[];
  filtered: Lead[];
  selected: Lead | null;
  loading: boolean;
  error: string | null;
  // filters
  query: string;
  setQuery: (q: string) => void;
  status: LeadStatus | "";
  setStatus: (s: LeadStatus | "") => void;
  priority: LeadPriority | "";
  setPriority: (p: LeadPriority | "") => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  // derived metrics
  highPriorityCount: number;
  noContactCount: number;
  avgScore: number;
}

export function useLeads(): UseLeadsReturn {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [priority, setPriority] = useState<LeadPriority | "">("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getLeads()
      .then((data) => {
        setLeads(data);
        setSelectedId(data[0]?.id ?? null);
      })
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    return leads.filter((lead) => {
      const matchesQuery = !q || buildLeadHaystack(lead).includes(q);
      const matchesStatus = !status || lead.status === status;
      const matchesPriority = !priority || lead.priority === priority;
      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [leads, query, status, priority]);

  const selected =
    filtered.find((lead) => lead.id === selectedId) ?? filtered[0] ?? null;

  const highPriorityCount = filtered.filter(
    (lead) => lead.priority === "alta",
  ).length;

  const noContactCount = filtered.filter((lead) => !lead.lastContact).length;

  const avgScore = filtered.length
    ? Math.round(
        filtered.reduce((sum, lead) => sum + lead.score, 0) / filtered.length,
      )
    : 0;

  return {
    leads,
    filtered,
    selected,
    loading,
    error,
    query,
    setQuery,
    status,
    setStatus,
    priority,
    setPriority,
    selectedId,
    setSelectedId,
    highPriorityCount,
    noContactCount,
    avgScore,
  };
}
