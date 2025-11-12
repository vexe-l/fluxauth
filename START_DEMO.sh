#!/bin/bash
# Quick demo starter script

echo "🚀 Starting FluxAuth Demo..."
echo ""

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo "❌ Error: frontend directory not found"
    echo "Please run this script from the project root"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd frontend
    npm install
    cd ..
fi

echo "✅ Starting frontend server..."
echo "🌐 Open http://localhost:5173 in your browser"
echo ""
echo "Press Ctrl+C to stop"
echo ""

cd frontend
npm run dev
