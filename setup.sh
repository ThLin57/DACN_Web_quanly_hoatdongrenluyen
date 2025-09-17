#!/bin/bash

echo "========================================"
echo "   DACN - Web Quan Ly Hoat Dong Ren Luyen"
echo "   Complete Project Setup Script"
echo "========================================"
echo

echo "[1/4] Checking prerequisites..."

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
echo "[2/4] Setting up Backend..."
chmod +x setup-backend.sh
./setup-backend.sh
if [ $? -ne 0 ]; then
    echo "❌ Backend setup failed"
    exit 1
fi

echo
echo "[3/4] Setting up Frontend..."
chmod +x setup-frontend.sh
./setup-frontend.sh
if [ $? -ne 0 ]; then
    echo "❌ Frontend setup failed"
    exit 1
fi

echo
echo "[4/4] Setup completed!"
echo
echo "========================================"
echo "   🎉 COMPLETE SETUP FINISHED! 🎉"
echo "========================================"
echo
echo "🚀 To start the application:"
echo
echo "1. Start Backend (Terminal 1):"
echo "   cd backend"
echo "   npm start"
echo
echo "2. Start Frontend (Terminal 2):"
echo "   cd frontend"
echo "   npm start"
echo
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo
echo "🔑 Login Credentials:"
echo "   Admin: admin / Admin@123"
echo "   Teacher: gv001 / Teacher@123"
echo "   Monitor: lt001 / Monitor@123"
echo "   Student: 2021003 / Student@123"
echo
echo "📚 Additional Commands:"
echo "   - View database: cd backend && npx prisma studio"
echo "   - Stop database: cd backend && docker-compose down"
echo "   - Restart database: cd backend && docker-compose restart"
echo
echo "📖 Documentation:"
echo "   - Backend API: http://localhost:3001/api/health"
echo "   - Database: PostgreSQL on port 5433"
echo
