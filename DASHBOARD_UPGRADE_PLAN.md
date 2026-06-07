# Dashboard Upgrade Plan

## Goal
Expand the dashboard from 4 KPIs + table + chart to a full operational view.
All new data comes from `ReportSummary` (already fetched) or the `leads` array (already fetched).
No new backend endpoints needed.

## Current data available (already in dashboard.tsx)
- `summary.total_leads`, `summary.new_this_week`, `summary.contacted`, `summary.avg_score`
- `summary.by_status` — `{ nuevo: N, contactado: N, calificado: N, perdido: N, desvinculado: N }`
- `summary.by_priority` — `{ alta: N, media: N, baja: N }`
- `summary.by_category` — `{ "Gastronomía": N, "Servicios": N, ... }`
- `summary.weekly_activity` — `[{ date, leads }]`
- `leads` array — full Lead objects (score, status, priority, name, category, lastContact)

---

## Section 1 — KPIs (expand from 4 to 6)

Keep the 4-column grid but add 2 more cards (2 rows on mobile, 6 cols on xl or 3+3).

**6 KPI cards (in order):**
1. Total Leads — `summary.total_leads` / "en base de datos"
2. Esta Semana — `summary.new_this_week` / "detectados"
3. Alta Prioridad — `summary.by_priority?.alta ?? 0` / "requieren atención"  
4. Score Promedio — `summary.avg_score` / "sobre 100"
5. Calificados — `summary.by_status?.calificado ?? 0` / "listos para cerrar"
6. Sin Contactar — `summary.total_leads - summary.contacted` / "pendientes"

Grid: `grid-cols-2 sm:grid-cols-3 xl:grid-cols-6` (all 6 in one row on xl)

---

## Section 2 — Pipeline Strip (new, below KPIs)

A horizontal strip showing the lead funnel. One row, each status as a labeled pill.

**Statuses in order:** Nuevo → Contactado → Calificado → Perdido → Desvinculado

For each status pill:
- Count from `summary.by_status[status] ?? 0`
- Percentage: `Math.round((count / summary.total_leads) * 100)`
- Color per status (use CSS vars or inline):
  - Nuevo: `var(--text-3)` background
  - Contactado: `#5B5FEF` (blue)
  - Calificado: `#3FAE2A` (green)
  - Perdido: `#E63946` (red)
  - Desvinculado: `#9A9A9A` (gray)
- Label in Spanish: Nuevo / Contactado / Calificado / Perdido / Desvinculado
- Show count big, % small below

Component: inline in dashboard.tsx as `PipelineStrip`. No separate file needed.

```tsx
function PipelineStrip({ by_status, total }: { by_status: Record<string, number>; total: number }) {
  const stages = [
    { key: "nuevo", label: "Nuevo", color: "#18181B" },
    { key: "contactado", label: "Contactado", color: "#5B5FEF" },
    { key: "calificado", label: "Calificado", color: "#3FAE2A" },
    { key: "perdido", label: "Perdido", color: "#E63946" },
    { key: "desvinculado", label: "Desvinculado", color: "#9A9A9A" },
  ];
  // render as flex row of pixel-card-sm pills
}
```

---

## Section 3 — Quick Wins (new card, left column)

Show top 3 leads that are high-score and untouched — the easiest contacts.

**Filter logic (from `leads` array):**
```ts
const quickWins = leads
  .filter(l => l.score >= 65 && l.status === "nuevo")
  .sort((a, b) => b.score - a.score)
  .slice(0, 3);
```

**Card layout:**
- Title: "QUICK WINS" (retro pixel font)
- Subtitle: "Leads de alto score sin contactar"
- If 0 quick wins: show EmptyInsight
- Each lead row shows:
  - Score badge (colored by score range, same logic as getScoreBadgeStyle)
  - Lead name (bold)
  - Category (text-2)
  - Priority badge

If there are quick wins, show a note: "{quickWins.length} oportunidades listas"

---

## Section 4 — Top Categories (new card, right column)

Bar chart showing which categories have the most leads.

**Data:** `summary.by_category` — sort by count descending, take top 5.

```ts
const topCategories = Object.entries(summary.by_category)
  .sort(([,a],[,b]) => b - a)
  .slice(0, 5);
```

**Layout per category row:**
- Category name (left, retro font)
- Horizontal bar fill: `width = (count / maxCount) * 100%`, color `var(--pixel-highlight)`
- Count number (right)

Simple pixel-card-sm containing the bars. Title: "CATEGORÍAS TOP"

---

## Section 5 — Priority Distribution (new, small card)

3-segment horizontal bar showing alta/media/baja breakdown.

```ts
const priorityTotal = (by_priority.alta ?? 0) + (by_priority.media ?? 0) + (by_priority.baja ?? 0);
```

Three colored segments side by side (flex row):
- Alta: red `#E63946`
- Media: orange/amber `#F4A261`  
- Baja: green `#3FAE2A`

Width of each = `(count / priorityTotal) * 100%`

Below the bar: three legend items with count and label.

Component name: `PriorityBar` — inline in dashboard.tsx.

---

## Updated Layout

```
[KPI row: 6 cards]
[Pipeline strip: 5 status pills in one row]
[grid 2 cols]
  left col:
    [Quick Wins card]
    [Priority bar card]
  right col:
    [Top Categories card]
    [Weekly activity chart — existing]
[Recent leads table — existing, full width below]
```

On mobile everything stacks to 1 col.

---

## Implementation notes for Codex

### File to edit
`c:\Proyects\leadscout-ai\components\leadscout\dashboard.tsx`

### What to keep unchanged
- `KpiCard` component (just add 2 more usages)
- `toChartData` function
- `ChartAreaStep` usage
- `OnboardingTour`
- Recent leads table (keep as-is)
- All imports that already exist

### What to add
1. `PipelineStrip` function component (inline)
2. `PriorityBar` function component (inline)
3. 2 new `KpiCard` usages in the grid
4. Quick Wins section (computed from `leads`, rendered inline in Dashboard)
5. Top Categories section (computed from `summary.by_category`, rendered inline)

### Styling rules
- Use `pixel-card-sm` for all new cards
- Use `retro pixel-text-xs uppercase` for all headings
- Use `bodyTextStyle` for all body text
- Use `var(--text)`, `var(--text-2)`, `var(--text-3)` for colors — no hardcoded grays
- All borders: `border-2 border-(--border)` or via `pixel-card-sm`
- No Tailwind classes with `[var(--...)]` syntax — use `(--...)` shorthand

### TypeScript
- `summary.by_status`, `summary.by_priority`, `summary.by_category` are `Record<string, number>` — access with `?? 0`
- `leads` is `Lead[]` — already imported and typed
- No new imports needed except potentially nothing (all data already available)
