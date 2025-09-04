// src/routes/index.js
const { Router } = require('express');
const health = require('./health.route');
const users = require('./users.route');
const auth = require('./auth.route');
const { auth: authMiddleware, requireAdmin } = require('../middlewares/auth');
const dashboard = require('./dashboard.route');
const activities = require('./activities.route');

const router = Router();

// Health check route
router.use('/health', health);

// Authentication routes
router.use('/auth', auth);

// Users routes (public và protected)
router.use('/users', users);

// Dashboard routes
router.use('/dashboard', dashboard);

// Activities routes
router.use('/activities', activities);

// Admin route example (chỉ admin mới truy cập được)
router.use('/admin', authMiddleware, requireAdmin, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Admin access granted',
    user: req.user 
  });
});

module.exports = router;