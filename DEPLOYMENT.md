# AWS Deployment Guide - Pandey Solutions

This guide will help you deploy the application to AWS using **AWS Amplify** (easiest and cheapest option).

## Prerequisites

- AWS Account
- Route53 domain: `leads.pandeylabs.com` (already configured)
- ACM certificate for the domain (already verified)
- Git repository (GitHub, GitLab, or Bitbucket)

## Option 1: AWS Amplify (Recommended - Easiest)

### Step 1: Push Code to Git Repository

1. Initialize git (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a repository on GitHub/GitLab/Bitbucket and push:
```bash
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2: Deploy via AWS Amplify Console

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"New app"** → **"Host web app"**
3. Connect your Git provider (GitHub/GitLab/Bitbucket)
4. Select your repository and branch (usually `main` or `master`)
5. Amplify will auto-detect Next.js and configure build settings
6. Review the build settings (should use the `amplify.yml` file)
7. Click **"Save and deploy"**

### Step 3: Configure Environment Variables

In Amplify Console → Your App → **Environment variables**, add:

```
OPENROUTER_API_KEY=your_openrouter_api_key_here
JWT_SECRET=your_strong_random_secret_here
NODE_ENV=production
```

**Important**: Generate a strong JWT_SECRET:
```bash
openssl rand -base64 32
```

### Step 4: Connect Custom Domain

1. In Amplify Console → Your App → **Domain management**
2. Click **"Add domain"**
3. Enter: `leads.pandeylabs.com`
4. Select your ACM certificate from the dropdown
5. Click **"Configure domain"**
6. Amplify will automatically configure Route53 records

### Step 5: Wait for Deployment

- First deployment takes ~5-10 minutes
- Subsequent deployments are automatic on git push
- You'll get a URL like: `https://leads.pandeylabs.com`

## Option 2: EC2 t3.micro (Cheapest - Free Tier Eligible)

If you prefer more control and want to use the free tier:

### Step 1: Launch EC2 Instance

1. Go to EC2 Console → Launch Instance
2. Choose:
   - **AMI**: Amazon Linux 2023
   - **Instance Type**: t3.micro (free tier eligible)
   - **Key Pair**: Create/download a new key pair
   - **Security Group**: Allow HTTP (80), HTTPS (443), SSH (22)
3. Launch instance

### Step 2: Connect and Setup

SSH into your instance:
```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

Run the setup script (see `ec2-setup.sh` below)

### Step 3: Configure Domain

1. In Route53, create an A record:
   - Name: `leads`
   - Type: A
   - Value: Your EC2 public IP
   - TTL: 300

2. Set up SSL with Let's Encrypt (see `ec2-setup.sh`)

## EC2 Setup Script

Create `ec2-setup.sh`:

```bash
#!/bin/bash

# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo yum install -y nginx

# Install Certbot for SSL
sudo yum install -y certbot python3-certbot-nginx

# Clone your repository (replace with your repo URL)
cd /home/ec2-user
git clone <your-repo-url> pandey-solutions
cd pandey-solutions

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
OPENROUTER_API_KEY=your_key_here
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "pandey-solutions" -- start
pm2 save
pm2 startup

# Configure Nginx
sudo tee /etc/nginx/conf.d/pandey-solutions.conf > /dev/null <<EOF
server {
    listen 80;
    server_name leads.pandeylabs.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Get SSL certificate
sudo certbot --nginx -d leads.pandeylabs.com --non-interactive --agree-tos --email your-email@example.com

echo "Setup complete! Your app should be available at https://leads.pandeylabs.com"
```

## Cost Comparison

### AWS Amplify
- **Free Tier**: 1000 build minutes/month, 15 GB storage, 5 GB served/month
- **After Free Tier**: ~$0.023/GB served, $0.01/build minute
- **Estimated Cost**: $0-5/month for low traffic

### EC2 t3.micro
- **Free Tier**: 750 hours/month for 12 months
- **After Free Tier**: ~$7.50/month
- **Additional**: Data transfer costs

## Recommendation

**Use AWS Amplify** - It's easier, handles SSL automatically, has built-in CI/CD, and is very cost-effective for low to medium traffic.

## Post-Deployment Checklist

- [ ] Environment variables set correctly
- [ ] Domain connected and SSL working
- [ ] Test registration/login flow
- [ ] Test strategy generation
- [ ] Verify data persistence
- [ ] Set up monitoring (optional: CloudWatch)

## Troubleshooting

### Build Fails
- Check environment variables are set
- Verify Node.js version (should be 18+)
- Check build logs in Amplify Console

### Domain Not Working
- Verify Route53 records are correct
- Check ACM certificate is attached
- Wait 5-10 minutes for DNS propagation

### App Crashes
- Check CloudWatch logs (Amplify) or PM2 logs (EC2)
- Verify all environment variables are set
- Check database directory permissions (EC2)

## Support

For issues, check:
- AWS Amplify Console logs
- CloudWatch logs
- Application error messages

