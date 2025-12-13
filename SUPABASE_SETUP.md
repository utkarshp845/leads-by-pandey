# Supabase Database Setup Guide

This guide will help you set up Supabase (PostgreSQL) for persistent user and prospect data storage.

## Why Supabase?

- **Free Tier**: 500MB database, 2GB bandwidth, 50,000 monthly active users
- **Quick Setup**: 5-10 minutes to get started
- **PostgreSQL**: Reliable, familiar SQL database
- **Serverless-Friendly**: No connection pooling issues
- **Automatic Backups**: Included in free tier

## Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Create a new project:
   - **Name**: `leads-by-pandey` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (for MVP)

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. Verify tables were created:
   - Go to **Table Editor**
   - You should see `users` and `prospects` tables

## Step 4: Configure Environment Variables

### For Local Development

Add to your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note**: Using `NEXT_PUBLIC_` prefix makes these available to both client and server in Next.js.

### For AWS Amplify Production

1. Go to AWS Amplify Console → Your App → **App settings** → **Environment variables**
2. Add these variables:
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your Supabase project URL
   - **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon key

3. Click **Save**
4. Amplify will automatically redeploy

## Step 5: Test the Setup

1. Start your local dev server: `npm run dev`
2. Register a new user
3. Create a prospect
4. Check Supabase dashboard → **Table Editor** → `users` and `prospects` tables
5. You should see your data!

## How It Works

- The app uses `lib/db-supabase.ts` which automatically uses Supabase if credentials are configured
- If Supabase is not configured, it falls back to file-based storage (for local dev)
- All database operations are async and work seamlessly with Next.js API routes

## Security Notes

- The `anon` key is safe to use in client-side code (it's public)
- Row Level Security (RLS) is enabled but we're using service role operations
- For production, consider using Supabase Auth instead of JWT for better security
- The anon key has limited permissions and is restricted by RLS policies

## Troubleshooting

### "Supabase credentials not found"
- Check that environment variables are set correctly
- Restart your dev server after adding env vars
- In Amplify, ensure variables are set and deployment completed

### "Table does not exist"
- Run the SQL schema in Supabase SQL Editor
- Check that tables were created in Table Editor

### "Permission denied"
- Ensure you're using the `anon` key (not service role key)
- Check RLS policies if you've customized them

## Migration from File-Based Storage

If you have existing users in file-based storage:

1. Export data from `data/users.json`
2. Use Supabase dashboard → Table Editor to manually insert users
3. Or create a migration script to import data

## Cost

**Free Tier Includes:**
- 500MB database storage
- 2GB bandwidth per month
- 50,000 monthly active users
- Automatic backups

**When you might need to upgrade:**
- More than 500MB of data
- More than 2GB bandwidth/month
- Need more database storage

**Pricing**: Starts at $25/month for Pro plan (if you exceed free tier)

## Next Steps

- ✅ Database is set up and working
- ✅ Users and prospects persist across deployments
- 🔄 Consider adding indexes for frequently queried fields
- 🔄 Set up automated backups (included in free tier)
- 🔄 Monitor usage in Supabase dashboard

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)

