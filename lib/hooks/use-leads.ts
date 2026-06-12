"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api/client";
import { getLeads } from "@/lib/api/leads";
import { parseApiError } from "@/lib/api/errors";
import type { Lead, LeadStatus, LeadPriority } from "@/lib/data";
import {
  getHiddenLeads,
  hideLead as persistHide,
  unhideLead as persistUnhide,
  type HiddenLeadRecord,
} from "@/lib/hidden-leads";

interface WorkspaceStats {
  total: number;
  high_priority_count: number;
  no_contact_count: number;
  avg_score: number;
}

export const PAGE_SIZE = 10;

export type SortField = "name" | "score" | "status" | "priority" | "created_at";

export interface UseLeadsReturn {
  leads: Lead[];
  selected: Lead | null;
  loading: boolean;
  error: string | null;
  query: string;
  setQuery: (q: string) => void;
  status: LeadStatus | "";
  setStatus: (s: LeadStatus | "") => void;
  priority: LeadPriority | "";
  setPriority: (p: LeadPriority | "") => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  sortBy: SortField;
  sortOrder: "asc" | "desc";
  toggleSort: (field: SortField) => void;
  page: number;
  setPage: (p: number) => void;
  total: number;
  totalPages: number;
  highPriorityCount: number;
  noContactCount: number;
  avgScore: number;
  refresh: () => void;
  hiddenLeads: HiddenLeadRecord[];
  hideLead: (lead: Lead) => void;
  unhideLead: (id: string) => void;
}

export function useLeads(): UseLeadsReturn {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [hiddenRecords, setHiddenRecords] = useState<HiddenLeadRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsStats, setWsStats] = useState<WorkspaceStats>({ total: 0, high_priority_count: 0, no_contact_count: 0, avg_score: 0 });

  useEffect(() => {
    apiFetch<WorkspaceStats>("/api/leads/stats").then(setWsStats).catch(() => {});
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setHiddenRecords(getHiddenLeads());
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const hiddenIds = new Set(hiddenRecords.map((r) => r.id));

  function hideLead(lead: Lead) {
    persistHide({
      id: lead.id,
      name: lead.name,
      category: lead.category,
      location: lead.location,
      score: lead.score,
      priority: lead.priority,
    });
    setHiddenRecords(getHiddenLeads());
  }

  function unhideLead(id: string) {
    persistUnhide(id);
    setHiddenRecords(getHiddenLeads());
  }

  // raw query (typed) vs debounced (sent to API)
  const [query, setQueryState] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatusState] = useState<LeadStatus | "">("");
  const [priority, setPriorityState] = useState<LeadPriority | "">("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortField>("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPageState] = useState(0);

  function setQuery(q: string) {
    setQueryState(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(q);
      setPageState(0);
    }, 400);
  }

  function setStatus(s: LeadStatus | "") {
    setStatusState(s);
    setPageState(0);
  }

  function setPriority(p: LeadPriority | "") {
    setPriorityState(p);
    setPageState(0);
  }

  function toggleSort(field: SortField) {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPageState(0);
  }

  function setPage(p: number) {
    setPageState(p);
    setSelectedId(null);
  }

  const abortRef = useRef<AbortController | null>(null);

  const fetchLeads = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const result = await getLeads({
        q: debouncedQuery || undefined,
        status: status || undefined,
        priority: priority || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }, controller.signal);
      if (controller.signal.aborted) return;
      setLeads(result.leads);
      setTotal(result.total);
      // keep selection if it's still on this page, else select first
      setSelectedId((prev) =>
        result.leads.find((l) => l.id === prev)?.id ?? result.leads[0]?.id ?? null,
      );
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(parseApiError(err));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [debouncedQuery, status, priority, sortBy, sortOrder, page]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const visibleLeads = leads.filter((l) => !hiddenIds.has(l.id));
  const selected = visibleLeads.find((l) => l.id === selectedId) ?? visibleLeads[0] ?? null;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const highPriorityCount = wsStats.total > 0 ? wsStats.high_priority_count : leads.filter((l) => l.priority === "alta").length;
  const noContactCount = wsStats.total > 0 ? wsStats.no_contact_count : leads.filter((l) => !l.lastContact).length;
  const avgScore = wsStats.total > 0 ? wsStats.avg_score : (leads.length ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length) : 0);

  return {
    leads: visibleLeads,
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
    sortBy,
    sortOrder,
    toggleSort,
    page,
    setPage,
    total,
    totalPages,
    highPriorityCount,
    noContactCount,
    avgScore,
    refresh: fetchLeads,
    hiddenLeads: hiddenRecords,
    hideLead,
    unhideLead,
  };
}
