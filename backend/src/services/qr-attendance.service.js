const QRCode = require('qrcode');
const crypto = require('crypto');
const { prisma } = require('../libs/prisma');
const { logInfo, logError } = require('../utils/logger');

class QRAttendanceService {
  constructor() {
    this.secretKey = process.env.QR_SECRET_KEY || 'your-super-secret-qr-key';
  }

  // Generate QR attendance session for activity
  async createAttendanceSession(hdId, sessionData, userId) {
    try {
      const { ten_buoi, mo_ta, tg_bat_dau, tg_ket_thuc, ip_whitelist = [], gps_location, gps_radius = 100 } = sessionData;

      // Verify activity exists and user has permission
      const activity = await prisma.hoatDong.findFirst({
        where: { 
          id: hdId,
          OR: [
            { nguoi_tao_id: userId },
            { nguoi_tao: { vai_tro: { ten_vt: { in: ['ADMIN', 'GIANG_VIEN'] } } } }
          ]
        }
      });

      if (!activity) {
        throw new Error('Không tìm thấy hoạt động hoặc không có quyền truy cập');
      }

      // Generate QR data with signature
      const qrData = {
        sessionId: crypto.randomUUID(),
        hdId,
        ten_buoi,
        tg_bat_dau: new Date(tg_bat_dau).toISOString(),
        tg_ket_thuc: new Date(tg_ket_thuc).toISOString(),
        timestamp: Date.now()
      };

      // Create digital signature
      const signature = this.signQRData(qrData);
      const qrPayload = { ...qrData, signature };
      const qrCode = await QRCode.toDataURL(JSON.stringify(qrPayload));

      // Save attendance session
      const session = await prisma.attendanceSession.create({
        data: {
          id: qrData.sessionId,
          hd_id: hdId,
          ten_buoi,
          mo_ta,
          tg_bat_dau: new Date(tg_bat_dau),
          tg_ket_thuc: new Date(tg_ket_thuc),
          qr_code: qrCode,
          qr_signature: signature,
          ip_whitelist,
          gps_location,
          gps_radius
        }
      });

      logInfo('QR attendance session created', { sessionId: session.id, hdId });
      return session;

    } catch (error) {
      logError('Error creating attendance session', error);
      throw error;
    }
  }

  // Process QR scan for attendance
  async processQRScan(qrDataString, userInfo, clientInfo = {}) {
    try {
      const qrData = JSON.parse(qrDataString);
      const { sessionId, signature, hdId } = qrData;

      // Verify QR signature
      if (!this.verifyQRSignature(qrData, signature)) {
        throw new Error('QR code không hợp lệ hoặc đã bị thay đổi');
      }

      // Get session details
      const session = await prisma.attendanceSession.findUnique({
        where: { id: sessionId },
        include: { hoat_dong: true }
      });

      if (!session) {
        throw new Error('Phiên điểm danh không tồn tại');
      }

      // Check session status and time
      const now = new Date();
      if (session.trang_thai !== 'active') {
        throw new Error('Phiên điểm danh đã kết thúc');
      }

      if (now < session.tg_bat_dau) {
        throw new Error('Chưa đến giờ điểm danh');
      }

      if (now > session.tg_ket_thuc) {
        await prisma.attendanceSession.update({
          where: { id: sessionId },
          data: { trang_thai: 'expired' }
        });
        throw new Error('Đã hết thời gian điểm danh');
      }

      // Verify student registration
      const registration = await prisma.dangKyHoatDong.findFirst({
        where: {
          sv_id: userInfo.studentId,
          hd_id: hdId,
          trang_thai_dk: 'da_duyet'
        }
      });

      if (!registration) {
        throw new Error('Bạn chưa đăng ký tham gia hoạt động này');
      }

      // Check for duplicate attendance
      const existingAttendance = await prisma.qRAttendance.findFirst({
        where: {
          session_id: sessionId,
          sv_id: userInfo.studentId
        }
      });

      if (existingAttendance) {
        throw new Error('Bạn đã điểm danh cho phiên này rồi');
      }

      // Validate location if required
      if (session.gps_location && clientInfo.location) {
        const isWithinRadius = this.validateGPSLocation(
          session.gps_location,
          clientInfo.location,
          session.gps_radius
        );
        if (!isWithinRadius) {
          throw new Error(`Bạn phải ở trong phạm vi ${session.gps_radius}m từ địa điểm tổ chức`);
        }
      }

      // Validate IP if whitelist exists
      if (session.ip_whitelist.length > 0 && clientInfo.ip) {
        if (!session.ip_whitelist.includes(clientInfo.ip)) {
          throw new Error('IP address không được phép truy cập');
        }
      }

      // Create attendance record
      const attendance = await prisma.qRAttendance.create({
        data: {
          session_id: sessionId,
          sv_id: userInfo.studentId,
          hd_id: hdId,
          dia_chi_ip: clientInfo.ip,
          vi_tri_gps: clientInfo.location,
          device_info: clientInfo.deviceInfo || {},
          trang_thai: 'verified',
          verified_at: new Date()
        }
      });

      logInfo('QR attendance recorded', { 
        attendanceId: attendance.id, 
        studentId: userInfo.studentId, 
        sessionId 
      });

      return {
        success: true,
        message: 'Điểm danh thành công!',
        data: {
          attendanceId: attendance.id,
          sessionName: session.ten_buoi,
          activityName: session.hoat_dong.ten_hd,
          timestamp: attendance.tg_quet
        }
      };

    } catch (error) {
      logError('Error processing QR scan', error);
      throw error;
    }
  }

  // Get attendance sessions for an activity
  async getAttendanceSessions(hdId, userId) {
    try {
      const sessions = await prisma.attendanceSession.findMany({
        where: { hd_id: hdId },
        include: {
          qr_attendance: {
            include: {
              sinh_vien: {
                include: {
                  nguoi_dung: {
                    select: { ho_ten: true, email: true }
                  }
                }
              }
            }
          },
          hoat_dong: {
            select: { ten_hd: true, nguoi_tao_id: true }
          }
        },
        orderBy: { tg_bat_dau: 'desc' }
      });

      return sessions.map(session => ({
        ...session,
        attendanceCount: session.qr_attendance.length,
        canManage: session.hoat_dong.nguoi_tao_id === userId
      }));

    } catch (error) {
      logError('Error getting attendance sessions', error);
      throw error;
    }
  }

  // Helper: Sign QR data
  signQRData(data) {
    const payload = JSON.stringify({
      sessionId: data.sessionId,
      hdId: data.hdId,
      tg_bat_dau: data.tg_bat_dau,
      tg_ket_thuc: data.tg_ket_thuc,
      timestamp: data.timestamp
    });
    
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex');
  }

  // Helper: Verify QR signature
  verifyQRSignature(data, signature) {
    const expectedSignature = this.signQRData(data);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  // Helper: Validate GPS location
  validateGPSLocation(sessionLocation, userLocation, radiusMeters) {
    try {
      const [sessionLat, sessionLng] = sessionLocation.split(',').map(Number);
      const [userLat, userLng] = userLocation.split(',').map(Number);

      const R = 6371e3; // Earth's radius in meters
      const φ1 = sessionLat * Math.PI / 180;
      const φ2 = userLat * Math.PI / 180;
      const Δφ = (userLat - sessionLat) * Math.PI / 180;
      const Δλ = (userLng - sessionLng) * Math.PI / 180;

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      return distance <= radiusMeters;
    } catch (error) {
      logError('Error validating GPS location', error);
      return false;
    }
  }

  // Update session status
  async updateSessionStatus(sessionId, status, userId) {
    try {
      const session = await prisma.attendanceSession.findUnique({
        where: { id: sessionId },
        include: { hoat_dong: true }
      });

      if (!session) {
        throw new Error('Phiên điểm danh không tồn tại');
      }

      if (session.hoat_dong.nguoi_tao_id !== userId) {
        throw new Error('Không có quyền cập nhật phiên điểm danh này');
      }

      const updatedSession = await prisma.attendanceSession.update({
        where: { id: sessionId },
        data: { trang_thai: status }
      });

      logInfo('Attendance session status updated', { sessionId, status });
      return updatedSession;

    } catch (error) {
      logError('Error updating session status', error);
      throw error;
    }
  }
}

module.exports = new QRAttendanceService();