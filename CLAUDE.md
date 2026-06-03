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

## Architecture

### View routing

There is no Next.js file-based routing in use. The entire app is a single page (`app/page.tsx`) that manages view state with `useState<View>`. The active view is passed to `<Sidebar>` and controls which module component renders in `<main>`. Adding a new module means:
1. Adding the view ID to the `View` union in `types/index.ts`
2. Adding a nav item to `SIDEBAR_SECTIONS` in `components/leadscout/sidebar.tsx`
3. Adding a render branch in `app/page.tsx`
4. Removing the view from `PENDING_VIEWS` (which currently renders `ModulePlaceholder`)

### Auth

Authentication is a fake `useState(false)` in `app/page.tsx` — no session, no persistence. The `LoginForm` component already renders a "Continuar con Google" button as a placeholder. Real auth is planned but not implemented.

### Data layer

All data is static mock in `lib/data.ts` (10 hardcoded leads). There is no API, no database, no server actions. Every component reads directly from this file.

**Known geographic inconsistency:** Lead data uses Buenos Aires (CABA) neighborhoods, while `lib/location-service.ts` and `lib/explorer-data.ts` use El Salvador coordinates. This must be resolved when connecting real data.

### Explorer module

The most complex module. Its state lives entirely in `hooks/use-explorer.ts` (a single custom hook). The `Explorer` component is a thin layout shell that destructures from this hook and distributes props to:
- `ExplorerLocationPanel` — search input, radius slider, place suggestions
- `ExplorerMapSection` — MapLibre GL map with draggable search area
- `ExplorerResultsTable` — filtered lead list
- `ExplorerLeadDetail` — slide-in detail panel
- `ExplorerCategoryModal` — Radix Dialog for category selection

Map tiles are not configured — MapLibre GL is initialized but has no tile source.

### Design system

All design tokens are CSS custom properties in `app/globals.css`. Never use hardcoded colors — reference tokens like `var(--text)`, `var(--border)`, `var(--sidebar)`, etc.

Two fonts are loaded in `app/layout.tsx`:
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

- `components/leadscout/` — page-level module components (one per sidebar view)
- `components/ui/` — reusable design system primitives; filenames starting with `8bit-` are pixel-art styled

`cn()` from `lib/utils.ts` is the standard utility for conditional class merging (clsx + tailwind-merge).

All types are centralized in `types/index.ts`. Explorer-specific types live in `types/explorer.ts`.
