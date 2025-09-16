# Multi-stage build: build frontend, then run backend serving frontend build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy and install backend deps (for prisma generate)
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci

# Copy and install frontend deps + build
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm install
COPY frontend ./frontend
RUN cd frontend && npm run build

# Final runtime image
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy backend
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev
COPY backend ./backend

# Copy built frontend into backend path expected by server
COPY --from=builder /app/frontend/build ./frontend/build

# Prisma generate at runtime layer
WORKDIR /app/backend
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Start backend (serves /frontend/build)
CMD ["node", "src/index.js"]
