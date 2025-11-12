#!/bin/bash

# FluxAuth Deployment Script - Runs on Port 8080 (won't conflict with existing site)
# Run this locally: bash deploy-to-server.sh

set -e  # Exit on error

echo "🚀 FluxAuth Deployment Script"
echo "================================"
echo "This will deploy FluxAuth on port 8080"
echo "Your existing website will NOT be affected"
echo ""

# Configuration
SERVER="91.99.184.74"
USER="root"
REMOTE_DIR="/var/www/fluxauth"
APP_NAME="fluxauth"

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
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ANOMALY_THRESHOLD=2.5
MIN_ENROLLMENT_SESSIONS=4
LOG_LEVEL=info
EOF
    
    echo "Creating data directory..."
    mkdir -p data
    
    echo "Starting backend with PM2..."
    pm2 delete fluxauth-backend || true
    pm2 start src/index.ts --name fluxauth-backend --interpreter tsx
    pm2 save
    
    echo "Installing serve for frontend..."
    npm install -g serve
    
    echo "Starting frontend on port 8080..."
    cd /var/www/fluxauth/frontend/dist
    pm2 delete fluxauth-frontend || true
    pm2 start "serve -s . -l 8080" --name fluxauth-frontend
    pm2 save
    
    echo "✅ Deployment complete!"
    echo ""
    echo "🌐 Your app is now live at:"
    echo "   http://91.99.184.74:8080"
    echo ""
    echo "📊 Backend API:"
    echo "   http://91.99.184.74:3001/api/health"
    echo ""
    echo "🔍 Check status:"
    echo "   pm2 status"
    echo ""
    echo "📝 View logs:"
    echo "   pm2 logs fluxauth-frontend"
    echo "   pm2 logs fluxauth-backend"
ENDSSH

echo ""
echo "🧹 Cleaning up local files..."
rm fluxauth-deploy.tar.gz

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🌐 Your app is live at: http://91.99.184.74:8080"
echo ""
echo "📝 Next steps:"
echo "1. Test: http://91.99.184.74:8080"
echo "2. Check backend: http://91.99.184.74:3001/api/health"
echo "3. View logs: ssh root@91.99.184.74 'pm2 logs'"
echo ""
echo "⚠️  Note: Your existing website is NOT affected!"
echo "    FluxAuth runs on port 8080"
echo "    Your site still runs on port 80"
echo ""
