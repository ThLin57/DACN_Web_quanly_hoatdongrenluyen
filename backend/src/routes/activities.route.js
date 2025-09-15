// src/routes/activities.route.js
const { Router } = require('express');
const { auth, requireAdmin } = require('../middlewares/auth');
const { prisma } = require('../config/database');
const { ApiResponse, sendResponse } = require('../utils/response');
const { logError, logInfo } = require('../utils/logger');

const router = Router();

// Danh sách hoạt động với tìm kiếm và lọc cơ bản
// Sinh viên chỉ thấy hoạt động do Lớp trưởng cùng lớp tạo
router.get('/', auth, async (req, res) => {
  try {
    const { q, type, status, from, to } = req.query;
    const now = new Date();

    const where = {};
    if (q) {
      where.ten_hd = { contains: String(q), mode: 'insensitive' };
    }
    // Lọc theo loại hoạt động (tên)
    if (type) {
      where.loai_hd = { is: { ten_loai_hd: String(type) } };
    }
    // Lọc theo trạng thái thời gian cơ bản
    if (status === 'open') {
      where.trang_thai = 'da_duyet';
      where.han_dk = { gte: now };
    } else if (status === 'soon') {
      where.trang_thai = 'da_duyet';
      where.ngay_bd = { gte: now };
    } else if (status === 'closed') {
      where.ngay_kt = { lt: now };
    }
    // Khoảng thời gian theo ngày bắt đầu
    if (from || to) {
      where.ngay_bd = Object.assign({}, where.ngay_bd, {
        gte: from ? new Date(String(from)) : undefined,
        lte: to ? new Date(String(to)) : undefined,
      });
    }

    // Nếu là sinh viên -> thêm điều kiện cùng lớp với người tạo (lớp trưởng)
    try {
      const role = String(req.user?.role || '').toLowerCase();
      if (role === 'student' || role === 'sinh_vien') {
        const sv = await prisma.sinhVien.findUnique({ where: { nguoi_dung_id: req.user.sub }, select: { lop_id: true } });
        if (sv?.lop_id) {
          where.nguoi_tao = { is: { sinh_vien: { lop_id: sv.lop_id } } };
        }
      }
    } catch (_) {}

    const list = await prisma.hoatDong.findMany({
      where,
      orderBy: { ngay_bd: 'asc' },
      include: { loai_hd: true },
      take: 50
    });

    const data = list.map((hd) => ({
      id: hd.id,
      ten_hd: hd.ten_hd,
      loai: hd.loai_hd?.ten_loai_hd || null,
      diem_rl: Number(hd.diem_rl || 0),
      ngay_bd: hd.ngay_bd,
      trang_thai: hd.trang_thai,
      dia_diem: hd.dia_diem || null,
    }));

    sendResponse(res, ApiResponse.success(data, 'Danh sách hoạt động'));
  } catch (error) {
    logError('List activities error', error);
    sendResponse(res, ApiResponse.error('Không thể lấy danh sách hoạt động'));
  }
});

module.exports = router;
