# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # start dev server
pnpm build      # production build
pnpm start      # run production build
pnpm lint       # run ESLint
```

Package manager is **pnpm** (not npm/yarn).

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `API_URL` | No | `http://127.0.0.1:8000` | FastAPI backend base URL. Server-side only. |

Typed access via `lib/env.ts`. No `NEXT_PUBLIC_` vars are needed — the `/backend/*` rewrite proxy handles all client→server communication, so the raw backend URL is never exposed to browsers.

**For production:** set `API_URL` to the deployed FastAPI URL (e.g. `https://api.scoutia.dev`).

## Architecture

```
lib/
  api/
    client.ts       — apiFetch: auth headers, 401/403 redirect, throws AppError
    errors.ts       — AppError class, parseApiError(unknown) → string
    auth.ts         — login, register, logout, getMe, onboarding, location
    leads.ts        — getLeads(filters)
    explorer.ts     — searchExplorer(params)
    reports.ts      — getReportSummary()
    settings.ts     — getSettingsData(), updateWorkspace()
  hooks/
    use-explorer.ts — all Explorer state, search, map interaction
    use-settings.ts — Settings form state + save lifecycle
    use-leads.ts    — leads fetch, filtering, selection, derived metrics
  env.ts            — typed env vars
  auth.ts           — getToken, setToken, clearToken, parseTokenUser
  settings-data.ts  — static mock data for settings sections (team, zones, plan, security)

components/
  shared/
    page-error.tsx      — <PageError module onRetry> — used by all error.tsx
    module-skeleton.tsx — SkeletonBlock, SkeletonKpiRow, SkeletonTable, SkeletonCards
  leadscout/            — one component per route, pure render only
  ui/                   — design system primitives (8bit-* = pixel-art)

app/(app)/
  [module]/
    page.tsx    — thin wrapper: imports component, no logic
    loading.tsx — skeleton matching the module's layout
    error.tsx   — <PageError> wrapper, always "use client"
```

### Pattern: hooks own logic, pages own render

Client components call a hook from `lib/hooks/`, destructure what they need, and return JSX. No fetch calls, no business logic in components.

```ts
// components/leadscout/leads.tsx
export function Leads() {
  const { filtered, loading, query, setQuery, ... } = useLeads();
  return <div>...</div>;  // pure render
}
```

Server components (dashboard.tsx, reportes.tsx) fetch directly — that's the correct Next.js 16 pattern for server data.

## Architecture

### Routing

App uses Next.js 16 App Router with two route groups:

- `app/(auth)/` — public routes (login, register, forgot-password, reset-password, verify-otp, onboarding). Centered layout, no sidebar.
- `app/(app)/` — protected routes (dashboard, explorer, leads, opportunities, campaigns, reports, integrations, settings). Layout checks `ls_token` cookie and redirects to `/login` or `/onboarding` if missing/incomplete.

`app/(app)/layout.tsx` is a Server Component that calls `GET /api/auth/me` to verify the session. It renders `<Sidebar>`, `<Topbar>`, and `<PageTransition>`.

Spanish URL aliases (`/oportunidades`, `/reportes`, `/campanas`, `/integraciones`, `/configuracion`) are handled as rewrites in `next.config.ts` — no separate page files.

### Auth

Custom JWT auth. The token lives in the `ls_token` cookie (7-day max-age, SameSite=Strict). Backend is FastAPI at `http://127.0.0.1:8000` (proxied as `/backend/*`).

- `lib/auth.ts` — `setToken`, `getToken`, `clearToken`, `parseTokenUser`
- `lib/api/client.ts` — `apiFetch` wrapper; calls `getToken()` from `lib/auth.ts`, handles 401 redirect to `/login` and 403 redirect to `/onboarding`
- `lib/api/auth.ts` — login, register, logout, getMe, forgotPassword, resetPassword, completeOnboarding, updateApproximateLocation

No Supabase. Auth is entirely via FastAPI JWT.

### Data layer

- `lib/api/` — all API functions using `apiFetch`. Currently: `auth.ts`, `leads.ts`, `explorer.ts`, `reports.ts`, `settings.ts`
- `lib/data.ts` — shared TypeScript types (`Lead`, `LeadStatus`, `LeadPriority`). Data comes from the backend.
- `lib/settings-data.ts` — static fallback mock for settings UI (team, zones, plan, security). The workspace/user profile fields are loaded from `GET /api/auth/me` via `lib/api/settings.ts`.

### Explorer module

The most complex module. State lives in `hooks/use-explorer.ts`. `Explorer` is a thin layout shell that distributes props to:

- `ExplorerLocationPanel` — search input, radius slider, place suggestions
- `ExplorerMapSection` — MapLibre GL map with draggable search area
- `ExplorerResultsTable` — filtered lead list
- `ExplorerLeadDetail` — slide-in detail panel
- `ExplorerCategoryModal` — Radix Dialog for category selection

Map tile source: Carto Positron (`https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`) configured in `components/ui/mapcn-layer-markers.tsx`.

Geocoding uses Nominatim (`https://nominatim.openstreetmap.org`) — both are allowed in CSP `connect-src`.

### Design system

All design tokens are CSS custom properties in `app/globals.css`. Never use hardcoded colors — reference tokens like `var(--text)`, `var(--border)`, `var(--sidebar)`, etc.

Two fonts loaded in `app/layout.tsx`:
- `--font-pixel` → Press Start 2P — used via the `.retro` CSS class for all pixel-art labels/headings
- `--font-body` → Inter — used for readable body text, passed inline as `{ fontFamily: "var(--font-body), system-ui, sans-serif" }`

Key utility classes defined in `globals.css`:
- `.pixel-card` / `.pixel-card-sm` — bordered card with pixel shadow
- `.pixel-inset` — recessed/inner panel
- `.retro` — applies pixel font + letter-spacing
- `.pixel-text-xs` / `.pixel-text-sm` — 9px/10px sizes for the pixel font
- `.animate-fade-up`, `.animate-scale-in`, `.animate-exit` — entrance/exit animations
- `[data-stagger]` — add to a container to stagger-animate its direct children

### Component conventions

- `components/leadscout/` — page-level module components (one per route)
- `components/ui/` — reusable design system primitives; filenames starting with `8bit-` are pixel-art styled

`cn()` from `lib/utils.ts` is the standard utility for conditional class merging (clsx + tailwind-merge).

All types are centralized in `types/index.ts`. Explorer-specific types live in `types/explorer.ts`.

### i18n

Bilingual (Spanish/English). `contexts/language-context.tsx` provides `useLanguage()`. All copy is in `lib/i18n.ts`. Language is persisted to `localStorage` and a `ls_lang` cookie.

### Known geographic inconsistency

`lib/location-service.ts` and `lib/explorer-data.ts` still use Buenos Aires (CABA) coordinates as placeholder data. The backend and workspace are El Salvador-based. This must be resolved when connecting real data.
