@AGENTS.md

# Dinotes

Personal daily planner web app (dino + notes). Session state resets on refresh; activity log and habit tracking are persisted to Supabase per-user. Evernote-inspired design with emerald green accent palette.

## Tech Stack

- Next.js 16.2.2 (App Router, Turbopack)
- React 19, TypeScript
- Tailwind CSS v4 (`@import "tailwindcss"` + `@theme inline {}` in globals.css — no tailwind.config.js)
- @dnd-kit/core for drag & drop (Eisenhower matrix)
- Clerk v7 — authentication (ClerkProvider, `src/proxy.ts` for route protection)
- Supabase — Postgres database for persisted log entries, RLS via Clerk JWT `sub` claim
- Path alias: `@/*` → `./src/*`

## Pages (10)

| Route | Page | Component |
|-------|------|-----------|
| `/` | Intake Wizard | `src/components/intake/IntakeWizard.tsx` |
| `/habits` | Habit Tracker | `src/components/habits/HabitsView.tsx` |
| `/checklist` | Today's Checklist | `src/components/checklist/ChecklistView.tsx` |
| `/planner` | Eisenhower Matrix (DnD) | `src/components/planner/PlannerView.tsx` |
| `/log` | Activity Log | `src/components/log/LogView.tsx` |
| `/pomodoro` | Deep Focus Timer | `src/components/pomodoro/PomodoroView.tsx` |
| `/games` | Games (Wordle) | `src/components/games/GamesView.tsx` |
| `/news` | News headlines (NewsAPI) | `src/components/news/NewsView.tsx` |
| `/sign-in` | Clerk sign-in | `src/app/sign-in/[[...sign-in]]/page.tsx` |
| `/sign-up` | Clerk sign-up | `src/app/sign-up/[[...sign-up]]/page.tsx` |

## Intake Flow

1. **Habits** (step 1) — select from user-defined habits (configured on `/habits` page). Selecting creates tasks under the system "habit" category. If no habits configured, links to `/habits`. After first selection, subsequent visits skip to step 2.
2. **Tasks** (step 2) — add tasks by category with deadline (none/soft/hard), event type tags (productive/social/flexible), and optional notes. Only user-created categories are shown; a category manager lets users create custom groups and categories.
3. "Start My Day" → redirects to `/checklist`.

## Data Model (`src/types/planner.ts`)

- **TaskItem** — id, categoryId, text, done, deadlineType, deadlineDate?, eventType?, note?, quadrant? (Eisenhower)
- **LogEntry** — id, time (string), activity (string), createdAt (timestamp)
- **TimerState** — mode (work/break), isRunning, startedAt timestamp, accumulated seconds, workElapsed, breakDuration (20% of work), sessionCount, selectedTaskId, isResetting (meteorite animation)
- **WizardStep** — 1 | 2
- **EisenhowerQuadrant** — 'do' | 'schedule' | 'delegate' | 'delete'

## Categories (`src/lib/useCategories.ts`)

All categories and groups are **user-created** — no hardcoded defaults. Users create categories via the category manager in StepTasks (intake step 2), choosing a group name, label, and color. Categories are stored in Supabase with `user_id` for ownership. A system "habit" category (user_id=null) exists in the DB for habit-task integration but is hidden from the intake task form.

The `useCategories()` hook provides: `categories`, `groups`, `byGroup()`, `find()`, `addCategory()`, `updateCategory()`, `deleteCategory()`.

## State Management

Session state lives in `PlannerContext` (`src/components/planner/PlannerContext.tsx`) — tasks, wizard progress, timer, and in-session log entries. All reset on refresh.

**Persisted state:** Activity log entries can be explicitly saved to Supabase via `useLogHistory()` (`src/lib/useLogHistory.ts`). The hook provides:
- `saveToday(entries)` — upserts session entries to `log_entries` table (idempotent by id)
- `deleteAllHistory()` — wipes all saved entries for the current user
- `savedHistory` — all previously saved entries, loaded on mount

**Habit tracking** is fully persisted via `useHabits()` (`src/lib/useHabits.ts`). Users configure their own habits (name, emoji icon, color) on the `/habits` page — no hardcoded habits. The hook provides:
- `addHabit`, `archiveHabit`, `deleteHabit` — CRUD for user-defined habits (`habits` table)
- `toggleCompletion(habitId, date)` — mark/unmark a habit for a specific day (`habit_completions` table, unique per habit per day)
- `getStreak(habitId)` — consecutive completed days ending today (computed client-side)
- `isCompleted(habitId, date)` — fast Set-based lookup

The `/habits` page shows each habit as a card with: streak badge, week view (Mon–Sun checkmarks), contribution grid (last 12 weeks dot matrix in the habit's color), and a today toggle. The Intake Wizard's StepHabits now reads from the user's Supabase habits instead of hardcoded `HABIT_DEFS`; if none configured, it links to `/habits`.

The Supabase client (`src/lib/supabase.ts`) is a `useSupabaseClient()` hook that passes the Clerk session token via `accessToken` callback for RLS.

Timer state uses `startedAt` timestamps so it survives tab navigation (but not refresh).

## Layout (responsive)

- `AppShell` (`src/components/layout/AppShell.tsx`) — flex row: sidebar + main content. Manages mobile drawer state. Auth routes (`/sign-in`, `/sign-up`) render fullscreen without sidebar.
- `Sidebar` (`src/components/layout/Sidebar.tsx`) — 14rem, 7 nav links, active state via `usePathname()`. On mobile (<md): hidden by default, opens as an overlay drawer with backdrop via hamburger in TopBar. Clicking a link auto-closes the drawer.
- `TopBar` (`src/components/layout/TopBar.tsx`) — top-right header strip. Contains: hamburger (mobile only), weather badge with geolocation detection (hidden on narrow screens, shows `—` if location denied), Clerk `UserButton` with custom menu items (Manage account, Delete log history, Sign out).
- Theme: light, Structured.app-inspired. Design tokens in `src/app/globals.css`.
- Breakpoint strategy: `md:` (768px) for sidebar visibility, `sm:` (640px) for grids and input stacking.

## External APIs

| API | Route | Key | Purpose |
|-----|-------|-----|---------|
| Open-Meteo | `src/app/api/weather/route.ts` | None (free) | Current weather (Celsius + feels-like) shown in TopBar. Location via browser geolocation (opt-in); coords cached in localStorage. If denied, badge shows `—` placeholder. Route accepts `?lat=...&lon=...` query params. |
| NewsAPI.org | `src/app/api/news/route.ts` | `NEWS_API_KEY` (server-only) | Top US headlines + search on `/news` page |

API routes proxy external calls server-side so keys never reach the browser. Weather is cached 10 min (`revalidate: 600`), news 5 min (`revalidate: 300`).

## Authentication

- Clerk v7 with `@clerk/nextjs`. `ClerkProvider` wraps root layout (`src/app/layout.tsx`).
- Route protection via `src/proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`). All routes except `/sign-in` and `/sign-up` require authentication.
- Supabase RLS uses `(select auth.jwt() ->> 'sub') = user_id` — the Clerk JWT `sub` claim is the user's Clerk ID (text, not UUID).
- Profile menu in TopBar: Clerk's built-in "Manage account" opens `<UserProfile />` modal (includes account deletion if enabled in Clerk dashboard). Custom "Delete log history" action wipes saved log entries.

## Database (Supabase)

Schema in `supabase/schema.sql` + migrations applied via Supabase MCP. Active tables:
- `categories` — user-created categories with `user_id`, `parent_id`, arbitrary `group` names. RLS: read system+own, write own only.
- `log_entries` — persisted activity log (via `useLogHistory`)
- `habits` — user-defined habits: `name`, `icon`, `color`, `archived` (via `useHabits`)
- `habit_completions` — one row per habit per day, unique on `(habit_id, completed_date)` (via `useHabits`)

Unused tables (schema exists, not wired to UI): `tasks`, `wizard_state`. RLS enabled on all tables.

Supabase MCP server connected for direct DB inspection from Claude Code.

## Key Patterns

- Page files are thin server components that import a single `'use client'` view component
- All interactivity is in client components
- Drag & drop (Eisenhower matrix) uses `@dnd-kit/core` with `useDraggable`/`useDroppable`
- Deep Focus Timer is a stopwatch (counts up), break = 20% of work time. Includes a **Conservatory Scene** (`src/components/pomodoro/ConservatoryScene.tsx`) — an SVG illustration that spans **150 minutes**. Starts with barren brown soil, rain grows grass (5–12 min), second rain fills the pond (15–22 min), then crane/greenhouse/garden elements progressively appear (25–150 min). **Meteorite reset**: clicking Reset triggers a meteorite impact animation that destroys the scene back to barren soil (2.5s CSS animation, two-phase state: `isResetting` in PlannerContext preserves scene during animation, `timerResetComplete` zeros out after). **Dev mode**: Shift+click the status text below the scene to reveal a time slider (0–155 min) for previewing all growth stages
- Activity Log tracks task switches, warns when context-switching is high (>6 switches), and shows saved history via a month calendar with dot indicators for days with data
- Environment variables: `NEXT_PUBLIC_*` keys are safe for browser; `SUPABASE_SECRET_KEY`, `CLERK_SECRET_KEY`, `NEWS_API_KEY` are server-only. All in `.env.local` (gitignored).
