const cron = require('node-cron');
const { prisma } = require('../libs/prisma');
const { logInfo, logError } = require('../utils/logger');

class AutoPointCalculationService {
  constructor() {
    this.isInitialized = false;
  }

  // Initialize scheduler
  init() {
    if (this.isInitialized) return;

    // Run every hour to check for completed activities
    cron.schedule('0 * * * *', () => {
      this.processCompletedActivities();
    });

    // Run every 30 minutes to retry failed calculations
    cron.schedule('*/30 * * * *', () => {
      this.retryFailedCalculations();
    });

    this.isInitialized = true;
    logInfo('Auto point calculation scheduler initialized');
  }

  // Process activities that have ended and calculate points
  async processCompletedActivities() {
    try {
      logInfo('Starting auto point calculation for completed activities');

      const now = new Date();
      
      // Find activities that have ended but haven't had points calculated
      const completedActivities = await prisma.hoatDong.findMany({
        where: {
          ngay_kt: { lt: now },
          trang_thai: 'da_duyet',
          auto_point_calculations: {
            none: {
              is_completed: true
            }
          }
        },
        include: {
          qr_attendance: {
            where: {
              trang_thai: 'verified',
              points_awarded: null
            },
            include: {
              sinh_vien: true
            }
          },
          auto_point_calculations: true
        }
      });

      logInfo(`Found ${completedActivities.length} activities ready for point calculation`);

      for (const activity of completedActivities) {
        await this.calculatePointsForActivity(activity);
      }

      logInfo('Auto point calculation completed');

    } catch (error) {
      logError('Error in auto point calculation', error);
    }
  }

  // Calculate points for a specific activity
  async calculatePointsForActivity(activity) {
    try {
      logInfo(`Calculating points for activity: ${activity.ten_hd} (${activity.id})`);

      // Check if calculation already exists and is not completed
      let calculation = activity.auto_point_calculations.find(calc => !calc.is_completed);

      if (!calculation) {
        calculation = await prisma.autoPointCalculation.create({
          data: {
            hd_id: activity.id,
            total_attendees: activity.qr_attendance.length,
            points_distributed: 0
          }
        });
      }

      const attendanceRecords = activity.qr_attendance;
      let totalPointsDistributed = 0;
      let successfulUpdates = 0;

      // Award points to each verified attendee
      for (const attendance of attendanceRecords) {
        try {
          const pointsToAward = activity.diem_rl; // Use activity's point value

          // Update attendance record with points
          await prisma.qRAttendance.update({
            where: { id: attendance.id },
            data: {
              points_awarded: pointsToAward,
              points_awarded_at: new Date()
            }
          });

          // Create notification for student
          await this.createPointAwardNotification(attendance.sinh_vien, activity, pointsToAward);

          totalPointsDistributed += parseFloat(pointsToAward);
          successfulUpdates++;

        } catch (error) {
          logError(`Error awarding points to student ${attendance.sv_id}`, error);
        }
      }

      // Update calculation record
      await prisma.autoPointCalculation.update({
        where: { id: calculation.id },
        data: {
          total_attendees: attendanceRecords.length,
          points_distributed: totalPointsDistributed,
          is_completed: successfulUpdates === attendanceRecords.length,
          error_log: successfulUpdates !== attendanceRecords.length ? 
            `Only ${successfulUpdates}/${attendanceRecords.length} students received points` : null
        }
      });

      logInfo(`Points calculation completed for activity ${activity.id}`, {
        totalAttendees: attendanceRecords.length,
        successfulUpdates,
        totalPointsDistributed
      });

      return {
        success: true,
        totalAttendees: attendanceRecords.length,
        successfulUpdates,
        totalPointsDistributed
      };

    } catch (error) {
      logError(`Error calculating points for activity ${activity.id}`, error);
      
      // Update calculation with error
      if (calculation) {
        await prisma.autoPointCalculation.update({
          where: { id: calculation.id },
          data: {
            error_log: error.message,
            retry_count: { increment: 1 }
          }
        });
      }

      throw error;
    }
  }

  // Retry failed calculations
  async retryFailedCalculations() {
    try {
      const failedCalculations = await prisma.autoPointCalculation.findMany({
        where: {
          is_completed: false,
          retry_count: { lt: 3 }, // Max 3 retries
          calculation_time: {
            lt: new Date(Date.now() - 30 * 60 * 1000) // Older than 30 minutes
          }
        },
        include: {
          hoat_dong: {
            include: {
              qr_attendance: {
                where: {
                  trang_thai: 'verified',
                  points_awarded: null
                },
                include: {
                  sinh_vien: true
                }
              }
            }
          }
        }
      });

      if (failedCalculations.length > 0) {
        logInfo(`Retrying ${failedCalculations.length} failed point calculations`);

        for (const calculation of failedCalculations) {
          try {
            await this.calculatePointsForActivity(calculation.hoat_dong);
          } catch (error) {
            logError(`Retry failed for calculation ${calculation.id}`, error);
          }
        }
      }

    } catch (error) {
      logError('Error retrying failed calculations', error);
    }
  }

  // Create notification for point award
  async createPointAwardNotification(student, activity, points) {
    try {
      const notification = {
        recipient_id: student.nguoi_dung_id,
        title: 'Điểm rèn luyện mới',
        message: `Bạn đã nhận được ${points} điểm rèn luyện từ hoạt động "${activity.ten_hd}".`,
        type: 'point_award',
        priority: 'trung_binh',
        scheduled_at: new Date(),
        method: 'trong_he_thong',
        metadata: {
          activity_id: activity.id,
          activity_name: activity.ten_hd,
          points_awarded: points,
          award_type: 'attendance'
        }
      };

      await prisma.notificationQueue.create({ data: notification });

    } catch (error) {
      logError('Error creating point award notification', error);
    }
  }

  // Manual trigger for specific activity
  async triggerManualCalculation(activityId, userId) {
    try {
      const activity = await prisma.hoatDong.findUnique({
        where: { id: activityId },
        include: {
          qr_attendance: {
            where: {
              trang_thai: 'verified'
            },
            include: {
              sinh_vien: true
            }
          },
          auto_point_calculations: true
        }
      });

      if (!activity) {
        throw new Error('Không tìm thấy hoạt động');
      }

      // Check permission (activity creator or admin/teacher)
      const user = await prisma.nguoiDung.findUnique({
        where: { id: userId },
        include: { vai_tro: true }
      });

      const canTrigger = activity.nguoi_tao_id === userId || 
        ['ADMIN', 'GIANG_VIEN'].includes(user.vai_tro.ten_vt);

      if (!canTrigger) {
        throw new Error('Không có quyền thực hiện tính điểm cho hoạt động này');
      }

      const result = await this.calculatePointsForActivity(activity);

      logInfo(`Manual point calculation triggered by user ${userId} for activity ${activityId}`);
      return result;

    } catch (error) {
      logError(`Error in manual point calculation for activity ${activityId}`, error);
      throw error;
    }
  }

  // Get calculation status for activity
  async getCalculationStatus(activityId) {
    try {
      const calculation = await prisma.autoPointCalculation.findUnique({
        where: { hd_id: activityId },
        include: {
          hoat_dong: {
            select: { ten_hd: true, diem_rl: true, ngay_kt: true }
          }
        }
      });

      if (!calculation) {
        return {
          status: 'not_started',
          message: 'Chưa tính điểm'
        };
      }

      return {
        status: calculation.is_completed ? 'completed' : 'pending',
        calculation_time: calculation.calculation_time,
        total_attendees: calculation.total_attendees,
        points_distributed: calculation.points_distributed,
        is_completed: calculation.is_completed,
        error_log: calculation.error_log,
        retry_count: calculation.retry_count
      };

    } catch (error) {
      logError(`Error getting calculation status for activity ${activityId}`, error);
      throw error;
    }
  }
}

module.exports = new AutoPointCalculationService();