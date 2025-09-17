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

  // Chi tiết hoạt động theo ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const where = { id: String(id) };

    // Nếu là sinh viên -> chỉ được xem hoạt động do lớp trưởng cùng lớp tạo
    try {
      const role = String(req.user?.role || '').toLowerCase();
      if (role === 'student' || role === 'sinh_vien') {
        const sv = await prisma.sinhVien.findUnique({ where: { nguoi_dung_id: req.user.sub }, select: { lop_id: true } });
        if (sv?.lop_id) {
          where.nguoi_tao = { is: { sinh_vien: { lop_id: sv.lop_id } } };
        }
      }
    } catch (_) {}

    const hd = await prisma.hoatDong.findFirst({
      where,
      include: {
        loai_hd: true,
        nguoi_tao: {
          select: { id: true, ten_dn: true, ho_ten: true, email: true, sinh_vien: { select: { lop_id: true } } }
        }
      }
    });

    if (!hd) {
      return sendResponse(res, ApiResponse.notFound('Không tìm thấy hoạt động'));
    }

    const data = {
      id: hd.id,
      ten_hd: hd.ten_hd,
      mo_ta: hd.mo_ta,
      diem_rl: Number(hd.diem_rl || 0),
      ngay_bd: hd.ngay_bd,
      ngay_kt: hd.ngay_kt,
      han_dk: hd.han_dk,
      dia_diem: hd.dia_diem,
      trang_thai: hd.trang_thai,
      loai: hd.loai_hd?.ten_loai_hd || null,
      nguoi_tao: {
        id: hd.nguoi_tao?.id,
        name: hd.nguoi_tao?.ho_ten || hd.nguoi_tao?.ten_dn,
        email: hd.nguoi_tao?.email
      }
    };

    sendResponse(res, ApiResponse.success(data, 'Chi tiết hoạt động'));
  } catch (error) {
    logError('Get activity detail error', error);
    sendResponse(res, ApiResponse.error('Không thể lấy chi tiết hoạt động'));
  }
});

// Trạng thái đăng ký hoạt động của sinh viên hiện tại
router.get('/:id/registration', auth, async (req, res) => {
  try {
    const { id } = req.params;
    // Chỉ áp dụng cho sinh viên
    const role = String(req.user?.role || '').toLowerCase();
    if (!(role === 'student' || role === 'sinh_vien')) {
      return sendResponse(res, ApiResponse.forbidden('Chỉ sinh viên mới xem trạng thái đăng ký'));
    }
    const sv = await prisma.sinhVien.findUnique({ where: { nguoi_dung_id: req.user.sub }, select: { id: true, lop_id: true } });
    if (!sv) {
      return sendResponse(res, ApiResponse.error('Không tìm thấy thông tin sinh viên'));
    }
    // Đảm bảo hoạt động thuộc lớp phù hợp như rule danh sách
    const hd = await prisma.hoatDong.findFirst({ where: { id: String(id), nguoi_tao: { sinh_vien: { lop_id: sv.lop_id } } }, select: { id: true } });
    if (!hd) {
      return sendResponse(res, ApiResponse.notFound('Không tìm thấy hoạt động'));
    }
    const reg = await prisma.dangKyHoatDong.findFirst({ where: { sv_id: sv.id, hd_id: String(id) } });
    const data = reg ? { status: reg.trang_thai_dk, registeredAt: reg.ngay_dang_ky } : { status: null };
    sendResponse(res, ApiResponse.success(data, 'Trạng thái đăng ký'));
  } catch (error) {
    logError('Get registration status error', error);
    sendResponse(res, ApiResponse.error('Không thể lấy trạng thái đăng ký'));
  }
});

// Đăng ký tham gia hoạt động (sinh viên)
router.post('/:id/register', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const role = String(req.user?.role || '').toLowerCase();
    if (!(role === 'student' || role === 'sinh_vien')) {
      return sendResponse(res, ApiResponse.forbidden('Chỉ sinh viên mới được đăng ký'));
    }
    const sv = await prisma.sinhVien.findUnique({ where: { nguoi_dung_id: req.user.sub }, select: { id: true, lop_id: true } });
    if (!sv) {
      return sendResponse(res, ApiResponse.error('Không tìm thấy thông tin sinh viên'));
    }
    // Đảm bảo hoạt động thuộc lớp hợp lệ
    const hd = await prisma.hoatDong.findFirst({ where: { id: String(id), nguoi_tao: { sinh_vien: { lop_id: sv.lop_id } } }, select: { id: true, han_dk: true, trang_thai: true } });
    if (!hd) {
      return sendResponse(res, ApiResponse.notFound('Không tìm thấy hoạt động'));
    }
    // Kiểm tra hạn đăng ký và trạng thái hoạt động
    const now = new Date();
    if (hd.han_dk && now > hd.han_dk) {
      return sendResponse(res, ApiResponse.error('Đã quá hạn đăng ký'));
    }
    if (!(hd.trang_thai === 'da_duyet' || hd.trang_thai === 'cho_duyet')) {
      return sendResponse(res, ApiResponse.error('Hoạt động không mở đăng ký'));
    }
    // Nếu đã có đăng ký thì trả về hiện trạng
    const existing = await prisma.dangKyHoatDong.findFirst({ where: { sv_id: sv.id, hd_id: String(id) } });
    if (existing) {
      return sendResponse(res, ApiResponse.success({ status: existing.trang_thai_dk, registeredAt: existing.ngay_dang_ky }, 'Đã đăng ký trước đó'));
    }
    // Tạo đăng ký mới với trạng thái chờ duyệt
    const created = await prisma.dangKyHoatDong.create({
      data: {
        sv_id: sv.id,
        hd_id: String(id),
        trang_thai_dk: 'cho_duyet',
        ly_do_dk: reason ? String(reason).slice(0, 1000) : null
      }
    });
    sendResponse(res, ApiResponse.success({ status: created.trang_thai_dk, registeredAt: created.ngay_dang_ky }, 'Đăng ký thành công'));
  } catch (error) {
    logError('Register activity error', error);
    sendResponse(res, ApiResponse.error('Không thể đăng ký hoạt động'));
  }
});
