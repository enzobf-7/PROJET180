-- Migration: seed 4 system todos for all existing clients
-- Run in Supabase SQL Editor AFTER 20260311_todos.sql

-- Remove old system todos (from previous 2-todo version)
delete from todos where is_system = true;

-- Insert 4 system todos for every existing client
insert into todos (client_id, title, is_system)
select p.id, t.title, true
from profiles p
cross join (values
  ('Poster check-in du soir dans le groupe'),
  ('To-do du lendemain'),
  ('Le dimanche : poster wins de la semaine'),
  ('Être présent au live')
) as t(title)
where p.role = 'client';
