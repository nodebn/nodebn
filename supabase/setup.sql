-- Run in Supabase SQL Editor after your core schema exists (profiles, stores, products, product_images, orders, order_items).
-- Adjust if your table/column names differ.

-- ---------------------------------------------------------------------------
-- Alter order_items to add variant columns (if not exists)
-- ---------------------------------------------------------------------------
alter table public.order_items add column if not exists variant_id text;
alter table public.order_items add column if not exists variant_name text;

-- ---------------------------------------------------------------------------
-- Promo Codes Table (if not exists)
-- ---------------------------------------------------------------------------
create table if not exists public.promo_codes (
  id uuid default gen_random_uuid() primary key,
  store_id uuid not null references public.stores(id) on delete cascade,
  code text not null unique,
  discount_type text not null check (discount_type in ('fixed', 'percentage')),
  value integer not null check (value > 0),
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------------
-- Services Table (if not exists)
-- ---------------------------------------------------------------------------
create table if not exists public.services (
  id uuid default gen_random_uuid() primary key,
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  description text,
  fee_cents integer not null default 0 check (fee_cents >= 0),
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------------
-- Product Variants Table (if not exists)
-- ---------------------------------------------------------------------------
create table if not exists public.product_variants (
  id uuid default gen_random_uuid() primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  price_cents integer not null check (price_cents >= 0),
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------------
-- Profile on signup (stores.owner_id → profiles.id)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security (seller = store owner)
-- ---------------------------------------------------------------------------
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

-- Public storefront reads (anon + signed-in customers)
drop policy if exists "stores_public_read" on public.stores;
create policy "stores_public_read"
  on public.stores for select
  using (is_active = true);

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products for select
  using (
    is_active = true
    and exists (
      select 1 from public.stores s
      where s.id = products.store_id and s.is_active = true
    )
  );

drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_images.product_id
        and p.is_active = true
        and s.is_active = true
    )
  );

drop policy if exists "stores_select_own" on public.stores;
create policy "stores_select_own"
  on public.stores for select
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists "stores_insert_own" on public.stores;
create policy "stores_insert_own"
  on public.stores for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "stores_update_own" on public.stores;
create policy "stores_update_own"
  on public.stores for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "stores_delete_own" on public.stores;
create policy "stores_delete_own"
  on public.stores for delete
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists "products_select_own" on public.products;
create policy "products_select_own"
  on public.products for select
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = products.store_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "products_insert_own" on public.products;
create policy "products_insert_own"
  on public.products for insert
  to authenticated
  with check (
    exists (
      select 1 from public.stores s
      where s.id = products.store_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "products_update_own" on public.products;
create policy "products_update_own"
  on public.products for update
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = products.store_id and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.stores s
      where s.id = products.store_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "products_delete_own" on public.products;
create policy "products_delete_own"
  on public.products for delete
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = products.store_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "product_images_select_own" on public.product_images;
create policy "product_images_select_own"
  on public.product_images for select
  to authenticated
  using (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_images.product_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "product_images_insert_own" on public.product_images;
create policy "product_images_insert_own"
  on public.product_images for insert
  to authenticated
  with check (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_images.product_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "product_images_update_own" on public.product_images;
create policy "product_images_update_own"
  on public.product_images for update
  using (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_images.product_id and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_images.product_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "product_images_delete_own" on public.product_images;
create policy "product_images_delete_own"
  on public.product_images for delete
  to authenticated
  using (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_images.product_id and s.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Storage: public bucket for storefront images + seller-only writes
-- Path convention: {store_id}/{product_id}/{filename}
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_images.product_id
        and p.is_active = true
        and s.is_active = true
    )
  );

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "product_images_auth_insert" on storage.objects;
create policy "product_images_auth_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.stores s
      where s.id::text = split_part(name, '/', 1)
        and s.owner_id = auth.uid()
    )
  );

drop policy if exists "product_images_auth_update" on storage.objects;
create policy "product_images_auth_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.stores s
      where s.id::text = split_part(name, '/', 1)
        and s.owner_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.stores s
      where s.id::text = split_part(name, '/', 1)
        and s.owner_id = auth.uid()
    )
  );

drop policy if exists "product_images_auth_delete" on storage.objects;
create policy "product_images_auth_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.stores s
      where s.id::text = split_part(name, '/', 1)
        and s.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Promo Codes RLS
-- ---------------------------------------------------------------------------
alter table public.promo_codes enable row level security;

drop policy if exists "promo_codes_select_own" on public.promo_codes;
create policy "promo_codes_select_own"
  on public.promo_codes for select
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = promo_codes.store_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "promo_codes_insert_own" on public.promo_codes;
create policy "promo_codes_insert_own"
  on public.promo_codes for insert
  to authenticated
  with check (
    exists (
      select 1 from public.stores s
      where s.id = promo_codes.store_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "promo_codes_update_own" on public.promo_codes;
create policy "promo_codes_update_own"
  on public.promo_codes for update
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = promo_codes.store_id and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.stores s
      where s.id = promo_codes.store_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "promo_codes_public_read" on public.promo_codes;
create policy "promo_codes_public_read"
  on public.promo_codes for select
  using (
    is_active = true
    and exists (
      select 1 from public.stores s
      where s.id = promo_codes.store_id and s.is_active = true
    )
  );

drop policy if exists "promo_codes_delete_own" on public.promo_codes;
create policy "promo_codes_delete_own"
  on public.promo_codes for delete
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = promo_codes.store_id and s.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Services RLS
-- ---------------------------------------------------------------------------
alter table public.services enable row level security;

-- Seller CRUD on own services
drop policy if exists "services_select_own" on public.services;
create policy "services_select_own"
  on public.services for select
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = services.store_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "services_insert_own" on public.services;
create policy "services_insert_own"
  on public.services for insert
  to authenticated
  with check (
    exists (
      select 1 from public.stores s
      where s.id = services.store_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "services_update_own" on public.services;
create policy "services_update_own"
  on public.services for update
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = services.store_id and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.stores s
      where s.id = services.store_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "services_public_read" on public.services;
create policy "services_public_read"
  on public.services for select
  using (
    is_active = true
    and exists (
      select 1 from public.stores s
      where s.id = services.store_id and s.is_active = true
    )
  );

drop policy if exists "services_delete_own" on public.services;
create policy "services_delete_own"
  on public.services for delete
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = services.store_id and s.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Product Variants RLS
-- ---------------------------------------------------------------------------
alter table public.product_variants enable row level security;

-- Public read for active variants
drop policy if exists "product_variants_public_read" on public.product_variants;
create policy "product_variants_public_read"
  on public.product_variants for select
  to anon
  using (
    is_active = true
    and exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_variants.product_id
        and p.is_active = true
        and s.is_active = true
    )
  );

-- Seller CRUD on own variants
drop policy if exists "product_variants_select_own" on public.product_variants;
create policy "product_variants_select_own"
  on public.product_variants for select
  to authenticated
  using (
    is_active = true
    and exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_variants.product_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "product_variants_insert_own" on public.product_variants;
create policy "product_variants_insert_own"
  on public.product_variants for insert
  to authenticated
  with check (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_variants.product_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "product_variants_update_own" on public.product_variants;
create policy "product_variants_update_own"
  on public.product_variants for update
  to authenticated
  using (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_variants.product_id and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_variants.product_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "product_variants_delete_own" on public.product_variants;
create policy "product_variants_delete_own"
  on public.product_variants for delete
  to authenticated
  using (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_variants.product_id and s.owner_id = auth.uid()
    )
  );
