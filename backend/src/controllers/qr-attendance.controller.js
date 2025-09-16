const qrAttendanceService = require('../services/qr-attendance.service');
const autoPointCalculationService = require('../services/auto-point-calculation.service');
const { sendResponse } = require('../utils/response');
const { logInfo, logError } = require('../utils/logger');
const { prisma } = require('../libs/prisma');

class QRAttendanceController {
  // POST /api/attendance/sessions - Create QR attendance session
  async createAttendanceSession(req, res) {
    try {
      const { hdId } = req.params;
      const userId = req.user.sub;
      const sessionData = req.body;

      const session = await qrAttendanceService.createAttendanceSession(hdId, sessionData, userId);
      
      sendResponse(res, 201, 'Tạo phiên điểm danh thành công', session);
    } catch (error) {
      logError('Create attendance session error', error);
      sendResponse(res, 400, error.message);
    }
  }

  // GET /api/attendance/sessions/:hdId - Get attendance sessions for activity
  async getAttendanceSessions(req, res) {
    try {
      const { hdId } = req.params;
      const userId = req.user.sub;

      const sessions = await qrAttendanceService.getAttendanceSessions(hdId, userId);
      
      sendResponse(res, 200, 'Lấy danh sách phiên điểm danh thành công', sessions);
    } catch (error) {
      logError('Get attendance sessions error', error);
      sendResponse(res, 400, error.message);
    }
  }

  // POST /api/attendance/scan - Process QR scan
  async processQRScan(req, res) {
    try {
      const { qrData } = req.body;
      const userId = req.user.sub;
      
      // Get student info from user
      const userInfo = {
        userId,
        studentId: req.user.studentId || userId // Assuming student relation exists
      };

      // Get client info
      const clientInfo = {
        ip: req.ip || req.connection.remoteAddress,
        location: req.body.location, // GPS coordinates as "lat,lng"
        deviceInfo: {
          userAgent: req.get('User-Agent'),
          timestamp: Date.now()
        }
      };

      const result = await qrAttendanceService.processQRScan(qrData, userInfo, clientInfo);
      
      sendResponse(res, 200, result.message, result.data);
    } catch (error) {
      logError('QR scan error', error);
      sendResponse(res, 400, error.message);
    }
  }

  // PUT /api/attendance/sessions/:sessionId/status - Update session status
  async updateSessionStatus(req, res) {
    try {
      const { sessionId } = req.params;
      const { status } = req.body;
      const userId = req.user.sub;

      const session = await qrAttendanceService.updateSessionStatus(sessionId, status, userId);
      
      sendResponse(res, 200, 'Cập nhật trạng thái phiên điểm danh thành công', session);
    } catch (error) {
      logError('Update session status error', error);
      sendResponse(res, 400, error.message);
    }
  }

  // GET /api/attendance/sessions/:sessionId/attendances - Get attendance list for session
  async getSessionAttendances(req, res) {
    try {
      const { sessionId } = req.params;
      
      const attendances = await prisma.qRAttendance.findMany({
        where: { session_id: sessionId },
        include: {
          sinh_vien: {
            include: {
              nguoi_dung: {
                select: { ho_ten: true, email: true }
              }
            }
          },
          session: {
            select: { ten_buoi: true, hoat_dong: { select: { ten_hd: true } } }
          }
        },
        orderBy: { tg_quet: 'desc' }
      });

      const formattedAttendances = attendances.map(att => ({
        id: att.id,
        studentName: att.sinh_vien.nguoi_dung.ho_ten,
        studentEmail: att.sinh_vien.nguoi_dung.email,
        mssv: att.sinh_vien.mssv,
        scanTime: att.tg_quet,
        status: att.trang_thai,
        ipAddress: att.dia_chi_ip,
        location: att.vi_tri_gps,
        pointsAwarded: att.points_awarded
      }));

      sendResponse(res, 200, 'Lấy danh sách điểm danh thành công', formattedAttendances);
    } catch (error) {
      logError('Get session attendances error', error);
      sendResponse(res, 400, error.message);
    }
  }

  // GET /api/attendance/my-attendances - Get student's attendance history
  async getMyAttendances(req, res) {
    try {
      const userId = req.user.sub;
      
      // Get student ID
      const student = await prisma.sinhVien.findFirst({
        where: { nguoi_dung_id: userId }
      });

      if (!student) {
        return sendResponse(res, 404, 'Không tìm thấy thông tin sinh viên');
      }

      const attendances = await prisma.qRAttendance.findMany({
        where: { sv_id: student.id },
        include: {
          session: {
            include: {
              hoat_dong: {
                select: { ten_hd: true, diem_rl: true }
              }
            }
          }
        },
        orderBy: { tg_quet: 'desc' }
      });

      const formattedAttendances = attendances.map(att => ({
        id: att.id,
        sessionName: att.session.ten_buoi,
        activityName: att.session.hoat_dong.ten_hd,
        activityPoints: att.session.hoat_dong.diem_rl,
        scanTime: att.tg_quet,
        status: att.trang_thai,
        pointsAwarded: att.points_awarded,
        pointsAwardedAt: att.points_awarded_at
      }));

      sendResponse(res, 200, 'Lấy lịch sử điểm danh thành công', formattedAttendances);
    } catch (error) {
      logError('Get my attendances error', error);
      sendResponse(res, 400, error.message);
    }
  }

  // POST /api/attendance/calculate-points/:hdId - Manual trigger point calculation
  async calculatePoints(req, res) {
    try {
      const { hdId } = req.params;
      const userId = req.user.sub;

      const result = await autoPointCalculationService.triggerManualCalculation(hdId, userId);
      
      sendResponse(res, 200, 'Tính điểm thành công', result);
    } catch (error) {
      logError('Manual point calculation error', error);
      sendResponse(res, 400, error.message);
    }
  }

  // GET /api/attendance/calculation-status/:hdId - Get calculation status
  async getCalculationStatus(req, res) {
    try {
      const { hdId } = req.params;

      const status = await autoPointCalculationService.getCalculationStatus(hdId);
      
      sendResponse(res, 200, 'Lấy trạng thái tính điểm thành công', status);
    } catch (error) {
      logError('Get calculation status error', error);
      sendResponse(res, 400, error.message);
    }
  }
}

module.exports = new QRAttendanceController();