const { prisma } = require('../libs/prisma');
const { ApiResponse, sendResponse } = require('../utils/response');
const { logError, logInfo } = require('../utils/logger');

class AdminRegistrationsController {
  static async list(req, res) {
    try {
      const { page = 1, limit = 20, status = 'cho_duyet', search, hoc_ky, nam_hoc, activityId } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = {
        ...(status ? { trang_thai_dk: status } : {}),
        ...(activityId ? { hd_id: activityId } : {}),
        ...(hoc_ky ? { hoat_dong: { hoc_ky } } : {}),
        ...(nam_hoc ? { hoat_dong: { nam_hoc } } : {}),
        ...(search
          ? {
              OR: [
                { sinh_vien: { nguoi_dung: { ho_ten: { contains: search, mode: 'insensitive' } } } },
                { hoat_dong: { ten_hd: { contains: search, mode: 'insensitive' } } }
              ]
            }
          : {})
      };

      const [items, total] = await Promise.all([
        prisma.dangKyHoatDong.findMany({
          where,
          include: {
            sinh_vien: { include: { nguoi_dung: true, lop: true } },
            hoat_dong: true
          },
          orderBy: { ngay_dang_ky: 'desc' },
          skip,
          take: parseInt(limit)
        }),
        prisma.dangKyHoatDong.count({ where })
      ]);

      return sendResponse(
        res,
        200,
        ApiResponse.success({ items, total, page: parseInt(page), limit: parseInt(limit) }, 'Lấy danh sách đăng ký thành công')
      );
    } catch (error) {
      logError('AdminRegistrationsController.list error', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách đăng ký'));
    }
  }

  static async approve(req, res) {
    try {
      const { id } = req.params;
      const updated = await prisma.dangKyHoatDong.update({
        where: { id },
        data: { trang_thai_dk: 'da_duyet', ly_do_tu_choi: null, ngay_duyet: new Date() }
      });
      logInfo('Admin approved registration', { id, by: req.user?.sub });
      return sendResponse(res, 200, ApiResponse.success(updated, 'Phê duyệt đăng ký thành công'));
    } catch (error) {
      logError('AdminRegistrationsController.approve error', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi phê duyệt đăng ký'));
    }
  }

  static async reject(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};
      const updated = await prisma.dangKyHoatDong.update({
        where: { id },
        data: { trang_thai_dk: 'tu_choi', ly_do_tu_choi: reason || null, ngay_duyet: new Date() }
      });
      logInfo('Admin rejected registration', { id, by: req.user?.sub });
      return sendResponse(res, 200, ApiResponse.success(updated, 'Từ chối đăng ký thành công'));
    } catch (error) {
      logError('AdminRegistrationsController.reject error', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi từ chối đăng ký'));
    }
  }

  static async bulkUpdate(req, res) {
    try {
      const { ids = [], action, reason } = req.body || {};
      if (!Array.isArray(ids) || ids.length === 0) {
        return sendResponse(res, 400, ApiResponse.error('Danh sách ID trống'));
      }
      if (!['approve', 'reject'].includes(action)) {
        return sendResponse(res, 400, ApiResponse.error('Hành động không hợp lệ'));
      }
      const data = action === 'approve'
        ? { trang_thai_dk: 'da_duyet', ly_do_tu_choi: null, ngay_duyet: new Date() }
        : { trang_thai_dk: 'tu_choi', ly_do_tu_choi: reason || null, ngay_duyet: new Date() };
      const result = await prisma.dangKyHoatDong.updateMany({ where: { id: { in: ids } }, data });
      return sendResponse(res, 200, ApiResponse.success({ updated: result.count }, 'Cập nhật hàng loạt thành công'));
    } catch (error) {
      return sendResponse(res, 500, ApiResponse.error('Lỗi cập nhật hàng loạt'));
    }
  }
}

module.exports = AdminRegistrationsController;


