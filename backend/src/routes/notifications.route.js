const { Router } = require('express');
const notificationsController = require('../controllers/notifications.controller');
const { auth: authMiddleware } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');

const router = Router();

// Tất cả routes đều cần authentication
router.use(authMiddleware);

// GET /notifications - Lấy danh sách thông báo của user
router.get('/', notificationsController.getNotifications);

// GET /notifications/unread-count - Lấy số lượng thông báo chưa đọc
router.get('/unread-count', notificationsController.getUnreadCount);

// GET /notifications/:notificationId - Lấy chi tiết 1 thông báo
router.get('/:notificationId', notificationsController.getNotificationById);

// PUT /notifications/:notificationId/read - Đánh dấu thông báo đã đọc
router.put('/:notificationId/read', notificationsController.markAsRead);

// PUT /notifications/mark-all-read - Đánh dấu tất cả đã đọc
router.put('/mark-all-read', notificationsController.markAllAsRead);

// DELETE /notifications/:notificationId - Xóa thông báo
router.delete('/:notificationId', notificationsController.deleteNotification);

// POST /notifications - Tạo thông báo mới (LOP_TRUONG, GIANG_VIEN, ADMIN)
router.post('/', requirePermission('notifications.create'), notificationsController.createNotification);

// PATCH /notifications/:notificationId/read - Đánh dấu đã đọc 1 thông báo
router.patch('/:notificationId/read', notificationsController.markAsRead);

module.exports = router;