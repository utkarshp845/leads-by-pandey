# Fixing AWS Amplify Build Error

If you're seeing this error:
```
3 validation errors detected: Value '' at 'platform' failed to satisfy constraint...
```

## Solution: Manual Build Configuration

When creating the app in AWS Amplify Console, you need to manually configure the build settings:

### Step 1: Create App
1. Go to AWS Amplify Console
2. Click "New app" → "Host web app"
3. Connect GitHub and select your repo

### Step 2: Configure Build Settings (IMPORTANT)

Instead of using auto-detection, click **"Edit"** next to build settings and use this:

**Build image:** `Amazon Linux 2023`

**Build settings:**
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

**Or use the UI:**
1. Click "Edit" in build settings
2. **Pre-build commands:**
   ```
   npm ci
   ```
3. **Build commands:**
   ```
   npm run build
   ```
4. **Output directory:** `.next`
5. **Base directory:** (leave empty)

### Step 3: Environment Variables

Add these in "Environment variables" section:
- `OPENROUTER_API_KEY` = your key
- `JWT_SECRET` = generate with `openssl rand -base64 32`
- `NODE_ENV` = `production`

### Step 4: Save and Deploy

Click "Save and deploy"

## Alternative: Use Amplify CLI

If the console still has issues, you can use Amplify CLI:

```bash
npm install -g @aws-amplify/cli
amplify init
amplify add hosting
amplify publish
```

But the manual configuration in the console should work!

