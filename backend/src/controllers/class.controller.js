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

      // For demo, get all students - in real app, filter by class
      const students = await prisma.sinhVien.findMany({
        include: {
          nguoi_dung: {
            select: {
              ho_ten: true,
              email: true
            }
          },
          lop: {
            select: {
              ten_lop: true,
              khoa: true
            }
          }
        },
        take: 50 // Limit for performance
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
        where: { id: registrationId }
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
        where: { id: registrationId }
      });

      if (!registration) {
        return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy đăng ký'));
      }

      await prisma.dangKyHoatDong.update({
        where: { id: registrationId },
        data: {
          trang_thai_dk: 'tu_choi',
          ghi_chu: reason || 'Bị từ chối',
          ngay_duyet: new Date()
        }
      });

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
          include: { hoat_dong: { select: { diem_rl: true, ngay_bd: true, loai_hd: { select: { ten_loai_hd: true } } } }, sinh_vien: { select: { id: true, mssv: true, nguoi_dung: { select: { ho_ten: true } } } } }
        })
      ]);

      const totalPoints = regs.filter(r => r.trang_thai_dk === 'da_tham_gia').reduce((s, r) => s + (r.hoat_dong?.diem_rl || 0), 0);
      const avgPoints = totalStudents > 0 ? totalPoints / totalStudents : 0;
      const uniqueParticipants = new Set(regs.filter(r => ['da_duyet','da_tham_gia'].includes(r.trang_thai_dk)).map(r => r.sinh_vien.id)).size;
      const participationRate = totalStudents > 0 ? (uniqueParticipants / totalStudents) * 100 : 0;

      // Monthly activities
      const monthKey = d => `${d.getFullYear()}-${d.getMonth()+1}`;
      const monthlyMap = new Map();
      regs.forEach(r => {
        const d = r.hoat_dong?.ngay_bd ? new Date(r.hoat_dong.ngay_bd) : now;
        const key = monthKey(d);
        const val = monthlyMap.get(key) || { month: `T${d.getMonth()+1}/${d.getFullYear()}`, activities: 0, participants: 0 };
        val.activities += 1;
        if (['da_duyet','da_tham_gia'].includes(r.trang_thai_dk)) val.participants += 1;
        monthlyMap.set(key, val);
      });
      const monthlyActivities = Array.from(monthlyMap.values()).sort((a,b)=>a.month.localeCompare(b.month));

      // Activity types distribution
      const typeMap = new Map();
      regs.forEach(r => {
        const name = r.hoat_dong?.loai_hd?.ten_loai_hd || 'Khác';
        const cur = typeMap.get(name) || { name, count: 0, points: 0 };
        cur.count += 1; cur.points += Number(r.hoat_dong?.diem_rl || 0);
        typeMap.set(name, cur);
      });
      const activityTypes = Array.from(typeMap.values());

      // Top students by points in range
      const studentPoints = new Map();
      regs.filter(r => r.trang_thai_dk === 'da_tham_gia').forEach(r => {
        const id = r.sinh_vien.id;
        const cur = studentPoints.get(id) || { id, name: r.sinh_vien.nguoi_dung?.ho_ten || '', mssv: r.sinh_vien.mssv, points: 0, activities: 0 };
        cur.points += Number(r.hoat_dong?.diem_rl || 0);
        cur.activities += 1;
        studentPoints.set(id, cur);
      });
      const topStudents = Array.from(studentPoints.values()).sort((a,b)=>b.points-a.points).slice(0,5).map((s,idx)=>({ rank: idx+1, name: s.name, mssv: s.mssv, points: s.points, activities: s.activities }));

      const reportData = {
        overview: {
          totalStudents,
          totalActivities,
          avgPoints: parseFloat(avgPoints.toFixed(1)),
          participationRate: parseFloat(participationRate.toFixed(1))
        },
        monthlyActivities,
        pointsDistribution: [],
        activityTypes,
        topStudents,
        attendanceRate: []
      };

  return sendResponse(res, 200, ApiResponse.success(reportData, 'Báo cáo thống kê lớp'));

    } catch (error) {
      logError('Error getting class reports', error, { userId: req.user?.sub });
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy báo cáo thống kê'));
    }
  }
}

module.exports = ClassController;