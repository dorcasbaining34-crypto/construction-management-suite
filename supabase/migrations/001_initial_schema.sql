-- EJ PNG Limited Management System
-- Supabase/Postgres foundation. Run through Supabase migrations.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  employee_id text unique,
  full_name text not null,
  email text,
  role text not null default 'staff' check (role in ('admin','director','project_manager','accounts','hr','operations','staff','contractor')),
  status text not null default 'Active' check (status in ('Active','Disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(), employee_id text unique, name text not null,
  designation text, department text, hire_date date, status text default 'Active',
  skills text, qualifications text, phone text, email text, supervisor_id uuid references public.employees(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(), name text not null, contact_name text, email text, phone text, address text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(), project_code text unique not null, name text not null,
  customer_id uuid references public.customers(id), manager_id uuid references public.employees(id), location text,
  contract_value numeric(14,2) default 0, budget numeric(14,2) default 0, spent numeric(14,2) default 0,
  progress numeric(5,2) default 0 check (progress between 0 and 100), status text default 'On Track',
  start_date date, end_date date, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.work_orders (
  id uuid primary key default gen_random_uuid(), work_order_no text unique not null, project_id uuid references public.projects(id) on delete cascade,
  title text not null, description text, assigned_employee_id uuid references public.employees(id), status text default 'Open', priority text default 'Medium',
  due_date date, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.timesheets (
  id uuid primary key default gen_random_uuid(), employee_id uuid not null references public.employees(id), project_id uuid references public.projects(id),
  work_order_id uuid references public.work_orders(id), work_date date not null, hours numeric(6,2) default 0, overtime_hours numeric(6,2) default 0,
  notes text, approved_by uuid references public.profiles(id), approved_at timestamptz, created_at timestamptz not null default now()
);

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(), quote_no text unique not null, customer_id uuid references public.customers(id), project_id uuid references public.projects(id),
  status text default 'Draft', subtotal numeric(14,2) default 0, tax numeric(14,2) default 0, total numeric(14,2) default 0,
  valid_until date, created_by uuid references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(), invoice_no text unique not null, customer_id uuid references public.customers(id), project_id uuid references public.projects(id),
  status text default 'Draft', amount numeric(14,2) default 0, due_date date, issued_date date, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(), invoice_id uuid references public.invoices(id) on delete cascade, amount numeric(14,2) not null, payment_date date not null, reference text, method text, created_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(), sku text unique, name text not null, category text, unit text, quantity numeric(14,2) default 0, reorder_level numeric(14,2) default 0, unit_cost numeric(14,2) default 0, supplier text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(), actor_id uuid references public.profiles(id), action text not null, table_name text, record_id uuid, details jsonb, created_at timestamptz not null default now()
);

create index if not exists idx_projects_customer on public.projects(customer_id);
create index if not exists idx_timesheets_employee_date on public.timesheets(employee_id, work_date);
create index if not exists idx_work_orders_project on public.work_orders(project_id);
create index if not exists idx_invoices_project on public.invoices(project_id);

alter table public.profiles enable row level security;
alter table public.employees enable row level security;
alter table public.customers enable row level security;
alter table public.projects enable row level security;
alter table public.work_orders enable row level security;
alter table public.timesheets enable row level security;
alter table public.quotations enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.inventory_items enable row level security;
alter table public.audit_logs enable row level security;

-- Authenticated users can read operational data. Writes should be tightened further
-- once production roles are provisioned; no anonymous access is granted.
create policy "authenticated read profiles" on public.profiles for select to authenticated using (true);
create policy "authenticated read employees" on public.employees for select to authenticated using (true);
create policy "authenticated read customers" on public.customers for select to authenticated using (true);
create policy "authenticated read projects" on public.projects for select to authenticated using (true);
create policy "authenticated read work orders" on public.work_orders for select to authenticated using (true);
create policy "authenticated read timesheets" on public.timesheets for select to authenticated using (true);
create policy "authenticated read quotations" on public.quotations for select to authenticated using (true);
create policy "authenticated read invoices" on public.invoices for select to authenticated using (true);
create policy "authenticated read payments" on public.payments for select to authenticated using (true);
create policy "authenticated read inventory" on public.inventory_items for select to authenticated using (true);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
