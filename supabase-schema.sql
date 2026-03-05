-- ============================================================
-- GLC PLATFORM — SCHEMA SUPABASE COMPLET
-- À exécuter dans Supabase SQL Editor
-- ============================================================

-- 1. PROFILES (extension de auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  first_name text not null default '',
  last_name text not null default '',
  role text not null default 'client' check (role in ('admin', 'client')),
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Admin can read all profiles"
  on public.profiles for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. APP SETTINGS (config globale Robin)
create table public.app_settings (
  id uuid primary key default gen_random_uuid(),
  whatsapp_link text not null default '',
  skool_link text not null default '',
  iclosed_link text not null default '',
  contract_pdf_url text not null default '',
  contract_version int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

create policy "Anyone authenticated can read settings"
  on public.app_settings for select using (auth.uid() is not null);
create policy "Only admin can update settings"
  on public.app_settings for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Insert default row
insert into public.app_settings (whatsapp_link, skool_link, iclosed_link) values ('', '', '');

-- 3. ONBOARDING PROGRESS
create table public.onboarding_progress (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete cascade unique not null,
  step_contract boolean not null default false,
  step_questionnaire boolean not null default false,
  step_whatsapp boolean not null default false,
  step_skool boolean not null default false,
  step_call_booked boolean not null default false,
  contract_signed_at timestamptz,
  contract_version_signed int,
  contract_signer_ip text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.onboarding_progress enable row level security;

create policy "Client can read own onboarding"
  on public.onboarding_progress for select using (auth.uid() = client_id);
create policy "Client can update own onboarding"
  on public.onboarding_progress for update using (auth.uid() = client_id);
create policy "Admin can read all onboarding"
  on public.onboarding_progress for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "Admin can insert onboarding"
  on public.onboarding_progress for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 4. QUESTIONNAIRE RESPONSES
create table public.questionnaire_responses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete cascade unique not null,
  responses jsonb not null default '{}',
  submitted_at timestamptz not null default now()
);

alter table public.questionnaire_responses enable row level security;

create policy "Client can read own responses"
  on public.questionnaire_responses for select using (auth.uid() = client_id);
create policy "Client can insert own responses"
  on public.questionnaire_responses for insert with check (auth.uid() = client_id);
create policy "Admin can read all responses"
  on public.questionnaire_responses for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 5. PROGRAMS
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete cascade unique not null,
  content jsonb not null default '[]',
  start_date date,
  updated_at timestamptz not null default now()
);

alter table public.programs enable row level security;

create policy "Client can read own program"
  on public.programs for select using (auth.uid() = client_id);
create policy "Admin can do everything on programs"
  on public.programs for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 6. HABITS
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  created_by text not null default 'admin' check (created_by in ('admin', 'client')),
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.habits enable row level security;

create policy "Client can read own habits"
  on public.habits for select using (auth.uid() = client_id);
create policy "Client can manage own habits"
  on public.habits for all using (auth.uid() = client_id);
create policy "Admin can do everything on habits"
  on public.habits for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 7. HABIT LOGS
create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references public.habits(id) on delete cascade not null,
  client_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  completed boolean not null default false,
  unique(habit_id, date)
);

alter table public.habit_logs enable row level security;

create policy "Client can manage own habit logs"
  on public.habit_logs for all using (auth.uid() = client_id);
create policy "Admin can read all habit logs"
  on public.habit_logs for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 8. WEEKLY REPORTS
create table public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete cascade not null,
  week_number int not null,
  responses jsonb not null default '{}',
  motivation_score int not null default 5 check (motivation_score between 1 and 10),
  submitted_at timestamptz not null default now(),
  unique(client_id, week_number)
);

alter table public.weekly_reports enable row level security;

create policy "Client can manage own reports"
  on public.weekly_reports for all using (auth.uid() = client_id);
create policy "Admin can read all reports"
  on public.weekly_reports for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 9. GAMIFICATION
create table public.gamification (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete cascade unique not null,
  xp_total int not null default 0,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  level text not null default 'RECRUE',
  badges jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

alter table public.gamification enable row level security;

create policy "Client can read own gamification"
  on public.gamification for select using (auth.uid() = client_id);
create policy "Admin can do everything on gamification"
  on public.gamification for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
-- Allow client to update own gamification (for XP/streak updates)
create policy "Client can update own gamification"
  on public.gamification for update using (auth.uid() = client_id);

-- 10. MESSAGES
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Users can read own messages"
  on public.messages for select using (
    auth.uid() = sender_id or auth.uid() = receiver_id
  );
create policy "Users can send messages"
  on public.messages for insert with check (auth.uid() = sender_id);
create policy "Users can mark messages as read"
  on public.messages for update using (auth.uid() = receiver_id);

-- ============================================================
-- STORAGE BUCKET pour les contrats PDF
-- ============================================================
insert into storage.buckets (id, name, public) values ('contracts', 'contracts', true);

-- ============================================================
-- INDEX pour performance
-- ============================================================
create index idx_habit_logs_client_date on public.habit_logs(client_id, date);
create index idx_habit_logs_habit_date on public.habit_logs(habit_id, date);
create index idx_messages_receiver on public.messages(receiver_id, created_at desc);
create index idx_messages_sender on public.messages(sender_id, created_at desc);
create index idx_weekly_reports_client on public.weekly_reports(client_id, week_number);
