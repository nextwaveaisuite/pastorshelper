-- Initial schema for an empty Neon PostgreSQL database.
-- Review before using on an existing database; CREATE TABLE IF NOT EXISTS
-- does not alter or reconcile pre-existing table definitions.

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  unlimited BOOLEAN NOT NULL DEFAULT FALSE,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  total_used INTEGER NOT NULL DEFAULT 0,
  is_free_tier BOOLEAN NOT NULL DEFAULT TRUE,
  last_free_topup DATE
);

CREATE TABLE IF NOT EXISTS credit_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sermons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Sermon',
  topic TEXT NOT NULL DEFAULT '',
  audience TEXT NOT NULL DEFAULT '',
  tone TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL DEFAULT 'beginner',
  language TEXT NOT NULL DEFAULT 'English',
  content JSONB NOT NULL DEFAULT '{}'::JSONB,
  series_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prayers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prayer_type TEXT NOT NULL DEFAULT 'General Prayer',
  topic TEXT NOT NULL DEFAULT '',
  audience TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'English',
  content JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sermon_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  topic TEXT,
  level TEXT,
  language TEXT,
  tone TEXT,
  audience TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  page TEXT NOT NULL DEFAULT '/',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sermons_user_created_idx
  ON sermons (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS prayers_user_created_idx
  ON prayers (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS credit_transactions_user_created_idx
  ON credit_transactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS sermon_usage_created_idx
  ON sermon_usage (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_created_idx
  ON page_views (created_at DESC);
