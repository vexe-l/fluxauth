# Deployment Guide

## GitHub Setup

### 1. Create GitHub Repository

```bash
# Go to https://github.com/new
# Repository name: fluxauth
# Description: Adaptive Behavioral Authentication System - AI-driven continuous authentication
# Public repository
# Don't initialize with README (we already have one)
```

### 2. Push to GitHub

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/fluxauth.git

# Push code
git branch -M main
git push -u origin main
```

## Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Frontend on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables:
     ```
     VITE_API_URL=https://your-backend.railway.app/api
     VITE_API_KEY=your_api_key_here
     ```

#### Backend on Railway

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repository
4. Configure:
   - Root Directory: `backend`
   - Start Command: `npm start`
   - Environment Variables:
     ```
     NODE_ENV=production
     PORT=3001
     API_KEY=your_secure_api_key_here
     CORS_ORIGIN=https://your-frontend.vercel.app
     ```

### Option 2: Docker Deployment (DigitalOcean/AWS/GCP)

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or deploy to cloud provider with Docker support
```

### Option 3: Render (Full Stack)

1. Go to [render.com](https://render.com)
2. Create Web Service for backend:
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
3. Create Static Site for frontend:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`

## Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=3001
API_KEY=your_secure_random_key_here
DATABASE_PATH=./data/fluxauth.db
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_API_KEY=your_api_key_here
```

## Post-Deployment Checklist

- [ ] Update CORS_ORIGIN to match frontend domain
- [ ] Rotate API keys from development defaults
- [ ] Enable HTTPS/TLS on both frontend and backend
- [ ] Set up monitoring (e.g., Sentry, LogRocket)
- [ ] Configure rate limiting appropriately
- [ ] Test all features in production
- [ ] Set up automated backups for database
- [ ] Configure CDN for static assets (optional)
- [ ] Set up CI/CD pipeline (GitHub Actions)

## GitHub Actions CI/CD (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: benc-uk/workflow-dispatch@v1
        with:
          workflow: Deploy Backend
          token: ${{ secrets.RAILWAY_TOKEN }}
```

## Monitoring & Observability

### Recommended Tools

1. **Sentry** - Error tracking
2. **LogRocket** - Session replay
3. **Datadog** - Infrastructure monitoring
4. **Grafana** - Metrics visualization

### Health Check Endpoint

```
GET /api/health
```

Returns system status and uptime.

## Scaling Considerations

1. **Database**: Migrate from SQLite to PostgreSQL for production
2. **Caching**: Add Redis for session data
3. **Load Balancing**: Use Nginx or cloud load balancer
4. **CDN**: CloudFlare or AWS CloudFront for static assets
5. **Horizontal Scaling**: Deploy multiple backend instances

## Security Hardening

1. Enable rate limiting (already configured)
2. Add request signing for API calls
3. Implement API key rotation
4. Set up Web Application Firewall (WAF)
5. Enable audit logging
6. Regular security audits
7. Dependency vulnerability scanning

## Support

For deployment issues, open a GitHub issue or contact support.
