const { prisma } = require('../libs/prisma');
const { ApiResponse, sendResponse } = require('../utils/response');

class AdminReportsController {
  static async overview(req, res) {
    try {
      const [byStatus, topActivities, dailyRegs] = await Promise.all([
        prisma.hoatDong.groupBy({ by: ['trang_thai'], _count: { _all: true } }),
        prisma.hoatDong.findMany({
          select: { id: true, ten_hd: true, ngay_bd: true, dang_ky_hd: { select: { id: true } } },
          orderBy: { ngay_bd: 'desc' },
          take: 20
        }),
        prisma.dangKyHoatDong.groupBy({
          by: ['ngay_dang_ky'],
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
      const rows = await prisma.hoatDong.findMany({
        include: { loai_hd: true },
        orderBy: { ngay_bd: 'desc' }
      });
      const headers = ['Ma','Ten','Loai','DiemRL','TrangThai','NgayBD','NgayKT'];
      const data = rows.map(r => [r.ma_hd || '', r.ten_hd, r.loai_hd?.ten_loai_hd || '', r.diem_rl, r.trang_thai, r.ngay_bd?.toISOString?.() || '', r.ngay_kt?.toISOString?.() || '']);
      const csv = [headers.join(','), ...data.map(r => r.map(v => '"' + String(v ?? '').replace(/"/g,'""') + '"').join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="activities.csv"');
      return res.status(200).send('\uFEFF' + csv);
    } catch (e) {
      return sendResponse(res, 500, ApiResponse.error('Lỗi xuất hoạt động'));
    }
  }

  static async exportRegistrations(req, res) {
    try {
      const rows = await prisma.dangKyHoatDong.findMany({
        include: { sinh_vien: { include: { nguoi_dung: true } }, hoat_dong: true },
        orderBy: { ngay_dang_ky: 'desc' },
        take: 5000
      });
      const headers = ['SinhVien','Email','HoatDong','TrangThai','NgayDangKy'];
      const data = rows.map(r => [r.sinh_vien?.nguoi_dung?.ho_ten || '', r.sinh_vien?.nguoi_dung?.email || '', r.hoat_dong?.ten_hd || '', r.trang_thai_dk, r.ngay_dang_ky?.toISOString?.() || '']);
      const csv = [headers.join(','), ...data.map(r => r.map(v => '"' + String(v ?? '').replace(/"/g,'""') + '"').join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
      return res.status(200).send('\uFEFF' + csv);
    } catch (e) {
      return sendResponse(res, 500, ApiResponse.error('Lỗi xuất đăng ký'));
    }
  }
}

module.exports = AdminReportsController;


