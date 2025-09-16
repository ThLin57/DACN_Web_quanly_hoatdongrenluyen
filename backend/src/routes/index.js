// src/routes/index.js
const { Router } = require('express');
const health = require('./health.route');
const users = require('./users.route');
const auth = require('./auth.route');
const admin = require('./admin.route');
const { auth: authMiddleware, requireAdmin, authorizeRoles, requireTeacher } = require('../middlewares/auth');
const dashboard = require('./dashboard.route');
const activities = require('./activities.route');
const qrAttendance = require('./qr-attendance.route');

const router = Router();

// Health check route
router.use('/health', health);

// Authentication routes
router.use('/auth', auth);

// Users routes (public và protected)
router.use('/users', users);

// Admin routes - comprehensive management
router.use('/admin', admin);

// Dashboard routes (đã đăng nhập mới truy cập)
router.use('/dashboard', authMiddleware, dashboard);

// Activities routes (đã đăng nhập)
router.use('/activities', authMiddleware, activities);

// QR Attendance routes
router.use('/attendance', qrAttendance);

// Ví dụ các route dành cho giảng viên/lớp trưởng (chưa hiện thực chi tiết)
router.get('/teacher-only/ping', authMiddleware, requireTeacher, (req, res) => {
  res.json({ success: true, role: req.user.role, message: 'Teacher or Admin access' });
});

router.get('/monitor-only/ping', authMiddleware, authorizeRoles('LOP_TRUONG', 'ADMIN'), (req, res) => {
  res.json({ success: true, role: req.user.role, message: 'Monitor or Admin access' });
});

module.exports = router;