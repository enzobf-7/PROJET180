-- Table to track which milestone emails have been sent per client
-- Prevents duplicate milestone emails if the cron runs multiple times on the same day

create table if not exists milestone_emails_sent (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references auth.users(id) on delete cascade,
  milestone_day integer not null check (milestone_day in (30, 60, 90, 180)),
  sent_at     timestamptz not null default now(),
  unique (client_id, milestone_day)
);

-- RLS: admins can read, no direct client access needed
alter table milestone_emails_sent enable row level security;

create policy "Admin full access"
  on milestone_emails_sent
  for all
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );
