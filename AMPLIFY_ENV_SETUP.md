# Setting Environment Variables in AWS Amplify

## Quick Guide: Add Environment Variables to Your Amplify App

### Step 1: Access AWS Amplify Console

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Sign in with your AWS account
3. Select your app (should be `leads-by-pandey` or similar)

### Step 2: Navigate to Environment Variables

1. In the left sidebar, click **"App settings"**
2. Click **"Environment variables"** (under "Build settings")

### Step 3: Add Required Environment Variables

Click **"Add environment variable"** for each of the following:

#### 1. OPENROUTER_API_KEY (Required)
- **Key:** `OPENROUTER_API_KEY`
- **Value:** Your OpenRouter API key (get it from https://openrouter.ai/keys)
- **Note:** This is required for the "Ask Mr Pandey" feature to work

#### 2. JWT_SECRET (Required)
- **Key:** `JWT_SECRET`
- **Value:** Generate a strong secret using:
  ```bash
  openssl rand -base64 32
  ```
  Or use any strong random string (at least 32 characters)
- **Note:** This is required for user authentication to work

#### 3. NODE_ENV (Recommended)
- **Key:** `NODE_ENV`
- **Value:** `production`
- **Note:** This tells the app it's running in production mode

### Step 4: Save and Redeploy

1. After adding all environment variables, click **"Save"**
2. Amplify will automatically trigger a new deployment
3. Wait for the deployment to complete (usually 5-10 minutes)

### Step 5: Verify

After deployment completes:
1. Go to your app URL
2. Try registering a new user
3. Try creating a prospect and clicking "Ask Mr Pandey"
4. Both should work without errors

## Important Notes

- **Never commit API keys to git** - They should only be in Amplify environment variables
- **JWT_SECRET must be the same** - If you change it, all existing user sessions will be invalidated
- **Changes take effect after redeploy** - Environment variable changes require a new deployment
- **Check deployment logs** - If something fails, check the build logs in Amplify Console

## Troubleshooting

### "API configuration error" in production
- Verify `OPENROUTER_API_KEY` is set in Amplify environment variables
- Check that the value doesn't have extra spaces or quotes
- Ensure the deployment completed successfully

### "Server configuration error" during registration
- Verify `JWT_SECRET` is set in Amplify environment variables
- Make sure it's a strong, random string (at least 32 characters)
- Check deployment logs for any errors

### Environment variables not working
- Make sure you clicked "Save" after adding variables
- Wait for the deployment to complete
- Check the build logs in Amplify Console for any errors
- Try redeploying the app manually if needed

## Screenshot Guide

1. **App Settings Location:**
   ```
   Amplify Console → Your App → App settings (left sidebar) → Environment variables
   ```

2. **Adding a Variable:**
   - Click "Add environment variable"
   - Enter Key (e.g., `OPENROUTER_API_KEY`)
   - Enter Value (your actual API key)
   - Click "Save"

3. **After Saving:**
   - You'll see a notification that a new deployment is starting
   - Monitor the deployment in the "Deployments" tab

## Quick Command Reference

If you need to generate a JWT_SECRET quickly:
```bash
openssl rand -base64 32
```

Copy the output and use it as your `JWT_SECRET` value in Amplify.

