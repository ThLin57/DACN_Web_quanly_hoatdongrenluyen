#!/bin/bash

echo "========================================"
echo "   DACN - Web Quan Ly Hoat Dong Ren Luyen"
echo "   Backend Setup Script"
echo "========================================"
echo

echo "[1/6] Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js is installed"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Download from: https://www.docker.com/"
    exit 1
fi
echo "✅ Docker is installed"

# Check Git
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    echo "Download from: https://git-scm.com/"
    exit 1
fi
echo "✅ Git is installed"

echo
echo "[2/6] Installing npm dependencies..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
    echo "✅ Backend dependencies installed"
else
    echo "✅ Backend dependencies already installed"
fi

echo
echo "[3/6] Setting up environment variables..."
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Database Configuration
DATABASE_URL="postgresql://admin:abc@localhost:5433/Web_QuanLyDiemRenLuyen"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here-change-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV=development
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo
echo "[4/6] Starting PostgreSQL database..."
echo "Stopping any existing containers..."
docker-compose down > /dev/null 2>&1

echo "Starting PostgreSQL container..."
docker-compose up -d
if [ $? -ne 0 ]; then
    echo "❌ Failed to start PostgreSQL container"
    exit 1
fi

echo "Waiting for PostgreSQL to be ready..."
sleep 10
echo "✅ PostgreSQL container started"

echo
echo "[5/6] Running database migrations..."
echo "Running Prisma migrations..."
npx prisma migrate dev --name init
if [ $? -ne 0 ]; then
    echo "❌ Failed to run migrations"
    exit 1
fi
echo "✅ Database migrations completed"

echo
echo "[6/6] Seeding initial data..."
echo "Running seed script..."
npm run seed
if [ $? -ne 0 ]; then
    echo "❌ Failed to seed data"
    exit 1
fi
echo "✅ Initial data seeded"

echo
echo "========================================"
echo "   🎉 SETUP COMPLETED SUCCESSFULLY! 🎉"
echo "========================================"
echo
echo "📊 Database Information:"
echo "   Host: localhost"
echo "   Port: 5433"
echo "   Database: Web_QuanLyDiemRenLuyen"
echo "   Username: admin"
echo "   Password: abc"
echo
echo "🔑 Login Credentials:"
echo "   Admin: admin / Admin@123"
echo "   Teacher: gv001 / Teacher@123"
echo "   Monitor: lt001 / Monitor@123"
echo "   Student: 2021003 / Student@123"
echo
echo "🚀 To start the backend server:"
echo "   cd backend"
echo "   npm start"
echo
echo "🌐 Backend will be available at:"
echo "   http://localhost:3001"
echo
echo "📚 Additional commands:"
echo "   - View database: npx prisma studio"
echo "   - Stop database: docker-compose down"
echo "   - Restart database: docker-compose restart"
echo
