#!/bin/bash

echo "========================================"
echo "   DACN - Web Quan Ly Hoat Dong Ren Luyen"
echo "   Frontend Setup Script"
echo "========================================"
echo

echo "[1/3] Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js is installed"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi
echo "✅ npm is installed"

echo
echo "[2/3] Installing frontend dependencies..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi

echo
echo "[3/3] Frontend setup completed!"
echo
echo "========================================"
echo "   🎉 FRONTEND SETUP COMPLETED! 🎉"
echo "========================================"
echo
echo "🚀 To start the frontend development server:"
echo "   cd frontend"
echo "   npm start"
echo
echo "🌐 Frontend will be available at:"
echo "   http://localhost:3000"
echo
echo "📝 Note: Make sure backend is running on port 3001"
echo "   before starting the frontend."
echo
