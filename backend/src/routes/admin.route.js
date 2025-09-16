const { Router } = require('express');
const AdminController = require('../controllers/admin.controller');
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

module.exports = router;