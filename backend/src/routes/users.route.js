const { Router } = require('express');
const controller = require('../controllers/users.controller');
const { auth, requireAdmin } = require('../middlewares/auth');
const { validate, updateUserSchema } = require('../utils/validation');

const router = Router();

// Public routes
router.get('/', controller.list);

// Protected routes - chỉ admin mới có quyền quản lý users
router.get('/:id', auth, requireAdmin, controller.getById);
router.put('/:id', auth, requireAdmin, validate(updateUserSchema), controller.update);
router.delete('/:id', auth, requireAdmin, controller.delete);
router.post('/', auth, requireAdmin, controller.create);

module.exports = router;