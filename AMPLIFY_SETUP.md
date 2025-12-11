# Quick AWS Amplify Deployment Guide

## Step-by-Step Instructions

### 1. Push Your Code to Git

```bash
# If not already a git repo
git init
git add .
git commit -m "Ready for deployment"

# Push to GitHub/GitLab/Bitbucket
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

### 2. Deploy on AWS Amplify

1. **Go to AWS Amplify Console**
   - Visit: https://console.aws.amazon.com/amplify/
   - Click **"New app"** → **"Host web app"**

2. **Connect Repository**
   - Choose your Git provider (GitHub/GitLab/Bitbucket)
   - Authorize AWS Amplify to access your repositories
   - Select your repository: `Leads` (or whatever you named it)
   - Select branch: `main`

3. **Configure Build Settings**
   - Amplify should auto-detect Next.js
   - Verify it's using `amplify.yml` from the repo
   - If not, the build settings should be:
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
     ```

4. **Add Environment Variables**
   - Click **"Advanced settings"**
   - Under **"Environment variables"**, add:
     - `OPENROUTER_API_KEY` = your OpenRouter API key
     - `JWT_SECRET` = generate with: `openssl rand -base64 32`
     - `NODE_ENV` = `production`

5. **Save and Deploy**
   - Click **"Save and deploy"**
   - Wait 5-10 minutes for first deployment

### 3. Connect Your Domain

1. **In Amplify Console**
   - Go to your app → **"Domain management"** (left sidebar)
   - Click **"Add domain"**

2. **Enter Domain**
   - Domain: `leads.pandeylabs.com`
   - Click **"Configure domain"**

3. **Select Certificate**
   - Choose your ACM certificate from the dropdown
   - It should show as verified

4. **Configure DNS**
   - Amplify will show you DNS records to add
   - Since you're using Route53, Amplify can auto-configure:
     - Click **"Verify"** if it shows verification option
     - Or manually add the CNAME record shown

5. **Wait for Propagation**
   - DNS changes take 5-10 minutes
   - SSL certificate will be automatically provisioned

### 4. Verify Deployment

1. Visit: `https://leads.pandeylabs.com`
2. Test registration
3. Test login
4. Test strategy generation

### 5. Automatic Deployments

- Every push to `main` branch will automatically deploy
- You can see deployment status in Amplify Console
- Failed deployments won't affect the live site

## Troubleshooting

### Build Fails
- Check **"Build logs"** in Amplify Console
- Verify environment variables are set
- Ensure `amplify.yml` is in the root directory

### Domain Not Working
- Check Route53 records (should be auto-configured)
- Verify ACM certificate is attached
- Wait 10-15 minutes for DNS propagation

### App Errors
- Check **"App logs"** in Amplify Console
- Verify all environment variables are correct
- Check that `data/` directory permissions are correct (should be automatic)

## Cost Estimate

- **Free Tier**: 1000 build minutes/month, 15 GB storage, 5 GB served/month
- **Typical Cost**: $0-5/month for low-medium traffic
- **First 12 months**: Likely free tier eligible

## Next Steps

1. Set up monitoring (optional CloudWatch alarms)
2. Configure custom error pages (optional)
3. Set up backup strategy for `/data` directory (optional S3 backup)

