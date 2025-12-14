-- SQL Script to create a test user directly in Supabase
-- Run this in Supabase SQL Editor for quick setup
-- 
-- Test User Credentials:
-- Email: test@leadsbypandey.com
-- Password: Test123!@#
-- 
-- Note: The password hash below is for "Test123!@#" (bcrypt with 10 rounds)
-- If you want a different password, you'll need to generate a new hash

-- Create test user with password: Test123!@#
-- Run this in Supabase SQL Editor

INSERT INTO users (id, email, name, password_hash, created_at)
VALUES (
  'test-user-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 9),
  'test@leadsbypandey.com',
  'Test User',
  '$2a$10$ySJ22DzRjWB8nYJxdsBVG.Inzd340BcxyH.vE2ZCb1XrRDqiKhHF6', -- Hash for password: Test123!@#
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Test User Credentials:
-- Email: test@leadsbypandey.com
-- Password: Test123!@#
-- 
-- After running this, you can log in at: https://leads.pandeylabs.com/login

