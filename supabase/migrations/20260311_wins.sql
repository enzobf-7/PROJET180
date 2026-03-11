-- Migration: wins table
-- Run in Supabase SQL Editor

create table if not exists wins (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references auth.users(id) on delete cascade,
  content      text not null,
  week_number  int  not null,
  created_at   timestamptz not null default now()
);

-- RLS
alter table wins enable row level security;

-- Client can only see and insert their own wins
create policy "client_select_own_wins" on wins
  for select using (auth.uid() = client_id);

create policy "client_insert_own_wins" on wins
  for insert with check (auth.uid() = client_id);

-- Admin can read all wins (service role bypasses RLS anyway)
create policy "admin_select_all_wins" on wins
  for select using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Index for fast lookups by client + week
create index if not exists wins_client_week_idx on wins(client_id, week_number);
