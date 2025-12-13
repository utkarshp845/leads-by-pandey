-- Supabase Database Schema for Leads by Pandey
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

-- Create policies (users can only access their own data)
-- Note: Since we're using the anon key and handling auth in Next.js,
-- we'll use service role key for server-side operations
-- For better security, you can set up RLS policies based on JWT claims

-- Policy: Users can read their own data (if using Supabase Auth)
-- For now, we'll use service role key which bypasses RLS
-- This is acceptable since we're handling auth in Next.js API routes

-- Optional: If you want to use Supabase Auth instead of JWT:
-- CREATE POLICY "Users can read own data" ON users
--   FOR SELECT USING (auth.uid()::text = id);
-- 
-- CREATE POLICY "Users can read own prospects" ON prospects
--   FOR SELECT USING (auth.uid()::text = user_id);

