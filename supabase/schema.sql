-- ============================================================
-- The Pastors Helper — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- SERMONS TABLE
-- ─────────────────────────────────────────
create table if not exists sermons (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade,
  title       text not null default 'Untitled Sermon',
  topic       text,
  audience    text,
  tone        text,
  content     jsonb,
  is_favorite boolean default false,
  series_id   uuid,
  created_at  timestamp with time zone default now(),
  updated_at  timestamp with time zone default now()
);

-- ─────────────────────────────────────────
-- SERMON SERIES TABLE
-- ─────────────────────────────────────────
create table if not exists series (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade,
  name        text not null,
  description text,
  created_at  timestamp with time zone default now()
);

-- Add foreign key from sermons to series
alter table sermons
  add constraint fk_series
  foreign key (series_id) references series(id)
  on delete set null;

-- ─────────────────────────────────────────
-- ROW-LEVEL SECURITY
-- ─────────────────────────────────────────
alter table sermons enable row level security;
alter table series  enable row level security;

-- Sermons: users only see/edit their own
create policy "Users can view own sermons"
  on sermons for select
  using (auth.uid() = user_id);

create policy "Users can insert own sermons"
  on sermons for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sermons"
  on sermons for update
  using (auth.uid() = user_id);

create policy "Users can delete own sermons"
  on sermons for delete
  using (auth.uid() = user_id);

-- Series: same pattern
create policy "Users can view own series"
  on series for select
  using (auth.uid() = user_id);

create policy "Users can insert own series"
  on series for insert
  with check (auth.uid() = user_id);

create policy "Users can update own series"
  on series for update
  using (auth.uid() = user_id);

create policy "Users can delete own series"
  on series for delete
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger sermons_updated_at
  before update on sermons
  for each row execute procedure update_updated_at();
