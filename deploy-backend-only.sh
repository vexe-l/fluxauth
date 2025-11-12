#!/bin/bash

# Deploy ONLY Backend to Your Server
# Frontend stays on Vercel
# Run: bash deploy-backend-only.sh

set -e

echo "🚀 Deploying Backend to 91.99.184.74"
echo "====================================="
echo ""

SERVER="91.99.184.74"
USER="root"

echo "📦 Creating backend package..."
tar -czf backend-deploy.tar.gz \
    backend/ \
    --exclude=node_modules \
    --exclude=backend/data/*.db

echo "📤 Uploading to server..."
scp backend-deploy.tar.gz $USER@$SERVER:/tmp/

echo "🔧 Setting up backend..."
ssh $USER@$SERVER << 'ENDSSH'
    set -e
    
    echo "Creating directory..."
    mkdir -p /var/www/fluxauth-backend
    cd /var/www/fluxauth-backend
    
    echo "Extracting..."
    tar -xzf /tmp/backend-deploy.tar.gz
    rm /tmp/backend-deploy.tar.gz
    
    echo "Installing Node.js if needed..."
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
    
    echo "Installing PM2..."
    npm install -g pm2 || true
    
    echo "Installing dependencies..."
    cd backend
    npm install --production
    
    echo "Creating .env..."
    cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
API_KEY=dev_key_12345
GEMINI_API_KEY=AIzaSyCdRHq7GB5XANsd3FSbYoxRWYpP0xlfM2k
DATABASE_PATH=./data/fluxauth.db
CORS_ORIGIN=https://frontend-qlphxvxcd-anirudh-website.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    
    mkdir -p data
    
    echo "Starting backend..."
    pm2 delete fluxauth-backend || true
    pm2 start src/index.ts --name fluxauth-backend --interpreter tsx
    pm2 save
    pm2 startup || true
    
    echo "✅ Backend deployed!"
    echo ""
    echo "Backend running at: http://91.99.184.74:3001"
    echo "Health check: http://91.99.184.74:3001/api/health"
ENDSSH

rm backend-deploy.tar.gz

echo ""
echo "✅ BACKEND DEPLOYED!"
echo ""
echo "🔗 Backend URL: http://91.99.184.74:3001"
echo ""
echo "📝 Now update Vercel:"
echo "   1. Go to: https://vercel.com/anirudh-website/frontend/settings/environment-variables"
echo "   2. Add: VITE_API_URL = http://91.99.184.74:3001/api"
echo "   3. Redeploy: vercel --prod"
echo ""
echo "🧪 Test backend:"
echo "   curl http://91.99.184.74:3001/api/health"
echo ""
