# Getting Started

Get FluxAuth running in under 5 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Basic knowledge of JavaScript/TypeScript

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/fluxauth.git
cd fluxauth
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Or install separately
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure Environment

```bash
# Copy example environment file
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=3001
API_KEY=dev_key_12345
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_PATH=./data/biaas.db
```

### 4. Start the Application

```bash
# From root directory
npm run dev
```

This starts:
- Backend API on `http://localhost:3001`
- Frontend dashboard on `http://localhost:5173`

## Test the Demo

1. Open `http://localhost:5173` in your browser
2. Click **"Try It Now"**
3. Enter a user ID (e.g., "demo-user")
4. Complete the 4 enrollment prompts by typing naturally
5. Go to the **Test** page to authenticate
6. See your trust score and AI analysis!

## Next Steps

- [Integrate into your app](integration-guide.md)
- [Explore the API](api-reference.md)
- [Deploy to production](deployment.md)

## Quick Test with cURL

```bash
# Test the API directly
curl http://localhost:3001/api/health

# Expected response:
# {"status":"ok","timestamp":"..."}
```

## Common Issues

**Port already in use?**
```bash
# Change PORT in backend/.env
PORT=3002
```

**Database errors?**
```bash
# Delete and recreate database
rm -rf backend/data/*.db
npm run dev
```

**Frontend won't start?**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```
