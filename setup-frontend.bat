@echo off
echo ========================================
echo    DACN - Web Quan Ly Hoat Dong Ren Luyen
echo    Frontend Setup Script
echo ========================================
echo.

echo [1/3] Checking prerequisites...
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js is installed

echo Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)
echo ✅ npm is installed

echo.
echo [2/3] Installing frontend dependencies...
cd frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo ✅ Frontend dependencies installed
) else (
    echo ✅ Frontend dependencies already installed
)

echo.
echo [3/3] Frontend setup completed!
echo.
echo ========================================
echo    🎉 FRONTEND SETUP COMPLETED! 🎉
echo ========================================
echo.
echo 🚀 To start the frontend development server:
echo    cd frontend
echo    npm start
echo.
echo 🌐 Frontend will be available at:
echo    http://localhost:3000
echo.
echo 📝 Note: Make sure backend is running on port 3001
echo    before starting the frontend.
echo.
pause
