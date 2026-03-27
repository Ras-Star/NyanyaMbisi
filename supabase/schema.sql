create extension if not exists pgcrypto;

create table if not exists public.suppliers (
  id text primary key,
  slug text not null unique,
  name text not null,
  area text not null,
  tagline text not null,
  eta_minutes integer not null,
  verified boolean not null default true,
  rating numeric(2, 1) not null,
  categories text[] not null default '{}',
  hero text not null,
  accent text not null,
  min_basket_ugx integer not null,
  distance_km numeric(4, 1) not null,
  open boolean not null default true,
  pickup_partner text not null,
  story text not null,
  prep_window text not null,
  badges text[] not null default '{}',
  sort_index integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id text primary key,
  supplier_id text not null references public.suppliers(id) on delete cascade,
  category text not null,
  name text not null,
  description text not null,
  unit_label text not null,
  price_ugx integer not null,
  image text not null,
  popular boolean not null default false,
  sort_index integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists products_supplier_id_idx on public.products (supplier_id);

create table if not exists public.otp_sessions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  code text not null,
  expires_at timestamptz not null,
  verified_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists otp_sessions_phone_idx on public.otp_sessions (phone);

create table if not exists public.verified_customers (
  token uuid primary key,
  session_id uuid references public.otp_sessions(id) on delete set null,
  full_name text not null,
  phone text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists verified_customers_phone_idx on public.verified_customers (phone);

create table if not exists public.customer_profiles (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  phone text not null,
  full_name text not null default '',
  default_pin jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists customer_profiles_phone_idx on public.customer_profiles (phone);

create table if not exists public.orders (
  id text primary key,
  customer_auth_id uuid references auth.users(id) on delete set null,
  supplier_id text references public.suppliers(id) on delete set null,
  supplier_name text not null,
  items jsonb not null,
  status text not null,
  payment_provider text not null,
  payment_reference text not null,
  payment_status text not null,
  timeline jsonb not null,
  quote jsonb not null,
  customer jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  total_ugx integer not null
);

alter table public.orders
  add column if not exists customer_auth_id uuid references auth.users(id) on delete set null;

create index if not exists orders_supplier_id_idx on public.orders (supplier_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_customer_auth_id_idx on public.orders (customer_auth_id, created_at desc);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  customer_auth_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  title text not null,
  body text not null,
  metadata jsonb,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists order_events_order_id_idx on public.order_events (order_id, created_at desc);
create index if not exists order_events_customer_auth_id_idx on public.order_events (customer_auth_id, created_at desc);

alter table public.suppliers enable row level security;
alter table public.products enable row level security;
alter table public.otp_sessions enable row level security;
alter table public.verified_customers enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_events enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'suppliers' and policyname = 'Public read suppliers'
  ) then
    create policy "Public read suppliers"
      on public.suppliers
      for select
      to anon, authenticated
      using (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'products' and policyname = 'Public read products'
  ) then
    create policy "Public read products"
      on public.products
      for select
      to anon, authenticated
      using (true);
  end if;
end
$$;

insert into public.suppliers (
  id,
  slug,
  name,
  area,
  tagline,
  eta_minutes,
  verified,
  rating,
  categories,
  hero,
  accent,
  min_basket_ugx,
  distance_km,
  open,
  pickup_partner,
  story,
  prep_window,
  badges,
  sort_index
)
values
  (
    'sup-neema',
    'neema-fresh-market',
    'Neema Fresh Market',
    'namilyango',
    'Leafy greens, tomatoes, onions, and daily essentials from the hill.',
    28,
    true,
    4.8,
    array['Vegetables', 'Fruit', 'Staples'],
    '/marketplace/neema-fresh.webp',
    '#1D6F3B',
    12000,
    1.8,
    true,
    'Kato Boda',
    'Neema keeps the basket simple: quick produce, small pantry restocks, and daily rider dispatch from Namilyango.',
    '15-25 min',
    array['Verified', 'Fast rider coordination', 'Best for family top-ups'],
    0
  ),
  (
    'sup-kibuuka',
    'kibuuka-butchery-staples',
    'Kibuuka Butchery & Staples',
    'gwafu',
    'Butchery cuts, dry goods, and fast lunch baskets from Gwafu.',
    35,
    true,
    4.7,
    array['Butchery', 'Staples', 'Sauces'],
    '/marketplace/kibuuka-butchery.webp',
    '#A2471A',
    15000,
    2.7,
    true,
    'Ssebaggala Rider',
    'Kibuuka handles heavier household baskets with dependable packaging for meat, flour, and sauce staples.',
    '20-35 min',
    array['Verified', 'Trusted by lunch shoppers', 'Best for larger baskets'],
    1
  ),
  (
    'sup-sunrise',
    'sunrise-greens-pantry',
    'Sunrise Greens Pantry',
    'njerere',
    'A tidy mix of fruit, greens, and pantry restocks for eastern homes.',
    30,
    true,
    4.9,
    array['Vegetables', 'Fruit', 'Pantry'],
    '/marketplace/sunrise-greens.webp',
    '#2F9E44',
    10000,
    3.4,
    true,
    'Mayanja Express',
    'Sunrise is ideal for colorful produce runs and smaller family baskets headed deeper into Njerere.',
    '18-28 min',
    array['Verified', 'Strong produce quality', 'Best for weekly restocks'],
    2
  )
on conflict (id) do nothing;

insert into public.products (
  id,
  supplier_id,
  category,
  name,
  description,
  unit_label,
  price_ugx,
  image,
  popular,
  sort_index
)
values
  ('prd-tomatoes', 'sup-neema', 'Vegetables', 'Tomatoes', 'Bright red market tomatoes packed for quick sauces and stews.', '1 kg', 4500, '/products/tomatoes.webp', true, 0),
  ('prd-onions', 'sup-neema', 'Vegetables', 'Onions', 'Cooking onions selected for a week''s worth of home meals.', '1 kg', 3200, '/products/onions.webp', false, 1),
  ('prd-spinach', 'sup-neema', 'Vegetables', 'Spinach bunch', 'Fresh bunches tied for same-day cooking.', '2 bunches', 2500, '/products/spinach.webp', false, 2),
  ('prd-bananas', 'sup-neema', 'Fruit', 'Sweet bananas', 'Ripe home-snack bananas for breakfast and tea time.', '1 dozen', 6000, '/products/bananas.webp', false, 3),
  ('prd-rice', 'sup-neema', 'Staples', 'Rice', 'Clean white rice for home pantry refills.', '2 kg', 9800, '/products/rice.webp', true, 4),
  ('prd-beef', 'sup-kibuuka', 'Butchery', 'Beef', 'Fresh trimmed beef for stew and roasting.', '1 kg', 18000, '/products/beef.webp', true, 0),
  ('prd-chicken', 'sup-kibuuka', 'Butchery', 'Broiler chicken', 'Whole dressed chicken prepared for home cooking.', '1 bird', 26000, '/products/chicken.webp', false, 1),
  ('prd-posho', 'sup-kibuuka', 'Staples', 'Posho flour', 'Milled maize flour packed for family servings.', '2 kg', 5200, '/products/posho.webp', false, 2),
  ('prd-groundnut', 'sup-kibuuka', 'Sauces', 'Groundnut paste', 'Creamy paste for quick home sauce prep.', '500 g', 9000, '/products/groundnut.webp', false, 3),
  ('prd-beans', 'sup-kibuuka', 'Staples', 'Beans', 'Dry beans sorted for stewing and batch cooking.', '2 kg', 8600, '/products/beans.webp', true, 4),
  ('prd-cabbage', 'sup-sunrise', 'Vegetables', 'Cabbage', 'Crunchy heads selected for salads and quick fry-ups.', '1 head', 3500, '/products/cabbage.webp', true, 0),
  ('prd-carrots', 'sup-sunrise', 'Vegetables', 'Carrots', 'Bright carrots for soup, rice, and lunchboxes.', '1 kg', 4200, '/products/carrots.webp', false, 1),
  ('prd-pineapple', 'sup-sunrise', 'Fruit', 'Pineapple', 'Sweet whole pineapple ready for slicing.', '1 fruit', 7000, '/products/pineapple.webp', false, 2),
  ('prd-cooking-oil', 'sup-sunrise', 'Pantry', 'Cooking oil', 'Clear vegetable oil for pantry refills.', '1 litre', 8500, '/products/cooking-oil.webp', true, 3),
  ('prd-salt', 'sup-sunrise', 'Pantry', 'Salt', 'Family table salt for daily cooking.', '500 g', 1500, '/products/salt.webp', false, 4)
on conflict (id) do nothing;
