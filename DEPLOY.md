# Quick Deploy Guide

## 1. Push to GitHub (2 minutes)

```bash
# Create repo at https://github.com/new (name: fluxauth)
git remote add origin https://github.com/YOUR_USERNAME/fluxauth.git
git branch -M main
git push -u origin main
```

## 2. Deploy Frontend to Vercel (3 minutes)

1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Settings:
   - Root Directory: `frontend`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   VITE_API_KEY=dev_key_12345
   ```
5. Click Deploy

## 3. Deploy Backend to Railway (3 minutes)

1. Go to https://railway.app/new
2. Deploy from GitHub → Select your repo
3. Settings:
   - Root Directory: `backend`
   - Start Command: `npm start`
4. Environment Variables:
   ```
   NODE_ENV=production
   PORT=3001
   API_KEY=dev_key_12345
   GEMINI_API_KEY=AIzaSyCdRHq7GB5XANsd3FSbYoxRWYpP0xlfM2k
   DATABASE_PATH=./data/biaas.db
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```
5. Deploy

## 4. Update Frontend with Backend URL

1. Go back to Vercel
2. Settings → Environment Variables
3. Update `VITE_API_URL` with your Railway URL
4. Redeploy

## Done! 🎉

Your app is live at:
- Frontend: `https://fluxauth.vercel.app`
- Backend: `https://fluxauth.railway.app`

## Test It

1. Open your Vercel URL
2. Click "Try It Now"
3. Enroll and test
4. Share the link!
