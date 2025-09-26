// src/routes/activities.route.js
const { Router } = require('express');
const QRCode = require('qrcode');
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
// Sinh viên chỉ thấy hoạt động do người tạo cùng lớp (lớp trưởng hoặc giảng viên chủ nhiệm)
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

      // Nếu là sinh viên -> chỉ hiển thị hoạt động do lớp trưởng cùng lớp tạo
      try {
        const role = String(req.user?.role || '').toLowerCase();
        console.log('🔍 User role:', role);
        
        if (role === 'student' || role === 'sinh_vien') {
          // Tạm thời hiển thị tất cả hoạt động để test
          console.log('🔍 Student - Showing all activities for testing');
          
          // Hiển thị hoạt động đã duyệt và đã kết thúc nếu user không chỉ định trangThai khác
          if (!trangThai) {
            where.trang_thai = { in: ['da_duyet', 'ket_thuc'] };
            console.log('🔍 Filter by trang_thai: da_duyet, ket_thuc');
          }
          
          // TODO: Sẽ bật lại logic lọc sau khi test
          /*
          // Bước 1: Lấy ID người dùng đang đăng nhập
          const userId = req.user.sub;
          console.log('🔍 User ID:', userId);
          
          // Bước 2: Tìm ID người dùng trong bảng sinh viên
          const currentStudent = await prisma.sinhVien.findUnique({
            where: { nguoi_dung_id: userId },
            select: { lop_id: true }
          });
          console.log('🔍 Current student:', currentStudent);
          
          if (currentStudent?.lop_id) {
            // Bước 3: Lấy dữ liệu lớp ID
            const lopId = currentStudent.lop_id;
            console.log('🔍 Lop ID:', lopId);
            
            // Bước 4: Chuyển qua bảng lớp, dùng lớp ID tìm trường lớp trưởng
            const lop = await prisma.lop.findUnique({
              where: { id: lopId },
              select: { lop_truong: true }
            });
            console.log('🔍 Lop data:', lop);
            
            if (lop?.lop_truong) {
              // Bước 5: Lấy ID lớp trưởng đó về bảng hoạt động
              // Tìm người dùng tương ứng với lớp trưởng
              const lopTruongSinhVien = await prisma.sinhVien.findUnique({
                where: { id: lop.lop_truong },
                select: { nguoi_dung_id: true }
              });
              console.log('🔍 Lop truong sinh vien:', lopTruongSinhVien);
              
              if (lopTruongSinhVien?.nguoi_dung_id) {
                // Bước 6: Xuất danh sách hoạt động có ID người tạo giống với ID lớp trưởng
                where.nguoi_tao_id = lopTruongSinhVien.nguoi_dung_id;
                console.log('🔍 Filter by nguoi_tao_id:', lopTruongSinhVien.nguoi_dung_id);
              } else {
                // Nếu không tìm thấy lớp trưởng, không hiển thị hoạt động nào
                where.nguoi_tao_id = { in: [] };
                console.log('🔍 No lop truong found, showing no activities');
              }
            } else {
              // Nếu lớp không có lớp trưởng, không hiển thị hoạt động nào
              where.nguoi_tao_id = { in: [] };
              console.log('🔍 No lop truong in class, showing no activities');
            }
          } else {
            // Nếu không tìm thấy sinh viên, không hiển thị hoạt động nào
            where.nguoi_tao_id = { in: [] };
            console.log('🔍 No student found, showing no activities');
          }
          */
        } else if (role === 'lop_truong') {
          // Lớp trưởng có thể xem tất cả hoạt động đã duyệt
          if (!trangThai) {
            where.trang_thai = { in: ['da_duyet', 'ket_thuc'] };
            console.log('🔍 Lop truong - Filter by trang_thai: da_duyet, ket_thuc');
          }
        } else if (role === 'giang_vien' || role === 'teacher') {
          // Giảng viên: xem hoạt động do lớp trưởng của các lớp mình chủ nhiệm tạo, hoặc do chính mình tạo
          const userId = req.user.sub;
          const homeroomClasses = await prisma.lop.findMany({ where: { chu_nhiem: userId }, select: { lop_truong: true } });
          const monitorStudentIds = homeroomClasses.map(c => c.lop_truong).filter(Boolean);
          let monitorUserIds = [];
          if (monitorStudentIds.length > 0) {
            const monitors = await prisma.sinhVien.findMany({ where: { id: { in: monitorStudentIds } }, select: { nguoi_dung_id: true } });
            monitorUserIds = monitors.map(m => m.nguoi_dung_id).filter(Boolean);
          }
          const orConds = [];
          orConds.push({ nguoi_tao_id: userId });
          if (monitorUserIds.length > 0) orConds.push({ nguoi_tao_id: { in: monitorUserIds } });
          if (orConds.length > 0) where.OR = (where.OR || []).concat(orConds);
          console.log('🔍 Teacher scope OR filter:', JSON.stringify(where.OR || [], null, 2));
        } else {
          console.log('🔍 Other role, showing all activities');
        }
        
        console.log('🔍 Final where clause:', JSON.stringify(where, null, 2));
      } catch (error) {
        console.error('Error in filter logic:', error);
        // Nếu có lỗi, không hiển thị hoạt động nào
        where.nguoi_tao_id = { in: [] };
      }

    const take = Math.min(100, parseInt(limit) || 20);
    const skip = (Math.max(1, parseInt(page) || 1) - 1) * take;
    // Hỗ trợ sắp xếp theo ngày tạo
    const sortField = ['ngay_bd','ngay_kt','han_dk','ten_hd','ngay_tao'].includes(String(sort)) ? String(sort) : 'ngay_bd';
    const orderBy = { [sortField]: order === 'desc' ? 'desc' : 'asc' };

    const [list, total] = await Promise.all([
      prisma.hoatDong.findMany({
      where,
      orderBy,
      include: { 
        loai_hd: true,
        nguoi_tao: { select: { id: true, ho_ten: true, email: true, sinh_vien: { select: { lop: { select: { ten_lop: true } } } } } }
      },
      skip,
      take
    }),
      prisma.hoatDong.count({ where })
    ]);
    
    console.log('🔍 Found activities:', list.length);
    console.log('🔍 Total activities:', total);

    // Check registration status for current user if they are a student
    let registrations = [];
    try {
      const role = req.user?.role?.toLowerCase();
      if (role === 'sinh_vien' || role === 'student' || role === 'lop_truong') {
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
      ngay_tao: hd.ngay_tao,
      han_dk: hd.han_dk,
      trang_thai: hd.trang_thai,
      dia_diem: hd.dia_diem || null,
      don_vi_to_chuc: hd.don_vi_to_chuc || null,
      sl_toi_da: hd.sl_toi_da,
      nguoi_tao: {
        id: hd.nguoi_tao?.id || null,
        ho_ten: hd.nguoi_tao?.ho_ten || null,
        email: hd.nguoi_tao?.email || null
      },
      lop: { ten_lop: hd.nguoi_tao?.sinh_vien?.lop?.ten_lop || null },
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

    // Notify activity creator that a new student registered
    try {
      // Find notification type "Hoạt động" if available
      const loai = await prisma.loaiThongBao.findFirst({ where: { ten_loai_tb: 'Hoạt động' } }).catch(() => null);
      const loaiId = loai?.id || (await prisma.loaiThongBao.findFirst().catch(() => null))?.id;
      if (loaiId && hd?.nguoi_tao_id) {
        const nguoiNhanId = hd.nguoi_tao_id;
        const tieuDe = 'Đăng ký hoạt động mới';
        const noiDung = `${sv.mssv || 'Sinh viên'} đã đăng ký tham gia hoạt động "${hd.ten_hd}"`;
        await prisma.thongBao.create({
          data: {
            tieu_de: tieuDe,
            noi_dung: noiDung,
            loai_tb_id: loaiId,
            nguoi_gui_id: req.user.sub,
            nguoi_nhan_id: nguoiNhanId,
            muc_do_uu_tien: 'trung_binh',
            phuong_thuc_gui: 'trong_he_thong'
          }
        }).catch(() => null);
      }
    } catch (e) {
      logError('Notify creator on student register error', e, { hdId: id, by: req.user.sub });
    }

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

    // Notify the approved student
    try {
      const reg = await prisma.dangKyHoatDong.findUnique({
        where: { id: regId },
        include: {
          sinh_vien: { include: { nguoi_dung: true } },
          hoat_dong: { select: { ten_hd: true } }
        }
      }).catch(() => null);
      if (reg?.sinh_vien?.nguoi_dung_id) {
        const loai = await prisma.loaiThongBao.findFirst({ where: { ten_loai_tb: 'Hoạt động' } }).catch(() => null);
        const loaiId = loai?.id || (await prisma.loaiThongBao.findFirst().catch(() => null))?.id;
        if (loaiId) {
          await prisma.thongBao.create({
            data: {
              tieu_de: 'Đăng ký đã được phê duyệt',
              noi_dung: `Bạn đã được phê duyệt tham gia hoạt động "${reg.hoat_dong?.ten_hd || ''}"`,
              loai_tb_id: loaiId,
              nguoi_gui_id: req.user.sub,
              nguoi_nhan_id: reg.sinh_vien.nguoi_dung_id,
              muc_do_uu_tien: 'trung_binh',
              phuong_thuc_gui: 'trong_he_thong'
            }
          }).catch(() => null);
        }
      }
    } catch (e) {
      logError('Notify student on approval error', e, { regId, by: req.user.sub });
    }

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

// Lấy QR code cho hoạt động (payload text hoặc ảnh DataURL)
router.get('/:id/qr', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await prisma.hoatDong.findUnique({ where: { id } });
    if (!activity) return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy hoạt động'));
    // Chỉ cho phép tạo/hiển thị QR kể từ thời điểm bắt đầu hoạt động
    const now = new Date();
    const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    if (now < new Date(activity.ngay_bd)) {
      return sendResponse(res, 400, ApiResponse.validationError([{ field: 'time', message: 'Chỉ tạo QR vào ngày bắt đầu hoạt động' }]));
    }
    // Không tạo QR nếu ngày kết thúc trùng ngày hiện tại
    if (isSameDay(now, new Date(activity.ngay_kt))) {
      return sendResponse(res, 400, ApiResponse.validationError([{ field: 'deadline', message: 'Đã hết hạn điểm danh trong ngày kết thúc' }]));
    }
    const forceRefresh = String(req.query.refresh || '') === '1';

    // Reuse existing token unless refresh is requested or not set
    let token = activity.qr || null;
    if (!token || forceRefresh) {
      // Generate a new short token and persist it
      token = (Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10)).slice(0, 16);
      await prisma.hoatDong.update({ where: { id }, data: { qr: token } });
    }

    const qrPayloadObj = { hd: id, token, ts: Date.now() };
    const qrPayload = JSON.stringify(qrPayloadObj);

    // image=1 -> trả về ảnh QR (data URL), mặc định trả payload text
    if (String(req.query.image || '') === '1') {
      try {
        const dataUrl = await QRCode.toDataURL(qrPayload, { errorCorrectionLevel: 'M', scale: 6, margin: 1 });
        return sendResponse(res, 200, ApiResponse.success({ image: dataUrl, text: qrPayload, token }, 'QR image'));
      } catch (e) {
        logError('Generate QR image error', e);
        return sendResponse(res, 500, ApiResponse.error('Không thể tạo ảnh QR'));
      }
    }

    sendResponse(res, 200, ApiResponse.success({ text: qrPayload, token }, 'QR payload'));
  } catch (error) {
    logError('Get QR error', error);
    sendResponse(res, 500, ApiResponse.error('Không thể tạo QR'));
  }
});

// Giải mã QR payload để lấy thông tin hoạt động cho ứng dụng di động/QRScannerImproved
router.get('/qr/:payload', auth, async (req, res) => {
  try {
    const { payload } = req.params;
    let parsed;
    try {
      parsed = JSON.parse(decodeURIComponent(payload));
    } catch (_) {
      try { parsed = JSON.parse(payload); } catch { parsed = null; }
    }
    if (!parsed?.hd) return sendResponse(res, 400, ApiResponse.validationError([{ field: 'payload', message: 'QR không hợp lệ' }]))
    const hd = await prisma.hoatDong.findUnique({ where: { id: String(parsed.hd) } });
    if (!hd) return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy hoạt động'));
    // If activity has a stored token, require match
    if (hd.qr) {
      if (!parsed.token || parsed.token !== hd.qr) {
        return sendResponse(res, 400, ApiResponse.validationError([{ field: 'payload', message: 'QR đã hết hạn hoặc không hợp lệ' }]));
      }
    }
    const data = {
      id: hd.id,
      ten_hd: hd.ten_hd,
      diem_rl: Number(hd.diem_rl || 0),
      dia_diem: hd.dia_diem || null,
      ngay_bd: hd.ngay_bd,
      ngay_kt: hd.ngay_kt,
      // Optional GPS requirement fields if you add them later
      gps_location: null,
      gps_radius: 100
    };
    sendResponse(res, 200, ApiResponse.success(data, 'Thông tin từ QR'));
  } catch (error) {
    logError('Decode QR payload error', error);
    sendResponse(res, 500, ApiResponse.error('Không thể đọc mã QR'));
  }
});

// Điểm danh bằng QR payload (qr_code) cho QRScannerImproved
router.post('/attendance/scan', auth, async (req, res) => {
  try {
    const { qr_code } = req.body || {};
    if (!qr_code) return sendResponse(res, 400, ApiResponse.validationError([{ field: 'qr_code', message: 'Thiếu qr_code' }]))

    let parsed;
    try {
      parsed = JSON.parse(String(qr_code));
    } catch (_) {
      try { parsed = JSON.parse(decodeURIComponent(String(qr_code))); } catch { parsed = null; }
    }
    if (!parsed?.hd) return sendResponse(res, 400, ApiResponse.validationError([{ field: 'qr_code', message: 'QR không hợp lệ' }]))
    const id = String(parsed.hd);

    // Reuse logic from direct attendance endpoint
    const activity = await prisma.hoatDong.findUnique({ where: { id } });
    if (!activity) return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy hoạt động'));
    const now = new Date();
    const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    // Không cho điểm danh nếu ngày kết thúc trùng ngày hiện tại
    if (isSameDay(now, new Date(activity.ngay_kt))) {
      return sendResponse(res, 400, ApiResponse.validationError([{ field: 'deadline', message: 'Điểm danh đã hết hạn trong ngày kết thúc' }]));
    }
    // If activity has a stored token, require match
    if (activity.qr) {
      if (!parsed.token || parsed.token !== activity.qr) {
        return sendResponse(res, 400, ApiResponse.validationError([{ field: 'qr_code', message: 'QR đã hết hạn hoặc không hợp lệ' }]));
      }
    }

    const sv = await prisma.sinhVien.findUnique({ where: { nguoi_dung_id: req.user.sub } });
    if (!sv) return sendResponse(res, 400, ApiResponse.validationError([{ field: 'sinh_vien', message: 'Không tìm thấy thông tin sinh viên' }]));

    const reg = await prisma.dangKyHoatDong.findUnique({ where: { sv_id_hd_id: { sv_id: sv.id, hd_id: id } } });
    if (!reg) {
      return sendResponse(res, 400, ApiResponse.validationError([{ field: 'dang_ky', message: 'Bạn chưa đăng ký hoạt động này' }]));
    }
    if (reg.trang_thai_dk === 'cho_duyet') {
      return sendResponse(res, 400, ApiResponse.validationError([{ field: 'dang_ky', message: 'Đăng ký của bạn chưa được phê duyệt' }]));
    }
    if (reg.trang_thai_dk === 'tu_choi') {
      return sendResponse(res, 400, ApiResponse.validationError([{ field: 'dang_ky', message: 'Đăng ký của bạn đã bị từ chối' }]));
    }

    const existed = await prisma.diemDanh.findUnique({ where: { sv_id_hd_id: { sv_id: sv.id, hd_id: id } } }).catch(()=>null);
    if (existed) return sendResponse(res, 400, ApiResponse.validationError([{ field: 'duplicate', message: 'Bạn đã điểm danh trước đó' }]));

    const clientIp = (req.headers['x-forwarded-for'] || '').toString().split(',')[0] || req.ip || null;
    const created = await prisma.diemDanh.create({
      data: {
        nguoi_diem_danh_id: req.user.sub,
        sv_id: sv.id,
        hd_id: id,
        phuong_thuc: 'qr',
        trang_thai_tham_gia: 'co_mat',
        dia_chi_ip: clientIp,
        xac_nhan_tham_gia: true
      }
    });

    if (reg.trang_thai_dk !== 'da_tham_gia') {
      await prisma.dangKyHoatDong.update({ where: { id: reg.id }, data: { trang_thai_dk: 'da_tham_gia' } });
    }

    sendResponse(res, 201, ApiResponse.success({ id: created.id, points_awarded: Number(activity.diem_rl || 0) }, 'Điểm danh thành công'));
  } catch (error) {
    logError('QR attendance scan error', error);
    sendResponse(res, 500, ApiResponse.error('Không thể điểm danh'));
  }
});

// New: Record attendance directly into DiemDanh (replaces QR session)
router.post('/:id/attendance', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const role = String(req.user?.role || '').toUpperCase();
    const activity = await prisma.hoatDong.findUnique({ where: { id } });
    if (!activity) return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy hoạt động'));

    // Resolve student from current user
    const sv = await prisma.sinhVien.findUnique({ where: { nguoi_dung_id: req.user.sub } });
    if (!sv) return sendResponse(res, 400, ApiResponse.validationError([{ field: 'sinh_vien', message: 'Không tìm thấy thông tin sinh viên' }]));

    // Must have approved registration with detailed reasons
    const reg = await prisma.dangKyHoatDong.findUnique({ where: { sv_id_hd_id: { sv_id: sv.id, hd_id: id } } });
    if (!reg) {
      return sendResponse(res, 400, ApiResponse.validationError([{ field: 'dang_ky', message: 'Bạn chưa đăng ký hoạt động này' }]));
    }
    if (reg.trang_thai_dk === 'cho_duyet') {
      return sendResponse(res, 400, ApiResponse.validationError([{ field: 'dang_ky', message: 'Đăng ký của bạn chưa được phê duyệt' }]));
    }
    if (reg.trang_thai_dk === 'tu_choi') {
      return sendResponse(res, 400, ApiResponse.validationError([{ field: 'dang_ky', message: 'Đăng ký của bạn đã bị từ chối' }]));
    }

    // Prevent duplicate attendance
    const existed = await prisma.diemDanh.findUnique({ where: { sv_id_hd_id: { sv_id: sv.id, hd_id: id } } }).catch(()=>null);
    if (existed) return sendResponse(res, 400, ApiResponse.validationError([{ field: 'duplicate', message: 'Bạn đã điểm danh trước đó' }]));

    const clientIp = (req.headers['x-forwarded-for'] || '').toString().split(',')[0] || req.ip || null;
    const created = await prisma.diemDanh.create({
      data: {
        nguoi_diem_danh_id: req.user.sub,
        sv_id: sv.id,
        hd_id: id,
        phuong_thuc: 'qr',
        trang_thai_tham_gia: 'co_mat',
        dia_chi_ip: clientIp,
        xac_nhan_tham_gia: true
      }
    });

    // Update registration to attended
    if (reg.trang_thai_dk !== 'da_tham_gia') {
      await prisma.dangKyHoatDong.update({ where: { id: reg.id }, data: { trang_thai_dk: 'da_tham_gia' } });
    }

    sendResponse(res, 201, ApiResponse.success({ id: created.id }, 'Điểm danh thành công'));
  } catch (error) {
    logError('Record attendance error', error);
    sendResponse(res, 500, ApiResponse.error('Không thể điểm danh'));
  }
});

// List attendance of an activity
router.get('/:id/attendance', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const list = await prisma.diemDanh.findMany({
      where: { hd_id: id },
      include: { sinh_vien: { include: { nguoi_dung: true } } },
      orderBy: { tg_diem_danh: 'desc' }
    });
    const data = list.map(r => ({ id: r.id, mssv: r.sinh_vien.mssv, ho_ten: r.sinh_vien.nguoi_dung?.ho_ten || '', tg: r.tg_diem_danh, thuc: r.phuong_thuc, tt: r.trang_thai_tham_gia }));
    sendResponse(res, 200, ApiResponse.success(data, 'Danh sách điểm danh'));
  } catch (error) {
    logError('List attendance error', error);
    sendResponse(res, 500, ApiResponse.error('Không thể lấy điểm danh'));
  }
});

module.exports = router;
