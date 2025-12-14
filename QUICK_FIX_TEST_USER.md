# Quick Fix: Create Test User in Supabase

## The Problem
The logs show: **"❌ User not found in Supabase: test@leadsbypandey.com"**

The test user doesn't exist in your Supabase database yet.

## Solution: Create the User (Choose One Method)

### Method 1: Using Supabase SQL Editor (Fastest - 30 seconds)

1. Go to your Supabase project dashboard
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste this SQL:

```sql
-- Create test user with password: Test123!@#
INSERT INTO users (id, email, name, password_hash, created_at)
VALUES (
  'test-user-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 9),
  'test@leadsbypandey.com',
  'Test User',
  '$2a$10$ySJ22DzRjWB8nYJxdsBVG.Inzd340BcxyH.vE2ZCb1XrRDqiKhHF6',
  NOW()
)
ON CONFLICT (email) DO NOTHING;
```

5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see: "Success. No rows returned"
7. ✅ Done! User created.

### Method 2: Using Supabase Table Editor (Visual)

1. Go to Supabase dashboard → **Table Editor** → **users** table
2. Click **Insert** → **Insert row**
3. Fill in:
   - **id**: `test-user-1234567890-abc123xyz` (any unique ID)
   - **email**: `test@leadsbypandey.com`
   - **name**: `Test User`
   - **password_hash**: `$2a$10$ySJ22DzRjWB8nYJxdsBVG.Inzd340BcxyH.vE2ZCb1XrRDqiKhHF6`
   - **created_at**: Click to set current timestamp
4. Click **Save**

### Method 3: Using the Script (If you have env vars locally)

If you have Supabase credentials in your local `.env` file:

```bash
npm run create-test-user
```

## Test User Credentials

After creating the user, use these to log in:

```
Email: test@leadsbypandey.com
Password: Test123!@#
```

## Verify User Was Created

1. Go to Supabase → **Table Editor** → **users**
2. You should see `test@leadsbypandey.com` in the list
3. Try logging in at https://leads.pandeylabs.com/login

## What the Logs Showed

✅ **Supabase is connected** - The app is successfully querying Supabase  
❌ **User doesn't exist** - The test user was never created  
✅ **Fallback works** - App correctly falls back to file storage (but it's empty)

Once you create the user in Supabase, login should work immediately!

