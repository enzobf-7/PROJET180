-- Migration: todos table (to-do journalière)
-- Run in Supabase SQL Editor

create table if not exists todos (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references auth.users(id) on delete cascade,
  title          text not null,
  is_system      boolean not null default false,
  completed_date date,            -- NULL = non complété ce jour
  created_at     timestamptz not null default now()
);

-- RLS
alter table todos enable row level security;

-- Client can only see and modify their own todos
create policy "client_select_own_todos" on todos
  for select using (auth.uid() = client_id);

create policy "client_insert_own_todos" on todos
  for insert with check (auth.uid() = client_id);

create policy "client_update_own_todos" on todos
  for update using (auth.uid() = client_id);

-- Admin can read all todos (service role bypasses RLS anyway)
create policy "admin_select_all_todos" on todos
  for select using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Admin can insert todos for any client (service role bypasses RLS)
create policy "admin_insert_todos" on todos
  for insert with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Admin can update todos (e.g. reorder)
create policy "admin_update_todos" on todos
  for update using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Admin can delete non-system todos per client
create policy "admin_delete_todos" on todos
  for delete using (
    is_system = false
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Index for fast lookups by client + date
create index if not exists todos_client_date_idx on todos(client_id, completed_date);
create index if not exists todos_client_system_idx on todos(client_id, is_system);
