# 🎯 Demo Guide for Judges

## Quick Start (2 minutes)

### Option 1: Frontend Only (Recommended - Works Offline)
```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not done)
npm install

# Start the demo
npm run dev
```

**Open:** http://localhost:5173

✅ **No backend needed** - Everything works in offline mode!

---

### Option 2: Full Stack (Backend + Frontend)
```bash
# From root directory
npm install
npm run dev
```

**Frontend:** http://localhost:5173  
**Backend:** http://localhost:3001

---

## 🎬 Demo Script (5-7 minutes)

### 1. **Homepage Introduction** (30 seconds)
- Show the landing page with glassmorphism design
- Highlight: "Continuous Behavioral Authentication"
- Point out: "No passwords needed - just your typing pattern"

### 2. **Enrollment Flow** (2 minutes)
**Navigate to:** Click "Try It" button → Enroll Page

**Steps:**
1. Enter a user ID (e.g., "judge-demo")
2. Click "Start Typing"
3. Type the first prompt naturally: *"The quick brown fox jumps over the lazy dog."*
4. **Show the live typing visualization** - Point out the real-time chart updating
5. Click "Complete Prompt"
6. Repeat for all 4 prompts (takes ~30 seconds each)
7. **After 4/4:** Show the success message

**Key Points to Mention:**
- "Notice how it captures your unique typing rhythm in real-time"
- "Each person types differently - flight time, hold time, rhythm"
- "This creates a behavioral fingerprint that can't be stolen"

### 3. **Authentication Test** (1.5 minutes)
**Navigate to:** Click "Go to Test Page" or navigate to `/test`

**Steps:**
1. Enter the same user ID
2. Click "Start Typing"
3. Type the test prompt naturally
4. Click "Score Session"
5. **Show the results:**
   - Trust Score (should be high, e.g., 85-95)
   - "This is you - your typing matches your profile"
   - Show the explainability panel with reasons

**Then show an attack:**
1. Click "Simulate Attack" button
2. Show the low trust score (e.g., 20-40)
3. Point out: "Different typing pattern detected - this would be blocked"

### 4. **Live Monitor Dashboard** (1 minute)
**Navigate to:** Click "Monitor" in navigation

**Show:**
- Real-time session tracking
- Trust scores for different users
- Anomaly detection badges
- "This is what admins see - continuous monitoring"

### 5. **Bot Detection** (1 minute)
**Navigate to:** Click "Detection" in navigation

**Show:**
- Bot detection metrics
- Explain: "We detect 5 patterns of bot behavior"
- Show the detection algorithm

### 6. **Fairness & Transparency** (1 minute)
**Navigate to:** Click "Fairness" in navigation

**Show:**
- Transparency dashboard
- Explain: "SDG 16 - No demographic bias"
- Show API metrics and fairness metrics

### 7. **Policy Engine** (30 seconds)
**Navigate to:** Click "Policy" in navigation

**Show:**
- Custom rules: `IF trustScore < 40 THEN REQUIRE_OTP`
- Explain: "Businesses can create custom security policies"

---

## 🎯 Key Talking Points

### Problem Statement
- "81% of data breaches involve stolen credentials"
- "Passwords can be phished - but typing patterns can't be stolen"
- "Traditional MFA only protects login - we protect the entire session"

### Technical Highlights
- **AI-Powered:** Gemini AI analyzes threats in natural language
- **Real-time:** Continuous monitoring, not just one-time auth
- **Privacy-First:** Works offline, no raw keystrokes stored
- **Explainable:** Shows exactly why a score is high/low

### Differentiation
- "Not just keystroke dynamics - we analyze rhythm, patterns, and behavior"
- "Works without backend - privacy-first architecture"
- "Adaptive - learns your patterns over time"

---

## 🚨 Troubleshooting

### If typing visualization doesn't show:
- Make sure you clicked "Start Typing" first
- Type in the textarea (not just anywhere on page)
- Check browser console for errors

### If "Failed to start session" appears:
- This is now fixed - it works in offline mode
- If you see it, just continue - it will work anyway

### If backend errors:
- **You don't need the backend!** Frontend works standalone
- Just run `cd frontend && npm run dev`

---

## 📱 Demo Tips

1. **Practice the enrollment flow once** before showing judges
2. **Type naturally** - don't try to type perfectly, show real patterns
3. **Have a backup plan:** If something breaks, show the other pages (Monitor, Dashboard, etc.)
4. **Emphasize the real-time visualization** - it's the most impressive part
5. **Show the attack simulation** - it demonstrates the security value

---

## 🎨 What Makes This Demo Impressive

✅ **Real-time typing visualization** - judges can see it working live  
✅ **No backend needed** - works completely offline  
✅ **Beautiful UI** - glassmorphism design stands out  
✅ **Complete flow** - enrollment → authentication → monitoring  
✅ **AI integration** - Gemini AI analysis (if API key set)  
✅ **Explainable** - shows why decisions are made  

---

## 📞 Quick Commands Reference

```bash
# Start frontend only (recommended)
cd frontend && npm run dev

# Start full stack
npm run dev

# Build for production
npm run build

# Check if it's running
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

---

## 🎯 One-Liner Pitch

**"FluxAuth continuously authenticates users by analyzing their unique typing patterns - even if attackers steal passwords, they can't replicate how you type."**

Good luck! 🚀

