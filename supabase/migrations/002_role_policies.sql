-- EJ PNG role-based database permissions.
-- Apply after 001_initial_schema.sql.
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

-- Profiles: users can read their own profile; administrators can manage all profiles.
drop policy if exists "authenticated read profiles" on public.profiles;
create policy "users read own profile" on public.profiles for select to authenticated using (id = auth.uid() or public.current_role() = 'admin');
create policy "admins manage profiles" on public.profiles for update to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- Employees.
create policy "authorized users create employees" on public.employees for insert to authenticated with check (public.current_role() in ('admin','hr','director'));
create policy "authorized users update employees" on public.employees for update to authenticated using (public.current_role() in ('admin','hr','director','project_manager')) with check (public.current_role() in ('admin','hr','director','project_manager'));

-- Projects.
create policy "authorized users create projects" on public.projects for insert to authenticated with check (public.current_role() in ('admin','director','project_manager'));
create policy "authorized users update projects" on public.projects for update to authenticated using (public.current_role() in ('admin','director','project_manager','operations')) with check (public.current_role() in ('admin','director','project_manager','operations'));

-- Work orders.
create policy "authorized users create work orders" on public.work_orders for insert to authenticated with check (public.current_role() in ('admin','director','project_manager','operations'));
create policy "authorized users update work orders" on public.work_orders for update to authenticated using (public.current_role() in ('admin','director','project_manager','operations')) with check (public.current_role() in ('admin','director','project_manager','operations'));

-- Timesheets.
create policy "authorized users create timesheets" on public.timesheets for insert to authenticated with check (public.current_role() in ('admin','director','project_manager','operations','staff'));
create policy "authorized users update timesheets" on public.timesheets for update to authenticated using (public.current_role() in ('admin','director','project_manager','operations')) with check (public.current_role() in ('admin','director','project_manager','operations'));

-- Quotations, invoices, payments and inventory.
create policy "authorized users create quotations" on public.quotations for insert to authenticated with check (public.current_role() in ('admin','director','accounts','project_manager'));
create policy "authorized users update quotations" on public.quotations for update to authenticated using (public.current_role() in ('admin','director','accounts','project_manager')) with check (public.current_role() in ('admin','director','accounts','project_manager'));
create policy "authorized users create invoices" on public.invoices for insert to authenticated with check (public.current_role() in ('admin','director','accounts'));
create policy "authorized users update invoices" on public.invoices for update to authenticated using (public.current_role() in ('admin','director','accounts')) with check (public.current_role() in ('admin','director','accounts'));
create policy "authorized users create payments" on public.payments for insert to authenticated with check (public.current_role() in ('admin','director','accounts'));
create policy "authorized users create inventory" on public.inventory_items for insert to authenticated with check (public.current_role() in ('admin','director','operations'));
create policy "authorized users update inventory" on public.inventory_items for update to authenticated using (public.current_role() in ('admin','director','operations')) with check (public.current_role() in ('admin','director','operations'));

-- Audit log: authenticated users may append records; only administrators may read all records.
create policy "authenticated append audit logs" on public.audit_logs for insert to authenticated with check (actor_id = auth.uid());
create policy "admins read audit logs" on public.audit_logs for select to authenticated using (public.current_role() = 'admin');
