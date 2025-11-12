# FluxAuth - Simple User Guide

## What is this?

FluxAuth is like Face ID, but for your typing. Instead of remembering passwords, it learns how YOU type and can tell if someone else is pretending to be you.

## How to try it (2 minutes):

### Step 1: Open the app
Go to: http://localhost:5173

### Step 2: Click "Try It Now"
You'll see a big orange button that says "🚀 Try It Now (2 min)"

### Step 3: Create your profile
1. Enter any username (like "john" or "test123")
2. Type 4 short sentences exactly as shown
3. Type naturally - don't try to be perfect!

### Step 4: Test it
1. After finishing all 4 prompts, click "Go to Test Page"
2. Type another sentence
3. See your "Trust Score" - higher = more like you!

### Step 5: Try the "Simulate Attack" button
This shows what happens when a bot or hacker tries to pretend to be you. The trust score will be LOW.

## What can you see?

### 📊 Live Monitor
Shows all active sessions in real-time with trust scores updating

### 🤖 Bot Detection  
Catches automated scripts and bots trying to break in

### ⚖️ Fairness Dashboard
Proves the system works fairly for everyone (no bias)

### 📋 Policy Rules
Create custom security rules like:
- "IF trust score < 40 THEN require extra verification"

## Common Questions

**Q: Does it record what I type?**
A: NO! It only records WHEN you press keys, not WHAT keys. Your actual text is never saved.

**Q: What if I type differently sometimes?**
A: That's normal! The system learns your natural variation. Coffee-fueled typing vs tired typing is OK.

**Q: Can I delete my data?**
A: Yes! It's all stored locally in a database file you can delete anytime.

**Q: Is this secure?**
A: Yes! All data is encrypted, and the system is open-source so anyone can verify it's safe.

## For Developers

Want to integrate this into your app? Check out:
- `README.md` - Full technical documentation
- `DEPLOYMENT.md` - How to deploy to production
- `frontend/src/sdk/browser.ts` - The SDK you can use

## Troubleshooting

**"Failed to start session"**
- Make sure the backend is running: `npm run dev`
- Check http://localhost:3001/api/health

**"User not enrolled"**
- You need to complete enrollment first (Step 3 above)
- Go to /enroll and type all 4 prompts

**Nothing happens when I type**
- Make sure you clicked "Start Typing" first
- Check browser console for errors (F12)

## Need Help?

Open an issue on GitHub or check the full README.md for technical details.

---

**Made with ❤️ to make the internet safer without annoying passwords**
