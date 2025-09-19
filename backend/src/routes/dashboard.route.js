// src/routes/dashboard.route.js
const { Router } = require('express');
const { auth } = require('../middlewares/auth');
const { prisma } = require('../config/database');
const { ApiResponse, sendResponse } = require('../utils/response');
const { logError } = require('../utils/logger');
const dashboardController = require('../controllers/dashboard.controller');

const router = Router();

// New comprehensive student dashboard
router.get('/student', auth, dashboardController.getStudentDashboard);

// Activity statistics for admin/teacher
router.get('/stats/activities', auth, dashboardController.getActivityStats);

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

    sendResponse(res, 200, ApiResponse.success({
      totalActiveStudents,
      ongoingActivities,
      averageScore
    }, 'Dashboard summary loaded'));
  } catch (error) {
    logError('Dashboard summary error', error, { userId: req.user?.sub });
    sendResponse(res, 500, ApiResponse.error('Không thể tải dữ liệu tổng quan'));
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
        loai_hd: { select: { ten_loai_hd: true } }
      }
    });

    const mapped = activities.map(a => ({
      id: a.id,
      name: a.ten_hd,
      startDate: a.ngay_bd,
      endDate: a.ngay_kt,
      points: Number(a.diem_rl || 0),
      type: a.loai_hd?.ten_loai_hd || 'Khác'
    }));

    sendResponse(res, 200, ApiResponse.success(mapped, 'Danh sách hoạt động đang diễn ra'));
  } catch (error) {
    logError('Ongoing activities error', error);
    sendResponse(res, 500, ApiResponse.error('Không thể tải danh sách hoạt động'));
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
        mo_ta: true,
        ngay_bd: true,
        ngay_kt: true,
        diem_rl: true,
        dia_diem: true,
        don_vi_to_chuc: true,
        trang_thai: true,
        loai_hd: { select: { ten_loai_hd: true } }
      }
    });

    const mapped = activities.map(a => ({
      id: a.id,
      ten_hd: a.ten_hd,
      mo_ta: a.mo_ta || '',
      ngay_bd: a.ngay_bd,
      ngay_kt: a.ngay_kt,
      diem_rl: Number(a.diem_rl || 0),
      dia_diem: a.dia_diem || '',
      don_vi_to_chuc: a.don_vi_to_chuc || '',
      trang_thai: a.trang_thai || 'cho_duyet',
      loai_hd: {
        ten_loai_hd: a.loai_hd?.ten_loai_hd || 'Khác'
      },
      registrationCount: 0 // Will be calculated separately if needed
    }));

    sendResponse(res, 200, ApiResponse.success(mapped, 'Danh sách hoạt động của lớp'));
  } catch (error) {
    logError('Class activities list error', error, { userId: req.user?.sub });
    sendResponse(res, 500, ApiResponse.error('Không thể tải danh sách hoạt động của lớp'));
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

    sendResponse(res, 200, ApiResponse.success({
      tongdiem,
      xeploai,
      sohdthamgia,
      progressPercent: progress
    }, 'Thống kê cá nhân'));
  } catch (error) {
    logError('Personal stats error', error, { userId: req.user?.sub });
    sendResponse(res, 500, ApiResponse.error('Không thể tải thống kê cá nhân'));
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

    sendResponse(res, 200, ApiResponse.success(mapped, 'Thông báo quan trọng'));
  } catch (error) {
    logError('Important notifications error', error, { userId: req.user?.sub });
    sendResponse(res, 500, ApiResponse.error('Không thể tải thông báo'));
  }
});

// API lấy điểm rèn luyện chi tiết theo tiêu chí
router.get('/scores/detailed', auth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const userRole = req.user.role;
    const { semester, year, hoc_ky, nam_hoc } = req.query;
    
    // Nếu là admin, giảng viên - trả về dữ liệu mặc định/demo
    if (userRole === 'ADMIN' || userRole === 'GIANG_VIEN') {
      const demoData = {
        student_info: {
          ho_ten: userRole === 'ADMIN' ? 'Quản Trị Viên' : 'Giảng Viên',
          mssv: userRole === 'ADMIN' ? 'admin' : 'gv001', 
          lop: 'N/A',
          khoa: 'Hệ thống'
        },
        summary: {
          total_score: 0,  // Changed from total_points
          target_points: 100,
          progress_percentage: 0,
          rank_in_class: 0,  // Changed from class_rank
          total_students_in_class: 0,  // Changed from total_students
          total_activities: 0,
          average_points: 0
        },
        criteria_breakdown: [
          { key: 'hoc_tap', name: 'Ý thức và kết quả học tập', max: 25, current: 0, activities: [], percentage: 0 },
          { key: 'noi_quy', name: 'Ý thức và kết quả chấp hành nội quy', max: 25, current: 0, activities: [], percentage: 0 },
          { key: 'tinh_nguyen', name: 'Hoạt động phong trào, tình nguyện', max: 25, current: 0, activities: [], percentage: 0 },
          { key: 'cong_dan', name: 'Phẩm chất công dân và quan hệ xã hội', max: 20, current: 0, activities: [], percentage: 0 },
          { key: 'khen_thuong', name: 'Hoạt động khen thưởng, kỷ luật', max: 5, current: 0, activities: [], percentage: 0 }
        ],
        activities: []
      };
      
      return sendResponse(res, 200, ApiResponse.success(demoData, 'Thông tin điểm rèn luyện (Quản trị)'));
    }
    
    // Lấy thông tin sinh viên
    const sv = await prisma.sinhVien.findUnique({ 
      where: { nguoi_dung_id: userId },
      include: { 
        lop: true,
        nguoi_dung: { select: { ho_ten: true } }
      }
    });
    
    if (!sv) {
      return sendResponse(res, 400, ApiResponse.validationError([{ field: 'sinh_vien', message: 'Không tìm thấy thông tin sinh viên' }]));
    }
    
    // Chuẩn hóa bộ lọc kỳ/năm (tùy chọn)
    let semesterEnum;
    const rawSemester = (semester || hoc_ky || '').toString().toLowerCase();
    if (rawSemester === '1' || rawSemester === 'hoc_ky_1' || rawSemester === 'hk1') {
      semesterEnum = 'hoc_ky_1';
    } else if (rawSemester === '2' || rawSemester === 'hoc_ky_2' || rawSemester === 'hk2') {
      semesterEnum = 'hoc_ky_2';
    }
    const selectedYear = (year || nam_hoc) ? String(year || nam_hoc) : undefined;

    const activityRelationFilter = {};
    if (semesterEnum) activityRelationFilter.hoc_ky = semesterEnum;
    if (selectedYear) activityRelationFilter.nam_hoc = selectedYear;

    // Lấy đăng ký đã tham gia/đã duyệt (lọc theo kỳ/năm nếu có)
    const registrationsPromise = prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: sv.id,
        trang_thai_dk: { in: ['da_tham_gia', 'da_duyet'] },
        hoat_dong: activityRelationFilter,
      },
      include: {
        hoat_dong: { include: { loai_hd: true } },
      },
      orderBy: { ngay_dang_ky: 'desc' },
    });

    // Lấy điểm danh xác nhận tham gia (cũng lọc theo kỳ/năm)
    const attendancesPromise = prisma.diemDanh.findMany({
      where: {
        sv_id: sv.id,
        xac_nhan_tham_gia: true,
        hoat_dong: activityRelationFilter,
      },
      include: {
        hoat_dong: { include: { loai_hd: true } },
      },
      orderBy: { tg_diem_danh: 'desc' },
    });

    const [registrations, attendances] = await Promise.all([
      registrationsPromise,
      attendancesPromise,
    ]);

    // Tính điểm theo tiêu chí (dựa trên loại hoạt động)
    const criteriaBreakdown = {
      hoc_tap: { name: 'Ý thức và kết quả học tập', max: 25, current: 0, activities: [] },
      noi_quy: { name: 'Ý thức và kết quả chấp hành nội quy', max: 25, current: 0, activities: [] },
      tinh_nguyen: { name: 'Hoạt động phong trào, tình nguyện', max: 25, current: 0, activities: [] },
      cong_dan: { name: 'Phẩm chất công dân và quan hệ xã hội', max: 20, current: 0, activities: [] },
      khen_thuong: { name: 'Hoạt động khen thưởng, kỷ luật', max: 5, current: 0, activities: [] }
    };

    let totalPoints = 0;
    const activityList = [];
    const byActivity = new Map(); // key = hd_id

    // Hợp nhất theo hoạt động: ưu tiên đăng ký, bổ sung điểm danh nếu chưa có
    registrations.forEach((reg) => {
      const activity = reg.hoat_dong;
      if (!activity) return;
      byActivity.set(reg.hd_id, {
        source: 'dang_ky',
        ten_hd: activity.ten_hd,
        id: activity.id,
        ngay_bd: activity.ngay_bd,
        diem_rl: Number(activity.diem_rl || 0),
        loai: activity.loai_hd?.ten_loai_hd || 'Khác',
        dia_diem: activity.dia_diem,
        don_vi_to_chuc: activity.don_vi_to_chuc,
        ngay_tham_gia: reg.ngay_dang_ky,
      });
    });

    attendances.forEach((att) => {
      const activity = att.hoat_dong;
      if (!activity) return;
      if (!byActivity.has(att.hd_id)) {
        byActivity.set(att.hd_id, {
          source: 'diem_danh',
          ten_hd: activity.ten_hd,
          id: activity.id,
          ngay_bd: activity.ngay_bd,
          diem_rl: Number(activity.diem_rl || 0),
          loai: activity.loai_hd?.ten_loai_hd || 'Khác',
          dia_diem: activity.dia_diem,
          don_vi_to_chuc: activity.don_vi_to_chuc,
          ngay_tham_gia: att.tg_diem_danh,
        });
      }
    });

    // Tính tổng điểm và phân loại
    for (const [, a] of byActivity) {
      totalPoints += a.diem_rl;
      const activityData = {
        id: a.id,
        ten_hd: a.ten_hd,
        ngay_bd: a.ngay_bd,
        diem_rl: a.diem_rl,
        loai: a.loai,
        dia_diem: a.dia_diem,
        don_vi_to_chuc: a.don_vi_to_chuc,
        ngay_dang_ky: a.ngay_tham_gia,
      };
      activityList.push(activityData);

      const loaiHd = (a.loai || '').toLowerCase();
      if (loaiHd.includes('học') || loaiHd.includes('giáo dục')) {
        criteriaBreakdown.hoc_tap.current += a.diem_rl;
        criteriaBreakdown.hoc_tap.activities.push(activityData);
      } else if (loaiHd.includes('tình nguyện') || loaiHd.includes('phong trào')) {
        criteriaBreakdown.tinh_nguyen.current += a.diem_rl;
        criteriaBreakdown.tinh_nguyen.activities.push(activityData);
      } else if (loaiHd.includes('văn hóa') || loaiHd.includes('thể thao')) {
        criteriaBreakdown.cong_dan.current += a.diem_rl;
        criteriaBreakdown.cong_dan.activities.push(activityData);
      } else {
        criteriaBreakdown.noi_quy.current += a.diem_rl;
        criteriaBreakdown.noi_quy.activities.push(activityData);
      }
    }

    // Tính xếp hạng trong lớp (giả định)
    const classRank = Math.floor(Math.random() * sv.lop?.total_students || 35) + 1;
    const totalStudentsInClass = sv.lop?.total_students || 35;

    const result = {
      student_info: {
        ho_ten: sv.nguoi_dung?.ho_ten,
        mssv: sv.mssv,
        lop: sv.lop?.ten_lop,
        khoa: sv.lop?.khoa
      },
      summary: {
        total_score: totalPoints,  // Changed from total_points to total_score
        target_points: 100,
        progress_percentage: Math.min((totalPoints / 100) * 100, 100),
        rank_in_class: classRank,  // Changed from class_rank 
        total_students_in_class: totalStudentsInClass,  // Changed from total_students
        total_activities: activityList.length,
        average_points: activityList.length > 0 ? parseFloat((totalPoints / activityList.length).toFixed(1)) : 0
      },
      criteria_breakdown: Object.keys(criteriaBreakdown).map(key => ({
        key,
        ...criteriaBreakdown[key],
        percentage: Math.min((criteriaBreakdown[key].current / criteriaBreakdown[key].max) * 100, 100)
      })),
      activities: activityList.map(activity => ({
        ...activity,
        diem: activity.diem_rl,
        ngay_bd: activity.ngay_bd,
        trang_thai: 'da_dien_ra'
      }))
    };

    sendResponse(res, 200, ApiResponse.success(result, 'Chi tiết điểm rèn luyện'));
  } catch (error) {
    logError('Get detailed scores error', error, { userId: req.user?.sub });
    sendResponse(res, 500, ApiResponse.error('Không thể tải chi tiết điểm rèn luyện'));
  }
});

// DUPLICATE ROUTE COMMENTED OUT
/*
// Student scores detailed breakdown
router.get('/scores/detailed', auth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { hoc_ky = '1', nam_hoc = '2025-2026', view_by = 'hoc_ky' } = req.query;
    
    console.log('=== Scores Debug ===');
    console.log('User ID:', userId);
    console.log('Params:', { hoc_ky, nam_hoc, view_by });
    
    // Lấy thông tin sinh viên
    const sv = await prisma.sinhVien.findUnique({ 
      where: { nguoi_dung_id: userId },
      include: { lop: true }
    });
    
    console.log('Student found:', sv ? { id: sv.id, mssv: sv.mssv, lop: sv.lop?.ten_lop } : null);
    
    if (!sv) {
      console.log('No student found for user ID:', userId);
      return sendResponse(res, 400, ApiResponse.validationError([{ field: 'sinh_vien', message: 'Không tìm thấy thông tin sinh viên' }]));
    }

    // Lấy điểm rèn luyện theo kỳ
    const scoreCondition = view_by === 'hoc_ky' 
      ? { hoc_ky: parseInt(hoc_ky), nam_hoc }
      : { nam_hoc };

    console.log('Score condition:', scoreCondition);

    const scores = await prisma.diemRenLuyen.findMany({
      where: { sv_id: sv.id, ...scoreCondition },
      include: {
        tieu_chi: true
      }
    });

    console.log('Scores found:', scores.length);

    // Lấy hoạt động đã tham gia trong kỳ
    const activities = await prisma.dangKyHoatDong.findMany({
      where: { 
        sv_id: sv.id, 
        trang_thai_dk: 'da_tham_gia',
        hoat_dong: { nam_hoc, hoc_ky: view_by === 'hoc_ky' ? parseInt(hoc_ky) : undefined }
      },
      include: {
        hoat_dong: {
          include: { loai_hd: true }
        }
      },
      orderBy: { ngay_dang_ky: 'desc' }
    });

    // Tính tổng điểm và thống kê
    const totalScore = scores.reduce((sum, s) => sum + Number(s.diem || 0), 0);
    const totalActivities = activities.length;
    const averagePoints = totalActivities > 0 ? (totalScore / totalActivities).toFixed(1) : 0;

    // Xếp hạng trong lớp (giả lập)
    const classRank = Math.floor(Math.random() * 20) + 1; 
    const totalStudentsInClass = 45;

    // Phân tích theo tiêu chí (5 loại chính)
    const criteriaBreakdown = [
      { key: 'hoc_tap', name: 'Ý thức và kết quả học tập', current: 0, max: 25 },
      { key: 'noi_quy', name: 'Ý thức chấp hành nội quy', current: 0, max: 25 },
      { key: 'tinh_nguyen', name: 'Hoạt động phong trào', current: 0, max: 20 },
      { key: 'cong_dan', name: 'Quan hệ với cộng đồng', current: 0, max: 25 },
      { key: 'khen_thuong', name: 'Thành tích đặc biệt', current: 0, max: 5 }
    ];

    // Phân điểm theo tiêu chí từ dữ liệu thực
    scores.forEach(score => {
      const tieuChi = score.tieu_chi?.key || '';
      const found = criteriaBreakdown.find(c => c.key === tieuChi);
      if (found) {
        found.current += Number(score.diem || 0);
      }
    });

    // Tính phần trăm
    criteriaBreakdown.forEach(c => {
      c.percentage = Math.round((c.current / c.max) * 100);
    });

    const result = {
      student_info: {
        ho_ten: sv.ho_ten,
        mssv: sv.mssv,
        lop: sv.lop?.ten_lop || 'Chưa có lớp'
      },
      summary: {
        total_score: totalScore,
        total_activities: totalActivities,
        average_points: parseFloat(averagePoints),
        rank_in_class: classRank,
        total_students_in_class: totalStudentsInClass
      },
      criteria_breakdown: criteriaBreakdown,
      activities: activities.map(activity => ({
        id: activity.hoat_dong?.id,
        ten_hd: activity.hoat_dong?.ten_hd,
        loai: activity.hoat_dong?.loai_hd?.ten_loai_hd,
        diem: Number(activity.hoat_dong?.diem_rl || 0),
        ngay_bd: activity.hoat_dong?.ngay_bd,
        trang_thai: activity.trang_thai_dk
      }))
    };

    sendResponse(res, 200, ApiResponse.success(result, 'Chi tiết điểm rèn luyện'));
  } catch (error) {
    logError('Student scores detailed error', error, { userId: req.user?.sub });
    sendResponse(res, 500, ApiResponse.error('Không thể tải chi tiết điểm rèn luyện'));
  }
});
*/
// END DUPLICATE ROUTE

// Danh sách hoạt động của tôi (đăng ký bởi sinh viên đang đăng nhập)
router.get('/activities/me', auth, async (req, res) => {
  try {
    const userId = req.user.sub;
    console.log('=== My Activities Debug ===');
    console.log('User ID:', userId);
    
    // Lấy thông tin sinh viên trước
    const sv = await prisma.sinhVien.findUnique({ 
      where: { nguoi_dung_id: userId },
      select: { id: true, mssv: true }
    });
    
    console.log('Student found:', sv);
    
    if (!sv) {
      console.log('No student found for user ID:', userId);
      return sendResponse(res, 400, ApiResponse.validationError([{ field: 'sinh_vien', message: 'Không tìm thấy thông tin sinh viên' }]));
    }
    
    const registrations = await prisma.dangKyHoatDong.findMany({
      where: { sv_id: sv.id },
      orderBy: { ngay_dang_ky: 'desc' },
      include: {
        hoat_dong: {
          include: {
            loai_hd: true
          }
        }
      }
    });

    console.log('Total registrations found:', registrations.length);
    console.log('Sample registration:', registrations[0]);

    const mapped = registrations.map(r => ({
      id: r.id,
      hd_id: r.hd_id,
      ngay_dang_ky: r.ngay_dang_ky,
      trang_thai_dk: r.trang_thai_dk,
      ly_do_tu_choi: r.ly_do_tu_choi,
      ngay_duyet: r.ngay_duyet,
      hoat_dong: {
        id: r.hoat_dong?.id,
        ten_hd: r.hoat_dong?.ten_hd,
        mo_ta: r.hoat_dong?.mo_ta,
        ngay_bd: r.hoat_dong?.ngay_bd,
        ngay_kt: r.hoat_dong?.ngay_kt,
        diem_rl: Number(r.hoat_dong?.diem_rl || 0),
        dia_diem: r.hoat_dong?.dia_diem,
        don_vi_to_chuc: r.hoat_dong?.don_vi_to_chuc,
        trang_thai: r.hoat_dong?.trang_thai,
        loai: r.hoat_dong?.loai_hd?.ten_loai_hd
      }
    }));

    console.log('Mapped result count:', mapped.length);
    console.log('=== End Debug ===');

    sendResponse(res, 200, ApiResponse.success(mapped, 'Danh sách hoạt động của tôi'));
  } catch (error) {
    console.error('My activities error:', error);
    logError('My activities error', error, { userId: req.user?.sub });
    sendResponse(res, 500, ApiResponse.error('Không thể tải danh sách hoạt động của tôi'));
  }
});

module.exports = router;

