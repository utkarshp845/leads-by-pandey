# Create Test User for Production

Two easy ways to create a test user for production testing:

## Option 1: Using the Script (Recommended)

**Prerequisites:**
- Supabase is set up
- Environment variables are configured in `.env` or Amplify

**Steps:**
1. Make sure you have Supabase credentials in your environment:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. Run the script:
   ```bash
   npm run create-test-user
   ```

3. The script will create a test user with these credentials:
   - **Email**: `test@leadsbypandey.com`
   - **Password**: `Test123!@#`
   - **Name**: Test User

4. Use these credentials to log in at: https://leads.pandeylabs.com/login

## Option 2: Using Supabase Dashboard (Quick)

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **users** table
3. Click **Insert** → **Insert row**
4. Fill in:
   - **id**: `test-user-1234567890-abc123xyz` (any unique ID)
   - **email**: `test@leadsbypandey.com`
   - **name**: `Test User`
   - **password_hash**: You need to generate this (see below)
   - **created_at**: Click to set current timestamp

5. **Generate password hash:**
   - Run locally: `node -e "const bcrypt=require('bcryptjs');bcrypt.hash('Test123!@#',10).then(h=>console.log(h))"`
   - Copy the hash output
   - Paste into `password_hash` field

6. Click **Save**

## Test User Credentials

```
Email: test@leadsbypandey.com
Password: Test123!@#
```

**Note:** You can change the password in the script (`scripts/create-test-user.ts`) if you want a different one.

## Verify User Was Created

1. Check Supabase dashboard → **Table Editor** → **users**
2. You should see the test user listed
3. Try logging in at https://leads.pandeylabs.com/login

## Troubleshooting

**"Supabase credentials not found"**
- Make sure `.env` file has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Or set them as environment variables before running the script

**"User already exists"**
- The script will detect if the user exists
- Delete the existing user from Supabase dashboard if you want to recreate

**"Permission denied"**
- Make sure you're using the `anon` key (not service role key)
- Check that RLS policies allow inserts (or use service role key temporarily)

## Security Note

This test user is for testing purposes only. In production, you may want to:
- Use a more secure password
- Delete test users after testing
- Set up proper user management

