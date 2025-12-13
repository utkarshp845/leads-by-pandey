# Verify Environment Variables in Production

## Quick Verification Steps

### Step 1: Check Build Logs

After deployment, check the Amplify build logs. You should see:
```
Environment variables check:
OPENROUTER_API_KEY is set: yes
JWT_SECRET is set: yes
NODE_ENV: production
```

If you see "no" for any variable, it's not set correctly.

### Step 2: Use Health Check Endpoint

After deployment, visit:
```
https://your-domain.com/api/health
```

This will show you:
- Which environment variables are set
- Their status (without exposing actual values)
- Any missing variables

### Step 3: Verify in Amplify Console

1. Go to AWS Amplify Console
2. Select your app
3. Go to **App settings** → **Environment variables**
4. Verify these are set:
   - `OPENROUTER_API_KEY` (should have a value)
   - `JWT_SECRET` (should have a value)
   - `NODE_ENV` (should be `production`)

## Common Issues

### Issue: "OPENROUTER_API_KEY is not set" error

**Possible causes:**
1. Variable not added in Amplify Console
2. Variable name has a typo (must be exactly `OPENROUTER_API_KEY`)
3. Variable has extra spaces or quotes
4. Deployment happened before variable was added

**Solution:**
1. Go to Amplify Console → App settings → Environment variables
2. Check if `OPENROUTER_API_KEY` exists
3. If it exists, check the value doesn't have quotes or spaces
4. If it doesn't exist, add it:
   - Key: `OPENROUTER_API_KEY`
   - Value: Your actual API key (no quotes, no spaces)
5. Click **Save**
6. **Redeploy** the app (Amplify should auto-redeploy, or manually trigger one)

### Issue: Environment variable set but still not working

**Solution:**
1. Make sure you clicked **Save** after adding the variable
2. Wait for the deployment to complete (5-10 minutes)
3. Check the build logs to see if the variable is detected during build
4. Visit `/api/health` endpoint to verify at runtime

## Step-by-Step: Setting Environment Variables in Amplify

1. **Go to AWS Amplify Console**
   - https://console.aws.amazon.com/amplify/
   - Sign in with your AWS account

2. **Select Your App**
   - Click on your app name

3. **Navigate to Environment Variables**
   - Left sidebar → **App settings**
   - Click **Environment variables** (under "Build settings")

4. **Add OPENROUTER_API_KEY**
   - Click **Add environment variable**
   - **Key:** `OPENROUTER_API_KEY` (exactly, case-sensitive)
   - **Value:** Your OpenRouter API key (get it from https://openrouter.ai/keys)
   - **Important:** No quotes, no spaces, just the key itself
   - Click **Save**

5. **Add JWT_SECRET**
   - Click **Add environment variable**
   - **Key:** `JWT_SECRET` (exactly, case-sensitive)
   - **Value:** Generate with `openssl rand -base64 32` or use a strong random string
   - Click **Save**

6. **Add NODE_ENV (Optional but recommended)**
   - Click **Add environment variable**
   - **Key:** `NODE_ENV`
   - **Value:** `production`
   - Click **Save**

7. **Redeploy**
   - After saving, Amplify should automatically start a new deployment
   - If not, go to **Deployments** tab and click **Redeploy this version**
   - Wait for deployment to complete

8. **Verify**
   - Check build logs for environment variable confirmation
   - Visit `/api/health` endpoint after deployment
   - Try using "Ask Mr Pandey" feature

## Testing After Deployment

1. **Check Health Endpoint:**
   ```
   https://your-domain.com/api/health
   ```
   Should return `"status": "healthy"` if all variables are set

2. **Test Authentication:**
   - Try registering a new user
   - Try logging in
   - Both should work without "Server configuration error"

3. **Test AI Feature:**
   - Create a prospect
   - Click "Ask Mr Pandey"
   - Should generate strategy without "API configuration error"

## Troubleshooting

### Build logs show "OPENROUTER_API_KEY is set: no"

- Variable is not set in Amplify Console
- Variable name is misspelled
- Variable was added but deployment hasn't run yet

**Fix:** Add the variable correctly and redeploy

### Health endpoint shows variables not set

- Variables are set in Amplify but not available at runtime
- This can happen if variables were added after the last deployment

**Fix:** Trigger a new deployment after adding variables

### Variables work in build but not at runtime

- Next.js might need variables prefixed with `NEXT_PUBLIC_` for client-side
- But for API routes, regular `process.env.VAR_NAME` should work
- Check that variables are in the correct environment (not just build environment)

**Fix:** Ensure variables are set in the main environment variables section, not just build-time

