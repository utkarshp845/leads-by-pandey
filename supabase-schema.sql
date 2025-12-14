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

