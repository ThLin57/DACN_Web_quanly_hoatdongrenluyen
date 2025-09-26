const { Router } = require('express');
const AdminController = require('../controllers/admin.controller');
const AdminRolesController = require('../controllers/admin.roles.controller');
const AdminActivityTypesController = require('../controllers/admin.activityTypes.controller');
const AdminRegistrationsController = require('../controllers/admin.registrations.controller');
const AdminReportsController = require('../controllers/admin.reports.controller');
const { auth, requireAdmin } = require('../middlewares/auth');

const router = Router();

// Tất cả routes admin đều yêu cầu auth và role admin
router.use(auth);
router.use(requireAdmin);

// Dashboard routes
router.get('/dashboard', AdminController.getDashboard);

// User management routes
router.get('/users', AdminController.getUsers);
router.post('/users', AdminController.createUser);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);
router.get('/users/export', AdminController.exportUsers);

// Roles management
router.get('/roles', AdminRolesController.list);
router.get('/roles/:id', AdminRolesController.getById);
router.post('/roles', AdminRolesController.create);
router.put('/roles/:id', AdminRolesController.update);
router.delete('/roles/:id', AdminRolesController.remove);

// Activity Types management
router.get('/activity-types', AdminActivityTypesController.list);
router.get('/activity-types/:id', AdminActivityTypesController.getById);
router.post('/activity-types', AdminActivityTypesController.create);
router.put('/activity-types/:id', AdminActivityTypesController.update);
router.delete('/activity-types/:id', AdminActivityTypesController.remove);

// Registrations management
router.get('/registrations', AdminRegistrationsController.list);
router.post('/registrations/:id/approve', AdminRegistrationsController.approve);
router.post('/registrations/:id/reject', AdminRegistrationsController.reject);
router.post('/registrations/bulk', AdminRegistrationsController.bulkUpdate);

// Reports & exports
router.get('/reports/overview', AdminReportsController.overview);
router.get('/reports/export/activities', AdminReportsController.exportActivities);
router.get('/reports/export/registrations', AdminReportsController.exportRegistrations);

module.exports = router;