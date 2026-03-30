# Supabase Database Setup

Run the SQL commands in your **Supabase SQL Editor** (Dashboard → SQL Editor).

For the complete schema, see [`setup.sql`](./setup.sql) — it contains everything in one file.

## Overview

The database uses **Telegram-based authentication** (no `auth.users` dependency for most tables). Users are identified by `telegram_id` and the app accesses data via the **anon key** with permissive RLS policies.

## Tables

| Table | Description |
|---|---|
| `users` | Platform users identified by `telegram_id` |
| `stores` | Loyalty program stores with tier config |
| `products` | Store product catalog |
| `offers` | Redeemable offers (discounts, gifts, etc.) |
| `user_store_memberships` | Links users to stores with points/tier |
| `transactions` | Point earn/redeem/adjust/expire history |
| `redemptions` | Offer redemption records |
| `promotions` | Advertising campaigns with targeting |

## Quick Setup

### 1. Create Tables

The full DDL is in [`setup.sql`](./setup.sql). Key schema details:

**users** — identified by `telegram_id`, no Supabase auth dependency:
```sql
create table public.users (
  id uuid default gen_random_uuid() primary key,
  full_name text,
  username text unique,
  telegram_id bigint unique,
  language_code text,
  avatar_url text,
  photo_url text,
  phone text,
  birth_date date,
  gender text check (gender in ('male', 'female')),
  role text default 'user' check (role in ('user', 'admin', 'super_admin')),
  is_super_admin boolean default false,
  is_bot boolean default false,
  is_premium boolean default false,
  permissions text[] default array['read']::text[],
  ad_points_balance integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_active timestamptz
);
```

**stores** — with tier thresholds and points configuration:
```sql
create table public.stores (
  id uuid default uuid_generate_v4() primary key,
  owner_email text not null,
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  phone text,
  address text,
  city text,
  category text,
  tier_config jsonb default '{"bronze": 0, "silver": 10000, "gold": 50000, "platinum": 100000}'::jsonb,
  points_rate integer default 1,
  welcome_points integer default 100,
  primary_color text default '#D4AF37',
  plan text default 'basic',
  is_active boolean default true,
  ad_points_balance integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**user_store_memberships** — the core linking table with role-based access:
```sql
create table public.user_store_memberships (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  store_id uuid references public.stores(id) on delete cascade not null,
  role text default 'viewer' check (role in ('owner', 'manager', 'cashier', 'viewer')),
  permissions jsonb default '{"view": true}'::jsonb,
  points integer default 0,
  tier text default 'bronze' check (tier in ('bronze', 'silver', 'gold', 'platinum')),
  total_spent integer default 0,
  visit_count integer default 0,
  last_purchase timestamptz,
  joined_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, store_id)
);
```

**transactions** — point ledger with type tracking:
```sql
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  store_id uuid references public.stores(id) on delete cascade not null,
  type text not null check (type in ('earn', 'redeem', 'adjust', 'expire')),
  points integer not null,
  amount integer,
  description text,
  created_at timestamptz default now()
);
```

**offers** — with tier gating and occasion-based scheduling:
```sql
create table public.offers (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  title text not null,
  description text,
  type text not null check (type in ('discount', 'gift', 'double_points', 'flash', 'exclusive')),
  discount_percent integer,
  points_cost integer default 0,
  min_tier text default 'bronze' check (min_tier in ('bronze', 'silver', 'gold', 'platinum')),
  occasion_type text default 'always' check (occasion_type in ('always', 'fixed', 'birthday', 'anniversary', 'win_back', 'flash')),
  occasion_date date,
  valid_from timestamptz,
  valid_until timestamptz,
  usage_limit integer,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**promotions** — ad campaigns with audience targeting:
```sql
create table public.promotions (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  title text not null,
  body text,
  image_url text,
  cta_label text default 'اكتشف المتجر',
  cta_url text,
  target_tiers text[] default array['bronze', 'silver', 'gold', 'platinum'],
  target_gender text check (target_gender in ('male', 'female', null)),
  target_city text,
  target_min_spent integer,
  reward_points integer default 50,
  budget_points integer default 1000,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 2. Storage Buckets

```sql
INSERT INTO storage.buckets (id, name, public) VALUES
  ('product-images', 'product-images', true)
ON CONFLICT DO NOTHING;
```

### 3. Row Level Security

All tables have RLS enabled. Policies allow **anon access** for the Telegram-based auth flow:

```sql
-- Enable RLS
alter table public.users enable row level security;
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.offers enable row level security;
alter table public.user_store_memberships enable row level security;
alter table public.transactions enable row level security;
alter table public.redemptions enable row level security;
alter table public.promotions enable row level security;

-- Anon read/write policies for users, stores, products, offers, memberships, transactions, redemptions, promotions
-- (see setup.sql lines 180-249 for all policies)
```

Super admin and store-owner policies are also defined for `stores`, `products`, `offers`, and `promotions` tables.

### 4. Indexes

```sql
create index idx_products_store_id on public.products(store_id);
create index idx_offers_store_id on public.offers(store_id);
create index idx_user_store_memberships_store_id on public.user_store_memberships(store_id);
create index idx_user_store_memberships_tier on public.user_store_memberships(tier);
create index idx_transactions_store_id on public.transactions(store_id);
create index idx_transactions_user_id on public.transactions(user_id);
create index idx_redemptions_store_id on public.redemptions(store_id);
create index idx_redemptions_offer_id on public.redemptions(offer_id);
create index idx_promotions_store_id on public.promotions(store_id);
```

### 5. Triggers & Functions

- **`update_user_tier()`** — automatically updates membership tier when points change, based on the store's `tier_config`
- **`handle_new_user()`** — syncs new `auth.users` to the `public.users` table (SECURITY DEFINER)

### 6. Seed Data

A super admin user and demo store are seeded at the end of `setup.sql`:

```sql
-- Super admin user (telegram_id: 1203654887)
INSERT INTO public.users (id, telegram_id, username, full_name, is_super_admin, role, language_code)
VALUES ('b7849646-d726-4ece-ab01-f6180d99f8bd', 1203654887, 'SaadMohammedMansour', 'ساعد محمد', true, 'super_admin', 'ar')
ON CONFLICT (telegram_id) DO UPDATE SET is_super_admin = true;

-- Demo store
INSERT INTO public.stores (id, slug, name, owner_email, category, points_rate, welcome_points, primary_color, plan, is_active)
VALUES ('11111111-1111-1111-1111-111111111111', 'store-alpha', 'متجر التجميع', 'saad@example.com', 'متجر عام', 1, 100, '#D4AF37', 'basic', true)
ON CONFLICT (slug) DO NOTHING;

-- Admin membership
INSERT INTO public.user_store_memberships (user_id, store_id, role, points, tier)
VALUES ('b7849646-d726-4ece-ab01-f6180d99f8bd', '11111111-1111-1111-1111-111111111111', 'owner', 0, 'bronze')
ON CONFLICT (user_id, store_id) DO NOTHING;
```

## Migration Notes

`setup.sql` includes a `DO $$` block (lines 330-431) that safely adds missing columns to existing tables. Run the full file on an existing database — the `DROP TABLE IF EXISTS ... CASCADE` statements at the top will reset everything, or the migration block will add only what's missing.
