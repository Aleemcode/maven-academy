-- Maven student app v1, additive migration (applied 2026-10-29 as "lms_v1_additive").
-- Project: "Kaban Board" (besjzgmacljwltnzhbzn). Nothing here changes what the old public pages can do.

-- ROSTER ---------------------------------------------------------------
create table if not exists public.students (
  email text primary key check (email = lower(btrim(email)) and position('@' in email) > 1),
  full_name text check (char_length(full_name) <= 80),
  user_id uuid unique references auth.users(id) on delete set null,
  role text not null default 'student' check (role in ('student','facilitator')),
  cohort int not null default 1,
  paystack_ref text,
  paid_at timestamptz,
  certified_at timestamptz,
  cert_code text unique,
  created_at timestamptz not null default now()
);
alter table public.students enable row level security;

create or replace function public.is_student() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.students where user_id = auth.uid());
$$;
create or replace function public.is_facilitator() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.students where user_id = auth.uid() and role = 'facilitator');
$$;

create policy "see self or all as facilitator" on public.students for select to authenticated
  using (user_id = auth.uid() or public.is_facilitator());
create policy "facilitator edits roster" on public.students for update to authenticated
  using (public.is_facilitator()) with check (public.is_facilitator());
create policy "facilitator adds to roster" on public.students for insert to authenticated
  with check (public.is_facilitator());

-- SESSIONS -------------------------------------------------------------
create table if not exists public.cohort_sessions (
  n int primary key check (n between 1 and 20),
  cohort int not null default 1,
  stage text not null,
  title text not null check (char_length(title) <= 120),
  ship text check (char_length(ship) <= 300),
  starts_at timestamptz not null,
  ends_at timestamptz,
  meet_url text,
  replay_url text,
  notes text check (char_length(notes) <= 2000)
);
alter table public.cohort_sessions enable row level security;
create policy "students read sessions" on public.cohort_sessions for select to authenticated
  using (public.is_student());
create policy "facilitator edits sessions" on public.cohort_sessions for update to authenticated
  using (public.is_facilitator()) with check (public.is_facilitator());

insert into public.cohort_sessions (n, stage, title, ship, starts_at, ends_at) values
 (1,'idea','AI Fluency','Your digital business card, live','2026-10-24 20:30+01','2026-10-24 22:00+01'),
 (2,'system','Design Language & System Thinking','Your journey map and wireframe','2026-10-25 20:30+01','2026-10-25 22:00+01'),
 (3,'prototype','Prototype','A first working screen of your project','2026-10-30 20:30+01','2026-10-30 22:00+01'),
 (4,'live','Go Live','Your project on a public link','2026-11-01 20:30+01','2026-11-01 22:00+01'),
 (5,'refined','Refine with Taste','A refined, slop-free version','2026-11-07 20:30+01','2026-11-07 22:00+01'),
 (6,'demo','Demo Day','Present your build to the cohort','2026-11-08 20:30+01','2026-11-08 22:30+01')
on conflict (n) do nothing;

-- OWNERSHIP ON EXISTING TABLES ----------------------------------------
alter table public.projects add column if not exists user_id uuid default auth.uid() references auth.users(id) on delete set null;
alter table public.projects add column if not exists presented_at timestamptz;
create unique index if not exists projects_one_per_student on public.projects(user_id) where user_id is not null;

alter table public.feedback add column if not exists user_id uuid default auth.uid() references auth.users(id) on delete set null;
create unique index if not exists feedback_once_per_session on public.feedback(user_id, session) where user_id is not null;

alter table public.taste_cards add column if not exists user_id uuid default auth.uid() references auth.users(id) on delete set null;

-- LAB STATE (Taste Lab / Prompt Lab work, synced to the account) -------
create table if not exists public.lab_state (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  app text not null check (app in ('taste-lab','prompt-lab')),
  key text not null check (char_length(key) <= 120),
  value text check (char_length(value) <= 400000),
  updated_at timestamptz not null default now(),
  primary key (user_id, app, key)
);
alter table public.lab_state enable row level security;
create policy "own lab state" on public.lab_state for all to authenticated
  using (user_id = auth.uid() and public.is_student())
  with check (user_id = auth.uid() and public.is_student());

-- RPCs -----------------------------------------------------------------
create or replace function public.lab_gate(p_app text) returns jsonb
language sql stable security definer set search_path = public as $$
  select case when s.email is null then null else jsonb_build_object(
    'name', s.full_name, 'email', s.email,
    'state', coalesce((select jsonb_object_agg(l.key, l.value) from public.lab_state l
                       where l.user_id = auth.uid() and l.app = p_app), '{}'::jsonb))
  end
  from (select 1) x left join public.students s on s.user_id = auth.uid();
$$;

create or replace function public.my_project() returns setof public.projects
language sql stable security definer set search_path = public as $$
  select * from public.projects where user_id = auth.uid() and public.is_student();
$$;

create or replace function public.claim_project(p_id uuid) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_student() then return false; end if;
  if exists (select 1 from public.projects where user_id = auth.uid()) then return false; end if;
  update public.projects set user_id = auth.uid() where id = p_id and user_id is null;
  return found;
end $$;

create or replace function public.set_presented(p_id uuid, p_on boolean) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_user uuid;
begin
  if not public.is_facilitator() then return false; end if;
  update public.projects set presented_at = case when p_on then coalesce(presented_at, now()) end
   where id = p_id returning user_id into v_user;
  if not found then return false; end if;
  if v_user is not null then
    update public.students set
      certified_at = case when p_on then coalesce(certified_at, now()) end,
      cert_code = case when p_on then coalesce(cert_code, 'MAB1-' || upper(substr(md5(gen_random_uuid()::text), 1, 6))) else cert_code end
    where user_id = v_user;
  end if;
  return true;
end $$;

create or replace function public.verify_certificate(p_code text) returns table(full_name text, project_name text, cohort int, certified_at timestamptz)
language sql stable security definer set search_path = public as $$
  select s.full_name, p.project_name, s.cohort, s.certified_at
  from public.students s left join public.projects p on p.user_id = s.user_id
  where s.cert_code = upper(btrim(p_code)) and s.certified_at is not null;
$$;

create or replace function public.facilitator_overview() returns table(
  email text, full_name text, role text, claimed boolean, project_id uuid, project_name text, status text,
  link text, presented_at timestamptz, comfort text, help_needed text, feedback_sessions int[], certified_at timestamptz, cert_code text)
language sql stable security definer set search_path = public as $$
  select s.email, s.full_name, s.role, s.user_id is not null, p.id, p.project_name, p.status, p.link, p.presented_at,
         p.comfort, p.help_needed,
         coalesce((select array_agg(f.session order by f.session) from public.feedback f where f.user_id = s.user_id and s.user_id is not null), '{}'),
         s.certified_at, s.cert_code
  from public.students s left join public.projects p on p.user_id = s.user_id
  where public.is_facilitator()
  order by s.role desc, s.full_name nulls last, s.email;
$$;

create or replace function public.unclaimed_projects() returns table(id uuid, builder text, project_name text, status text)
language sql stable security definer set search_path = public as $$
  select id, builder, project_name, status from public.projects where user_id is null and public.is_student() order by created_at;
$$;

revoke execute on function public.lab_gate(text), public.my_project(), public.claim_project(uuid), public.set_presented(uuid, boolean),
  public.facilitator_overview(), public.unclaimed_projects() from anon, public;
grant execute on function public.lab_gate(text), public.my_project(), public.claim_project(uuid), public.set_presented(uuid, boolean),
  public.facilitator_overview(), public.unclaimed_projects(), public.is_student(), public.is_facilitator() to authenticated;
grant execute on function public.verify_certificate(text) to anon, authenticated;

insert into public.students (email, full_name, role) values ('aakinyoola857@gmail.com', 'Aleem Akinyoola', 'facilitator')
on conflict (email) do update set role = 'facilitator';
