const { ApiResponse, sendResponse } = require('../utils/response');
const { logInfo, logError } = require('../utils/logger');
const { prisma } = require('../libs/prisma');
const bcrypt = require('bcryptjs');
const { z } = require('zod');

// Validation schemas
const createUserSchema = z.object({
  maso: z.string().min(3, 'Mã số phải có ít nhất 3 ký tự'),
  hoten: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ').refine(
    email => email.endsWith('@dlu.edu.vn'),
    'Email phải có domain @dlu.edu.vn'
  ),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  role: z.enum(['SINH_VIEN', 'LOP_TRUONG', 'GIANG_VIEN', 'ADMIN']).default('SINH_VIEN'),
  lop: z.string().optional(),
  khoa: z.string().optional(),
  sdt: z.string().optional()
});

const updateUserSchema = z.object({
  hoten: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').optional(),
  email: z.string().email('Email không hợp lệ').refine(
    email => email.endsWith('@dlu.edu.vn'),
    'Email phải có domain @dlu.edu.vn'
  ).optional(),
  role: z.enum(['SINH_VIEN', 'LOP_TRUONG', 'GIANG_VIEN', 'ADMIN']).optional(),
  lop: z.string().optional(),
  khoa: z.string().optional(),
  sdt: z.string().optional(),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional()
});

class AdminController {
  // Lấy dashboard thống kê hệ thống
  static async getDashboard(req, res) {
    try {
      const [
        totalUsers,
        totalActivities,
        totalRegistrations,
        activeUsers
      ] = await Promise.all([
        prisma.nguoiDung.count(),
        prisma.hoatDong.count(),
        prisma.dangKyHoatDong.count(),
        prisma.nguoiDung.count({ where: { trang_thai: 'hoat_dong' } })
      ]);

      const pendingApprovals = await prisma.dangKyHoatDong.count({
        where: { trang_thai_dk: 'cho_duyet' }
      });

      const stats = {
        totalUsers,
        totalActivities,
        totalRegistrations,
        activeUsers,
        pendingApprovals
      };

      logInfo('Admin dashboard accessed', { userId: req.user.id, stats });
      return sendResponse(res, 200, ApiResponse.success('Lấy dashboard thành công', stats));

    } catch (error) {
      logError('Error fetching admin dashboard', { error: error.message, userId: req.user?.id });
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy dữ liệu dashboard'));
    }
  }

  // Lấy danh sách người dùng với phân trang và lọc
  static async getUsers(req, res) {
    try {
      const { page = 1, limit = 10, search, role } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const whereCondition = {};

      // Tìm kiếm theo tên hoặc email
      if (search) {
        whereCondition.OR = [
          { ho_ten: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { ten_dn: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Lọc theo vai trò (cần map role name to vai_tro_id)
      if (role) {
        const vaiTro = await prisma.vaiTro.findFirst({
          where: { ten_vt: role }
        });
        if (vaiTro) {
          whereCondition.vai_tro_id = vaiTro.id;
        }
      }

      const [users, total] = await Promise.all([
        prisma.nguoiDung.findMany({
          where: whereCondition,
          include: {
            vai_tro: true,
            sinh_vien: {
              include: {
                lop: true
              }
            }
          },
          skip: offset,
          take: parseInt(limit),
          orderBy: { ngay_tao: 'desc' }
        }),
        prisma.nguoiDung.count({ where: whereCondition })
      ]);

      // Transform data to match frontend expectations
      const transformedUsers = users.map(user => ({
        id: user.id,
        maso: user.ten_dn,
        hoten: user.ho_ten,
        email: user.email,
        role: user.vai_tro?.ten_vt || 'SINH_VIEN',
        lop: user.sinh_vien?.lop?.ten_lop || '',
        khoa: user.sinh_vien?.lop?.khoa || '',
        sdt: user.sinh_vien?.sdt || '',
        trang_thai: user.trang_thai,
        ngay_tao: user.ngay_tao
      }));

      const result = {
        data: transformedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      };

      logInfo('Users list fetched', { userId: req.user.id, total });
      return sendResponse(res, 200, ApiResponse.success('Lấy danh sách người dùng thành công', transformedUsers));

    } catch (error) {
      logError('Error fetching users', { error: error.message, userId: req.user?.id });
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách người dùng'));
    }
  }

  // Tạo người dùng mới
  static async createUser(req, res) {
    try {
      const validatedData = createUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await prisma.nguoiDung.findFirst({
        where: {
          OR: [
            { ten_dn: validatedData.maso },
            { email: validatedData.email }
          ]
        }
      });

      if (existingUser) {
        return sendResponse(res, 400, ApiResponse.error('Mã số hoặc email đã tồn tại'));
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Get or create role
      let vaiTro = await prisma.vaiTro.findFirst({
        where: { ten_vt: validatedData.role }
      });

      if (!vaiTro) {
        // Create role if not exists
        vaiTro = await prisma.vaiTro.create({
          data: {
            ten_vt: validatedData.role,
            mo_ta: `Vai trò ${validatedData.role}`
          }
        });
      }

      // Create user
      const newUser = await prisma.nguoiDung.create({
        data: {
          ten_dn: validatedData.maso,
          mat_khau: hashedPassword,
          email: validatedData.email,
          ho_ten: validatedData.hoten,
          vai_tro_id: vaiTro.id,
          trang_thai: 'hoat_dong'
        },
        include: {
          vai_tro: true
        }
      });

      logInfo('User created successfully', { 
        adminId: req.user.id, 
        newUserId: newUser.id,
        userMaso: validatedData.maso 
      });

      return sendResponse(res, 201, ApiResponse.success('Tạo người dùng thành công', {
        id: newUser.id,
        maso: newUser.ten_dn,
        hoten: newUser.ho_ten,
        email: newUser.email,
        role: newUser.vai_tro.ten_vt
      }));

    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendResponse(res, 400, ApiResponse.error('Dữ liệu không hợp lệ', error.errors));
      }
      
      logError('Error creating user', { error: error.message, userId: req.user?.id });
      return sendResponse(res, 500, ApiResponse.error('Lỗi tạo người dùng'));
    }
  }

  // Cập nhật người dùng
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const validatedData = updateUserSchema.parse(req.body);

      const existingUser = await prisma.nguoiDung.findUnique({
        where: { id },
        include: { vai_tro: true }
      });

      if (!existingUser) {
        return sendResponse(res, 404, ApiResponse.error('Không tìm thấy người dùng'));
      }

      const updateData = {};

      if (validatedData.hoten) updateData.ho_ten = validatedData.hoten;
      if (validatedData.email) updateData.email = validatedData.email;
      
      if (validatedData.password) {
        updateData.mat_khau = await bcrypt.hash(validatedData.password, 10);
      }

      if (validatedData.role && validatedData.role !== existingUser.vai_tro.ten_vt) {
        let vaiTro = await prisma.vaiTro.findFirst({
          where: { ten_vt: validatedData.role }
        });

        if (!vaiTro) {
          vaiTro = await prisma.vaiTro.create({
            data: {
              ten_vt: validatedData.role,
              mo_ta: `Vai trò ${validatedData.role}`
            }
          });
        }
        updateData.vai_tro_id = vaiTro.id;
      }

      const updatedUser = await prisma.nguoiDung.update({
        where: { id },
        data: updateData,
        include: {
          vai_tro: true
        }
      });

      logInfo('User updated successfully', { 
        adminId: req.user.id, 
        updatedUserId: id,
        changes: Object.keys(updateData)
      });

      return sendResponse(res, 200, ApiResponse.success('Cập nhật người dùng thành công', {
        id: updatedUser.id,
        maso: updatedUser.ten_dn,
        hoten: updatedUser.ho_ten,
        email: updatedUser.email,
        role: updatedUser.vai_tro.ten_vt
      }));

    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendResponse(res, 400, ApiResponse.error('Dữ liệu không hợp lệ', error.errors));
      }
      
      logError('Error updating user', { error: error.message, userId: req.user?.id });
      return sendResponse(res, 500, ApiResponse.error('Lỗi cập nhật người dùng'));
    }
  }

  // Xóa người dùng
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const existingUser = await prisma.nguoiDung.findUnique({
        where: { id }
      });

      if (!existingUser) {
        return sendResponse(res, 404, ApiResponse.error('Không tìm thấy người dùng'));
      }

      // Don't allow deleting admin accounts
      if (existingUser.id === req.user.id) {
        return sendResponse(res, 400, ApiResponse.error('Không thể xóa tài khoản của chính mình'));
      }

      // Delete related records first (sinh_vien if exists)
      await prisma.sinhVien.deleteMany({
        where: { nguoi_dung_id: id }
      });

      // Delete user
      await prisma.nguoiDung.delete({
        where: { id }
      });

      logInfo('User deleted successfully', { 
        adminId: req.user.id, 
        deletedUserId: id,
        deletedUserMaso: existingUser.ten_dn
      });

      return sendResponse(res, 200, ApiResponse.success('Xóa người dùng thành công'));

    } catch (error) {
      logError('Error deleting user', { error: error.message, userId: req.user?.id });
      return sendResponse(res, 500, ApiResponse.error('Lỗi xóa người dùng'));
    }
  }
}

module.exports = AdminController;