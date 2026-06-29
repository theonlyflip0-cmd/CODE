-- ─────────────────────────────────────────────────────────────────────────────
-- Kral Durum To Go — schema, RLS, auth helpers & realtime.
-- Run against your own Supabase project (SQL editor or `supabase db push`).
-- ─────────────────────────────────────────────────────────────────────────────

-- Enums ----------------------------------------------------------------------
do $$ begin
  create type order_status as enum ('new', 'accepted', 'ready', 'delivered');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_type as enum ('delivery', 'pickup');
exception when duplicate_object then null; end $$;

-- menu_items -----------------------------------------------------------------
create table if not exists public.menu_items (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  name_nl         text not null,
  name_en         text not null,
  description_nl  text,
  description_en  text,
  price           numeric(8, 2) not null,
  category        text not null,
  sort_order      int not null default 0,
  is_popular      boolean not null default false,
  available       boolean not null default true,
  calories        int, -- deprecated / removed from UI
  created_at      timestamptz not null default now()
);

-- settings (single row id=1) -------------------------------------------------
create table if not exists public.settings (
  id              int primary key,
  ordering_closed boolean not null default false,
  updated_at      timestamptz not null default now()
);
insert into public.settings (id, ordering_closed) values (1, false)
  on conflict (id) do nothing;

-- orders ---------------------------------------------------------------------
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     bigint generated always as identity (start with 1001),
  customer_name    text not null,
  customer_phone   text not null,
  customer_address text,          -- null for pickup
  postcode         text,          -- null for pickup
  order_type       order_type not null,
  items            jsonb not null default '[]'::jsonb,
  subtotal         numeric(8, 2) not null default 0,
  delivery_fee     numeric(8, 2) not null default 0,
  tip              numeric(8, 2) not null default 0,
  discount         numeric(8, 2) not null default 0,
  total            numeric(8, 2) not null default 0,
  status           order_status not null default 'new',
  ready_minutes    int,
  created_at       timestamptz not null default now()
);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_idx on public.orders (created_at desc);

-- profiles (admin role flag) -------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  email      text,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Auth helpers ────────────────────────────────────────────────────────────

-- True when the current user is flagged as admin.
create or replace function public.is_admin()
returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_admin);
$$;

-- Create a profile row automatically when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- First account to log in is auto-promoted to admin.
create or replace function public.claim_admin_if_first()
returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (auth.uid(), (select email from auth.users where id = auth.uid()))
  on conflict (id) do nothing;

  if not exists (select 1 from public.profiles where is_admin) then
    update public.profiles set is_admin = true where id = auth.uid();
  end if;
end; $$;

-- ── Row Level Security ──────────────────────────────────────────────────────

alter table public.menu_items enable row level security;
alter table public.settings   enable row level security;
alter table public.orders     enable row level security;
alter table public.profiles   enable row level security;

-- menu_items: world-readable, admin-writable.
drop policy if exists menu_select_all on public.menu_items;
create policy menu_select_all on public.menu_items
  for select to anon, authenticated using (true);
drop policy if exists menu_admin_write on public.menu_items;
create policy menu_admin_write on public.menu_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- settings: world-readable, admin-writable.
drop policy if exists settings_select_all on public.settings;
create policy settings_select_all on public.settings
  for select to anon, authenticated using (true);
drop policy if exists settings_admin_write on public.settings;
create policy settings_admin_write on public.settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- orders: anyone may place one. PII is protected by column GRANTs below —
-- anon can only ever read id + order_number (needed for the insert RETURNING).
drop policy if exists orders_insert_anyone on public.orders;
create policy orders_insert_anyone on public.orders
  for insert to anon, authenticated with check (true);
drop policy if exists orders_select_anon on public.orders;
create policy orders_select_anon on public.orders
  for select to anon using (true);
drop policy if exists orders_select_admin on public.orders;
create policy orders_select_admin on public.orders
  for select to authenticated using (public.is_admin());
drop policy if exists orders_update_admin on public.orders;
create policy orders_update_admin on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists orders_delete_admin on public.orders;
create policy orders_delete_admin on public.orders
  for delete to authenticated using (public.is_admin());

-- profiles: a user can read their own row.
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select to authenticated using (id = auth.uid());

-- ── Column / execute GRANTs ─────────────────────────────────────────────────

revoke all on public.orders from anon, authenticated;
grant insert on public.orders to anon, authenticated;
grant select (id, order_number) on public.orders to anon;        -- no PII for anon
grant select, update, delete on public.orders to authenticated;  -- gated by RLS (admin only)

grant select on public.menu_items to anon, authenticated;
grant insert, update, delete on public.menu_items to authenticated;

grant select on public.settings to anon, authenticated;
grant insert, update on public.settings to authenticated;

grant execute on function public.claim_admin_if_first() to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ── Realtime ────────────────────────────────────────────────────────────────
do $$ begin
  alter publication supabase_realtime add table public.menu_items;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.settings;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null; end $$;
