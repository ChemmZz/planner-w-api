@AGENTS.md

# my-planner

Personal daily planner web app. Session-only state (no database, no persistence — resets on refresh).

## Tech Stack

- Next.js 16.2.2 (App Router, Turbopack)
- React 19, TypeScript
- Tailwind CSS v4 (`@import "tailwindcss"` + `@theme inline {}` in globals.css — no tailwind.config.js)
- @dnd-kit/core for drag & drop (Eisenhower matrix)
- Path alias: `@/*` → `./src/*`

## Pages (7)

| Route | Page | Component |
|-------|------|-----------|
| `/` | Intake Wizard | `src/components/intake/IntakeWizard.tsx` |
| `/checklist` | Today's Checklist | `src/components/checklist/ChecklistView.tsx` |
| `/planner` | Eisenhower Matrix (DnD) | `src/components/planner/PlannerView.tsx` |
| `/log` | Activity Log | `src/components/log/LogView.tsx` |
| `/pomodoro` | Deep Focus Timer | `src/components/pomodoro/PomodoroView.tsx` |
| `/games` | Games (Wordle) | `src/components/games/GamesView.tsx` |
| `/news` | News (empty, pending) | `src/app/news/page.tsx` |

## Intake Flow

1. **Habits** (step 1) — toggle Gym / Reading. Selecting creates real tasks under the "habit" category. Reading creates two tasks: "Reading — 30 min" and "Reading — 15 min". After first selection, subsequent visits skip to step 2.
2. **Tasks** (step 2) — add tasks by category with deadline (none/soft/hard), event type tags (productive/social/flexible), and optional notes.
3. "Start My Day" → redirects to `/checklist`.

## Data Model (`src/types/planner.ts`)

- **TaskItem** — id, categoryId, text, done, deadlineType, deadlineDate?, eventType?, note?, quadrant? (Eisenhower)
- **LogEntry** — id, time (string), activity (string), createdAt (timestamp)
- **TimerState** — mode (work/break), isRunning, startedAt timestamp, accumulated seconds, workElapsed, breakDuration (20% of work), sessionCount, selectedTaskId
- **WizardStep** — 1 | 2
- **EisenhowerQuadrant** — 'do' | 'schedule' | 'delegate' | 'delete'

## Categories (`src/lib/constants.ts`)

| ID | Group | Label | Color |
|----|-------|-------|-------|
| class-se | Classes | Software Engineering | #6366f1 |
| class-bds | Classes | Build, Design, Ship | #8b5cf6 |
| class-pe | Classes | Program Eval. | #a78bfa |
| work-gradlounge | Work | GradLounge | #f59e0b |
| work-demography | Work | Demography Workshop | #f97316 |
| personal-study | Personal Study | Personal Study | #10b981 |
| job-application | Job Application | Job Application | #3b82f6 |
| habit | Habits | Habits | #ec4899 |
| other | Other | Other | #6b7280 |

## State Management

All state lives in `PlannerContext` (`src/components/planner/PlannerContext.tsx`) — a React context provider mounted in `AppShell`. No persistence. Timer state uses `startedAt` timestamps so it survives tab navigation (but not refresh).

## Layout

- `AppShell` (`src/components/layout/AppShell.tsx`) — flex row: sidebar + main content
- `Sidebar` (`src/components/layout/Sidebar.tsx`) — 14rem, 7 nav links, active state via `usePathname()`
- Theme: light, Structured.app-inspired. Design tokens in `src/app/globals.css`.

## Key Patterns

- Page files are thin server components that import a single `'use client'` view component
- All interactivity is in client components
- Drag & drop (Eisenhower matrix) uses `@dnd-kit/core` with `useDraggable`/`useDroppable`
- Deep Focus Timer is a stopwatch (counts up), break = 20% of work time
- Activity Log tracks task switches and warns when context-switching is high (>6 switches)
