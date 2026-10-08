-- ============================================================
-- The Pastors Helper — Neon PostgreSQL Schema
-- Run this in your Neon SQL Editor
-- ============================================================

-- Users (email + password auth)
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  name            TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  last_login      TIMESTAMPTZ DEFAULT NOW()
);

-- Sermons
CREATE TABLE IF NOT EXISTS sermons (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT,
  topic      TEXT,
  audience   TEXT,
  tone       TEXT,
  level      TEXT,
  language   TEXT DEFAULT 'English',
  content    JSONB,
  series_id  UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prayers
CREATE TABLE IF NOT EXISTS prayers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT,
  prayer_type TEXT,
  topic       TEXT,
  audience    TEXT,
  language    TEXT DEFAULT 'English',
  content     JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Series
CREATE TABLE IF NOT EXISTS series (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Credits
CREATE TABLE IF NOT EXISTS user_credits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  balance         INTEGER DEFAULT 10,
  total_purchased INTEGER DEFAULT 0,
  total_used      INTEGER DEFAULT 0,
  unlimited       BOOLEAN DEFAULT FALSE,
  is_free_tier    BOOLEAN DEFAULT TRUE,
  last_free_topup DATE DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Credit transactions log
CREATE TABLE IF NOT EXISTS credit_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  type              TEXT,
  amount            INTEGER,
  description       TEXT,
  stripe_session_id TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Page views analytics
CREATE TABLE IF NOT EXISTS page_views (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sermon & prayer usage analytics
CREATE TABLE IF NOT EXISTS sermon_usage (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  topic      TEXT,
  level      TEXT,
  language   TEXT,
  tone       TEXT,
  audience   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sermons_user ON sermons(user_id);
CREATE INDEX IF NOT EXISTS idx_prayers_user ON prayers(user_id);
CREATE INDEX IF NOT EXISTS idx_series_user ON series(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_user ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_user ON sermon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at);
