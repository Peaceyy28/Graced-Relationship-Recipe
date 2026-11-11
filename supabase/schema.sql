-- Graced Relationship Recipes — Cloud Database Schema (Supabase)
-- Paste & run this once inside your Supabase Dashboard -> SQL Editor

create table if not exists public.grr_posts (
  id text primary key,
  title text not null,
  scripture text,
  scripture_reference text,
  content text not null,
  cover_image text,
  status text default 'published',
  scheduled_for timestamptz,
  views integer default 0,
  shares integer default 0,
  created_at timestamptz default now(),
  published_at timestamptz,
  updated_at timestamptz
);

create table if not exists public.grr_videos (
  id text primary key,
  title text not null,
  description text,
  youtube_url text not null,
  thumbnail_url text,
  clicks integer default 0,
  source text default 'manual',
  created_at timestamptz default now(),
  updated_at timestamptz
);

create table if not exists public.grr_settings (
  id text primary key default 'default',
  data jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists public.grr_analytics (
  id text primary key default 'default',
  data jsonb not null,
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.grr_posts enable row level security;
alter table public.grr_videos enable row level security;
alter table public.grr_settings enable row level security;
alter table public.grr_analytics enable row level security;

-- Public & App Access Policies
create policy "Allow public read/write on grr_posts" on public.grr_posts for all using (true) with check (true);
create policy "Allow public read/write on grr_videos" on public.grr_videos for all using (true) with check (true);
create policy "Allow public read/write on grr_settings" on public.grr_settings for all using (true) with check (true);
create policy "Allow public read/write on grr_analytics" on public.grr_analytics for all using (true) with check (true);

-- Grant table privileges to Supabase API roles
grant usage on schema public to anon, authenticated;
grant all on table public.grr_posts, public.grr_videos, public.grr_settings, public.grr_analytics to anon, authenticated;
