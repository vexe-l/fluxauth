# FluxAuth - AI-Driven Behavioral Authentication

**Solves the password crisis with continuous behavioral authentication powered by AI.**

## What It Does

FluxAuth verifies users throughout their entire session based on how they type and move their mouse - not just passwords. If someone steals your password, FluxAuth will still catch them because they don't type like you.

## 🤖 AI Features

1. **Gemini AI** - Analyzes threats in natural language, explains anomalies to users
2. **Isolation Forest** - ML algorithm for unsupervised anomaly detection
3. **Adaptive Scoring** - Learns each user's patterns and adapts over time
4. **Z-Score Analysis** - Statistical AI for explainable decisions

## 🚀 Quick Start

```bash
# Install
npm install

# Run (starts both frontend + backend)
npm run dev
```

Open http://localhost:5173

## 📖 How to Use

1. **Click "Try It Now"** on homepage
2. **Enroll**: Type 4 prompts to create your profile
3. **Test**: Authenticate and see your trust score
4. **Explore**: Check out Live Monitor, Bot Detection, Fairness Dashboard, Policy Rules

## 🎯 Key Features

- **Live Monitor** - Real-time session tracking with trust scores
- **Bot Detection** - Catches automated attacks and scripts
- **Fairness Dashboard** - Proves no bias across demographics (SDG 16)
- **Policy Engine** - Create custom rules: `IF trustScore < 40 THEN REQUIRE_OTP`
- **Edge SDK** - Offline scoring for privacy

## 🏗️ Architecture

```
Frontend (React) → Backend API (Node.js) → SQLite DB
                ↓
        Gemini AI Analysis
```

## 🔧 Configuration

Edit `backend/.env`:
```env
PORT=3001
API_KEY=dev_key_12345
GEMINI_API_KEY=your_key_here  # For AI features
DATABASE_PATH=./data/biaas.db
```

## 📊 What's Real vs Demo

**100% Real & Working:**
- ✅ Enrollment flow
- ✅ Authentication & scoring
- ✅ Bot detection algorithm
- ✅ AI analysis (Gemini)
- ✅ Database storage

**Demo Data (until you use it):**
- ⚠️ Live Monitor (shows demo until real sessions exist)
- ⚠️ Transparency metrics (mock data)
- ⚠️ Policy engine (UI only, doesn't execute)

## 🚀 Deploy to GitHub

```bash
# Create repo at github.com/new
git remote add origin https://github.com/YOUR_USERNAME/fluxauth.git
git branch -M main
git push -u origin main
```

## 🌍 UN SDG Alignment

- **SDG 9**: Open-source, energy-efficient, accessible infrastructure
- **SDG 16**: Transparent, fair, accountable authentication

## 📝 Tech Stack

- **Frontend**: React + TypeScript + Chakra UI
- **Backend**: Node.js + Express + SQLite
- **AI**: Gemini Pro, Isolation Forest, Z-Score Analysis
- **Testing**: Vitest

## 🎬 Demo Script (5 min)

1. Show homepage → Click "Try It Now"
2. Enroll with username "demo"
3. Complete 4 typing prompts
4. Go to test page → Authenticate → See AI analysis
5. Click "Simulate Attack" → See low trust score
6. Show Live Monitor, Bot Detection, Fairness Dashboard
7. Generate AI threat report on Dashboard

## 🔒 Security

- No raw text captured (only timing patterns)
- API key authentication
- Rate limiting enabled
- HTTPS required for production

## 📦 What's Included

```
fluxauth/
├── frontend/          # React app
├── backend/           # Node.js API
│   ├── src/
│   │   ├── features/  # ML algorithms
│   │   ├── services/  # Gemini AI
│   │   └── routes/    # API endpoints
└── README.md          # This file
```

## 🐛 Troubleshooting

**Backend won't start?**
```bash
cd backend && npm install
```

**Frontend shows errors?**
```bash
cd frontend && npm install
```

**Database errors?**
```bash
rm -rf backend/data/*.db
# Restart backend - it will recreate
```

## 📚 API Endpoints

- `POST /api/session/start` - Start capturing
- `POST /api/session/score` - Get trust score
- `POST /api/enroll` - Enroll user
- `GET /api/sessions/recent` - Get session history
- `GET /api/ai/threat-report` - AI analysis

## 🎯 Next Steps

1. Test the enrollment → authentication flow
2. Push to GitHub
3. Deploy (Vercel for frontend, Railway for backend)
4. Record demo video
5. Submit!

## 📄 License

MIT

---

**Built to make authentication secure, fair, and transparent.**
