# Deployment Guide

Deploy FluxAuth to production.

## Deployment Options

1. **Self-Hosted** - Full control, your infrastructure
2. **Cloud Platforms** - Easy deployment, managed services
3. **Docker** - Containerized deployment
4. **Kubernetes** - Enterprise-scale orchestration

## Prerequisites

- Node.js 18+ runtime
- PostgreSQL or SQLite database
- SSL certificate (for HTTPS)
- Domain name (optional but recommended)

---

## Option 1: Self-Hosted (VPS)

Deploy on your own server (DigitalOcean, AWS EC2, etc.)

### 1. Prepare Server

```bash
# SSH into your server
ssh user@your-server.com

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx
```

### 2. Clone and Setup

```bash
# Clone repository
git clone https://github.com/yourusername/fluxauth.git
cd fluxauth

# Install dependencies
cd backend && npm install
cd ../frontend && npm install && npm run build
```

### 3. Configure Environment

```bash
# Create production environment file
nano backend/.env
```

```env
NODE_ENV=production
PORT=3001
API_KEY=your-secure-random-api-key-here
GEMINI_API_KEY=your-gemini-api-key
DATABASE_PATH=./data/biaas.db
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Start Backend with PM2

```bash
cd backend
pm2 start npm --name "fluxauth-api" -- start
pm2 save
pm2 startup
```

### 5. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/fluxauth
```

```nginx
# API Server
server {
    listen 80;
    server_name api.your-domain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Frontend Dashboard
server {
    listen 80;
    server_name dashboard.your-domain.com;
    root /path/to/fluxauth/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/fluxauth /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Setup SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com -d dashboard.your-domain.com
```

### 7. Setup Firewall

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

---

## Option 2: Docker Deployment

### 1. Build Docker Images

```bash
# Build backend
cd backend
docker build -t fluxauth-api .

# Build frontend
cd ../frontend
docker build -t fluxauth-dashboard .
```

### 2. Run with Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    image: fluxauth-api
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - API_KEY=${API_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    volumes:
      - ./data:/app/data
    restart: unless-stopped
  
  dashboard:
    image: fluxauth-dashboard
    ports:
      - "80:80"
    depends_on:
      - api
    restart: unless-stopped
```

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Option 3: Cloud Platforms

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy backend
cd backend
railway init
railway up

# Deploy frontend
cd ../frontend
railway init
railway up
```

### Render

1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Create **Web Service** for backend:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Environment: Add your env vars
4. Create **Static Site** for frontend:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`

### Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

### Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create fluxauth-api

# Deploy backend
cd backend
git push heroku main

# Set environment variables
heroku config:set API_KEY=your-key
heroku config:set GEMINI_API_KEY=your-key
```

---

## Option 4: Kubernetes

### 1. Create Kubernetes Manifests

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fluxauth-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fluxauth-api
  template:
    metadata:
      labels:
        app: fluxauth-api
    spec:
      containers:
      - name: api
        image: your-registry/fluxauth-api:latest
        ports:
        - containerPort: 3001
        env:
        - name: API_KEY
          valueFrom:
            secretKeyRef:
              name: fluxauth-secrets
              key: api-key
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: fluxauth-secrets
              key: gemini-key
---
apiVersion: v1
kind: Service
metadata:
  name: fluxauth-api
spec:
  selector:
    app: fluxauth-api
  ports:
  - port: 80
    targetPort: 3001
  type: LoadBalancer
```

### 2. Deploy to Kubernetes

```bash
# Create secrets
kubectl create secret generic fluxauth-secrets \
  --from-literal=api-key=your-api-key \
  --from-literal=gemini-key=your-gemini-key

# Deploy
kubectl apply -f k8s/deployment.yaml

# Check status
kubectl get pods
kubectl get services
```

---

## Database Options

### SQLite (Default)

Good for:
- Development
- Small deployments (<1000 users)
- Single-server setups

```env
DATABASE_PATH=./data/biaas.db
```

### PostgreSQL (Recommended for Production)

Good for:
- Production environments
- Multiple servers
- High traffic

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE fluxauth;
CREATE USER fluxauth_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE fluxauth TO fluxauth_user;
```

```env
DATABASE_URL=postgresql://fluxauth_user:secure_password@localhost:5432/fluxauth
```

---

## Monitoring & Logging

### PM2 Monitoring

```bash
# View logs
pm2 logs fluxauth-api

# Monitor resources
pm2 monit

# View status
pm2 status
```

### Application Logging

```javascript
// backend/src/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Health Checks

```javascript
// Add to your backend
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});
```

---

## Backup Strategy

### Database Backups

```bash
# Create backup script
nano /usr/local/bin/backup-fluxauth.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/fluxauth"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup SQLite database
cp /path/to/fluxauth/backend/data/biaas.db $BACKUP_DIR/biaas_$DATE.db

# Keep only last 7 days
find $BACKUP_DIR -name "biaas_*.db" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x /usr/local/bin/backup-fluxauth.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /usr/local/bin/backup-fluxauth.sh
```

---

## Security Checklist

- [ ] Use HTTPS (SSL certificate)
- [ ] Strong API keys (32+ characters, random)
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Keep dependencies updated
- [ ] Use environment variables (never commit secrets)
- [ ] Enable firewall
- [ ] Regular backups
- [ ] Monitor logs for suspicious activity
- [ ] Implement API key rotation
- [ ] Use secure database passwords
- [ ] Enable database encryption at rest

---

## Performance Optimization

### Caching with Redis

```bash
# Install Redis
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: maxmemory 256mb
# Set: maxmemory-policy allkeys-lru

sudo systemctl restart redis
```

```javascript
// Add to backend
const redis = require('redis');
const client = redis.createClient();

// Cache user profiles
async function getUserProfile(userId) {
  const cached = await client.get(`profile:${userId}`);
  if (cached) return JSON.parse(cached);
  
  const profile = await db.getUserProfile(userId);
  await client.setex(`profile:${userId}`, 3600, JSON.stringify(profile));
  return profile;
}
```

### Load Balancing

```nginx
# Nginx load balancer
upstream fluxauth_backend {
    least_conn;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;
    location / {
        proxy_pass http://fluxauth_backend;
    }
}
```

---

## Troubleshooting

### API Not Responding

```bash
# Check if process is running
pm2 status

# Check logs
pm2 logs fluxauth-api --lines 100

# Restart
pm2 restart fluxauth-api
```

### Database Errors

```bash
# Check database file permissions
ls -la backend/data/

# Fix permissions
chmod 644 backend/data/biaas.db
```

### High Memory Usage

```bash
# Check memory
free -h

# Restart with memory limit
pm2 restart fluxauth-api --max-memory-restart 500M
```

---

## Scaling

### Horizontal Scaling

1. Deploy multiple API instances
2. Use load balancer (Nginx, HAProxy)
3. Share database (PostgreSQL)
4. Use Redis for session storage

### Vertical Scaling

1. Increase server resources (CPU, RAM)
2. Optimize database queries
3. Enable caching
4. Use CDN for frontend

---

## Next Steps

- [Security & Privacy](security-privacy.md) - Security best practices
- [Configuration](configuration.md) - Advanced configuration
- [Troubleshooting](troubleshooting.md) - Common issues
