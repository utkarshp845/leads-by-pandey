# Quick Deployment Guide - leads.pandeylabs.com

Your repository: `https://github.com/utkarshp845/leads-by-pandey.git`

## 🚀 Deploy in 5 Minutes

### Step 1: Push Your Code (if not already done)

```bash
git add .
git commit -m "Ready for AWS deployment"
git push origin main
```

### Step 2: Deploy on AWS Amplify

1. **Go to AWS Amplify Console**
   - Visit: https://console.aws.amazon.com/amplify/
   - Sign in with your AWS account

2. **Create New App**
   - Click **"New app"** → **"Host web app"**
   - Choose **"GitHub"** (or your Git provider)
   - Authorize AWS Amplify to access your GitHub account
   - Select repository: **`utkarshp845/leads-by-pandey`**
   - Select branch: **`main`** (or `master`)

3. **Configure Build Settings** ⚠️ IMPORTANT
   - Click **"Edit"** next to build settings (don't rely on auto-detection)
   - **Pre-build commands:** `npm ci`
   - **Build commands:** `npm run build`
   - **Output directory:** `.next`
   - **Base directory:** (leave empty)
   - Or paste the YAML from `amplify.yml` if there's a YAML editor option
   - Click **"Next"**

4. **Add Environment Variables** ⚠️ IMPORTANT
   - Click **"Advanced settings"**
   - Under **"Environment variables"**, click **"Add environment variable"**
   - Add these three variables:
   
     ```
     OPENROUTER_API_KEY = [your OpenRouter API key]
     JWT_SECRET = [generate with: openssl rand -base64 32]
     NODE_ENV = production
     ```
   
   - **Generate JWT_SECRET now:**
     ```bash
     openssl rand -base64 32
     ```
     Copy the output and use it as your JWT_SECRET value

5. **Review and Deploy**
   - Review the settings
   - Click **"Save and deploy"**
   - Wait 5-10 minutes for the first build

### Step 3: Connect Your Domain (You already have Route53 & ACM!)

1. **After deployment completes:**
   - Go to your app in Amplify Console
   - Click **"Domain management"** in the left sidebar
   - Click **"Add domain"**

2. **Enter Domain:**
   - Domain: `leads.pandeylabs.com`
   - Click **"Configure domain"**

3. **Select Certificate:**
   - Choose your ACM certificate from the dropdown
   - ⚠️ **Important**: Certificate must be in **us-east-1** region for CloudFront
   - If not showing, you may need to request a new certificate in us-east-1
   - It should show as verified ✅

4. **DNS Configuration:**
   - Amplify will show DNS records (usually a CNAME)
   - **Option A**: If you see **"Auto-configure Route53"** button, click it
   - **Option B**: Manually add the CNAME record shown to your Route53 hosted zone
   - Update the existing Route53 entry if needed

5. **Wait for SSL:**
   - SSL certificate will be automatically provisioned
   - Takes 5-10 minutes
   - Status will show: "Provisioning" → "Available"

### Step 4: Verify

1. Visit: `https://leads.pandeylabs.com`
2. Test:
   - ✅ Registration
   - ✅ Login
   - ✅ Create a prospect
   - ✅ Generate a strategy

## 📋 Environment Variables Checklist

Make sure these are set in Amplify Console:

- [ ] `OPENROUTER_API_KEY` - Your OpenRouter API key
- [ ] `JWT_SECRET` - Strong random string (32+ characters)
- [ ] `NODE_ENV` - Set to `production`

## 🔧 Troubleshooting

### Build Fails?
- Check **"Build logs"** in Amplify Console
- Verify all environment variables are set
- Ensure `amplify.yml` exists in repo root

### Domain Not Working?
- Check Route53 records (should auto-configure)
- Verify ACM certificate is selected
- Wait 10-15 minutes for DNS propagation

### App Crashes?
- Check **"App logs"** in Amplify Console
- Verify environment variables are correct
- Check that data directory is writable

## 💰 Cost Estimate

- **Free Tier**: 1000 build minutes/month, 15 GB storage, 5 GB served/month
- **Typical Cost**: $0-5/month for low-medium traffic
- **First 12 months**: Likely stays in free tier

## 🎉 You're Done!

Your app will automatically deploy on every `git push` to the main branch.

## 📞 Need Help?

- Check Amplify Console → **"App logs"** for errors
- Check Amplify Console → **"Build logs"** for build issues
- AWS Amplify Docs: https://docs.aws.amazon.com/amplify/

