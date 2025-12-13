# Production Deployment Checklist

## Pre-Deployment Verification

### ✅ Configuration Files
- [x] `amplify.yml` - Valid YAML syntax, no syntax errors
- [x] `package.json` - All build dependencies in `dependencies` (not `devDependencies`)
- [x] `tsconfig.json` - `baseUrl` and `paths` configured correctly
- [x] `next.config.js` - Webpack alias configured for `@/` paths
- [x] `postcss.config.js` - Correct format for Tailwind CSS v3.4.0

### ✅ Code Quality
- [x] Build succeeds locally (`npm run build`)
- [x] No TypeScript errors
- [x] No linter errors
- [x] All imports resolve correctly

## AWS Amplify Environment Variables

### Required Variables (Must be set in Amplify Console)

1. **OPENROUTER_API_KEY**
   - Location: Amplify Console → App settings → Environment variables
   - Key: `OPENROUTER_API_KEY` (exactly, case-sensitive)
   - Value: Your OpenRouter API key from https://openrouter.ai/keys
   - ⚠️ No quotes, no spaces, just the key itself

2. **JWT_SECRET**
   - Location: Amplify Console → App settings → Environment variables
   - Key: `JWT_SECRET` (exactly, case-sensitive)
   - Value: Strong random string (generate with `openssl rand -base64 32`)
   - ⚠️ Must be at least 32 characters

3. **NODE_ENV** (Recommended)
   - Location: Amplify Console → App settings → Environment variables
   - Key: `NODE_ENV`
   - Value: `production`

### How to Set Environment Variables

1. Go to https://console.aws.amazon.com/amplify/
2. Select your app
3. Click **App settings** (left sidebar)
4. Click **Environment variables** (under "Build settings")
5. Click **Add environment variable** for each required variable
6. Enter exact key name (case-sensitive)
7. Enter value (no quotes, no spaces)
8. Click **Save**
9. **Wait for automatic redeploy** or manually trigger one

## Deployment Process

### Step 1: Verify Code is Pushed
```bash
git status  # Should show "nothing to commit, working tree clean"
git log --oneline -1  # Verify latest commit is pushed
```

### Step 2: Verify Environment Variables
- Check Amplify Console → Environment variables
- All three variables should be listed
- Values should not be empty

### Step 3: Monitor Deployment
1. Go to Amplify Console → Deployments
2. Watch for new deployment to start
3. Check build logs for:
   - ✅ "OPENROUTER_API_KEY is set"
   - ✅ "JWT_SECRET is set"
   - ✅ "Compiled successfully"
   - ✅ "Generating static pages (6/6)"

### Step 4: Verify After Deployment
1. Visit `/api/health` endpoint
   - Should return `"status": "healthy"`
   - Should show all env vars are set

2. Test Authentication
   - Register a new user
   - Login with that user
   - Both should work

3. Test AI Feature
   - Create a prospect
   - Click "Ask Mr Pandey"
   - Should generate strategy successfully

## Troubleshooting

### Build Fails with YAML Error
- Check `amplify.yml` syntax
- Ensure no colons in comments
- Use proper YAML multiline syntax for complex commands

### Build Fails with "Module not found"
- Verify `tsconfig.json` has `baseUrl: "."`
- Verify `next.config.js` has webpack alias
- Verify all dependencies are in `dependencies` (not `devDependencies`)

### "OPENROUTER_API_KEY is not set" Error
1. Check Amplify Console → Environment variables
2. Verify key name is exactly `OPENROUTER_API_KEY` (case-sensitive)
3. Verify value doesn't have quotes or spaces
4. Check build logs to see if variable is detected
5. Visit `/api/health` to verify at runtime
6. **Redeploy** after adding/changing variables

### Environment Variables Not Working
- Variables must be set BEFORE deployment
- After adding variables, a new deployment is required
- Check build logs to see if variables are detected during build
- Use `/api/health` endpoint to verify at runtime

## Current Configuration Status

✅ **All build dependencies in `dependencies`:**
- typescript
- @types/*
- tailwindcss
- postcss
- autoprefixer

✅ **Module resolution configured:**
- `tsconfig.json`: `baseUrl: "."`, `paths: { "@/*": ["./*"] }`
- `next.config.js`: Webpack alias for `@/`
- `moduleResolution: "node"`

✅ **PostCSS configured:**
- Tailwind CSS v3.4.0 (compatible version)
- Correct config format

✅ **Build verified:**
- Builds successfully locally
- No errors or warnings

## Next Steps

1. **Set environment variables in Amplify Console** (if not already done)
2. **Wait for deployment to complete**
3. **Verify using `/api/health` endpoint**
4. **Test all features**

