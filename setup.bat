@echo off
echo ========================================
echo    DACN - Web Quan Ly Hoat Dong Ren Luyen
echo    Complete Project Setup Script
echo ========================================
echo.

echo [1/4] Checking prerequisites...
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js is installed

echo Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    echo Download from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo ✅ Docker is installed

echo Checking Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed. Please install Git first.
    echo Download from: https://git-scm.com/
    pause
    exit /b 1
)
echo ✅ Git is installed

echo.
echo [2/4] Setting up Backend...
call setup-backend.bat
if %errorlevel% neq 0 (
    echo ❌ Backend setup failed
    pause
    exit /b 1
)

echo.
echo [3/4] Setting up Frontend...
call setup-frontend.bat
if %errorlevel% neq 0 (
    echo ❌ Frontend setup failed
    pause
    exit /b 1
)

echo.
echo [4/4] Setup completed!
echo.
echo ========================================
echo    🎉 COMPLETE SETUP FINISHED! 🎉
echo ========================================
echo.
echo 🚀 To start the application:
echo.
echo 1. Start Backend (Terminal 1):
echo    cd backend
echo    npm start
echo.
echo 2. Start Frontend (Terminal 2):
echo    cd frontend
echo    npm start
echo.
echo 🌐 Application URLs:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:3001
echo.
echo 🔑 Login Credentials:
echo    Admin: admin / Admin@123
echo    Teacher: gv001 / Teacher@123
echo    Monitor: lt001 / Monitor@123
echo    Student: 2021003 / Student@123
echo.
echo 📚 Additional Commands:
echo    - View database: cd backend && npx prisma studio
echo    - Stop database: cd backend && docker-compose down
echo    - Restart database: cd backend && docker-compose restart
echo.
echo 📖 Documentation:
echo    - Backend API: http://localhost:3001/api/health
echo    - Database: PostgreSQL on port 5433
echo.
pause
