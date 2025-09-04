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

    // Tổng sinh viên đang hoạt động (trangthai = 'hot')
    const totalActiveStudentsPromise = prisma.nguoiDung.count({ where: { trangthai: 'hot' } });

    // Hoạt động đang diễn ra (ngày hiện tại nằm trong [ngaybd, ngaykt] và trangthaihd = 'duyet')
    const now = new Date();
    const ongoingActivitiesPromise = prisma.hoatDong.count({
      where: {
        trangthaihd: 'duyet',
        ngaybd: { lte: now },
        ngaykt: { gte: now }
      }
    });

    // Điểm trung bình của sinh viên: trung bình 'diemdatduoc' từ BangDiemTongHop theo sinh viên hiện tại
    // Nếu chưa có, fallback 0
    const avgScorePromise = prisma.bangDiemTongHop.aggregate({
      _avg: { diemdatduoc: true },
      where: { svid: userId }
    });

    const [totalActiveStudents, ongoingActivities, avgResult] = await Promise.all([
      totalActiveStudentsPromise,
      ongoingActivitiesPromise,
      avgScorePromise
    ]);

    const averageScore = Number(avgResult?._avg?.diemdatduoc || 0);

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
    // Lấy lopid của người dùng hiện tại
    const currentUser = await prisma.nguoiDung.findUnique({
      where: { id: req.user.sub },
      select: { lopid: true }
    });
    const lopId = currentUser?.lopid || null;

    const activities = await prisma.hoatDong.findMany({
      where: {
        trangthaihd: 'duyet',
        ngaybd: { lte: now },
        ngaykt: { gte: now },
        // Chỉ lấy hoạt động có người tạo thuộc cùng lớp với người dùng hiện tại
        nguoiTao: lopId ? { lopid: lopId } : undefined,
      },
      orderBy: { ngaybd: 'asc' },
      take: 10,
      select: {
        id: true,
        tenhd: true,
        ngaybd: true,
        ngaykt: true,
        diemrl: true,
        loaiHoatDong: { select: { tenloai: true } }
      }
    });

    const mapped = activities.map(a => ({
      id: a.id,
      name: a.tenhd,
      startDate: a.ngaybd,
      endDate: a.ngaykt,
      points: a.diemrl || 0,
      type: a.loaiHoatDong?.tenloai || 'Khác'
    }));

    sendResponse(res, ApiResponse.success(mapped, 'Danh sách hoạt động đang diễn ra'));
  } catch (error) {
    logError('Ongoing activities error', error);
    sendResponse(res, ApiResponse.error('Không thể tải danh sách hoạt động'));
  }
});

module.exports = router;

// Danh sách hoạt động của tôi (đăng ký bởi sinh viên đang đăng nhập)
router.get('/activities/me', auth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const registrations = await prisma.dangKyHoatDong.findMany({
      where: { svid: userId },
      orderBy: { ngaydangky: 'desc' },
      select: {
        id: true,
        ngaydangky: true,
        lydodk: true,
        lydotuchoi: true,
        nguoiduyetid: true,
        ngayduyet: true,
        hoatDong: {
          select: {
            id: true,
            tenhd: true,
            ngaybd: true,
            ngaykt: true,
            diemrl: true,
            trangthaihd: true
          }
        }
      }
    });

    const mapped = registrations.map(r => {
      let status = 'cho_duyet';
      if (r.lydotuchoi) status = 'tu_choi';
      else if (r.nguoiduyetid || r.ngayduyet) status = 'duyet';
      return {
        id: r.id,
        activityId: r.hoatDong?.id,
        name: r.hoatDong?.tenhd,
        startDate: r.hoatDong?.ngaybd,
        endDate: r.hoatDong?.ngaykt,
        points: r.hoatDong?.diemrl || 0,
        status,
        registeredAt: r.ngaydangky,
        rejectReason: r.lydotuchoi || null
      };
    });

    sendResponse(res, ApiResponse.success(mapped, 'Danh sách hoạt động của tôi'));
  } catch (error) {
    logError('My activities error', error, { userId: req.user?.sub });
    sendResponse(res, ApiResponse.error('Không thể tải danh sách hoạt động của tôi'));
  }
});


