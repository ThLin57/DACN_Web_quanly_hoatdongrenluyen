// src/routes/activities.route.js
const { Router } = require('express');
const { auth, requireAdmin } = require('../middlewares/auth');
const { prisma } = require('../config/database');
const { ApiResponse, sendResponse } = require('../utils/response');
const { logError, logInfo } = require('../utils/logger');

const router = Router();

// Admin: cập nhật trạng thái hoạt động thành 'hoan_thanh' nếu đã kết thúc
router.put('/finalize-past', auth, requireAdmin, async (req, res) => {
  try {
    const now = new Date();

    // Chỉ cập nhật những hoạt động đã được duyệt và đã quá hạn nhưng chưa hoan_thanh
    const result = await prisma.hoatDong.updateMany({
      where: {
        ngaykt: { lt: now },
        trangthaihd: { in: ['duyet'] },
      },
      data: {
        trangthaihd: 'hoan_thanh',
        ngayduyet: now,
      },
    });

    logInfo('Finalize past activities', { adminId: req.user.sub, updatedCount: result.count });
    sendResponse(res, ApiResponse.success({ updated: result.count }, 'Đã cập nhật trạng thái các hoạt động quá hạn'));
  } catch (error) {
    logError('Finalize past activities error', error, { adminId: req.user?.sub });
    sendResponse(res, ApiResponse.error('Không thể cập nhật trạng thái hoạt động'));
  }
});

// Student: đăng ký tham gia hoạt động
router.post('/:id/register', auth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const activityId = String(req.params.id);

    // Lấy thông tin hoạt động
    const activity = await prisma.hoatDong.findUnique({ where: { id: activityId } });
    if (!activity) {
      return sendResponse(res, ApiResponse.notFound('Không tìm thấy hoạt động'));
    }

    const now = new Date();
    if (activity.trangthaihd !== 'duyet') {
      return sendResponse(res, ApiResponse.forbidden('Hoạt động chưa mở hoặc không hợp lệ'));
    }
    if (activity.handangky && now > activity.handangky) {
      return sendResponse(res, ApiResponse.forbidden('Đã quá hạn đăng ký'));
    }

    // Kiểm tra trùng đăng ký
    const exists = await prisma.dangKyHoatDong.findFirst({ where: { svid: userId, hdid: activityId } });
    if (exists) {
      return sendResponse(res, ApiResponse.validationError([{ field: 'activity', message: 'Bạn đã đăng ký hoạt động này' }]));
    }

    // Kiểm tra số lượng tối đa nếu được cấu hình
    if (activity.sltoida && activity.sltoida > 0) {
      const currentCount = await prisma.dangKyHoatDong.count({ where: { hdid: activityId } });
      if (currentCount >= activity.sltoida) {
        return sendResponse(res, ApiResponse.forbidden('Hoạt động đã đủ số lượng đăng ký'));
      }
    }

    // Tạo đăng ký
    const created = await prisma.dangKyHoatDong.create({
      data: {
        svid: userId,
        hdid: activityId,
        ngaydangky: new Date(),
      }
    });

    logInfo('Register activity', { userId, activityId, registrationId: created.id });
    sendResponse(res, ApiResponse.success(created, 'Đăng ký tham gia hoạt động thành công'));
  } catch (error) {
    logError('Register activity error', error, { userId: req.user?.sub, activityId: req.params?.id });
    sendResponse(res, ApiResponse.error('Không thể đăng ký hoạt động'));
  }
});

module.exports = router;
