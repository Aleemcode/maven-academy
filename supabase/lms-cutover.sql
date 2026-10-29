-- Maven student app: switch the shared tables to students-only.
-- Applied when /app goes live (it stops the old public board/feedback pages from writing).
-- Project: "Kaban Board" (besjzgmacljwltnzhbzn).

-- PROJECTS -------------------------------------------------------------
drop policy if exists "class read" on public.projects;
drop policy if exists "class add"  on public.projects;
drop policy if exists "class move" on public.projects;

revoke all on public.projects from anon;
revoke select, insert, update on public.projects from authenticated;
-- private fields (comfort, help_needed, edit_key) are not readable directly. Owners use my_project(), Aleem uses facilitator_overview()
grant select (id, builder, project_name, problem, audience, done_looks_like, status, created_at, kind, features, link, user_id, presented_at) on public.projects to authenticated;
grant insert (builder, project_name, problem, audience, done_looks_like, status, kind, features, link, comfort, help_needed) on public.projects to authenticated;
grant update (builder, project_name, problem, audience, done_looks_like, status, kind, features, link, comfort, help_needed) on public.projects to authenticated;
grant delete on public.projects to authenticated;

create policy "students read the board" on public.projects for select to authenticated using (public.is_student());
create policy "students add their own card" on public.projects for insert to authenticated
  with check (public.is_student() and user_id = auth.uid());
create policy "owner or facilitator edits" on public.projects for update to authenticated
  using (user_id = auth.uid() or public.is_facilitator())
  with check ((user_id = auth.uid() or public.is_facilitator()) and status in ('idea','system','prototype','live','refined','demo'));
create policy "owner or facilitator deletes" on public.projects for delete to authenticated
  using (user_id = auth.uid() or public.is_facilitator());

-- FEEDBACK -------------------------------------------------------------
drop policy if exists "class can submit feedback" on public.feedback;
revoke all on public.feedback from anon;
create policy "students send their own feedback" on public.feedback for insert to authenticated
  with check (public.is_student() and user_id = auth.uid());
create policy "own feedback or facilitator" on public.feedback for select to authenticated
  using (user_id = auth.uid() or public.is_facilitator());

-- TASTE CARDS ----------------------------------------------------------
drop policy if exists "anyone reads tastes"     on public.taste_cards;
drop policy if exists "anyone publishes tastes" on public.taste_cards;
revoke all on public.taste_cards from anon;
create policy "students read tastes" on public.taste_cards for select to authenticated using (public.is_student());
create policy "students publish tastes" on public.taste_cards for insert to authenticated
  with check (public.is_student() and user_id = auth.uid());

-- Old edit-key / shared-secret functions stay for the labs, but not for anonymous callers.
revoke execute on function public.move_project(uuid, uuid, text), public.delete_project(uuid, uuid), public.delete_taste(uuid, uuid),
  public.admin_check(text), public.admin_move_project(uuid, text, text), public.admin_delete_project(uuid, text), public.admin_delete_taste(uuid, text)
  from anon, public;
grant execute on function public.move_project(uuid, uuid, text), public.delete_project(uuid, uuid), public.delete_taste(uuid, uuid),
  public.admin_check(text), public.admin_move_project(uuid, text, text), public.admin_delete_project(uuid, text), public.admin_delete_taste(uuid, text)
  to authenticated;

-- New tables: nothing for anonymous callers (RLS already returns nothing; this is belt and braces).
revoke all on public.students, public.cohort_sessions, public.lab_state from anon;
