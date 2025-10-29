const { prisma } = require('../config/database');
const { ApiResponse, sendResponse } = require('../utils/response');
const { buildSemesterFilter, parseSemesterString } = require('../utils/semester');

class AdminReportsController {
  static async getOverview(req, res) {
    try {
      const { semester, hoc_ky, nam_hoc } = req.query || {};
      let activityWhere = {};
      if (semester) {
        const si = parseSemesterString(semester);
        if (!si) return sendResponse(res, 400, ApiResponse.error('Tham số học kỳ không hợp lệ'));
        // Dùng dynamic filter theo ngày để tránh lỗi kiểu dữ liệu nam_hoc (string/int) khác biệt giữa DB
        activityWhere = buildSemesterFilter(semester, true);
      } else if (hoc_ky || nam_hoc) {
        activityWhere = { hoc_ky: hoc_ky || undefined, ...(nam_hoc ? { nam_hoc } : {}) };
      }

      const [byStatus, topActivities, dailyRegs] = await Promise.all([
        prisma.hoatDong.groupBy({ by: ['trang_thai'], where: activityWhere, _count: { _all: true } }),
        prisma.hoatDong.findMany({
          where: activityWhere,
          select: { id: true, ten_hd: true, ngay_bd: true, dang_ky_hd: { select: { id: true } } },
          orderBy: { ngay_bd: 'desc' },
          take: 20
        }),
        prisma.dangKyHoatDong.groupBy({
          by: ['ngay_dang_ky'],
          where: { hoat_dong: activityWhere },
          _count: { _all: true }
        })
      ]);

      const top = topActivities
        .map(a => ({ id: a.id, ten_hd: a.ten_hd, count: a.dang_ky_hd.length }))
        .sort((x, y) => y.count - x.count)
        .slice(0, 10);

      return sendResponse(res, 200, ApiResponse.success({ byStatus, topActivities: top, dailyRegs }));
    } catch (e) {
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy báo cáo'));
    }
  }

  static async exportActivities(req, res) {
    try {
      const { semester, hoc_ky, nam_hoc } = req.query || {};
      let activityWhere = {};
      if (semester) {
        const si = parseSemesterString(semester);
        if (!si) return sendResponse(res, 400, ApiResponse.error('Tham số học kỳ không hợp lệ'));
        activityWhere = buildSemesterFilter(semester, true);
      } else if (hoc_ky || nam_hoc) {
        activityWhere = { hoc_ky: hoc_ky || undefined, ...(nam_hoc ? { nam_hoc } : {}) };
      }

      let rows;
      try {
        rows = await prisma.hoatDong.findMany({
          where: activityWhere,
          select: {
            ma_hd: true,
            ten_hd: true,
            diem_rl: true,
            trang_thai: true,
            ngay_bd: true,
            ngay_kt: true,
            loai_hd: { select: { ten_loai_hd: true } }
          },
          orderBy: { ngay_bd: 'desc' }
        });
      } catch (qErr) {
        console.warn('exportActivities query failed, retrying without orderBy', qErr?.message);
        rows = await prisma.hoatDong.findMany({
          where: activityWhere,
          select: {
            ma_hd: true,
            ten_hd: true,
            diem_rl: true,
            trang_thai: true,
            ngay_bd: true,
            ngay_kt: true,
            loai_hd: { select: { ten_loai_hd: true } }
          }
        });
      }
      const headers = ['Ma','Ten','Loai','DiemRL','TrangThai','NgayBD','NgayKT'];
      const safeToIso = (d) => {
        if (!d) return '';
        try {
          if (typeof d === 'string') {
            const nd = new Date(d);
            return isNaN(nd.getTime()) ? '' : nd.toISOString();
          }
          if (d instanceof Date && !isNaN(d.getTime())) return d.toISOString();
          if (typeof d.toISOString === 'function') return d.toISOString();
          return '';
        } catch { return ''; }
      };
      const safe = (v) => v === null || v === undefined ? '' : v;
      const data = rows.map(r => [
        safe(r.ma_hd),
        safe(r.ten_hd),
        safe(r.loai_hd?.ten_loai_hd),
        safe(r.diem_rl),
        safe(r.trang_thai),
        safeToIso(r.ngay_bd),
        safeToIso(r.ngay_kt)
      ]);
      const csvRows = data.map(r => r.map(v => '"' + String(v ?? '').replace(/"/g,'""') + '"').join(',')).join('\n');
      const csv = [headers.join(','), csvRows].filter(Boolean).join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="activities.csv"');
      return res.status(200).send('\uFEFF' + csv);
    } catch (e) {
      console.error('exportActivities error', e);
      return sendResponse(res, 500, ApiResponse.error(`Lỗi xuất hoạt động: ${e?.message || 'UNKNOWN'}`));
    }
  }

  static async exportRegistrations(req, res) {
    try {
      const { semester, hoc_ky, nam_hoc } = req.query || {};
      let activityWhere = {};
      if (semester) {
        const si = parseSemesterString(semester);
        if (!si) return sendResponse(res, 400, ApiResponse.error('Tham số học kỳ không hợp lệ'));
        activityWhere = buildSemesterFilter(semester, false);
      } else if (hoc_ky || nam_hoc) {
        activityWhere = { hoc_ky: hoc_ky || undefined, ...(nam_hoc ? { nam_hoc } : {}) };
      }

      const rows = await prisma.dangKyHoatDong.findMany({
        where: { hoat_dong: activityWhere },
        include: { sinh_vien: { include: { nguoi_dung: true } }, hoat_dong: true },
        orderBy: { ngay_dang_ky: 'desc' },
        take: 5000
      });
      const headers = ['SinhVien','Email','HoatDong','TrangThai','NgayDangKy'];
      const safeToIso = (d) => {
        if (!d) return '';
        try {
          if (typeof d === 'string') {
            const nd = new Date(d);
            return isNaN(nd.getTime()) ? '' : nd.toISOString();
          }
          if (d instanceof Date && !isNaN(d.getTime())) return d.toISOString();
          if (typeof d.toISOString === 'function') return d.toISOString();
          return '';
        } catch { return ''; }
      };
      const safe = (v) => v === null || v === undefined ? '' : v;
      const data = rows.map(r => [
        safe(r.sinh_vien?.nguoi_dung?.ho_ten),
        safe(r.sinh_vien?.nguoi_dung?.email),
        safe(r.hoat_dong?.ten_hd),
        safe(r.trang_thai_dk),
        safeToIso(r.ngay_dang_ky)
      ]);
      const csvRows = data.map(r => r.map(v => '"' + String(v ?? '').replace(/"/g,'""') + '"').join(',')).join('\n');
      const csv = [headers.join(','), csvRows].filter(Boolean).join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
      return res.status(200).send('\uFEFF' + csv);
    } catch (e) {
      console.error('exportRegistrations error', e);
      return sendResponse(res, 500, ApiResponse.error(`Lỗi xuất đăng ký: ${e?.message || 'UNKNOWN'}`));
    }
  }
}

module.exports = AdminReportsController;


