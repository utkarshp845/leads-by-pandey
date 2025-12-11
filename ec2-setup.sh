#!/bin/bash

# Pandey Solutions - EC2 Setup Script
# Run this script on a fresh Amazon Linux 2023 EC2 instance

set -e

echo "🚀 Starting Pandey Solutions deployment..."

# Update system
echo "📦 Updating system packages..."
sudo yum update -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify Node.js installation
node --version
npm --version

# Install PM2 for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo yum install -y nginx

# Install Certbot for SSL
echo "📦 Installing Certbot..."
sudo yum install -y certbot python3-certbot-nginx

# Create application directory
echo "📁 Creating application directory..."
APP_DIR="/opt/pandey-solutions"
sudo mkdir -p $APP_DIR
sudo chown ec2-user:ec2-user $APP_DIR
cd $APP_DIR

# Note: You'll need to clone your repository here
# Or upload files via SCP/SFTP
echo "⚠️  IMPORTANT: You need to upload your application files to $APP_DIR"
echo "   You can use: git clone <your-repo-url> ."
echo "   Or upload via SCP: scp -r . ec2-user@your-ip:$APP_DIR"

read -p "Press Enter after you've uploaded/cloned the application files..."

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Create .env file
echo "⚙️  Creating environment file..."
if [ ! -f .env ]; then
    read -p "Enter your OPENROUTER_API_KEY: " OPENROUTER_KEY
    JWT_SECRET=$(openssl rand -base64 32)
    
    cat > .env << EOF
OPENROUTER_API_KEY=$OPENROUTER_KEY
JWT_SECRET=$JWT_SECRET
NODE_ENV=production
PORT=3000
EOF
    echo "✅ Environment file created"
else
    echo "⚠️  .env file already exists, skipping..."
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Create data directory
echo "📁 Creating data directory..."
mkdir -p data/prospects
chmod 755 data
chmod 755 data/prospects

# Start with PM2
echo "🚀 Starting application with PM2..."
pm2 start npm --name "pandey-solutions" -- start
pm2 save
pm2 startup

# Configure Nginx
echo "⚙️  Configuring Nginx..."
sudo tee /etc/nginx/conf.d/pandey-solutions.conf > /dev/null <<'EOF'
server {
    listen 80;
    server_name leads.pandeylabs.com;

    # Increase timeouts for AI API calls
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Start and enable Nginx
echo "🚀 Starting Nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Get SSL certificate
echo "🔒 Setting up SSL certificate..."
read -p "Enter your email for Let's Encrypt: " EMAIL
sudo certbot --nginx -d leads.pandeylabs.com --non-interactive --agree-tos --email $EMAIL --redirect

# Setup auto-renewal for SSL
echo "⏰ Setting up SSL auto-renewal..."
sudo systemctl enable certbot-renew.timer

# Configure firewall (if needed)
echo "🔥 Configuring firewall..."
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update Route53 A record to point to this server's IP: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "2. Wait 5-10 minutes for DNS propagation"
echo "3. Visit https://leads.pandeylabs.com"
echo ""
echo "📊 Useful commands:"
echo "  - View logs: pm2 logs pandey-solutions"
echo "  - Restart app: pm2 restart pandey-solutions"
echo "  - View status: pm2 status"
echo "  - View Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo ""

