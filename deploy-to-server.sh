#!/bin/bash

# FluxAuth Deployment Script
# Run this locally: bash deploy-to-server.sh

set -e  # Exit on error

echo "🚀 FluxAuth Deployment Script"
echo "================================"

# Configuration
SERVER="91.99.184.74"
USER="root"
REMOTE_DIR="/var/www/fluxauth"
APP_NAME="fluxauth"

echo ""
echo "📦 Step 1: Building frontend locally..."
cd frontend
npm run build
cd ..

echo ""
echo "📤 Step 2: Connecting to server..."
echo "You'll be prompted for password: ranga123"

# Create deployment package
echo ""
echo "📦 Step 3: Creating deployment package..."
tar -czf fluxauth-deploy.tar.gz \
    backend/ \
    frontend/dist/ \
    package.json \
    README.md \
    --exclude=node_modules \
    --exclude=backend/data/*.db \
    --exclude=.git

echo ""
echo "📤 Step 4: Uploading to server..."
scp fluxauth-deploy.tar.gz $USER@$SERVER:/tmp/

echo ""
echo "🔧 Step 5: Setting up on server..."
ssh $USER@$SERVER << 'ENDSSH'
    set -e
    
    echo "Creating directory..."
    mkdir -p /var/www/fluxauth
    cd /var/www/fluxauth
    
    echo "Extracting files..."
    tar -xzf /tmp/fluxauth-deploy.tar.gz
    rm /tmp/fluxauth-deploy.tar.gz
    
    echo "Installing Node.js if needed..."
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
    
    echo "Installing PM2 if needed..."
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi
    
    echo "Installing backend dependencies..."
    cd backend
    npm install --production
    
    echo "Creating .env file..."
    cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
API_KEY=dev_key_12345
GEMINI_API_KEY=AIzaSyCdRHq7GB5XANsd3FSbYoxRWYpP0xlfM2k
DATABASE_PATH=./data/fluxauth.db
CORS_ORIGIN=https://frontend-qlphxvxcd-anirudh-website.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ANOMALY_THRESHOLD=2.5
MIN_ENROLLMENT_SESSIONS=4
LOG_LEVEL=info
EOF
    
    echo "Creating data directory..."
    mkdir -p data
    
    echo "Building backend..."
    npm run build || echo "Build step skipped"
    
    echo "Starting backend with PM2..."
    pm2 delete fluxauth-backend || true
    pm2 start src/index.ts --name fluxauth-backend --interpreter tsx
    pm2 save
    
    echo "Installing Nginx if needed..."
    if ! command -v nginx &> /dev/null; then
        apt-get update
        apt-get install -y nginx
    fi
    
    echo "Configuring Nginx for frontend..."
    cat > /etc/nginx/sites-available/fluxauth << 'NGINXCONF'
server {
    listen 80;
    server_name _;
    
    # Frontend
    location / {
        root /var/www/fluxauth/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXCONF
    
    ln -sf /etc/nginx/sites-available/fluxauth /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    echo "Restarting Nginx..."
    nginx -t && systemctl restart nginx
    
    echo "✅ Deployment complete!"
    echo ""
    echo "🌐 Your app is now live at:"
    echo "   http://91.99.184.74"
    echo ""
    echo "📊 Backend API:"
    echo "   http://91.99.184.74/api/health"
    echo ""
    echo "🔍 Check logs:"
    echo "   pm2 logs fluxauth-backend"
    echo ""
    echo "🔄 Restart backend:"
    echo "   pm2 restart fluxauth-backend"
ENDSSH

echo ""
echo "🧹 Cleaning up local files..."
rm fluxauth-deploy.tar.gz

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🌐 Your app is live at: http://91.99.184.74"
echo ""
echo "📝 Next steps:"
echo "1. Test: http://91.99.184.74"
echo "2. Check backend: http://91.99.184.74/api/health"
echo "3. View logs: ssh root@91.99.184.74 'pm2 logs fluxauth-backend'"
echo ""
