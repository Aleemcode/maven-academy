-- Facilitator can add, insert-between and remove sessions. Session numbers stay 1..N with no gaps,
-- and feedback already given moves with its session when numbers shift.

-- add a session after p_after (0 = at the very start). Later sessions (and their feedback) move down by one.
create or replace function public.insert_session_after(p_after int, p_title text, p_starts timestamptz, p_ends timestamptz default null, p_stage text default null)
returns int language plpgsql security definer set search_path = public as $$
declare r record; v_stage text; v_n int := p_after + 1;
begin
  if not public.is_facilitator() then raise exception 'not allowed' using errcode = '42501'; end if;
  if coalesce(trim(p_title), '') = '' then raise exception 'title required'; end if;
  if (select count(*) from public.cohort_sessions) >= 20 then raise exception 'too many sessions'; end if;
  if p_after < 0 or p_after > (select coalesce(max(n), 0) from public.cohort_sessions) then raise exception 'bad position'; end if;
  v_stage := coalesce(p_stage, (select stage from public.cohort_sessions where n = greatest(p_after, 1)), 'idea');
  for r in select n from public.cohort_sessions where n > p_after order by n desc loop
    update public.cohort_sessions set n = r.n + 1 where n = r.n;
    update public.feedback set session = r.n + 1 where session = r.n;
  end loop;
  insert into public.cohort_sessions (n, stage, title, starts_at, ends_at) values (v_n, v_stage, trim(p_title), p_starts, coalesce(p_ends, p_starts + interval '2 hours'));
  return v_n;
end $$;

-- remove a session. Refused when students already gave feedback on it, so no feedback is ever lost.
create or replace function public.delete_session(p_n int)
returns void language plpgsql security definer set search_path = public as $$
declare r record;
begin
  if not public.is_facilitator() then raise exception 'not allowed' using errcode = '42501'; end if;
  if exists (select 1 from public.feedback where session = p_n) then raise exception 'has feedback'; end if;
  delete from public.cohort_sessions where n = p_n;
  if not found then raise exception 'not found'; end if;
  for r in select n from public.cohort_sessions where n > p_n order by n loop
    update public.cohort_sessions set n = r.n - 1 where n = r.n;
    update public.feedback set session = r.n - 1 where session = r.n;
  end loop;
end $$;

revoke all on function public.insert_session_after(int, text, timestamptz, timestamptz, text) from public, anon;
revoke all on function public.delete_session(int) from public, anon;
grant execute on function public.insert_session_after(int, text, timestamptz, timestamptz, text) to authenticated;
grant execute on function public.delete_session(int) to authenticated;
