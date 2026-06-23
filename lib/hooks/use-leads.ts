"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api/client";
import {
  createLead as createLeadRequest,
  getLeads,
  MAX_LEADS_LIMIT,
  type CreateLeadInput,
} from "@/lib/api/leads";
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

export const PAGE_SIZE = 7;

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
  viewedFilter: boolean | null;
  setViewedFilter: (v: boolean | null) => void;
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
  createLead: (input: CreateLeadInput) => Promise<Lead>;
  hiddenLeads: HiddenLeadRecord[];
  hideLead: (lead: Lead) => void;
  unhideLead: (id: string) => void;
  selectById: (id: string) => boolean;
}

interface UseLeadsInitialFilters {
  query?: string;
  priority?: LeadPriority | "";
}

export function useLeads(initialFilters: UseLeadsInitialFilters = {}): UseLeadsReturn {
  const initialQuery = initialFilters.query ?? "";
  const initialPriority = initialFilters.priority ?? "";

  const [leads, setLeads] = useState<Lead[]>([]);
  const [hiddenRecords, setHiddenRecords] = useState<HiddenLeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsStats, setWsStats] = useState<WorkspaceStats>({ total: 0, high_priority_count: 0, no_contact_count: 0, avg_score: 0 });

  const refreshStats = useCallback(() => {
    apiFetch<WorkspaceStats>("/api/leads/stats").then(setWsStats).catch(() => {});
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

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
  const [query, setQueryState] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatusState] = useState<LeadStatus | "">("");
  const [priority, setPriorityState] = useState<LeadPriority | "">(initialPriority);
  const [viewedFilter, setViewedFilterState] = useState<boolean | null>(null);
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

  function setViewedFilter(v: boolean | null) {
    setViewedFilterState(v);
    setPageState(0);
  }

  function toggleSort(field: SortField) {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder(field === "score" ? "desc" : "asc");
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
        is_viewed: viewedFilter ?? undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit: MAX_LEADS_LIMIT,
        offset: 0,
      }, controller.signal);
      if (controller.signal.aborted) return;
      setLeads(result.leads);
      // Keep selection if it still exists in the fetched result, else select the first result.
      setSelectedId((prev) =>
        result.leads.find((l) => l.id === prev)?.id ?? result.leads[0]?.id ?? null,
      );
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(parseApiError(err));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [debouncedQuery, status, priority, viewedFilter, sortBy, sortOrder]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void fetchLeads();
    });
    return () => {
      active = false;
    };
  }, [fetchLeads]);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const visibleLeads = leads.filter((l) => !hiddenIds.has(l.id));
  const visibleTotal = visibleLeads.length;
  const totalPages = Math.max(1, Math.ceil(visibleTotal / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedVisibleLeads = visibleLeads.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const selected = paginatedVisibleLeads.find((l) => l.id === selectedId) ?? paginatedVisibleLeads[0] ?? null;

  const highPriorityCount = wsStats.total > 0 ? wsStats.high_priority_count : leads.filter((l) => l.priority === "alta").length;
  const noContactCount = wsStats.total > 0 ? wsStats.no_contact_count : visibleLeads.filter((l) => l.status === "nuevo").length;
  const avgScore = wsStats.total > 0 ? wsStats.avg_score : (leads.length ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length) : 0);

  const selectById = useCallback((id: string): boolean => {
    const idx = visibleLeads.findIndex((l) => l.id === id);
    if (idx === -1) return false;
    setPageState(Math.floor(idx / PAGE_SIZE));
    setSelectedId(id);
    return true;
  }, [visibleLeads]);

  const createLead = useCallback(async (input: CreateLeadInput) => {
    const created = await createLeadRequest(input);
    setQueryState("");
    setDebouncedQuery("");
    setStatusState("");
    setPriorityState("");
    setViewedFilterState(null);
    setSortBy("created_at");
    setSortOrder("desc");
    setPageState(0);
    setSelectedId(created.id);
    setLeads((current) => [created, ...current.filter((lead) => lead.id !== created.id)]);
    refreshStats();
    return created;
  }, [refreshStats]);

  return {
    leads: paginatedVisibleLeads,
    selected,
    loading,
    error,
    query,
    setQuery,
    status,
    setStatus,
    priority,
    setPriority,
    viewedFilter,
    setViewedFilter,
    selectedId,
    setSelectedId,
    sortBy,
    sortOrder,
    toggleSort,
    page: safePage,
    setPage,
    total: visibleTotal,
    totalPages,
    highPriorityCount,
    noContactCount,
    avgScore,
    refresh: fetchLeads,
    createLead,
    hiddenLeads: hiddenRecords,
    hideLead,
    unhideLead,
    selectById,
  };
}
