// src/routes/activities.route.js
const { Router } = require('express');
const { auth, requireAdmin } = require('../middlewares/auth');
const { prisma } = require('../config/database');
const { ApiResponse, sendResponse } = require('../utils/response');
const { logError, logInfo } = require('../utils/logger');

const router = Router();

// Admin: cập nhật trạng thái hoạt động thành 'ket_thuc' nếu đã kết thúc
router.put('/finalize-past', auth, requireAdmin, async (req, res) => {
  try {
    const now = new Date();

    // Chỉ cập nhật những hoạt động đã được duyệt và đã quá hạn nhưng chưa kết thúc
    const result = await prisma.hoatDong.updateMany({
      where: {
        ngay_kt: { lt: now },
        trang_thai: { in: ['da_duyet'] },
      },
      data: {
        trang_thai: 'ket_thuc',
        ngay_cap_nhat: now,
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
    if (activity.trang_thai !== 'da_duyet') {
      return sendResponse(res, ApiResponse.forbidden('Hoạt động chưa mở hoặc không hợp lệ'));
    }
    if (activity.han_dk && now > activity.han_dk) {
      return sendResponse(res, ApiResponse.forbidden('Đã quá hạn đăng ký'));
    }

    // Kiểm tra trùng đăng ký
    const exists = await prisma.dangKyHoatDong.findFirst({ where: { sv_id: userId, hd_id: activityId } });
    if (exists) {
      return sendResponse(res, ApiResponse.validationError([{ field: 'Thông báo ', message: 'Bạn đã đăng ký hoạt động này' }]));
    }

    // Kiểm tra số lượng tối đa nếu được cấu hình
    if (activity.sl_toi_da && activity.sl_toi_da > 0) {
      const currentCount = await prisma.dangKyHoatDong.count({ where: { hd_id: activityId } });
      if (currentCount >= activity.sl_toi_da) {
        return sendResponse(res, ApiResponse.forbidden('Hoạt động đã đủ số lượng đăng ký'));
      }
    }

    // Tạo đăng ký
    const created = await prisma.dangKyHoatDong.create({
      data: {
        sv_id: userId,
        hd_id: activityId,
        ngay_dang_ky: new Date(),
      }
    });

    logInfo('Register activity', { userId, activityId, registrationId: created.id });
    sendResponse(res, ApiResponse.success(created, 'Đăng ký tham gia hoạt động thành công'));
  } catch (error) {
    logError('Register activity error', error, { userId: req.user?.sub, activityId: req.params?.id });
    sendResponse(res, ApiResponse.error('Không thể đăng ký hoạt động'));
  }
});

// Chi tiết hoạt động
router.get('/:id', auth, async (req, res) => {
  try {
    const id = String(req.params.id);
    const hd = await prisma.hoatDong.findUnique({
      where: { id },
      include: {
        loaiHoatDong: true,
        nguoiTao: { select: { id: true, ho_ten: true } },
        dangKyHoatDongs: { select: { id: true, nguoi_duyet_id: true, ly_do_tu_choi: true, sv_id: true } },
      }
    });
    if (!hd) return sendResponse(res, ApiResponse.notFound('Không tìm thấy hoạt động'));

    const tong_dangky = hd.dangKyHoatDongs.length;
    const da_duyet = hd.dangKyHoatDongs.filter(dk => dk.nguoi_duyet_id && !dk.ly_do_tu_choi).length;
    const currentReg = hd.dangKyHoatDongs.find(dk => dk.sv_id === req.user.sub) || null;
    let registrationStatus = 'chua_dang_ky';
    if (currentReg) {
      if (currentReg.ly_do_tu_choi) registrationStatus = 'tu_choi';
      else if (currentReg.nguoi_duyet_id) registrationStatus = 'da_duyet';
      else registrationStatus = 'cho_duyet';
    }
    const now = new Date();
    const deadline = hd.han_dk || hd.ngay_kt;
    const reachedCapacity = (hd.sl_toi_da && hd.sl_toi_da > 0) ? tong_dangky >= hd.sl_toi_da : false;
    const isOpen = hd.trang_thai === 'da_duyet' && deadline ? now <= deadline : hd.trang_thai === 'da_duyet';
    const canRegister = isOpen && !reachedCapacity && registrationStatus === 'chua_dang_ky';

    const detail = {
      id: hd.id,
      name: hd.ten_hd,
      description: hd.mo_ta,
      startDate: hd.ngay_bd,
      endDate: hd.ngay_kt,
      deadline: hd.han_dk,
      location: hd.dia_diem,
      capacity: hd.sl_toi_da || 0,
      points: Number(hd.diem_rl || 0),
      type: hd.loaiHoatDong?.ten_loai_hd || null,
      typeColor: hd.loaiHoatDong?.mau_sac || null,
      organizer: hd.don_vi_to_chuc || null,
      requirement: hd.yeu_cau_tham_gia || null,
      creatorName: hd.nguoiTao?.ho_ten || null,
      tong_dangky,
      da_duyet,
      qr: hd.qr || null,
      registrationStatus,
      canRegister,
    };

    sendResponse(res, ApiResponse.success(detail, 'Chi tiết hoạt động'));
  } catch (error) {
    logError('Get activity detail error', error, { id: req.params?.id });
    sendResponse(res, ApiResponse.error('Không thể lấy chi tiết hoạt động'));
  }
});

module.exports = router;
