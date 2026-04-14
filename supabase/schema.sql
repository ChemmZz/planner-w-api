-- my-planner schema
-- Run in Supabase SQL Editor (or `supabase db push` if using the CLI).
-- Mirrors the types in src/types/planner.ts.

-- ---------------------------------------------------------------------------
-- categories  (reference table; seeded from src/lib/constants.ts)
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id         text primary key,
  "group"    text not null check ("group" in (
               'Classes','Work','Personal Study',
               'Job Application','Habits','Other'
             )),
  label      text not null,
  color      text not null,
  sort_order int  not null default 0
);

insert into public.categories (id, "group", label, color, sort_order) values
  ('class-se',         'Classes',         'Software Engineering', '#6366f1', 10),
  ('class-bds',        'Classes',         'Build, Design, Ship',  '#8b5cf6', 20),
  ('class-pe',         'Classes',         'Program Eval.',        '#a78bfa', 30),
  ('work-gradlounge',  'Work',            'GradLounge',           '#f59e0b', 40),
  ('work-demography',  'Work',            'Demography Workshop',  '#f97316', 50),
  ('personal-study',   'Personal Study',  'Personal Study',       '#10b981', 60),
  ('job-application',  'Job Application', 'Job Application',      '#3b82f6', 70),
  ('habit',            'Habits',          'Habits',               '#ec4899', 80),
  ('other',            'Other',           'Other',                '#6b7280', 90)
on conflict (id) do update set
  "group"    = excluded."group",
  label      = excluded.label,
  color      = excluded.color,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id             uuid primary key default gen_random_uuid(),
  user_id        text not null,  -- Clerk user id (e.g. "user_2abc...")
  category_id    text not null references public.categories(id),
  text           text not null,
  done           boolean not null default false,
  deadline_type  text not null default 'none'
                   check (deadline_type in ('none','soft','hard')),
  deadline_date  timestamptz,
  event_type     text check (event_type in ('productive','social','flexible')),
  note           text,
  quadrant       text check (quadrant in ('do','schedule','delegate','delete')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists tasks_user_id_idx     on public.tasks (user_id);
create index if not exists tasks_category_id_idx on public.tasks (category_id);
create index if not exists tasks_done_idx        on public.tasks (done);
create index if not exists tasks_quadrant_idx    on public.tasks (quadrant);

-- ---------------------------------------------------------------------------
-- log_entries
-- ---------------------------------------------------------------------------
create table if not exists public.log_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,  -- Clerk user id
  time       text not null,               -- display string like "14:32"
  activity   text not null,
  created_at timestamptz not null default now()
);

create index if not exists log_entries_user_id_idx
  on public.log_entries (user_id);
create index if not exists log_entries_user_created_idx
  on public.log_entries (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- wizard_state  (one row per user — tracks wizardComplete + last step)
-- ---------------------------------------------------------------------------
create table if not exists public.wizard_state (
  user_id          text primary key,  -- Clerk user id
  wizard_complete  boolean not null default false,
  last_step        smallint not null default 1 check (last_step in (1, 2)),
  updated_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

drop trigger if exists wizard_state_set_updated_at on public.wizard_state;
create trigger wizard_state_set_updated_at
  before update on public.wizard_state
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row-level security — per-user isolation via Clerk JWT `sub` claim
-- ---------------------------------------------------------------------------
alter table public.categories   enable row level security;
alter table public.tasks        enable row level security;
alter table public.log_entries  enable row level security;
alter table public.wizard_state enable row level security;

-- categories: readable by any signed-in user, not writable from the client
drop policy if exists "categories: read for authenticated" on public.categories;
create policy "categories: read for authenticated"
  on public.categories
  for select to authenticated
  using (true);

-- NOTE: with Clerk third-party auth, the JWT `sub` claim is the Clerk user id
-- (a text value like "user_2abc..."). We wrap auth.jwt() in a subselect for
-- PostgREST planner caching (Supabase RLS perf best practice).

-- tasks: owner-only CRUD
drop policy if exists "tasks: select own"  on public.tasks;
drop policy if exists "tasks: insert own"  on public.tasks;
drop policy if exists "tasks: update own"  on public.tasks;
drop policy if exists "tasks: delete own"  on public.tasks;

create policy "tasks: select own"  on public.tasks
  for select to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);
create policy "tasks: insert own"  on public.tasks
  for insert to authenticated
  with check ((select auth.jwt() ->> 'sub') = user_id);
create policy "tasks: update own"  on public.tasks
  for update to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id)
  with check ((select auth.jwt() ->> 'sub') = user_id);
create policy "tasks: delete own"  on public.tasks
  for delete to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

-- log_entries: owner-only CRUD
drop policy if exists "log_entries: select own" on public.log_entries;
drop policy if exists "log_entries: insert own" on public.log_entries;
drop policy if exists "log_entries: update own" on public.log_entries;
drop policy if exists "log_entries: delete own" on public.log_entries;

create policy "log_entries: select own" on public.log_entries
  for select to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);
create policy "log_entries: insert own" on public.log_entries
  for insert to authenticated
  with check ((select auth.jwt() ->> 'sub') = user_id);
create policy "log_entries: update own" on public.log_entries
  for update to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id)
  with check ((select auth.jwt() ->> 'sub') = user_id);
create policy "log_entries: delete own" on public.log_entries
  for delete to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

-- wizard_state: owner-only CRUD
drop policy if exists "wizard_state: select own" on public.wizard_state;
drop policy if exists "wizard_state: upsert own" on public.wizard_state;
drop policy if exists "wizard_state: update own" on public.wizard_state;
drop policy if exists "wizard_state: delete own" on public.wizard_state;

create policy "wizard_state: select own" on public.wizard_state
  for select to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);
create policy "wizard_state: upsert own" on public.wizard_state
  for insert to authenticated
  with check ((select auth.jwt() ->> 'sub') = user_id);
create policy "wizard_state: update own" on public.wizard_state
  for update to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id)
  with check ((select auth.jwt() ->> 'sub') = user_id);
create policy "wizard_state: delete own" on public.wizard_state
  for delete to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);
