// src/routes/activities.route.js
const { Router } = require('express');
const { Prisma } = require('@prisma/client');
const { auth, requireAdmin } = require('../middlewares/auth');
const { prisma } = require('../config/database');
const { ApiResponse, sendResponse } = require('../utils/response');
const { logError, logInfo } = require('../utils/logger');

const router = Router();

// Helper: role checks
function isTeacherOrAdmin(role) { const r = String(role || '').toUpperCase(); return r === 'GIANG_VIEN' || r === 'ADMIN'; }
function isCreatorOrElevated(userId, activity) { return activity?.nguoi_tao_id === userId || isTeacherOrAdmin(activity?._callerRole); }

// Danh sách hoạt động với tìm kiếm và lọc nâng cao (U13)
// Sinh viên chỉ thấy hoạt động do Lớp trưởng cùng lớp tạo
router.get('/', auth, async (req, res) => {
  try {
    const { q, type, status, from, to, loaiId, trangThai, sort = 'ngay_bd', order = 'asc', page = 1, limit = 20 } = req.query;
    const now = new Date();

    const where = {};
    if (q) {
      where.ten_hd = { contains: String(q), mode: 'insensitive' };
    }
    // Lọc theo loại hoạt động (tên hoặc id)
    if (type) {
      where.loai_hd = { is: { ten_loai_hd: String(type) } };
    }
    if (loaiId) {
      where.loai_hd_id = String(loaiId);
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
    // Lọc theo trạng thái chính xác
    if (trangThai) {
      where.trang_thai = String(trangThai);
    }
    // Khoảng thời gian theo ngày bắt đầu
    if (from || to) {
      where.ngay_bd = Object.assign({}, where.ngay_bd, {
        gte: from ? new Date(String(from)) : undefined,
        lte: to ? new Date(String(to)) : undefined,
      });
    }

    // Nếu là sinh viên -> hiển thị hoạt động đã được duyệt và đã kết thúc
    try {
      const role = String(req.user?.role || '').toLowerCase();
      if (role === 'student' || role === 'sinh_vien') {
        // Hiển thị hoạt động đã duyệt và đã kết thúc nếu user không chỉ định trangThai khác
        if (!trangThai) {
          where.trang_thai = { in: ['da_duyet', 'ket_thuc'] };
        }
      }
    } catch (_) {}

    const take = Math.min(100, parseInt(limit) || 20);
    const skip = (Math.max(1, parseInt(page) || 1) - 1) * take;
    const orderBy = { [sort]: order === 'desc' ? 'desc' : 'asc' };

    const [list, total] = await Promise.all([
      prisma.hoatDong.findMany({
      where,
        orderBy,
      include: { loai_hd: true },
        skip,
        take
      }),
      prisma.hoatDong.count({ where })
    ]);

    // Check registration status for current user if they are a student
    let registrations = [];
    try {
      if (req.user?.role?.toLowerCase() === 'sinh_vien' || req.user?.role?.toLowerCase() === 'student') {
        const sv = await prisma.sinhVien.findUnique({ where: { nguoi_dung_id: req.user.sub } });
        if (sv) {
          const activityIds = list.map(hd => hd.id);
          registrations = await prisma.dangKyHoatDong.findMany({
            where: { sv_id: sv.id, hd_id: { in: activityIds } },
            select: { hd_id: true, trang_thai_dk: true }
          });
        }
      }
    } catch (_) {}

    const registrationMap = new Map(registrations.map(r => [r.hd_id, r.trang_thai_dk]));

    const data = list.map((hd) => ({
      id: hd.id,
      ten_hd: hd.ten_hd,
      mo_ta: hd.mo_ta,
      loai: hd.loai_hd?.ten_loai_hd || null,
      diem_rl: Number(hd.diem_rl || 0),
      ngay_bd: hd.ngay_bd,
      ngay_kt: hd.ngay_kt,
      han_dk: hd.han_dk,
      trang_thai: hd.trang_thai,
      dia_diem: hd.dia_diem || null,
      don_vi_to_chuc: hd.don_vi_to_chuc || null,
      sl_toi_da: hd.sl_toi_da,
      is_registered: registrationMap.has(hd.id),
      registration_status: registrationMap.get(hd.id) || null
    }));

    sendResponse(res, 200, ApiResponse.success({ items: data, total, page: parseInt(page), limit: take }, 'Danh sách hoạt động'));
  } catch (error) {
    logError('List activities error', error);
    sendResponse(res, 500, ApiResponse.error('Không thể lấy danh sách hoạt động'));
  }
});

// Lấy chi tiết một hoạt động
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const hd = await prisma.hoatDong.findUnique({ where: { id }, include: { loai_hd: true } });
    if (!hd) return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy hoạt động'));

    // Kiểm tra trạng thái đăng ký của user hiện tại (nếu là sinh viên)
    let is_registered = false;
    let registration_status = null;
    try {
      const role = String(req.user?.role || '').toLowerCase();
      if (role === 'sinh_vien' || role === 'student' || role === 'lop_truong') {
        const sv = await prisma.sinhVien.findUnique({ where: { nguoi_dung_id: req.user.sub } });
        if (sv) {
          const reg = await prisma.dangKyHoatDong.findUnique({ where: { sv_id_hd_id: { sv_id: sv.id, hd_id: id } } });
          if (reg) { is_registered = true; registration_status = reg.trang_thai_dk; }
        }
      }
    } catch (_) {}

    const data = {
      id: hd.id,
      ten_hd: hd.ten_hd,
      mo_ta: hd.mo_ta,
      loai: hd.loai_hd?.ten_loai_hd || null,
      diem_rl: Number(hd.diem_rl || 0),
      ngay_bd: hd.ngay_bd,
      ngay_kt: hd.ngay_kt,
      han_dk: hd.han_dk,
      trang_thai: hd.trang_thai,
      dia_diem: hd.dia_diem || null,
      don_vi_to_chuc: hd.don_vi_to_chuc || null,
      sl_toi_da: hd.sl_toi_da,
      is_registered,
      registration_status
    };

    sendResponse(res, 200, ApiResponse.success(data, 'Chi tiết hoạt động'));
  } catch (error) {
    logError('Get activity detail error', error);
    sendResponse(res, 500, ApiResponse.error('Không thể lấy chi tiết hoạt động'));
  }
});

// Tạo hoạt động (Giảng viên/Lớp trưởng/Admin)
router.post('/', auth, async (req, res) => {
  try {
    const role = String(req.user?.role || '').toUpperCase();
    if (!['GIANG_VIEN', 'LOP_TRUONG', 'ADMIN'].includes(role)) {
      return sendResponse(res, 403, ApiResponse.forbidden('Bạn không có quyền tạo hoạt động'));
    }
    const { ten_hd, mo_ta, loai_hd_id, diem_rl = 0, dia_diem, ngay_bd, ngay_kt, han_dk, sl_toi_da = 1, don_vi_to_chuc, yeu_cau_tham_gia, nam_hoc, hoc_ky } = req.body || {};
    if (!ten_hd || !loai_hd_id || !ngay_bd || !ngay_kt) {
      return sendResponse(res, 400, ApiResponse.validationError([{ field: 'payload', message: 'Thiếu thông tin bắt buộc' }]));
    }
    if (new Date(ngay_bd) > new Date(ngay_kt)) {
      return sendResponse(res, 400, ApiResponse.validationError([{ field: 'ngay_bd', message: 'Ngày bắt đầu phải trước ngày kết thúc' }]));
    }
    const created = await prisma.hoatDong.create({
      data: {
        ten_hd: String(ten_hd), mo_ta: mo_ta || null, loai_hd_id: String(loai_hd_id), diem_rl: new Prisma.Decimal(diem_rl),
        dia_diem: dia_diem || null, ngay_bd: new Date(ngay_bd), ngay_kt: new Date(ngay_kt), han_dk: han_dk ? new Date(han_dk) : null,
        sl_toi_da: Number(sl_toi_da) || 1, don_vi_to_chuc: don_vi_to_chuc || null, yeu_cau_tham_gia: yeu_cau_tham_gia || null,
        nam_hoc: nam_hoc || null, hoc_ky: hoc_ky || undefined,
        nguoi_tao_id: req.user.sub, trang_thai: role === 'GIANG_VIEN' || role === 'ADMIN' ? 'da_duyet' : 'cho_duyet'
      }
    });
    sendResponse(res, 201, ApiResponse.success(created, 'Tạo hoạt động thành công'));
  } catch (error) {
    logError('Create activity error', error);
    sendResponse(res, 500, ApiResponse.error('Không thể tạo hoạt động'));
  }
});

// Cập nhật hoạt động (chủ sở hữu hoặc Giảng viên/Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.hoatDong.findUnique({ where: { id } });
    if (!existing) return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy hoạt động'));
    const role = String(req.user?.role || '').toUpperCase();
    const isOwner = existing.nguoi_tao_id === req.user.sub;
    if (!(isOwner || isTeacherOrAdmin(role))) {
      return sendResponse(res, 403, ApiResponse.forbidden('Bạn không có quyền sửa hoạt động này'));
    }
    const { ten_hd, mo_ta, loai_hd_id, diem_rl, dia_diem, ngay_bd, ngay_kt, han_dk, sl_toi_da, don_vi_to_chuc, yeu_cau_tham_gia, trang_thai } = req.body || {};
    if (ngay_bd && ngay_kt && new Date(ngay_bd) > new Date(ngay_kt)) {
      return sendResponse(res, 400, ApiResponse.validationError([{ field: 'ngay_bd', message: 'Ngày bắt đầu phải trước ngày kết thúc' }]));
    }
    const updated = await prisma.hoatDong.update({
      where: { id },
      data: {
        ten_hd, mo_ta, loai_hd_id, diem_rl: typeof diem_rl !== 'undefined' ? new Prisma.Decimal(diem_rl) : undefined,
        dia_diem, ngay_bd: ngay_bd ? new Date(ngay_bd) : undefined, ngay_kt: ngay_kt ? new Date(ngay_kt) : undefined,
        han_dk: typeof han_dk !== 'undefined' ? (han_dk ? new Date(han_dk) : null) : undefined,
        sl_toi_da, don_vi_to_chuc, yeu_cau_tham_gia,
        trang_thai: isTeacherOrAdmin(role) && trang_thai ? trang_thai : undefined
      }
    });
    sendResponse(res, 200, ApiResponse.success(updated, 'Cập nhật hoạt động thành công'));
  } catch (error) {
    logError('Update activity error', error);
    sendResponse(res, 500, ApiResponse.error('Không thể cập nhật hoạt động'));
  }
});

// Xóa hoạt động (chủ sở hữu hoặc Giảng viên/Admin), chặn nếu đã có đăng ký
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.hoatDong.findUnique({ where: { id }, include: { dang_ky_hd: true } });
    if (!existing) return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy hoạt động'));
    const role = String(req.user?.role || '').toUpperCase();
    const isOwner = existing.nguoi_tao_id === req.user.sub;
    if (!(isOwner || isTeacherOrAdmin(role))) {
      return sendResponse(res, 403, ApiResponse.forbidden('Bạn không có quyền xóa hoạt động này'));
    }
    if (existing.dang_ky_hd && existing.dang_ky_hd.length > 0) {
      return sendResponse(res, 400, ApiResponse.validationError([{ field: 'dang_ky', message: 'Không thể xóa hoạt động đã có đăng ký' }]));
    }
    await prisma.hoatDong.delete({ where: { id } });
    sendResponse(res, 200, ApiResponse.success(true, 'Đã xóa hoạt động'));
  } catch (error) {
    logError('Delete activity error', error);
    sendResponse(res, 500, ApiResponse.error('Không thể xóa hoạt động'));
  }
});

// Sinh viên/Lớp trưởng đăng ký tham gia hoạt động
router.post('/:id/register', auth, async (req, res) => {
  try {
    const role = String(req.user?.role || '').toUpperCase();
    if (!['SINH_VIEN', 'STUDENT', 'LOP_TRUONG'].includes(role)) {
      return sendResponse(res, 403, ApiResponse.forbidden('Chỉ sinh viên hoặc lớp trưởng mới được đăng ký'));
    }
    const { id } = req.params;
    const hd = await prisma.hoatDong.findUnique({ where: { id } });
    if (!hd) return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy hoạt động'));
    if (hd.trang_thai !== 'da_duyet') return sendResponse(res, 400, ApiResponse.validationError([{ field: 'trang_thai', message: 'Hoạt động chưa mở đăng ký' }]));
    if (hd.han_dk && new Date(hd.han_dk) < new Date()) return sendResponse(res, 400, ApiResponse.validationError([{ field: 'han_dk', message: 'Đã quá hạn đăng ký' }]));
    const sv = await prisma.sinhVien.findUnique({ where: { nguoi_dung_id: req.user.sub } });
    if (!sv) return sendResponse(res, 400, ApiResponse.validationError([{ field: 'sinh_vien', message: 'Không tìm thấy thông tin sinh viên' }]));
    // Kiểm tra trùng đăng ký
    const exists = await prisma.dangKyHoatDong.findUnique({ where: { sv_id_hd_id: { sv_id: sv.id, hd_id: id } } }).catch(() => null);
    if (exists) return sendResponse(res, 400, ApiResponse.validationError([{ field: 'duplicate', message: 'Bạn đã đăng ký hoạt động này' }]));
    // Kiểm tra sức chứa
    if (hd.sl_toi_da && hd.sl_toi_da > 0) {
      const count = await prisma.dangKyHoatDong.count({ where: { hd_id: id, trang_thai_dk: { in: ['cho_duyet', 'da_duyet'] } } });
      if (count >= hd.sl_toi_da) return sendResponse(res, 400, ApiResponse.validationError([{ field: 'capacity', message: 'Hoạt động đã đủ số lượng' }]));
    }
    const created = await prisma.dangKyHoatDong.create({ data: { sv_id: sv.id, hd_id: id, trang_thai_dk: 'cho_duyet' } });
    sendResponse(res, 201, ApiResponse.success(created, 'Đăng ký thành công, chờ phê duyệt'));
  } catch (error) {
    logError('Register activity error', error);
    sendResponse(res, 500, ApiResponse.error('Không thể đăng ký hoạt động'));
  }
});

// Sinh viên/Lớp trưởng hủy đăng ký theo activityId (tự động tìm regId)
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const role = String(req.user?.role || '').toUpperCase();
    if (!['SINH_VIEN', 'STUDENT', 'LOP_TRUONG'].includes(role)) {
      return sendResponse(res, 403, ApiResponse.forbidden('Chỉ sinh viên hoặc lớp trưởng mới được hủy đăng ký'));
    }
    const { id } = req.params;
    const sv = await prisma.sinhVien.findUnique({ where: { nguoi_dung_id: req.user.sub } });
    if (!sv) return sendResponse(res, 400, ApiResponse.validationError([{ field: 'sinh_vien', message: 'Không tìm thấy thông tin sinh viên' }]));
    const reg = await prisma.dangKyHoatDong.findUnique({ where: { sv_id_hd_id: { sv_id: sv.id, hd_id: id } }, include: { hoat_dong: true } });
    if (!reg) return sendResponse(res, 404, ApiResponse.notFound('Bạn chưa đăng ký hoạt động này'));
    if (reg.hoat_dong?.han_dk && new Date(reg.hoat_dong.han_dk) < new Date()) {
      return sendResponse(res, 400, ApiResponse.validationError([{ field: 'deadline', message: 'Đã quá hạn hủy đăng ký' }]));
    }
    await prisma.dangKyHoatDong.delete({ where: { id: reg.id } });
    logInfo('Registration canceled by activity', { hdId: id, by: req.user.sub });
    sendResponse(res, 200, ApiResponse.success(true, 'Đã hủy đăng ký'));
  } catch (error) {
    logError('Cancel registration by activity error', error);
    sendResponse(res, 500, ApiResponse.error('Không thể hủy đăng ký'));
  }
});

// Danh sách loại hoạt động (phục vụ form tạo)
router.get('/types/list', auth, async (req, res) => {
  try {
    const list = await prisma.loaiHoatDong.findMany({ orderBy: { ten_loai_hd: 'asc' } });
    const data = list.map(l => ({ id: l.id, name: l.ten_loai_hd, color: l.mau_sac, max: l.diem_toi_da }));
    sendResponse(res, 200, ApiResponse.success(data, 'Danh sách loại hoạt động'));
  } catch (error) {
    logError('List activity types error', error);
    sendResponse(res, 500, ApiResponse.error('Không thể lấy danh sách loại hoạt động'));
  }
});

// Duyệt/Từ chối hoạt động bởi Giảng viên (U12, U15) với lý do từ chối
router.post('/:id/approve', auth, async (req, res) => {
  try {
    const role = String(req.user?.role || '').toUpperCase();
    if (!(role === 'GIANG_VIEN' || role === 'ADMIN')) {
      return sendResponse(res, 403, ApiResponse.forbidden('Chỉ giảng viên hoặc admin được duyệt hoạt động'));
    }
    const { id } = req.params;
    const updated = await prisma.hoatDong.update({
      where: { id },
      data: { trang_thai: 'da_duyet', ly_do_tu_choi: null }
    });
    logInfo('Activity approved', { id, by: req.user.sub });
    sendResponse(res, 200, ApiResponse.success({ id: updated.id, trang_thai: updated.trang_thai }, 'Đã duyệt hoạt động'));
  } catch (error) {
    logError('Approve activity error', error);
    sendResponse(res, 500, ApiResponse.error('Không thể duyệt hoạt động'));
  }
});

router.post('/:id/reject', auth, async (req, res) => {
  try {
    const role = String(req.user?.role || '').toUpperCase();
    if (!(role === 'GIANG_VIEN' || role === 'ADMIN')) {
      return sendResponse(res, 403, ApiResponse.forbidden('Chỉ giảng viên hoặc admin được từ chối hoạt động'));
    }
    const { id } = req.params;
    const { reason } = req.body;
    const updated = await prisma.hoatDong.update({
      where: { id },
      data: { trang_thai: 'tu_choi', ly_do_tu_choi: String(reason || 'Không nêu lý do') }
    });
    logInfo('Activity rejected', { id, by: req.user.sub });
    sendResponse(res, 200, ApiResponse.success({ id: updated.id, trang_thai: updated.trang_thai }, 'Đã từ chối hoạt động'));
  } catch (error) {
    logError('Reject activity error', error);
    sendResponse(res, 500, ApiResponse.error('Không thể từ chối hoạt động'));
  }
});

// Duyệt/Từ chối đăng ký bởi Lớp trưởng/Giảng viên (U16)
router.post('/registrations/:regId/approve', auth, async (req, res) => {
  try {
    const role = String(req.user?.role || '').toUpperCase();
    if (!['LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'].includes(role)) {
      return sendResponse(res, 403, ApiResponse.forbidden('Không có quyền duyệt đăng ký'));
    }
    const { regId } = req.params;
    const updated = await prisma.dangKyHoatDong.update({
      where: { id: regId },
      data: { trang_thai_dk: 'da_duyet', ly_do_tu_choi: null, ngay_duyet: new Date() }
    });
    logInfo('Registration approved', { regId, by: req.user.sub });
    sendResponse(res, 200, ApiResponse.success({ id: updated.id, trang_thai_dk: updated.trang_thai_dk }, 'Đã duyệt đăng ký'));
  } catch (error) {
    logError('Approve registration error', error);
    sendResponse(res, 500, ApiResponse.error('Không thể duyệt đăng ký'));
  }
});

router.post('/registrations/:regId/reject', auth, async (req, res) => {
  try {
    const role = String(req.user?.role || '').toUpperCase();
    if (!['LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'].includes(role)) {
      return sendResponse(res, 403, ApiResponse.forbidden('Không có quyền từ chối đăng ký'));
    }
    const { regId } = req.params;
    const { reason } = req.body;
    const updated = await prisma.dangKyHoatDong.update({
      where: { id: regId },
      data: { trang_thai_dk: 'tu_choi', ly_do_tu_choi: String(reason || 'Không nêu lý do'), ngay_duyet: new Date() }
    });
    logInfo('Registration rejected', { regId, by: req.user.sub });
    sendResponse(res, 200, ApiResponse.success({ id: updated.id, trang_thai_dk: updated.trang_thai_dk }, 'Đã từ chối đăng ký'));
  } catch (error) {
    logError('Reject registration error', error);
    sendResponse(res, 500, ApiResponse.error('Không thể từ chối đăng ký'));
  }
});

// Hủy đăng ký bởi sinh viên (U15)
router.post('/registrations/:regId/cancel', auth, async (req, res) => {
  try {
    const role = String(req.user?.role || '').toUpperCase();
    if (role !== 'SINH_VIEN') {
      return sendResponse(res, 403, ApiResponse.forbidden('Chỉ sinh viên mới được hủy đăng ký'));
    }
    const { regId } = req.params;
    const reg = await prisma.dangKyHoatDong.findUnique({ where: { id: regId }, include: { hoat_dong: true, sinh_vien: true } });
    if (!reg) return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy đăng ký'));
    // Chỉ cho phép hủy nếu trước hạn chót
    if (reg.hoat_dong?.han_dk && new Date(reg.hoat_dong.han_dk) < new Date()) {
      return sendResponse(res, 400, ApiResponse.validationError([{ field: 'deadline', message: 'Đã quá hạn hủy đăng ký' }]));
    }
    // Chỉ chủ sở hữu được hủy
    if (reg.sinh_vien?.nguoi_dung_id !== req.user.sub) {
      return sendResponse(res, 403, ApiResponse.forbidden('Bạn chỉ có thể hủy đăng ký của chính mình'));
    }
    const deleted = await prisma.dangKyHoatDong.delete({ where: { id: regId } });
    logInfo('Registration canceled', { regId, by: req.user.sub });
    sendResponse(res, 200, ApiResponse.success({ id: deleted.id }, 'Đã hủy đăng ký'));
  } catch (error) {
    logError('Cancel registration error', error);
    sendResponse(res, 500, ApiResponse.error('Không thể hủy đăng ký'));
  }
});

// Placeholder: Lấy QR code cho hoạt động (U17)
router.get('/:id/qr', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await prisma.hoatDong.findUnique({ where: { id } });
    if (!activity) return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy hoạt động'));
    // Tạm thời trả về payload QR text (thay vì ảnh). Ảnh sẽ cần thư viện qrcode.
    const qrPayload = JSON.stringify({ hd: id, ts: Date.now() });
    sendResponse(res, 200, ApiResponse.success({ text: qrPayload }, 'QR payload'));
  } catch (error) {
    logError('Get QR error', error);
    sendResponse(res, 500, ApiResponse.error('Không thể tạo QR'));
  }
});

module.exports = router;
