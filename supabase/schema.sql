-- Belora schema. Run in the Supabase SQL editor.
create table if not exists riders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  lat double precision not null,
  lng double precision not null,
  available boolean not null default true
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text,
  customer_phone text,
  pickup_postcode text not null,
  dropoff_postcode text not null,
  distance_km numeric,
  fee_ngn integer,
  status text not null default 'new' check (status in ('new','assigned','picked_up','delivered','cancelled')),
  rider_id uuid references riders(id),
  paid boolean not null default false
);

alter table riders enable row level security;
alter table orders enable row level security;
-- Prototype policies: open for demo. Tighten (auth + per-operator ownership) before real use.
create policy "demo read riders" on riders for select using (true);
create policy "demo read orders" on orders for select using (true);
create policy "demo write orders" on orders for insert with check (true);
create policy "demo update orders" on orders for update using (true);

insert into riders (name, phone, lat, lng) values
  ('Musa', '08000000001', 9.0765, 7.3986),
  ('Chika', '08000000002', 9.0579, 7.4951),
  ('Tunde', '08000000003', 9.0300, 7.4700);
