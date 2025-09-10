// src/routes/dashboard.route.js
const { Router } = require('express');
const { auth } = require('../middlewares/auth');
const { prisma } = require('../config/database');
const { ApiResponse, sendResponse } = require('../utils/response');
const { logError } = require('../utils/logger');

const router = Router();

// Tóm tắt dashboard cho người dùng đang đăng nhập
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user.sub;

    // Tổng tài khoản đang hoạt động
    const totalActiveStudentsPromise = prisma.nguoiDung.count({ where: { trang_thai: 'hoat_dong' } });

    // Hoạt động đang diễn ra (ngày hiện tại nằm trong [ngay_bd, ngay_kt] và trang_thai = 'da_duyet')
    const now = new Date();
    const ongoingActivitiesPromise = prisma.hoatDong.count({
      where: {
        trang_thai: 'da_duyet',
        ngay_bd: { lte: now },
        ngay_kt: { gte: now }
      }
    });

    // Điểm trung bình của sinh viên: trung bình điểm hoạt động đã tham gia
    const avgScorePromise = prisma.dangKyHoatDong.findMany({
      where: { sv_id: userId, trang_thai_dk: 'da_tham_gia' },
      select: { hoatDong: { select: { diem_rl: true } } }
    });

    const [totalActiveStudents, ongoingActivities, avgResult] = await Promise.all([
      totalActiveStudentsPromise,
      ongoingActivitiesPromise,
      avgScorePromise
    ]);

    const completed = Array.isArray(avgResult) ? avgResult : [];
    const averageScore = completed.length > 0
      ? completed.reduce((sum, r) => sum + Number(r.hoatDong?.diem_rl || 0), 0) / completed.length
      : 0;

    sendResponse(res, ApiResponse.success({
      totalActiveStudents,
      ongoingActivities,
      averageScore
    }, 'Dashboard summary loaded'));
  } catch (error) {
    logError('Dashboard summary error', error, { userId: req.user?.sub });
    sendResponse(res, ApiResponse.error('Không thể tải dữ liệu tổng quan'));
  }
});

// Danh sách các hoạt động đang diễn ra (chi tiết) - giới hạn 10
router.get('/activities/ongoing', auth, async (req, res) => {
  try {
    const now = new Date();
    // Không lọc theo lớp nữa

    const activities = await prisma.hoatDong.findMany({
      where: { trang_thai: 'da_duyet', ngay_bd: { lte: now }, ngay_kt: { gte: now } },
      orderBy: { ngay_bd: 'asc' },
      take: 10,
      select: {
        id: true,
        ten_hd: true,
        ngay_bd: true,
        ngay_kt: true,
        diem_rl: true,
        loaiHoatDong: { select: { ten_loai_hd: true } }
      }
    });

    const mapped = activities.map(a => ({
      id: a.id,
      name: a.ten_hd,
      startDate: a.ngay_bd,
      endDate: a.ngay_kt,
      points: Number(a.diem_rl || 0),
      type: a.loaiHoatDong?.ten_loai_hd || 'Khác'
    }));

    sendResponse(res, ApiResponse.success(mapped, 'Danh sách hoạt động đang diễn ra'));
  } catch (error) {
    logError('Ongoing activities error', error);
    sendResponse(res, ApiResponse.error('Không thể tải danh sách hoạt động'));
  }
});

// Tất cả hoạt động của lớp (mới nhất -> cũ nhất)
router.get('/activities/class/all', auth, async (req, res) => {
  try {
    // Danh sách tất cả hoạt động (không lọc lớp)

    const activities = await prisma.hoatDong.findMany({
      where: {},
      orderBy: { ngay_bd: 'desc' },
      select: {
        id: true,
        ten_hd: true,
        ngay_bd: true,
        ngay_kt: true,
        diem_rl: true,
        trang_thai: true,
        loaiHoatDong: { select: { ten_loai_hd: true } }
      }
    });

    const mapped = activities.map(a => ({
      id: a.id,
      name: a.ten_hd,
      startDate: a.ngay_bd,
      endDate: a.ngay_kt,
      points: Number(a.diem_rl || 0),
      type: a.loaiHoatDong?.ten_loai_hd || 'Khác',
      status: a.trang_thai || null
    }));

    sendResponse(res, ApiResponse.success(mapped, 'Danh sách hoạt động của lớp'));
  } catch (error) {
    logError('Class activities list error', error, { userId: req.user?.sub });
    sendResponse(res, ApiResponse.error('Không thể tải danh sách hoạt động của lớp'));
  }
});

// Thống kê cá nhân: tổng điểm từ các hoạt động đã tham gia, số hoạt động, tiến độ (%)
router.get('/personal/stats', auth, async (req, res) => {
  try {
    const userId = req.user.sub;

    const completedRegs = await prisma.dangKyHoatDong.findMany({
      where: { sv_id: userId, trang_thai_dk: 'da_tham_gia' },
      select: { hoatDong: { select: { diem_rl: true } } }
    });
    const tongdiem = (completedRegs || []).reduce((sum, r) => sum + Number(r.hoatDong?.diem_rl || 0), 0);
    const sohdthamgia = completedRegs?.length || 0;
    const xeploai = null;

    // Tiến độ: giả định yêu cầu đạt 100 điểm tối đa
    const progress = Math.max(0, Math.min(100, Math.round((tongdiem / 100) * 100)));

    sendResponse(res, ApiResponse.success({
      tongdiem,
      xeploai,
      sohdthamgia,
      progressPercent: progress
    }, 'Thống kê cá nhân'));
  } catch (error) {
    logError('Personal stats error', error, { userId: req.user?.sub });
    sendResponse(res, ApiResponse.error('Không thể tải thống kê cá nhân'));
  }
});

// Thông báo quan trọng chưa đọc (tối đa 3)
router.get('/notifications/important', auth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const important = await prisma.thongBao.findMany({
      where: {
        nguoi_nhan_id: userId,
        da_doc: false,
        muc_do_uu_tien: { in: ['cao', 'khan_cap'] },
      },
      orderBy: { ngay_gui: 'desc' },
      take: 3,
      select: { id: true, tieu_de: true, ngay_gui: true, muc_do_uu_tien: true },
    });

    const mapped = important.map(tb => ({
      id: tb.id,
      title: tb.tieu_de,
      sentAt: tb.ngay_gui,
      priority: tb.muc_do_uu_tien,
    }));

    sendResponse(res, ApiResponse.success(mapped, 'Thông báo quan trọng'));
  } catch (error) {
    logError('Important notifications error', error, { userId: req.user?.sub });
    sendResponse(res, ApiResponse.error('Không thể tải thông báo'));
  }
});

module.exports = router;

// Danh sách hoạt động của tôi (đăng ký bởi sinh viên đang đăng nhập)
router.get('/activities/me', auth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const registrations = await prisma.dangKyHoatDong.findMany({
      where: { sv_id: userId },
      orderBy: { ngay_dang_ky: 'desc' },
      select: {
        id: true,
        ngay_dang_ky: true,
        ly_do_dk: true,
        ly_do_tu_choi: true,
        nguoi_duyet_id: true,
        ngay_duyet: true,
        trang_thai_dk: true,
        hoatDong: {
          select: {
            id: true,
            ten_hd: true,
            ngay_bd: true,
            ngay_kt: true,
            diem_rl: true,
            trang_thai: true
          }
        }
      }
    });

    const mapped = registrations.map(r => ({
      id: r.id,
      activityId: r.hoatDong?.id,
      name: r.hoatDong?.ten_hd,
      startDate: r.hoatDong?.ngay_bd,
      endDate: r.hoatDong?.ngay_kt,
      points: Number(r.hoatDong?.diem_rl || 0),
      status: r.trang_thai_dk,
      registeredAt: r.ngay_dang_ky,
      rejectReason: r.ly_do_tu_choi || null
    }));

    sendResponse(res, ApiResponse.success(mapped, 'Danh sách hoạt động của tôi'));
  } catch (error) {
    logError('My activities error', error, { userId: req.user?.sub });
    sendResponse(res, ApiResponse.error('Không thể tải danh sách hoạt động của tôi'));
  }
});


