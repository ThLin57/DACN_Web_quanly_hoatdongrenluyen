const express = require('express');
const router = express.Router();
const ClassController = require('../controllers/class.controller');
const { auth, authorizeRoles } = require('../middlewares/auth');

// Test endpoint WITHOUT auth
router.get('/test-public', (req, res) => {
  res.json({ success: true, message: 'Class routes working without auth' });
});

// All routes require authentication and LOP_TRUONG permission
router.use(auth);
router.use(authorizeRoles('LOP_TRUONG', 'ADMIN'));

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Class routes working', user: req.user?.role });
});

// Get students in class
router.get('/students', ClassController.getClassStudents);

// Get pending registrations for approval
router.get('/registrations', ClassController.getPendingRegistrations);

// Approve registration
router.put('/registrations/:registrationId/approve', ClassController.approveRegistration);

// Reject registration
router.put('/registrations/:registrationId/reject', ClassController.rejectRegistration);

// Get class reports
router.get('/reports', ClassController.getClassReports);

module.exports = router;