"use client";

import { useState, useCallback, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
  type Modifier,
} from "@dnd-kit/core";
import { ArrowUpDown } from "lucide-react";
import { PriorityBadge, Tag } from "@/components/ui/badge";
import { EmptyInsight } from "@/components/ui/empty-insight";
import { ScoreBar } from "@/components/ui/score-bar";
import { ExplorerLeadDetail } from "@/components/leadscout/explorer-lead-detail";
import { useLanguage } from "@/contexts/language-context";
import { updateLeadStatus } from "@/lib/api/leads";
import type { Lead, LeadStatus } from "@/lib/data";
import { translations } from "@/lib/i18n";

const bodyTextStyle = { fontFamily: "var(--font-body), system-ui, sans-serif" };

const COLUMNS = ["nuevo", "contactado", "calificado", "perdido"] as const satisfies readonly LeadStatus[];

type SortKey = "score_desc" | "score_asc" | "priority" | "name";

const PRIORITY_ORDER: Record<string, number> = { alta: 0, media: 1, baja: 2 };

const SORT_LABELS: Record<SortKey, string> = {
  score_desc: "Mayor puntaje",
  score_asc: "Menor puntaje",
  priority: "Prioridad",
  name: "A-Z",
};

function sortLeads(leads: Lead[], sort: SortKey): Lead[] {
  return [...leads].sort((a, b) => {
    switch (sort) {
      case "score_desc": return b.score - a.score;
      case "score_asc": return a.score - b.score;
      case "priority": return (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
      case "name": return a.name.localeCompare(b.name);
    }
  });
}

interface OportunidadesKanbanProps {
  initialLeads: Lead[];
}

interface CardContentProps {
  lead: Lead;
  tr: (typeof translations)[keyof typeof translations]["oportunidades"];
  onTitleClick?: () => void;
}

function CardContent({ lead, tr, onTitleClick }: CardContentProps) {
  return (
    <>
      <div className="mb-2 flex items-start justify-between gap-2">
        <p
          className={`text-sm font-bold leading-snug ${onTitleClick ? "cursor-pointer underline-offset-2 hover:underline" : ""}`}
          style={{ ...bodyTextStyle, color: "var(--text)" }}
          onClick={onTitleClick}
        >
          {lead.name}
        </p>
        <PriorityBadge priority={lead.priority} className="shrink-0" />
      </div>

      <p className="mb-3 text-xs" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
        {lead.category} &middot; {lead.location}
      </p>

      <div className="pixel-inset mb-3 bg-white p-1">
        <ScoreBar score={lead.score} />
      </div>

      <div className="mb-3 flex flex-wrap gap-1">
        {lead.issues.length > 0 ? (
          lead.issues.slice(0, 2).map((issue) => (
            <Tag key={issue} className="rounded-none border border-[#18181B] text-[10px]">
              {issue}
            </Tag>
          ))
        ) : (
          <p className="text-[11px] font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
            {tr.gaps}
          </p>
        )}
        {lead.issues.length > 2 && (
          <Tag className="rounded-none border border-[#18181B] text-[10px]">
            +{lead.issues.length - 2}
          </Tag>
        )}
      </div>

      {lead.lastContact && (
        <p className="text-xs font-medium" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
          {tr.lastContact}: {lead.lastContact}
        </p>
      )}
    </>
  );
}

interface KanbanCardProps {
  lead: Lead;
  tr: (typeof translations)[keyof typeof translations]["oportunidades"];
  onTitleClick: () => void;
}

function KanbanCard({ lead, tr, onTitleClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="group bg-white p-4 hover:bg-[#F4F4F5]"
      style={{
        border: isDragging ? "2px dashed var(--pixel-border, #18181B)" : "2px solid var(--pixel-border, #18181B)",
        background: isDragging ? "transparent" : "#FFFFFF",
        boxShadow: isDragging ? "none" : "2px 2px 0 var(--pixel-shadow, #18181B)",
        cursor: isDragging ? "grabbing" : "grab",
        minHeight: isDragging ? 80 : undefined,
        opacity: isDragging ? 0 : 1,
      }}
    >
      <CardContent lead={lead} tr={tr} onTitleClick={onTitleClick} />
    </div>
  );
}

interface KanbanColumnProps {
  col: LeadStatus;
  leads: Lead[];
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
  onLeadClick: (lead: Lead) => void;
  tr: (typeof translations)[keyof typeof translations]["oportunidades"];
}

function KanbanColumn({ col, leads, sort, onSortChange, onLeadClick, tr }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: col });
  const [menuOpen, setMenuOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const sortedLeads = sortLeads(leads, sort);

  function handleSortSelect(key: SortKey) {
    setMenuOpen(false);
    if (key === sort) return;
    setTransitioning(true);
    setTimeout(() => {
      onSortChange(key);
      setTransitioning(false);
    }, 180);
  }

  return (
    <div
      ref={setNodeRef}
      className="pixel-card-sm p-3 transition-colors"
      style={{
        background: isOver ? "var(--pixel-highlight, #f0fdf4)" : "#FAFAF9",
        border: `2px solid ${isOver ? "var(--c-qualified, #2FB226)" : "var(--pixel-border, #18181B)"}`,
      }}
    >
      <div
        className="mb-3 flex items-center justify-between bg-white px-3 py-2"
        style={{ border: "2px solid var(--pixel-border, #18181B)" }}
      >
        <div className="flex items-center gap-2">
          <h2 className="retro pixel-text-xs font-black uppercase" style={{ color: "var(--text-2)" }}>
            {tr.columns[col]}
          </h2>
          <span
            className="retro inline-flex h-6 min-w-6 items-center justify-center px-1 text-[10px] font-black"
            style={{
              background: "#FFFFFF",
              border: "2px solid var(--pixel-border, #18181B)",
              color: "#18181B",
              boxShadow: "1px 1px 0 #18181B",
            }}
          >
            {leads.length}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold transition-colors hover:bg-[#F4F4F5]"
            style={{ ...bodyTextStyle, color: "var(--text-3)", border: "1px solid var(--border)" }}
            title="Ordenar columna"
          >
            <ArrowUpDown size={10} />
            <span className="hidden sm:inline">{SORT_LABELS[sort]}</span>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div
                className="absolute right-0 top-full z-50 mt-1 min-w-36 bg-white"
                style={{
                  border: "2px solid var(--pixel-border, #18181B)",
                  boxShadow: "3px 3px 0 var(--pixel-shadow, #18181B)",
                }}
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => handleSortSelect(key)}
                    className="block w-full px-3 py-2 text-left text-xs font-semibold transition-colors hover:bg-[#F4F4F5]"
                    style={{
                      ...bodyTextStyle,
                      color: sort === key ? "var(--c-qualified, #2FB226)" : "var(--text)",
                      background: sort === key ? "#f0fdf4" : "transparent",
                    }}
                  >
                    {SORT_LABELS[key]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className="flex min-h-40 flex-col gap-3 transition-[opacity,transform] duration-180 ease-out"
        style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? "translateY(4px)" : "translateY(0)" }}
      >
        {sortedLeads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} tr={tr} onTitleClick={() => onLeadClick(lead)} />
        ))}

        {sortedLeads.length === 0 && (
          <div
            className="bg-white p-4 text-center"
            style={{ border: "2px dashed var(--pixel-border, #18181B)", color: "var(--text-3)" }}
          >
            <EmptyInsight title={tr.empty.title} description={tr.empty.description} compact />
          </div>
        )}
      </div>
    </div>
  );
}

export function OportunidadesKanban({ initialLeads }: OportunidadesKanbanProps) {
  const { lang } = useLanguage();
  const tr = translations[lang].oportunidades;
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [columnSorts, setColumnSorts] = useState<Record<LeadStatus, SortKey>>({
    nuevo: "score_desc",
    contactado: "score_desc",
    calificado: "score_desc",
    perdido: "score_desc",
    desvinculado: "score_desc",
  });

  // Track where within the card the user clicked, so the DragOverlay lifts from that point
  const pointerOffset = useRef({ x: 0, y: 0 });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : undefined;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
    const rect = event.active.rect.current.initial;
    const e = event.activatorEvent;
    if (rect && e instanceof PointerEvent) {
      pointerOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  }

  // Offset DragOverlay so it appears under the cursor at the exact click point
  const overlayModifier: Modifier = useCallback(({ transform, draggingNodeRect }) => {
    if (!draggingNodeRect) return transform;
    return {
      ...transform,
      x: transform.x - pointerOffset.current.x + draggingNodeRect.width / 2,
      y: transform.y - pointerOffset.current.y + draggingNodeRect.height / 2,
    };
  }, []);

  async function handleDragEnd(event: DragEndEvent) {
    const leadId = String(event.active.id);
    const nextStatusId = event.over?.id;
    setActiveId(null);

    if (typeof nextStatusId !== "string" || !COLUMNS.some((col) => col === nextStatusId)) return;

    const nextStatus = nextStatusId as LeadStatus;
    const lead = leads.find((item) => item.id === leadId);
    if (!lead || lead.status === nextStatus) return;

    const previousLeads = leads;
    setLeads((current) =>
      current.map((item) => (item.id === leadId ? { ...item, status: nextStatus } : item)),
    );

    try {
      await updateLeadStatus(leadId, nextStatus);
    } catch (error) {
      setLeads(previousLeads);
      console.error(error);
    }
  }

  return (
    <>
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="w-full animate-in fade-in duration-300 p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col}
              col={col}
              leads={leads.filter((l) => l.status === col)}
              sort={columnSorts[col]}
              onSortChange={(s) => setColumnSorts((prev) => ({ ...prev, [col]: s }))}
              onLeadClick={setSelectedLead}
              tr={tr}
            />
          ))}
        </div>
      </div>

      <DragOverlay
        modifiers={[overlayModifier]}
        dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}
      >
        {activeLead ? (
          <div
            className="bg-white p-4"
            style={{
              border: "2px solid var(--pixel-border, #18181B)",
              boxShadow: "6px 6px 0 var(--pixel-shadow, #18181B)",
              cursor: "grabbing",
              transform: "rotate(-1.5deg) scale(1.03)",
            }}
          >
            <CardContent lead={activeLead} tr={tr} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>

    {/* Lead detail panel */}
    {selectedLead && (
      <>
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
          onClick={() => setSelectedLead(null)}
        />
        <div className="fixed inset-y-0 right-0 z-50 flex">
          <ExplorerLeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} />
        </div>
      </>
    )}
    </>
  );
}
