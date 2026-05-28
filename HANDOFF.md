# Handoff — Progress App FE Refactor

## Goal

Senior-level code quality pass on a React 19 + TypeScript + Vite PWA.
Work is being done **tab by tab**, converting all inline `style={{}}` to Tailwind CSS classes, while keeping the visual design pixel-identical.

---

## Project Setup

- **Repo path (WSL):** `~/Desktop/progress-app-fe`
- **Active branch:** `refactor/code-quality`
- **Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS v3, React Router v7
- **CRITICAL — npm must use WSL node:** Always run npm/npx inside WSL via:
  ```bash
  wsl -d ubuntu-22.04 -e bash -c "source ~/.nvm/nvm.sh && cd ~/Desktop/progress-app-fe && <cmd>"
  ```
  Running npm from Windows PowerShell directly will fail (UNC path error).

---

## Architecture Notes

### Two `Goal` types exist — do not confuse them

| Type | File | Shape | Used for |
|------|------|-------|----------|
| `HookGoal` | `src/hooks/useGoals.ts` | `startDate`, `deadline` (API raw) | Hook state, API calls |
| `UIGoal` (Goal) | `src/types.ts` | `start`, `end`, `icon`, `streak`, etc. | All components/context |

`AppContext.tsx` maps `HookGoal → UIGoal`. `updateGoal` / `addGoal` in AppContext accept `HookGoal` shapes (not `UIGoal`).

### `useTasks` returns `RawTask` (not `UITask`)

`RawTask` has `name`, `date`, `completed`. `AppContext` maps these to `UITask` (`title`, `due`, `done`). `TasksPage` does its own local mapping too.

---

## Tailwind Setup

### Config file: `tailwind.config.cjs` (CJS — required because package.json has `"type":"module"`)

All colors are defined in **one place** — `tailwind.config.cjs`. Never hardcode hex values in components.

**Color token naming convention:**

| Prefix | Purpose | Example class |
|--------|---------|---------------|
| `c-*` | CSS variable design tokens | `bg-c-surface`, `text-c-text1`, `border-c-border` |
| `cat-*` | Category accent colors | `text-cat-health` |
| `danger` | #FF6B7A | `bg-danger`, `text-danger` |
| `surface-deep` | #20203a | `bg-surface-deep` |
| `primary-{subtle/muted/soft/medium/glow/active}` | color-mix opacity variants | `bg-primary-muted`, `border-primary-active` |
| `success-{muted/glow}` | success opacity variants | `bg-success-muted` |
| `warning-{muted/soft}` | warning opacity variants | `bg-warning-muted` |
| `danger-{muted/glow}` | danger opacity variants | `bg-danger-muted` |

**Custom font sizes:** `text-2xs` (11px), `text-xs` (12px), `text-sm` (13px), `text-base` (14px), `text-md` (15px), `text-lg` (16px), `text-xl` (18px), `text-2xl` (22px), `text-3xl` (28px)

**Custom border-radius:** `rounded-card` (14px), `rounded-chip` (20px), `rounded-pill` (999px)

**Custom shadows:** `shadow-primary-sm`, `shadow-overlay`, `shadow-modal`, `shadow-nav`

**Custom letter-spacing:** `tracking-label` (0.5px), `tracking-badge` (0.8px), `tracking-tight` (-0.4px)

### Rule: what stays inline vs Tailwind

- **Always Tailwind:** static colors, layout, spacing, typography, border-radius, shadows
- **Always inline:** `catColor = var(--c-${goal.category.toLowerCase()})` — runtime per-item, can't be static class
- **Always inline:** `prioColor` from `PRIORITY_META` — same reason
- **Always inline:** SVG attributes (`stroke`, `strokeDashoffset`, `strokeDasharray`)
- **Always inline:** `transition` strings with complex cubic-bezier values on animated elements

---

## What's Been Done

### Commit 1 — `88fc8fa` — Initial code quality pass
- Installed Tailwind CSS v3 (`tailwind.config.cjs`, `postcss.config.cjs`)
- Added `@tailwind` directives to `src/index.css`
- Eliminated all `any` types in `AppContext`, `useTasks`, `useGoals`
- Fixed `getDayPoints` in `Analytics.tsx` to be a pure function (removed 3× eslint-disable-line exhaustive-deps)
- Split `Goals.tsx` (928 lines) into `GoalsList`, `GoalForm`, `GoalDetail` + thin coordinator
- Added `src/components/ErrorBoundary.tsx` wrapping app root
- Created `src/constants.ts` with `GOAL_ICON_MAP`, `CATEGORY_COLORS`, `PRIORITY_META`, `CATEGORIES`, `PRIORITIES`
- Added error state to `useGoals`/`useTasks`; `syncError` exposed from `AppContext`; TickTick errors shown in Sidebar
- Added `aria-label` to all icon-only buttons

### Commit 2 — `ebade64` — Goals tab full Tailwind conversion
- Expanded `tailwind.config.cjs` with all color tokens (danger, opacity variants, shadows, letter-spacing)
- **`GoalRow.tsx`** — full Tailwind (catColor stays inline)
- **`GoalsList.tsx`** — full Tailwind (zero inline styles)
- **`GoalForm.tsx`** — full Tailwind (zero inline styles)
- **`GoalDetail.tsx`** — full Tailwind (catColor/prioColor/SVG stay inline)

---

## Remaining Work — Tab by Tab

### ✅ Goals tab — DONE

### 🔲 Tasks tab
Files to convert:
- `src/pages/Tasks.tsx` — partial Tailwind already, finish it
- `src/components/ui/TaskRow.tsx` — partial Tailwind, finish (has catColor-like dynamic color via `ptColor`)
- `src/components/ui/DateStrip.tsx` — partial Tailwind, finish

### 🔲 Dashboard tab
Files to convert:
- `src/pages/Dashboard.tsx` — partial Tailwind, finish

### 🔲 Analytics (Overview) tab
Files to convert:
- `src/pages/Analytics.tsx` — largest remaining file, has many subcomponents still using `T.*` color object
  - Note: The `T` object at the top of Analytics.tsx (lines 11-33 in original) has been replaced by CSS var strings but still uses inline styles. Convert all to Tailwind.
  - Subcomponents: `PointsRing`, `DayPointsCard`, `CategoryBreakdown`, `WeekChart`, `EarnedTasksList`

### 🔲 Shared components (used across tabs)
- `src/components/Layout.tsx` — partial Tailwind, check for remaining inline styles
- `src/components/BottomNav.tsx` — partial Tailwind, check
- `src/components/Sidebar.tsx` — partial Tailwind, finish
- `src/components/ui/Card.tsx` — still fully inline, convert
- `src/components/ui/ProgressBar.tsx` — check
- `src/components/ui/Pill.tsx` — check
- `src/components/ui/StreakChip.tsx` — check
- `src/components/ui/Icon.tsx` — check

---

## How to Verify After Each Tab

```bash
# Type-check
wsl -d ubuntu-22.04 -e bash -c "source ~/.nvm/nvm.sh && cd ~/Desktop/progress-app-fe && npx tsc -b"

# Full build (must succeed with zero errors)
wsl -d ubuntu-22.04 -e bash -c "source ~/.nvm/nvm.sh && cd ~/Desktop/progress-app-fe && npm run build"

# Dev server
wsl -d ubuntu-22.04 -e bash -c "source ~/.nvm/nvm.sh && cd ~/Desktop/progress-app-fe && npm run dev"
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `tailwind.config.cjs` | **Single source of truth for all colors** |
| `src/index.css` | @tailwind directives + existing animations/resets only |
| `src/constants.ts` | GOAL_ICON_MAP, CATEGORY_COLORS, PRIORITY_META, CATEGORIES, PRIORITIES |
| `src/types.ts` | UIGoal, UITask, ManualLog, Category, Priority, TaskSeriesSummary |
| `src/hooks/useGoals.ts` | HookGoal type (raw API shape) |
| `src/context/AppContext.tsx` | Maps HookGoal→UIGoal, RawTask→UITask; exposes syncError |
| `src/components/ErrorBoundary.tsx` | Class-based error boundary |
| `src/pages/goals/` | Split Goals tab (GoalDetail, GoalForm, GoalsList) |
