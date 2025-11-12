@echo off
REM Quick demo starter script for Windows

echo 🚀 Starting FluxAuth Demo...
echo.

REM Check if frontend directory exists
if not exist "frontend" (
    echo ❌ Error: frontend directory not found
    echo Please run this script from the project root
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "frontend\node_modules" (
    echo 📦 Installing dependencies...
    cd frontend
    call npm install
    cd ..
)

echo ✅ Starting frontend server...
echo 🌐 Open http://localhost:5173 in your browser
echo.
echo Press Ctrl+C to stop
echo.

cd frontend
call npm run dev

pause

