-- Fix RLS Policies for Leads by Pandey
-- Run this in Supabase SQL Editor to fix the "user not found" issue
-- 
-- Problem: RLS is enabled but no policies exist, blocking all queries
-- Solution: Add policies to allow anon key to access users and prospects

-- Drop existing policies if they exist (optional, won't error if they don't exist)
DROP POLICY IF EXISTS "Allow anon to read users" ON users;
DROP POLICY IF EXISTS "Allow anon to insert users" ON users;
DROP POLICY IF EXISTS "Allow anon to read prospects" ON prospects;
DROP POLICY IF EXISTS "Allow anon to manage prospects" ON prospects;

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

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('users', 'prospects')
ORDER BY tablename, policyname;

