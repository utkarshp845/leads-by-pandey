# Database Quick Start (5 Minutes)

## Why Supabase?

✅ **Free Forever**: 500MB database, 2GB bandwidth/month  
✅ **5-Minute Setup**: Get running immediately  
✅ **PostgreSQL**: Industry-standard, reliable database  
✅ **No Connection Issues**: Perfect for serverless/Amplify  

## Quick Setup Steps

### 1. Create Supabase Account (2 min)
- Go to [supabase.com](https://supabase.com) → Sign up
- Create new project → Choose free tier
- Wait ~2 minutes for project to initialize

### 2. Get API Keys (1 min)
- In Supabase dashboard: **Settings** → **API**
- Copy:
  - **Project URL** (e.g., `https://xxxxx.supabase.co`)
  - **anon/public key** (long string starting with `eyJ...`)

### 3. Create Database Tables (1 min)
- Go to **SQL Editor** in Supabase dashboard
- Copy/paste contents of `supabase-schema.sql`
- Click **Run**
- ✅ Done! Tables created.

### 4. Add Environment Variables (1 min)

**For Local Development:**
Add to `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**For AWS Amplify:**
1. Amplify Console → App settings → Environment variables
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Save → Auto-redeploy

### 5. Test It! (30 sec)
- Register a new user
- Create a prospect
- Check Supabase dashboard → Table Editor
- See your data! 🎉

## That's It!

Your app now has persistent storage. Users and prospects will survive deployments!

## Need Help?

See `SUPABASE_SETUP.md` for detailed instructions and troubleshooting.

