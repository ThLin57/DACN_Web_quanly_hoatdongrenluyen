// src/routes/auth.route.js
const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth, requireAdmin } = require('../middlewares/auth');
const { validate, loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, adminResetPasswordSchema, changePasswordSchema } = require('../utils/validation');
const { ApiResponse, sendResponse } = require('../utils/response');
const { logInfo, logError } = require('../utils/logger');
const config = require('../config/app');
const { prisma } = require('../config/database');
const AuthModel = require('../models/auth.model');
const UserModel = require('../models/user.model');
const router = Router();

// Lưu trữ token reset trong bộ nhớ (demo). Trong sản xuất nên dùng Redis/DB
const resetTokens = new Map(); // token -> userId
const generateResetToken = (userId) => {
  const token = Buffer.from(`${userId}.${Date.now()}`).toString('base64url');
  resetTokens.set(token, { userId, exp: Date.now() + 15 * 60 * 1000 }); // 15 phút
  return token;
};
const consumeResetToken = (token) => {
  const entry = resetTokens.get(token);
  if (!entry) return null;
  if (Date.now() > entry.exp) {
    resetTokens.delete(token);
    return null;
  }
  resetTokens.delete(token);
  return entry.userId;
};

// Đăng nhập bằng mã số và mật khẩu
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { maso, password } = req.validatedData;

    // Tìm người dùng theo mã số
    const user = await AuthModel.findUserByMaso(maso);
    if (!user) {
      return sendResponse(res, ApiResponse.unauthorized('Mã số hoặc mật khẩu không đúng'));
    }

    const isPasswordValid = await AuthModel.comparePassword(password, user.matkhau);
    if (!isPasswordValid) {
      return sendResponse(res, ApiResponse.unauthorized('Mã số hoặc mật khẩu không đúng'));
    }

    // Kiểm tra trạng thái tài khoản
    if (user.trangthai !== 'hot') {
      return sendResponse(res, ApiResponse.unauthorized('Tài khoản đã bị khóa'));
    }

    const payload = {
      sub: user.id,
      maso: user.maso,
      role: user.vaiTro?.tenvt || 'student'
    };

    const token = jwt.sign(payload, config.jwtSecret, { 
      expiresIn: config.jwtExpiresIn
    });

    // Cập nhật thông tin đăng nhập
    await AuthModel.updateLoginInfo(user.id, req.ip);

    // Ghi log đăng nhập thành công
    logInfo('User logged in successfully', { 
      userId: user.id, 
      maso: user.maso, 
      role: payload.role,
      ip: req.ip 
    });

    const dto = AuthModel.toUserDTO(user);
    sendResponse(res, ApiResponse.success({ token, user: dto }, 'Đăng nhập thành công'));
  } catch (error) {
    logError('Login error', error, { ip: req.ip });
    sendResponse(res, ApiResponse.error('Lỗi server, vui lòng thử lại sau'));
  }
});

// Đăng ký tài khoản mới
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { name, maso, email, password } = req.validatedData;

    // Kiểm tra mã số bị trùng
    const existingUser = await AuthModel.findUserByMaso(maso);
    if (existingUser) {
      return sendResponse(res, ApiResponse.validationError([{ field: 'maso', message: 'Mã số đã được sử dụng' }]));
    }

    // Kiểm tra lớp học mặc định
    const lopMacDinh = await AuthModel.findDefaultClass();
    if (!lopMacDinh) {
      return sendResponse(res, ApiResponse.error('Không tìm thấy lớp mặc định, vui lòng liên hệ quản trị viên'));
    }

    // Băm mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser = await AuthModel.createStudent({
      name,
      maso,
      hashedPassword,
      lopId: lopMacDinh.id
    });

    // Tạo thông tin liên hệ qua email
    await AuthModel.createEmailContact(newUser.id, email);

    const payload = {
      sub: newUser.id,
      maso: newUser.maso,
      role: 'student'
    };

    const token = jwt.sign(payload, config.jwtSecret, { 
      expiresIn: config.jwtExpiresIn
    });

    // Ghi log đăng ký thành công
    logInfo('User registered successfully', { 
      userId: newUser.id, 
      maso: newUser.maso,
      email: email,
      ip: req.ip 
    });

    const dto = AuthModel.toUserDTO(newUser);
    sendResponse(res, ApiResponse.success({ token, user: dto }, 'Đăng ký thành công', 201));
  } catch (error) {
    logError('Register error', error, { ip: req.ip });
    sendResponse(res, ApiResponse.error('Lỗi server, vui lòng thử lại sau'));
  }
});

// Quên mật khẩu - yêu cầu token để đặt lại
router.post('/forgot', validate(forgotPasswordSchema), async (req, res) => {
  try {
    const { identifier } = req.validatedData; // email hoặc mã số
    const user = await AuthModel.findByEmailOrMaso(identifier);
    if (!user) {
      // Giả lập trả về thành công để tránh việc dò tài khoản
      return sendResponse(res, ApiResponse.success(null, 'Nếu tài khoản tồn tại, chúng tôi đã gửi hướng dẫn khôi phục'));
    }
    const token = generateResetToken(user.id);
    // Demo: trả về token trực tiếp. Trong thực tế: gửi email chứa liên kết đặt lại mật khẩu
    logInfo('Generated reset token', { userId: user.id });
    sendResponse(res, ApiResponse.success({ token }, 'Tạo token khôi phục thành công'));
  } catch (error) {
    logError('Forgot password error', error);
    sendResponse(res, ApiResponse.error('Lỗi server, vui lòng thử lại sau'));
  }
});

// Đặt lại mật khẩu bằng token
router.post('/reset', validate(resetPasswordSchema), async (req, res) => {
  try {
    const { token, password } = req.validatedData;
    const userId = consumeResetToken(token);
    if (!userId) {
      return sendResponse(res, ApiResponse.unauthorized('Token không hợp lệ hoặc đã hết hạn'));
    }
    const hashed = await AuthModel.hashPassword(password);
    await AuthModel.updatePasswordById(userId, hashed);
    sendResponse(res, ApiResponse.success(null, 'Đặt lại mật khẩu thành công'));
  } catch (error) {
    logError('Reset password error', error);
    sendResponse(res, ApiResponse.error('Lỗi server, vui lòng thử lại sau'));
  }
});

// Quản trị viên đặt lại mật khẩu
router.post('/admin/reset', auth, requireAdmin, validate(adminResetPasswordSchema), async (req, res) => {
  try {
    const { userId, newPassword } = req.validatedData;
    const hashed = await AuthModel.hashPassword(newPassword);
    await AuthModel.updatePasswordById(userId, hashed);
    logInfo('Admin reset password', { adminId: req.user.sub, targetUserId: userId });
    sendResponse(res, ApiResponse.success(null, 'Tạo lại mật khẩu thành công'));
  } catch (error) {
    logError('Admin reset password error', error);
    sendResponse(res, ApiResponse.error('Lỗi server, vui lòng thử lại sau'));
  }
});

// Đổi mật khẩu (khi đã đăng nhập)
router.post('/change', auth, validate(changePasswordSchema), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.validatedData;
    const user = await AuthModel.findUserByMaso(req.user.maso);
    if (!user) {
      return sendResponse(res, ApiResponse.notFound('Không tìm thấy người dùng'));
    }
    const ok = await AuthModel.comparePassword(currentPassword, user.matkhau);
    if (!ok) {
      return sendResponse(res, ApiResponse.unauthorized('Mật khẩu hiện tại không đúng'));
    }
    const hashed = await AuthModel.hashPassword(newPassword);
    await AuthModel.updatePasswordById(user.id, hashed);
    sendResponse(res, ApiResponse.success(null, 'Đổi mật khẩu thành công'));
  } catch (error) {
    logError('Change password error', error);
    sendResponse(res, ApiResponse.error('Lỗi server, vui lòng thử lại sau'));
  }
});

// Cập nhật thông tin cá nhân (self)
router.put('/profile', auth, async (req, res) => {
  try {
    const { maso, name, trangthai, ngaysinh, gt, cccd } = req.body;

    // Không cho phép sinh viên cập nhật trạng thái tài khoản
    if (req.user?.role === 'student' && typeof trangthai !== 'undefined') {
      return sendResponse(res, ApiResponse.forbidden('Sinh viên không được phép cập nhật trạng thái tài khoản'));
    }

    // Chỉ admin mới được phép cập nhật mã số (maso)
    const isAdmin = req.user?.role === 'admin';
    const payload = { name, trangthai, ngaysinh, gt, cccd };
    if (isAdmin && typeof maso !== 'undefined') payload.maso = maso;

    const updated = await UserModel.updateBasic(req.user.sub, payload);
    sendResponse(res, ApiResponse.success(updated, 'Cập nhật thông tin cá nhân thành công'));
  } catch (error) {
    logError('Update self profile error', error, { userId: req.user?.sub });
    sendResponse(res, ApiResponse.error('Lỗi server, vui lòng thử lại sau'));
  }
});

// Cập nhật danh sách liên hệ (trừ email)
router.put('/contacts', auth, async (req, res) => {
  try {
    const { contacts } = req.body; // [{ type, value, priority }]
    if (!Array.isArray(contacts)) {
      return sendResponse(res, ApiResponse.validationError([{ field: 'contacts', message: 'Danh sách liên hệ không hợp lệ' }]));
    }

    // Chỉ nhận các liên hệ không phải email và giá trị không rỗng
    const sanitized = contacts
      .filter(c => c && c.type && c.type !== 'email' && c.value)
      .map((c, idx) => ({ type: String(c.type), value: String(c.value), priority: Number(c.priority || idx + 1) }));

    // Thao tác: xóa toàn bộ liên hệ non-email cũ và tạo mới (đơn giản, rõ ràng)
    await AuthModel.deleteNonEmailContacts(req.user.sub); // Assuming AuthModel has this method
    if (sanitized.length > 0) {
      await AuthModel.createNonEmailContacts(req.user.sub, sanitized); // Assuming AuthModel has this method
    }

    // Trả lại profile mới với contacts đã cập nhật
    const user = await AuthModel.findUserByMaso(req.user.maso);
    const dto = AuthModel.toUserDTO(user);
    sendResponse(res, ApiResponse.success(dto, 'Cập nhật thông tin liên hệ thành công'));
  } catch (error) {
    logError('Update contacts error', error, { userId: req.user?.sub });
    sendResponse(res, ApiResponse.error('Lỗi server, vui lòng thử lại sau'));
  }
});

// Lấy thông tin cá nhân
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await AuthModel.findUserByMaso(req.user.maso);
    if (!user) {
      return sendResponse(res, ApiResponse.notFound('Không tìm thấy người dùng'));
    }
    const dto = AuthModel.toUserDTO(user);
    sendResponse(res, ApiResponse.success(dto, 'Lấy thông tin profile thành công'));
  } catch (error) {
    logError('Get profile error', error, { userId: req.user.sub });
    sendResponse(res, ApiResponse.error('Lỗi server, vui lòng thử lại sau'));
  }
});

// Đăng xuất
router.post('/logout', auth, async (req, res) => {
  try {
    logInfo('User logged out', { userId: req.user.sub, maso: req.user.maso, ip: req.ip });
    sendResponse(res, ApiResponse.success(null, 'Đăng xuất thành công'));
  } catch (error) {
    logError('Logout error', error, { userId: req.user.sub });
    sendResponse(res, ApiResponse.error('Lỗi server, vui lòng thử lại sau'));
  }
});

module.exports = router;