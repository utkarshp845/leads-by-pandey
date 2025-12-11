# Connect Domain: leads.pandeylabs.com

## Prerequisites ✅
- Route53 entry already configured
- ACM certificate already verified for leads.pandeylabs.com
- AWS Amplify app created and deployed

## Step-by-Step: Connect Your Domain

### Step 1: Go to Domain Management
1. In AWS Amplify Console, select your app
2. Click **"Domain management"** in the left sidebar
3. Click **"Add domain"**

### Step 2: Enter Your Domain
1. Enter: `leads.pandeylabs.com`
2. Click **"Configure domain"**

### Step 3: Select Your ACM Certificate
1. In the certificate dropdown, select your ACM certificate for `leads.pandeylabs.com`
2. It should show as **"Verified"** ✅
3. Click **"Next"**

### Step 4: Configure DNS Records

Amplify will show you DNS records. You have two options:

#### Option A: Auto-Configure (Recommended if Amplify has Route53 access)
- If you see a **"Auto-configure Route53"** or **"Verify"** button, click it
- Amplify will automatically update your Route53 records

#### Option B: Manual Configuration
If auto-configure isn't available, you'll see records like:
```
Type: CNAME
Name: _xxxxx.leads.pandeylabs.com
Value: xxxxx.cloudfront.net
```

1. Go to Route53 Console
2. Find your hosted zone for `pandeylabs.com`
3. Update or create the CNAME record shown by Amplify
4. Wait 5-10 minutes for DNS propagation

### Step 5: Wait for SSL Provisioning
- Amplify will automatically provision SSL using your ACM certificate
- This takes 5-10 minutes
- You'll see status: "Provisioning" → "Available"

### Step 6: Verify
1. Visit: `https://leads.pandeylabs.com`
2. You should see your app!
3. SSL should be working (green lock icon)

## Troubleshooting

### Domain Not Resolving?
- Check Route53 records match what Amplify shows
- Wait 10-15 minutes for DNS propagation
- Use `dig leads.pandeylabs.com` or `nslookup leads.pandeylabs.com` to verify

### SSL Not Working?
- Verify ACM certificate is selected in Amplify
- Check certificate is in `us-east-1` region (required for CloudFront)
- Wait for provisioning to complete

### Certificate Not Showing in Dropdown?
- Make sure certificate is in **us-east-1** region
- Certificate must be for `leads.pandeylabs.com` or `*.pandeylabs.com`
- Certificate must be in "Issued" status

## Quick Checklist

- [ ] Amplify app is deployed successfully
- [ ] Domain added in Amplify Console
- [ ] ACM certificate selected (us-east-1 region)
- [ ] DNS records configured (auto or manual)
- [ ] SSL provisioning complete
- [ ] Site accessible at https://leads.pandeylabs.com

