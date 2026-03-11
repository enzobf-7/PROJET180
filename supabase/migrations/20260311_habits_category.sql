-- Migration: add category column to habits
-- Separates daily habits from one-off missions
-- Run in Supabase SQL Editor

alter table habits
  add column if not exists category text not null default 'habit'
  check (category in ('habit', 'mission'));

-- Index for fast filtering by category
create index if not exists habits_client_category_idx on habits(client_id, category);
