const { Router } = require('express');
const qrAttendanceController = require('../controllers/qr-attendance.controller');
const { auth, requireTeacher, authorizeRoles } = require('../middlewares/auth');

const router = Router();

// All routes require authentication
router.use(auth);

// QR attendance session management (Teachers/Monitors only)
router.post('/sessions/:hdId', authorizeRoles('GIANG_VIEN', 'LOP_TRUONG', 'ADMIN'), qrAttendanceController.createAttendanceSession);
router.get('/sessions/:hdId', qrAttendanceController.getAttendanceSessions);
router.put('/sessions/:sessionId/status', authorizeRoles('GIANG_VIEN', 'LOP_TRUONG', 'ADMIN'), qrAttendanceController.updateSessionStatus);
router.get('/sessions/:sessionId/attendances', qrAttendanceController.getSessionAttendances);

// QR scanning (Students and others)
router.post('/scan', qrAttendanceController.processQRScan);

// Student attendance history
router.get('/my-attendances', qrAttendanceController.getMyAttendances);

// Point calculation management
router.post('/calculate-points/:hdId', authorizeRoles('GIANG_VIEN', 'LOP_TRUONG', 'ADMIN'), qrAttendanceController.calculatePoints);
router.get('/calculation-status/:hdId', qrAttendanceController.getCalculationStatus);

module.exports = router;