const { PrismaClient } = require('@prisma/client');
const { ApiResponse, sendResponse } = require('../utils/response');
const { logError, logInfo } = require('../utils/logger');
const bcrypt = require('bcryptjs');
const { z } = require('zod');

// Helper functions
const success = (res, data, statusCode = 200) => {
  return sendResponse(res, statusCode, ApiResponse.success(data));
};

const error = (res, message, statusCode = 400, errors = null) => {
  return sendResponse(res, statusCode, ApiResponse.error(message, errors));
};

const prisma = new PrismaClient();

// Validation schemas
const updateProfileSchema = z.object({
  ho_ten: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').optional(),
  email: z.string().email('Email không hợp lệ').optional(),
  anh_dai_dien: z.string().url('URL ảnh đại diện không hợp lệ').optional(),
  // Thông tin sinh viên cơ bản
  ngay_sinh: z.string().optional(),
  gt: z.enum(['nam', 'nu', 'khac']).optional(),
  dia_chi: z.string().optional(),
  sdt: z.string().min(10, 'Số điện thoại phải có ít nhất 10 ký tự').max(11).optional(),
  
  // Thông tin bổ sung
  avatar_url: z.string().url('URL ảnh đại diện không hợp lệ').optional(),
  sdt_khan_cap: z.string().max(15).optional(),
  email_phu: z.string().email('Email phụ không hợp lệ').optional(),
  so_thich: z.string().optional(),
  ky_nang: z.string().optional(),
  muc_tieu: z.string().optional(),
  
  // Thông tin gia đình
  ten_cha: z.string().max(100).optional(),
  sdt_cha: z.string().max(15).optional(),
  ten_me: z.string().max(100).optional(),
  sdt_me: z.string().max(15).optional(),
  dia_chi_gia_dinh: z.string().optional(),
  
  // Thông tin học vấn
  truong_thpt: z.string().max(200).optional(),
  nam_tot_nghiep_thpt: z.coerce.number().int().min(2000).max(2030).optional(),
  diem_thpt: z.coerce.number().min(0).max(10).optional(),
  
  // Cài đặt
  ngon_ngu: z.enum(['vi', 'en']).optional(),
  mui_gio: z.string().max(50).optional(),
  thong_bao_email: z.boolean().optional(),
  thong_bao_sdt: z.boolean().optional()
});

const changePasswordSchema = z.object({
  old_password: z.string().min(1, 'Mật khẩu cũ là bắt buộc'),
  new_password: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirm_password"],
});

const registerSchema = z.object({
  ten_dn: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  mat_khau: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  ho_ten: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  // Vai trò người dùng
  vai_tro: z.enum(['SINH_VIEN', 'LOP_TRUONG', 'GIANG_VIEN']).optional().default('SINH_VIEN'),
  // Thông tin sinh viên
  mssv: z.string().min(8, 'MSSV phải có ít nhất 8 ký tự').optional(),
  ngay_sinh: z.string().optional(),
  gt: z.enum(['nam', 'nu', 'khac']).optional(),
  lop_id: z.string().uuid('ID lớp không hợp lệ').optional(),
  dia_chi: z.string().optional(),
  sdt: z.string().min(10, 'Số điện thoại phải có ít nhất 10 ký tự').max(11).optional()
});

class UsersController {
  // Lấy thông tin profile của user hiện tại (U5)
  async getProfile(req, res) {
    try {
      const userId = req.user.id || req.user.sub;

      const user = await prisma.nguoiDung.findUnique({
        where: { id: userId },
        include: {
          vai_tro: {
            select: {
              id: true,
              ten_vt: true,
              mo_ta: true
            }
          },
          sinh_vien: {
            include: {
              lop: {
                select: {
                  id: true,
                  ten_lop: true,
                  khoa: true,
                  nien_khoa: true
                }
              }
            }
          }
        }
      });

      if (!user) {
        return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy thông tin người dùng'));
      }

      const profile = {
        id: user.id,
        ten_dn: user.ten_dn,
        email: user.email,
        ho_ten: user.ho_ten,
        anh_dai_dien: user.anh_dai_dien,
        vai_tro: user.vai_tro?.ten_vt || '',
        trang_thai: user.trang_thai,
        lan_cuoi_dn: user.lan_cuoi_dn,
        ngay_tao: user.ngay_tao,
        
        // Thông tin sinh viên (nếu có)
        sinh_vien: user.sinh_vien ? {
          mssv: user.sinh_vien.mssv,
          ngay_sinh: user.sinh_vien.ngay_sinh,
          gt: user.sinh_vien.gt,
          dia_chi: user.sinh_vien.dia_chi,
          sdt: user.sinh_vien.sdt,
          // Thông tin bổ sung
          avatar_url: user.sinh_vien.avatar_url,
          sdt_khan_cap: user.sinh_vien.sdt_khan_cap,
          email_phu: user.sinh_vien.email_phu,
          so_thich: user.sinh_vien.so_thich,
          ky_nang: user.sinh_vien.ky_nang,
          muc_tieu: user.sinh_vien.muc_tieu,
          // Thông tin gia đình
          ten_cha: user.sinh_vien.ten_cha,
          sdt_cha: user.sinh_vien.sdt_cha,
          ten_me: user.sinh_vien.ten_me,
          sdt_me: user.sinh_vien.sdt_me,
          dia_chi_gia_dinh: user.sinh_vien.dia_chi_gia_dinh,
          // Thông tin học vấn
          truong_thpt: user.sinh_vien.truong_thpt,
          nam_tot_nghiep_thpt: user.sinh_vien.nam_tot_nghiep_thpt,
          diem_thpt: user.sinh_vien.diem_thpt,
          // Cài đặt
          ngon_ngu: user.sinh_vien.ngon_ngu,
          mui_gio: user.sinh_vien.mui_gio,
          thong_bao_email: user.sinh_vien.thong_bao_email,
          thong_bao_sdt: user.sinh_vien.thong_bao_sdt,
          lop: user.sinh_vien.lop ? {
            id: user.sinh_vien.lop.id,
            ten_lop: user.sinh_vien.lop.ten_lop,
            khoa: user.sinh_vien.lop.khoa,
            nien_khoa: user.sinh_vien.lop.nien_khoa
          } : null
        } : null
      };

      return sendResponse(res, 200, ApiResponse.success(profile, 'Lấy thông tin profile thành công'));

    } catch (err) {
      logError('Error fetching user profile:', err);
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy thông tin profile'));
    }
  }

  // Cập nhật thông tin profile (U5)
  async updateProfile(req, res) {
    try {
      const userId = req.user.id || req.user.sub;
      // Làm sạch dữ liệu đầu vào: loại bỏ chuỗi rỗng và chuẩn hóa kiểu
      const input = req.body || {};
      const cleaned = Object.keys(input).reduce((acc, key) => {
        const value = input[key];
        if (value === '' || value === null) {
          return acc; // bỏ qua giá trị rỗng
        }
        // Chuẩn hóa boolean từ chuỗi 'true'/'false'
        if (key === 'thong_bao_email' || key === 'thong_bao_sdt') {
          if (typeof value === 'string') {
            acc[key] = value === 'true';
            return acc;
          }
        }
        // Số nguyên năm tốt nghiệp
        if (key === 'nam_tot_nghiep_thpt') {
          const n = Number(value);
          if (!Number.isNaN(n)) acc[key] = n;
          return acc;
        }
        // Điểm THPT
        if (key === 'diem_thpt') {
          const n = Number(value);
          if (!Number.isNaN(n)) acc[key] = n;
          return acc;
        }
        acc[key] = value;
        return acc;
      }, {});

      const validatedData = updateProfileSchema.parse(cleaned);

      // Cập nhật thông tin người dùng
      const updateUserData = {};
      if (validatedData.ho_ten) updateUserData.ho_ten = validatedData.ho_ten;
      if (validatedData.email) updateUserData.email = validatedData.email;
      if (validatedData.anh_dai_dien) updateUserData.anh_dai_dien = validatedData.anh_dai_dien;

      // Cập nhật thông tin sinh viên (nếu có)
      const updateSinhVienData = {};
      if (validatedData.ngay_sinh) updateSinhVienData.ngay_sinh = new Date(validatedData.ngay_sinh);
      if (validatedData.gt) updateSinhVienData.gt = validatedData.gt;
      if (validatedData.dia_chi) updateSinhVienData.dia_chi = validatedData.dia_chi;
      if (validatedData.sdt) updateSinhVienData.sdt = validatedData.sdt;
      
      // Thông tin bổ sung
      if (validatedData.avatar_url) updateSinhVienData.avatar_url = validatedData.avatar_url;
      if (validatedData.sdt_khan_cap) updateSinhVienData.sdt_khan_cap = validatedData.sdt_khan_cap;
      if (validatedData.email_phu) updateSinhVienData.email_phu = validatedData.email_phu;
      if (validatedData.so_thich !== undefined) updateSinhVienData.so_thich = validatedData.so_thich;
      if (validatedData.ky_nang !== undefined) updateSinhVienData.ky_nang = validatedData.ky_nang;
      if (validatedData.muc_tieu !== undefined) updateSinhVienData.muc_tieu = validatedData.muc_tieu;
      
      // Thông tin gia đình
      if (validatedData.ten_cha) updateSinhVienData.ten_cha = validatedData.ten_cha;
      if (validatedData.sdt_cha) updateSinhVienData.sdt_cha = validatedData.sdt_cha;
      if (validatedData.ten_me) updateSinhVienData.ten_me = validatedData.ten_me;
      if (validatedData.sdt_me) updateSinhVienData.sdt_me = validatedData.sdt_me;
      if (validatedData.dia_chi_gia_dinh) updateSinhVienData.dia_chi_gia_dinh = validatedData.dia_chi_gia_dinh;
      
      // Thông tin học vấn
      if (validatedData.truong_thpt) updateSinhVienData.truong_thpt = validatedData.truong_thpt;
      if (validatedData.nam_tot_nghiep_thpt !== undefined) updateSinhVienData.nam_tot_nghiep_thpt = parseInt(validatedData.nam_tot_nghiep_thpt);
      if (validatedData.diem_thpt !== undefined) updateSinhVienData.diem_thpt = parseFloat(validatedData.diem_thpt);
      
      // Cài đặt
      if (validatedData.ngon_ngu) updateSinhVienData.ngon_ngu = validatedData.ngon_ngu;
      if (validatedData.mui_gio) updateSinhVienData.mui_gio = validatedData.mui_gio;
      if (validatedData.thong_bao_email !== undefined) updateSinhVienData.thong_bao_email = validatedData.thong_bao_email;
      if (validatedData.thong_bao_sdt !== undefined) updateSinhVienData.thong_bao_sdt = validatedData.thong_bao_sdt;
      if (validatedData.sdt) updateSinhVienData.sdt = validatedData.sdt;

      // Transaction để cập nhật cả user và sinh viên
      const result = await prisma.$transaction(async (tx) => {
        // Cập nhật thông tin user
        const updatedUser = await tx.nguoiDung.update({
          where: { id: userId },
          data: updateUserData
        });

        // Cập nhật thông tin sinh viên nếu có
        if (Object.keys(updateSinhVienData).length > 0) {
          const sinhVien = await tx.sinhVien.findUnique({
            where: { nguoi_dung_id: userId }
          });

          if (sinhVien) {
            await tx.sinhVien.update({
              where: { nguoi_dung_id: userId },
              data: updateSinhVienData
            });
          }
        }

        return updatedUser;
      });

      logInfo('Profile updated successfully', { userId });
      // Trả về lại profile mới để FE đồng bộ ngay
      const refreshed = await prisma.nguoiDung.findUnique({
        where: { id: userId },
        include: {
          sinh_vien: {
            include: { lop: true }
          },
          vai_tro: true
        }
      });
      return sendResponse(res, 200, ApiResponse.success({ message: 'Cập nhật thông tin thành công', profile: refreshed }));

    } catch (err) {
      if (err instanceof z.ZodError) {
        return sendResponse(res, 400, ApiResponse.validationError(err.errors, 'Dữ liệu không hợp lệ'));
      }
      
      logError('Error updating profile:', err);
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi cập nhật thông tin'));
    }
  }

  // Đổi mật khẩu (U5)
  async changePassword(req, res) {
    try {
      const userId = req.user.id || req.user.sub;
      const validatedData = changePasswordSchema.parse(req.body);

      // Kiểm tra user tồn tại
      const user = await prisma.nguoiDung.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy người dùng'));
      }

      // Kiểm tra mật khẩu cũ
      const isOldPasswordValid = await bcrypt.compare(validatedData.old_password, user.mat_khau);
      if (!isOldPasswordValid) {
        return sendResponse(res, 400, ApiResponse.error('Mật khẩu cũ không chính xác', 400));
      }

      // Hash mật khẩu mới
      const hashedNewPassword = await bcrypt.hash(validatedData.new_password, 10);

      // Cập nhật mật khẩu
      await prisma.nguoiDung.update({
        where: { id: userId },
        data: { mat_khau: hashedNewPassword }
      });

      logInfo('Password changed successfully', { userId });
      return sendResponse(res, 200, ApiResponse.success({ message: 'Đổi mật khẩu thành công' }));

    } catch (err) {
      if (err instanceof z.ZodError) {
        return sendResponse(res, 400, ApiResponse.validationError(err.errors, 'Dữ liệu không hợp lệ'));
      }
      
      logError('Error changing password:', err);
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi đổi mật khẩu'));
    }
  }

  // Đăng ký tài khoản mới (U2)
  async register(req, res) {
    try {
      const validatedData = registerSchema.parse(req.body);

      // Kiểm tra user đã tồn tại
      const existingUser = await prisma.nguoiDung.findFirst({
        where: {
          OR: [
            { ten_dn: validatedData.ten_dn },
            { email: validatedData.email }
          ]
        }
      });

      if (existingUser) {
        return error(res, 'Tên đăng nhập hoặc email đã tồn tại', 400);
      }

      // Kiểm tra MSSV đã tồn tại (nếu có)
      if (validatedData.mssv) {
        const existingSinhVien = await prisma.sinhVien.findUnique({
          where: { mssv: validatedData.mssv }
        });

        if (existingSinhVien) {
          return error(res, 'MSSV đã tồn tại', 400);
        }
      }

      // Lấy vai trò theo yêu cầu
      let vaiTro = await prisma.vaiTro.findFirst({
        where: { ten_vt: validatedData.vai_tro }
      });

      if (!vaiTro) {
        vaiTro = await prisma.vaiTro.create({
          data: {
            ten_vt: validatedData.vai_tro,
            mo_ta: `Vai trò ${validatedData.vai_tro}`
          }
        });
      }

      // Hash mật khẩu
      const hashedPassword = await bcrypt.hash(validatedData.mat_khau, 10);

      // Transaction tạo user và sinh viên
      const result = await prisma.$transaction(async (tx) => {
        // Tạo user
        const newUser = await tx.nguoiDung.create({
          data: {
            ten_dn: validatedData.ten_dn,
            mat_khau: hashedPassword,
            email: validatedData.email,
            ho_ten: validatedData.ho_ten,
            vai_tro_id: vaiTro.id,
            trang_thai: 'hoat_dong'
          }
        });

        // Tạo sinh viên cho cả SINH_VIEN và LOP_TRUONG
        if (validatedData.vai_tro === 'SINH_VIEN' || validatedData.vai_tro === 'LOP_TRUONG') {
          // Tạo MSSV nếu chưa có
          let mssv = validatedData.mssv;
          if (!mssv) {
            let baseMssv;
            if (validatedData.vai_tro === 'LOP_TRUONG') {
              baseMssv = `LT${validatedData.ten_dn.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}`.slice(0, 8);
            } else {
              baseMssv = `SV${validatedData.ten_dn.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}`.slice(0, 8);
            }
            
            // Kiểm tra và tạo MSSV unique
            let counter = 1;
            mssv = baseMssv;
            while (await tx.sinhVien.findUnique({ where: { mssv: mssv } })) {
              mssv = `${baseMssv}${counter.toString().padStart(2, '0')}`;
              counter++;
            }
          }

          // Tìm lớp để gán nếu chưa có
          let lopId = validatedData.lop_id;
          if (!lopId) {
            if (validatedData.vai_tro === 'LOP_TRUONG') {
              // Lớp trưởng: tìm lớp chưa có lớp trưởng
              const defaultLop = await tx.lop.findFirst({
                where: { lop_truong: null }
              });
              if (defaultLop) {
                lopId = defaultLop.id;
              } else {
                // Tạo lớp mới cho lớp trưởng
                const giangVien = await tx.nguoiDung.findFirst({
                  where: {
                    vai_tro: {
                      is: {
                        ten_vt: 'GIANG_VIEN'
                      }
                    }
                  }
                });
                
                let chuNhiemId = giangVien?.id;
                if (!chuNhiemId) {
                  const admin = await tx.nguoiDung.findFirst({
                    where: {
                      vai_tro: {
                        is: {
                          ten_vt: 'ADMIN'
                        }
                      }
                    }
                  });
                  chuNhiemId = admin?.id || newUser.id;
                }
                
                const newLop = await tx.lop.create({
                  data: {
                    ten_lop: `Lớp ${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
                    khoa: 'CNTT',
                    nien_khoa: '2021-2025',
                    nam_nhap_hoc: new Date(),
                    chu_nhiem: chuNhiemId
                  }
                });
                lopId = newLop.id;
              }
            } else {
              // Sinh viên thường: tìm lớp có sẵn
              const defaultLop = await tx.lop.findFirst();
              if (defaultLop) {
                lopId = defaultLop.id;
              } else {
                // Tạo lớp mặc định cho sinh viên
                const giangVien = await tx.nguoiDung.findFirst({
                  where: {
                    vai_tro: {
                      is: {
                        ten_vt: 'GIANG_VIEN'
                      }
                    }
                  }
                });
                
                let chuNhiemId = giangVien?.id;
                if (!chuNhiemId) {
                  const admin = await tx.nguoiDung.findFirst({
                    where: {
                      vai_tro: {
                        is: {
                          ten_vt: 'ADMIN'
                        }
                      }
                    }
                  });
                  chuNhiemId = admin?.id || newUser.id;
                }
                
                const newLop = await tx.lop.create({
                  data: {
                    ten_lop: `Lớp Sinh viên - ${new Date().getFullYear()}`,
                    khoa: 'CNTT',
                    nien_khoa: '2021-2025',
                    nam_nhap_hoc: new Date(),
                    chu_nhiem: chuNhiemId
                  }
                });
                lopId = newLop.id;
              }
            }
          } else {
            // Kiểm tra nếu lớp đã có lớp trưởng và user muốn tạo lớp trưởng mới
            if (validatedData.vai_tro === 'LOP_TRUONG') {
              const existingLop = await tx.lop.findUnique({
                where: { id: lopId },
                include: { 
                  lop_truong_rel: {
                    include: { nguoi_dung: true }
                  }
                }
              });
              
              if (existingLop?.lop_truong_rel) {
                throw new Error(`Lớp ${existingLop.ten_lop} đã có lớp trưởng: ${existingLop.lop_truong_rel.nguoi_dung?.ho_ten || 'N/A'}`);
              }
            }
          }

          const sinhVien = await tx.sinhVien.create({
            data: {
              nguoi_dung_id: newUser.id,
              mssv: mssv,
              ngay_sinh: validatedData.ngay_sinh ? new Date(validatedData.ngay_sinh) : new Date('2000-01-01'),
              gt: validatedData.gt || null,
              lop_id: lopId,
              dia_chi: validatedData.dia_chi || 'Chưa cập nhật',
              sdt: validatedData.sdt || null
            }
          });

          // Nếu là lớp trưởng, cập nhật lớp để gán làm lớp trưởng
          if (validatedData.vai_tro === 'LOP_TRUONG') {
            await tx.lop.update({
              where: { id: lopId },
              data: { lop_truong: sinhVien.id }
            });
          }
        }

        return newUser;
      });

      logInfo('User registered successfully', { 
        userId: result.id, 
        username: validatedData.ten_dn 
      });

      return success(res, {
        message: 'Đăng ký tài khoản thành công',
        user: {
          id: result.id,
          ten_dn: result.ten_dn,
          email: result.email,
          ho_ten: result.ho_ten,
          vai_tro: validatedData.vai_tro
        }
      }, 201);

    } catch (err) {
      if (err instanceof z.ZodError) {
        return error(res, 'Dữ liệu không hợp lệ', 400, err.errors);
      }
      
      // Xử lý lỗi lớp đã có lớp trưởng
      if (err.message && err.message.includes('đã có lớp trưởng')) {
        return error(res, err.message, 400);
      }
      
      logError('Error registering user:', err);
      return error(res, 'Lỗi khi đăng ký tài khoản', 500);
    }
  }

  // Kiểm tra lớp có lớp trưởng chưa
  async checkClassMonitor(req, res) {
    try {
      const { lopId } = req.params;
      
      if (!lopId) {
        return error(res, 'ID lớp là bắt buộc', 400);
      }
      
      const lop = await prisma.lop.findUnique({
        where: { id: lopId },
        include: {
          lop_truong_rel: {
            include: { 
              nguoi_dung: {
                select: {
                  id: true,
                  ho_ten: true,
                  email: true
                }
              }
            }
          }
        }
      });
      
      if (!lop) {
        return error(res, 'Không tìm thấy lớp', 404);
      }
      
      return success(res, {
        hasMonitor: !!lop.lop_truong,
        monitor: lop.lop_truong_rel && lop.lop_truong_rel.nguoi_dung ? {
          id: lop.lop_truong_rel.id,
          mssv: lop.lop_truong_rel.mssv,
          ho_ten: lop.lop_truong_rel.nguoi_dung.ho_ten,
          email: lop.lop_truong_rel.nguoi_dung.email
        } : null,
        lop: {
          id: lop.id,
          ten_lop: lop.ten_lop,
          khoa: lop.khoa
        }
      });
      
    } catch (err) {
      logError('Error checking class monitor:', err);
      return error(res, 'Lỗi khi kiểm tra lớp trưởng', 500);
    }
  }

  // Lấy danh sách tất cả người dùng (Admin only) (U21)
  async list(req, res) {
    try {
      const { page = 1, limit = 10, search, role, status } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const whereCondition = {};

      // Tìm kiếm
      if (search) {
        whereCondition.OR = [
          { ho_ten: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { ten_dn: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Lọc theo vai trò
      if (role) {
        const vaiTro = await prisma.vaiTro.findFirst({
          where: { ten_vt: role }
        });
        if (vaiTro) {
          whereCondition.vai_tro_id = vaiTro.id;
        }
      }

      // Lọc theo trạng thái
      if (status) {
        whereCondition.trang_thai = status;
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

      const transformedUsers = users.map(user => ({
        id: user.id,
        ten_dn: user.ten_dn,
        ho_ten: user.ho_ten,
        email: user.email,
        vai_tro: user.vai_tro?.ten_vt || '',
        trang_thai: user.trang_thai,
        ngay_tao: user.ngay_tao,
        lan_cuoi_dn: user.lan_cuoi_dn,
        sinh_vien: user.sinh_vien ? {
          mssv: user.sinh_vien.mssv,
          lop: user.sinh_vien.lop?.ten_lop || '',
          khoa: user.sinh_vien.lop?.khoa || ''
        } : null
      }));

      return success(res, {
        users: transformedUsers,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total,
          total_pages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (err) {
      logger.error('Error fetching users list:', err);
      return error(res, 'Lỗi khi lấy danh sách người dùng', 500);
    }
  }

  // Lấy thông tin người dùng theo ID (Admin only)
  async getById(req, res) {
    try {
      const { id } = req.params;

      const user = await prisma.nguoiDung.findUnique({
        where: { id },
        include: {
          vai_tro: true,
          sinh_vien: {
            include: {
              lop: true
            }
          }
        }
      });

      if (!user) {
        return error(res, 'Không tìm thấy người dùng', 404);
      }

      const userData = {
        id: user.id,
        ten_dn: user.ten_dn,
        ho_ten: user.ho_ten,
        email: user.email,
        vai_tro: user.vai_tro?.ten_vt || '',
        trang_thai: user.trang_thai,
        ngay_tao: user.ngay_tao,
        lan_cuoi_dn: user.lan_cuoi_dn,
        sinh_vien: user.sinh_vien ? {
          mssv: user.sinh_vien.mssv,
          ngay_sinh: user.sinh_vien.ngay_sinh,
          gt: user.sinh_vien.gt,
          dia_chi: user.sinh_vien.dia_chi,
          sdt: user.sinh_vien.sdt,
          lop: user.sinh_vien.lop ? {
            id: user.sinh_vien.lop.id,
            ten_lop: user.sinh_vien.lop.ten_lop,
            khoa: user.sinh_vien.lop.khoa,
            nien_khoa: user.sinh_vien.lop.nien_khoa
          } : null
        } : null
      };

      return success(res, userData);

    } catch (err) {
      logger.error('Error fetching user by ID:', err);
      return error(res, 'Lỗi khi lấy thông tin người dùng', 500);
    }
  }

  // Cập nhật trạng thái người dùng (Admin only)
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { trang_thai } = req.body;

      if (!['hoat_dong', 'khong_hoat_dong', 'khoa'].includes(trang_thai)) {
        return error(res, 'Trạng thái không hợp lệ', 400);
      }

      const user = await prisma.nguoiDung.findUnique({
        where: { id }
      });

      if (!user) {
        return error(res, 'Không tìm thấy người dùng', 404);
      }

      await prisma.nguoiDung.update({
        where: { id },
        data: { trang_thai }
      });

      logger.info('User status updated', { 
        adminId: req.user.id, 
        userId: id, 
        newStatus: trang_thai 
      });

      return success(res, { message: 'Cập nhật trạng thái thành công' });

    } catch (err) {
      logger.error('Error updating user status:', err);
      return error(res, 'Lỗi khi cập nhật trạng thái', 500);
    }
  }

  // Xóa người dùng (Admin only)
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Kiểm tra không thể xóa chính mình
      if (id === req.user.id) {
        return error(res, 'Không thể xóa tài khoản của chính mình', 400);
      }

      const user = await prisma.nguoiDung.findUnique({
        where: { id }
      });

      if (!user) {
        return error(res, 'Không tìm thấy người dùng', 404);
      }

      // Transaction xóa user và các thông tin liên quan
      await prisma.$transaction(async (tx) => {
        // Xóa sinh viên nếu có
        await tx.sinhVien.deleteMany({
          where: { nguoi_dung_id: id }
        });

        // Xóa user
        await tx.nguoiDung.delete({
          where: { id }
        });
      });

      logger.info('User deleted successfully', { 
        adminId: req.user.id, 
        deletedUserId: id,
        deletedUsername: user.ten_dn
      });

      return success(res, { message: 'Xóa người dùng thành công' });

    } catch (err) {
      logger.error('Error deleting user:', err);
      return error(res, 'Lỗi khi xóa người dùng', 500);
    }
  }
}

module.exports = new UsersController();