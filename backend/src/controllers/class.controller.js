const { PrismaClient } = require('@prisma/client');
const { ApiResponse, sendResponse } = require('../utils/response');
const { logInfo, logError } = require('../utils/logger');

const prisma = new PrismaClient();

class ClassController {
  // Get students in class
  static async getClassStudents(req, res) {
    try {
      const userId = req.user?.sub;
      const userRole = req.user?.role;

      logInfo('Getting class students', { userId, userRole });

      // Find the current user (class monitor) to get their class ID
      const monitor = await prisma.sinhVien.findFirst({
        where: {
          nguoi_dung_id: userId,
        },
        select: {
          lop_id: true,
        },
      });

      if (!monitor || !monitor.lop_id) {
        logError('Monitor not found or not assigned to a class', { userId });
        return sendResponse(res, 404, ApiResponse.error('Không tìm thấy thông tin lớp của bạn'));
      }

      const classId = monitor.lop_id;

      // Get all students in the same class as the monitor
      const students = await prisma.sinhVien.findMany({
        where: {
          lop_id: classId, // Filter by the monitor's class ID
        },
        include: {
          nguoi_dung: {
            select: {
              ho_ten: true,
              email: true,
            },
          },
          lop: {
            select: {
              ten_lop: true,
              khoa: true,
            },
          },
        },
      });

      // Calculate points for each student
      const studentsWithPoints = await Promise.all(
        students.map(async (student) => {
          // Get student's activities and points
          const registrations = await prisma.dangKyHoatDong.findMany({
            where: {
              sv_id: student.id,
              trang_thai_dk: {
                in: ['da_tham_gia', 'da_duyet']
              }
            },
            include: {
              hoat_dong: {
                select: {
                  diem_rl: true
                }
              }
            }
          });

          const totalPoints = registrations.reduce((sum, reg) => 
            sum + Number(reg.hoat_dong?.diem_rl || 0), 0
          );

          const activitiesJoined = registrations.length;

          // Ensure totalPoints is a valid number
          const validTotalPoints = isNaN(totalPoints) ? 0 : Math.max(0, totalPoints);

          // Calculate status based on points
          let status = 'active';
          if (validTotalPoints < 30) status = 'critical';
          else if (validTotalPoints < 50) status = 'warning';

          return {
            id: student.id,
            mssv: student.mssv,
            nguoi_dung: {
              ...student.nguoi_dung,
              sdt: student.sdt // Phone number is in SinhVien model
            },
            lop: student.lop,
            totalPoints: validTotalPoints,
            activitiesJoined,
            lastActivityDate: registrations.length > 0 
              ? registrations[registrations.length - 1].ngay_dang_ky 
              : null,
            rank: 0, // Will be calculated after sorting
            gpa: parseFloat((Math.random() * 2 + 2).toFixed(1)), // Mock GPA
            academicYear: '2021-2025',
            status
          };
        })
      );

      // Sort by points and assign ranks
      studentsWithPoints.sort((a, b) => b.totalPoints - a.totalPoints);
      studentsWithPoints.forEach((student, index) => {
        student.rank = index + 1;
      });

      return sendResponse(res, 200, ApiResponse.success(
        studentsWithPoints,
        'Danh sách sinh viên lớp'
      ));

    } catch (error) {
      logError('Error getting class students', error, { userId: req.user?.sub });
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách sinh viên'));
    }
  }

  // Get pending registrations for approval
  static async getPendingRegistrations(req, res) {
    try {
      const userId = req.user?.sub;
      const userRole = req.user?.role;

      logInfo('Getting pending registrations', { userId, userRole });

      const registrations = await prisma.dangKyHoatDong.findMany({
        where: {
          trang_thai_dk: 'cho_duyet'
        },
        include: {
          sinh_vien: {
            include: {
              nguoi_dung: {
                select: {
                  ho_ten: true,
                  email: true
                }
              }
            }
          },
          hoat_dong: {
            select: {
              ten_hd: true,
              ngay_bd: true,
              diem_rl: true,
              dia_diem: true
            }
          }
        },
        orderBy: {
          ngay_dang_ky: 'desc'
        },
        take: 100 // Limit for performance
      });

      return sendResponse(res, 200, ApiResponse.success(
        registrations,
        'Danh sách đăng ký chờ duyệt'
      ));

    } catch (error) {
      logError('Error getting pending registrations', error, { userId: req.user?.sub });
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách đăng ký'));
    }
  }

  // Approve registration
  static async approveRegistration(req, res) {
    try {
      const { registrationId } = req.params;
      const userId = req.user?.sub;

      logInfo('Approving registration', { registrationId, userId });

      const registration = await prisma.dangKyHoatDong.findUnique({
        where: { id: registrationId },
        include: {
          sinh_vien: { include: { nguoi_dung: true } },
          hoat_dong: { select: { ten_hd: true } }
        }
      });

      if (!registration) {
        return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy đăng ký'));
      }

      await prisma.dangKyHoatDong.update({
        where: { id: registrationId },
        data: {
          trang_thai_dk: 'da_duyet',
          ngay_duyet: new Date()
        }
      });

      // Notify student that their registration has been approved
      try {
        const loai = await prisma.loaiThongBao.findFirst({ where: { ten_loai_tb: 'Hoạt động' } }).catch(() => null);
        const loaiId = loai?.id || (await prisma.loaiThongBao.findFirst().catch(() => null))?.id;
        const recipientId = registration?.sinh_vien?.nguoi_dung_id;
        if (loaiId && recipientId) {
          await prisma.thongBao.create({
            data: {
              tieu_de: 'Đăng ký đã được phê duyệt',
              noi_dung: `Bạn đã được phê duyệt tham gia hoạt động "${registration?.hoat_dong?.ten_hd || ''}"`,
              loai_tb_id: loaiId,
              nguoi_gui_id: userId,
              nguoi_nhan_id: recipientId,
              muc_do_uu_tien: 'trung_binh',
              phuong_thuc_gui: 'trong_he_thong'
            }
          }).catch(() => null);
        }
      } catch (e) {
        logError('Notify student on class approval error', e, { registrationId, by: userId });
      }

      return sendResponse(res, 200, ApiResponse.success(null, 'Phê duyệt đăng ký thành công'));

    } catch (error) {
      logError('Error approving registration', error, { 
        registrationId: req.params.registrationId,
        userId: req.user?.sub 
      });
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi phê duyệt đăng ký'));
    }
  }

  // Reject registration
  static async rejectRegistration(req, res) {
    try {
      const { registrationId } = req.params;
      const { reason } = req.body;
      const userId = req.user?.sub;

      logInfo('Rejecting registration', { registrationId, reason, userId });

      const registration = await prisma.dangKyHoatDong.findUnique({
        where: { id: registrationId },
        include: {
          sinh_vien: { include: { nguoi_dung: true } },
          hoat_dong: { select: { ten_hd: true } }
        }
      });

      if (!registration) {
        return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy đăng ký'));
      }

      await prisma.dangKyHoatDong.update({
        where: { id: registrationId },
        data: {
          trang_thai_dk: 'tu_choi',
          ly_do_tu_choi: reason || 'Bị từ chối',
          ngay_duyet: new Date()
        }
      });

      // Notify student that their registration has been rejected
      try {
        const loai = await prisma.loaiThongBao.findFirst({ where: { ten_loai_tb: 'Hoạt động' } }).catch(() => null);
        const loaiId = loai?.id || (await prisma.loaiThongBao.findFirst().catch(() => null))?.id;
        const recipientId = registration?.sinh_vien?.nguoi_dung_id;
        if (loaiId && recipientId) {
          await prisma.thongBao.create({
            data: {
              tieu_de: 'Đăng ký bị từ chối',
              noi_dung: `Đăng ký tham gia hoạt động "${registration?.hoat_dong?.ten_hd || ''}" đã bị từ chối. Lý do: ${reason || 'Không đủ điều kiện tham gia'}`,
              loai_tb_id: loaiId,
              nguoi_gui_id: userId,
              nguoi_nhan_id: recipientId,
              muc_do_uu_tien: 'trung_binh',
              phuong_thuc_gui: 'trong_he_thong'
            }
          }).catch(() => null);
        }
      } catch (e) {
        logError('Notify student on class rejection error', e, { registrationId, by: userId });
      }

      return sendResponse(res, 200, ApiResponse.success(null, 'Từ chối đăng ký thành công'));

    } catch (error) {
      logError('Error rejecting registration', error, { 
        registrationId: req.params.registrationId,
        userId: req.user?.sub 
      });
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi từ chối đăng ký'));
    }
  }

  // Get class reports (real aggregates from Prisma)
  static async getClassReports(req, res) {
    try {
      const { timeRange = 'semester' } = req.query;
      const userId = req.user?.sub;

      logInfo('Getting class reports', { timeRange, userId });

      // Date range
      const now = new Date();
      let startDate;
      switch (timeRange) {
        case 'year':
          startDate = new Date(now.getFullYear() - 1, 8, 1);
          break;
        case 'all':
          startDate = new Date(2020, 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - 4, 1);
      }

      // Overview
      const [totalActivities, totalStudents, regs] = await Promise.all([
        prisma.hoatDong.count({ where: { ngay_bd: { gte: startDate } } }),
        prisma.sinhVien.count(),
        prisma.dangKyHoatDong.findMany({
          where: { hoat_dong: { ngay_bd: { gte: startDate } } },
          include: {
            hoat_dong: {
              select: {
                id: true,
                diem_rl: true,
                ngay_bd: true,
                loai_hd: { select: { ten_loai_hd: true } }
              }
            },
            sinh_vien: { select: { id: true, mssv: true, nguoi_dung: { select: { ho_ten: true } } } }
          }
        })
      ]);

      const totalPoints = regs.filter(r => r.trang_thai_dk === 'da_tham_gia').reduce((s, r) => s + (r.hoat_dong?.diem_rl || 0), 0);
      const avgPoints = totalStudents > 0 ? totalPoints / totalStudents : 0;
      const uniqueParticipants = new Set(regs.filter(r => ['da_duyet','da_tham_gia'].includes(r.trang_thai_dk)).map(r => r.sinh_vien.id)).size;
      const participationRate = totalStudents > 0 ? (uniqueParticipants / totalStudents) * 100 : 0;

      // Monthly activities (distinct activities per month) and monthly attendance rate (unique participants per month)
      const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthlyActivityIds = new Map(); // key -> Set(activityId)
      const monthlyParticipantSets = new Map(); // key -> Set(studentId)
      regs.forEach(r => {
        const d = r.hoat_dong?.ngay_bd ? new Date(r.hoat_dong.ngay_bd) : now;
        const key = monthKey(d);
        if (!monthlyActivityIds.has(key)) monthlyActivityIds.set(key, new Set());
        if (r.hoat_dong?.id) monthlyActivityIds.get(key).add(r.hoat_dong.id);
        if (!monthlyParticipantSets.has(key)) monthlyParticipantSets.set(key, new Set());
        if (r.trang_thai_dk === 'da_tham_gia') monthlyParticipantSets.get(key).add(r.sinh_vien.id);
      });
      const monthlyActivities = Array.from(monthlyActivityIds.keys()).sort().map(key => {
        const [year, mm] = key.split('-');
        const monthNumber = parseInt(mm, 10);
        const label = `T${monthNumber}/${year}`;
        const activities = monthlyActivityIds.get(key)?.size || 0;
        const participants = monthlyParticipantSets.get(key)?.size || 0;
        return { month: label, activities, participants };
      });

      // Activity types distribution (distinct activities per type)
      const activitiesById = new Map(); // activityId -> { typeName, diem_rl }
      regs.forEach(r => {
        const id = r.hoat_dong?.id;
        if (!id) return;
        if (!activitiesById.has(id)) {
          activitiesById.set(id, {
            typeName: r.hoat_dong?.loai_hd?.ten_loai_hd || 'Khác',
            diem_rl: Number(r.hoat_dong?.diem_rl || 0)
          });
        }
      });
      const typeAgg = new Map(); // typeName -> { name, count, points }
      activitiesById.forEach(({ typeName, diem_rl }) => {
        const cur = typeAgg.get(typeName) || { name: typeName, count: 0, points: 0 };
        cur.count += 1;
        cur.points += diem_rl;
        typeAgg.set(typeName, cur);
      });
      const activityTypes = Array.from(typeAgg.values());

      // Top students by points in range (attended only)
      const studentPoints = new Map();
      regs.filter(r => r.trang_thai_dk === 'da_tham_gia').forEach(r => {
        const id = r.sinh_vien.id;
        const cur = studentPoints.get(id) || { id, name: r.sinh_vien.nguoi_dung?.ho_ten || '', mssv: r.sinh_vien.mssv, points: 0, activities: 0 };
        cur.points += Number(r.hoat_dong?.diem_rl || 0);
        cur.activities += 1;
        studentPoints.set(id, cur);
      });
      const topStudents = Array.from(studentPoints.values()).sort((a,b)=>b.points-a.points).slice(0,5).map((s,idx)=>({ rank: idx+1, name: s.name, mssv: s.mssv, points: s.points, activities: s.activities }));

      // Points distribution across students (bins)
      const bins = [
        { range: '0-20', min: 0, max: 20 },
        { range: '21-40', min: 21, max: 40 },
        { range: '41-60', min: 41, max: 60 },
        { range: '61-80', min: 61, max: 80 },
        { range: '81-100', min: 81, max: 100 }
      ];
      const binCounts = bins.map(() => 0);
      const studentsWithPoints = Array.from(studentPoints.values());
      studentsWithPoints.forEach(s => {
        const p = Math.max(0, Math.min(100, Math.round(s.points)));
        const idx = bins.findIndex(b => p >= b.min && p <= b.max);
        if (idx >= 0) binCounts[idx] += 1;
      });
      const participantsCount = new Set(regs.filter(r => r.trang_thai_dk === 'da_tham_gia').map(r => r.sinh_vien.id)).size;
      const nonParticipants = Math.max(0, totalStudents - participantsCount);
      // Add non-participants (0 points) to the lowest bin
      binCounts[0] += nonParticipants;
      const pointsDistribution = bins.map((b, i) => ({
        range: b.range,
        count: binCounts[i],
        percentage: totalStudents > 0 ? parseFloat(((binCounts[i] / totalStudents) * 100).toFixed(1)) : 0
      }));

      // Attendance rate per month (unique attendees / total students)
      const attendanceRate = Array.from(monthlyParticipantSets.keys()).sort().map(key => {
        const mmSet = monthlyParticipantSets.get(key) || new Set();
        const monthNumber = parseInt(key.split('-')[1], 10);
        return {
          month: `T${monthNumber}`,
          rate: totalStudents > 0 ? Math.round((mmSet.size / totalStudents) * 100) : 0
        };
      });

      const reportData = {
        overview: {
          totalStudents,
          totalActivities,
          avgPoints: parseFloat(avgPoints.toFixed(1)),
          participationRate: parseFloat(participationRate.toFixed(1))
        },
        monthlyActivities,
        pointsDistribution,
        activityTypes,
        topStudents,
        attendanceRate
      };

  return sendResponse(res, 200, ApiResponse.success(reportData, 'Báo cáo thống kê lớp'));

    } catch (error) {
      logError('Error getting class reports', error, { userId: req.user?.sub });
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy báo cáo thống kê'));
    }
  }
}

module.exports = ClassController;