const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

const config = require('./config/app');
const { connectDB, disconnectDB } = require('./config/database');
const corsMw = require('./middlewares/cors');
const notFound = require('./middlewares/notFound');
const error = require('./middlewares/error');
const routes = require('./routes');
const { logInfo, logError } = require('./utils/logger');

const app = express();

// CORS middleware - phải được đặt trước tất cả routes
app.use(corsMw);

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  ...config.rateLimit,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.ip}:${req.user?.sub || 'anon'}`,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logInfo(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// API routes
app.use('/api', routes);

// Serve static frontend (no build) for demo UI
app.use(express.static('frontend'));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(require('path').join(process.cwd(), 'frontend', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(error);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logInfo('SIGTERM received, shutting down gracefully');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logInfo('SIGINT received, shutting down gracefully');
  await disconnectDB();
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start listening
    app.listen(config.port, () => {
      logInfo(`🚀 Server started successfully`, {
        port: config.port,
        environment: config.nodeEnv,
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    logError('Failed to start server', error);
    process.exit(1);
  }
};

startServer();