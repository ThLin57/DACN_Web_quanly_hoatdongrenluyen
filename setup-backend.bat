@echo off
echo ========================================
echo    DACN - Web Quan Ly Hoat Dong Ren Luyen
echo    Backend Setup Script
echo ========================================
echo.

echo [1/6] Checking prerequisites...
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
echo [2/6] Installing npm dependencies...
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
    echo ✅ Backend dependencies installed
) else (
    echo ✅ Backend dependencies already installed
)

echo.
echo [3/6] Setting up environment variables...
if not exist .env (
    echo Creating .env file...
    (
        echo # Database Configuration
        echo DATABASE_URL="postgresql://admin:abc@localhost:5433/Web_QuanLyDiemRenLuyen"
        echo.
        echo # JWT Configuration
        echo JWT_SECRET="your-super-secret-jwt-key-here-change-in-production"
        echo JWT_EXPIRES_IN="7d"
        echo.
        echo # Server Configuration
        echo PORT=3001
        echo NODE_ENV=development
    ) > .env
    echo ✅ .env file created
) else (
    echo ✅ .env file already exists
)

echo.
echo [4/6] Starting PostgreSQL database...
echo Stopping any existing containers...
docker-compose down >nul 2>&1

echo Starting PostgreSQL container...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ Failed to start PostgreSQL container
    pause
    exit /b 1
)

echo Waiting for PostgreSQL to be ready...
timeout /t 10 /nobreak >nul
echo ✅ PostgreSQL container started

echo.
echo [5/6] Running database migrations...
echo Running Prisma migrations...
npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo ❌ Failed to run migrations
    pause
    exit /b 1
)
echo ✅ Database migrations completed

echo.
echo [6/6] Seeding initial data...
echo Running seed script...
npm run seed
if %errorlevel% neq 0 (
    echo ❌ Failed to seed data
    pause
    exit /b 1
)
echo ✅ Initial data seeded

echo.
echo ========================================
echo    🎉 SETUP COMPLETED SUCCESSFULLY! 🎉
echo ========================================
echo.
echo 📊 Database Information:
echo    Host: localhost
echo    Port: 5433
echo    Database: Web_QuanLyDiemRenLuyen
echo    Username: admin
echo    Password: abc
echo.
echo 🔑 Login Credentials:
echo    Admin: admin / Admin@123
echo    Teacher: gv001 / Teacher@123
echo    Monitor: lt001 / Monitor@123
echo    Student: 2021003 / Student@123
echo.
echo 🚀 To start the backend server:
echo    cd backend
echo    npm start
echo.
echo 🌐 Backend will be available at:
echo    http://localhost:3001
echo.
echo 📚 Additional commands:
echo    - View database: npx prisma studio
echo    - Stop database: docker-compose down
echo    - Restart database: docker-compose restart
echo.
pause
