-- ============================================================
-- Campus Lost & Found Portal — Database Schema
-- Run this in the Supabase SQL Editor (Project > SQL Editor)
-- ============================================================

-- Enable pgcrypto if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to automatically create a public.users row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_app_meta_data->>'role', NEW.raw_user_metadata->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to automatically update public.users when auth.users is updated
CREATE OR REPLACE FUNCTION public.handle_update_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET 
    email = NEW.email,
    role = COALESCE(NEW.raw_app_meta_data->>'role', NEW.raw_user_metadata->>'role', 'user'),
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_user();

-- Backfill existing users
INSERT INTO public.users (id, email, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_app_meta_data->>'role', raw_user_metadata->>'role', 'user')
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET 
  email = EXCLUDED.email, 
  role = EXCLUDED.role,
  updated_at = NOW();

-- ── Items table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  category      TEXT NOT NULL,
  location      TEXT NOT NULL,
  date_occurred DATE NOT NULL,
  image_url     TEXT,
  contact_info  TEXT NOT NULL,
  storage_location TEXT,
  status        TEXT NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open', 'claimed', 'removed')),
  posted_by     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(category, '') || ' ' ||
      coalesce(location, '')
    )
  ) STORED
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS items_search_idx     ON items USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS items_status_idx     ON items (status);
CREATE INDEX IF NOT EXISTS items_type_idx       ON items (type);
CREATE INDEX IF NOT EXISTS items_category_idx   ON items (category);
CREATE INDEX IF NOT EXISTS items_created_at_idx ON items (created_at DESC);
CREATE INDEX IF NOT EXISTS items_posted_by_idx  ON items (posted_by);

-- ── Auto-update updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── AI rate limiting table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_rate_limits (
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  hour_bucket TIMESTAMPTZ NOT NULL,
  count       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, hour_bucket)
);

CREATE INDEX IF NOT EXISTS ai_rate_limits_user_idx ON ai_rate_limits (user_id, hour_bucket);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_rate_limits ENABLE ROW LEVEL SECURITY;

-- Users RLS policies
CREATE POLICY "Allow authenticated read users" ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow individual update users" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admin all users" ON public.users
  FOR ALL
  USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Public can read open/claimed items
CREATE POLICY "Public read items" ON items
  FOR SELECT
  USING (status != 'removed');

-- Authenticated users can insert
CREATE POLICY "Auth insert items" ON items
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Owners can update their own items
CREATE POLICY "Owner update items" ON items
  FOR UPDATE
  USING (auth.uid() = posted_by);

-- Admins can do anything (read/update/delete regardless of status)
CREATE POLICY "Admin select all items" ON items
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admin update all items" ON items
  FOR UPDATE
  USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admin delete items" ON items
  FOR DELETE
  USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- AI rate limits: users can only see/modify their own records
CREATE POLICY "Own rate limits" ON ai_rate_limits
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
