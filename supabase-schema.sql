-- Supabase Database Schema for Leads by Pandey Solutions
-- Run this in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create prospects table
CREATE TABLE IF NOT EXISTS prospects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  company TEXT NOT NULL,
  industry TEXT,
  notes TEXT,
  known_pain_points TEXT,
  links JSONB DEFAULT '[]'::jsonb,
  prior_interactions TEXT,
  strategy JSONB,
  strategy_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_prospects_user_id ON prospects(user_id);
CREATE INDEX IF NOT EXISTS idx_prospects_created_at ON prospects(created_at DESC);

-- Enable Row Level Security (RLS) for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: Since we're using JWT auth in Next.js (not Supabase Auth),
-- we need to allow the anon key to read/write users for login/registration.
-- This is safe because:
-- 1. Passwords are hashed with bcrypt
-- 2. Authentication is handled in Next.js API routes
-- 3. API routes validate all inputs

-- Policy: Allow anon key to read users (needed for login)
CREATE POLICY "Allow anon to read users" ON users
  FOR SELECT
  USING (true);

-- Policy: Allow anon key to insert users (needed for registration)
CREATE POLICY "Allow anon to insert users" ON users
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow anon key to read prospects (needed to load user's prospects)
CREATE POLICY "Allow anon to read prospects" ON prospects
  FOR SELECT
  USING (true);

-- Policy: Allow anon key to insert/update/delete prospects
CREATE POLICY "Allow anon to manage prospects" ON prospects
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  notification_preferences JSONB DEFAULT '{}'::jsonb,
  ai_model_preference TEXT DEFAULT 'openrouter/auto',
  export_default_format TEXT DEFAULT 'json',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prospect_id TEXT REFERENCES prospects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  reminder_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  prospect_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Extend prospects table with follow-up and status
ALTER TABLE prospects 
  ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'follow-up', 'closed'));

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_reminder_date ON reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_prospects_follow_up_date ON prospects(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status);

-- Enable RLS on new tables
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
CREATE POLICY "Allow anon to manage user_settings" ON user_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for reminders
CREATE POLICY "Allow anon to manage reminders" ON reminders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for templates
CREATE POLICY "Allow anon to manage templates" ON templates
  FOR ALL
  USING (true)
  WITH CHECK (true);

