const jwt = require('jsonwebtoken');
const config = require('../config/app');
const { ApiResponse, sendResponse } = require('../utils/response');
const { logError } = require('../utils/logger');

// Middleware chính để verify JWT token
const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    
    if (!token) {
      return sendResponse(res, 401, ApiResponse.unauthorized('Token không được cung cấp'));
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    logError('Auth middleware error', error, { ip: req.ip, userAgent: req.get('User-Agent') });
    
    if (error.name === 'TokenExpiredError') {
      return sendResponse(res, 401, ApiResponse.unauthorized('Token đã hết hạn'));
    }
    
    if (error.name === 'JsonWebTokenError') {
      return sendResponse(res, 401, ApiResponse.unauthorized('Token không hợp lệ'));
    }
    
    return sendResponse(res, 401, ApiResponse.unauthorized('Token không hợp lệ hoặc đã hết hạn'));
  }
};

// Middleware để kiểm tra vai trò (chuẩn hóa so sánh không phân biệt hoa thường)
const authorizeRoles = (...roles) => (req, res, next) => {
  const userRole = String(req.user?.role || '').toUpperCase();
  const allowed = roles.map(r => String(r).toUpperCase());
  if (!userRole || !allowed.includes(userRole)) {
    return sendResponse(res, 403, ApiResponse.forbidden('Bạn không có quyền truy cập tài nguyên này'));
  }
  next();
};

// Middleware để kiểm tra quyền admin
const requireAdmin = (req, res, next) => {
  const role = String(req.user?.role || '').toUpperCase();
  if (role !== 'ADMIN') {
    return sendResponse(res, 403, ApiResponse.forbidden('Chỉ admin mới có quyền truy cập'));
  }
  next();
};

// Middleware để kiểm tra quyền teacher trở lên
const requireTeacher = (req, res, next) => {
  const role = String(req.user?.role || '').toUpperCase();
  const allowedRoles = ['ADMIN', 'GIANG_VIEN'];
  if (!role || !allowedRoles.includes(role)) {
    return sendResponse(res, 403, ApiResponse.forbidden('Chỉ giảng viên trở lên mới có quyền truy cập'));
  }
  next();
};

module.exports = {
  auth,
  authorizeRoles,
  requireAdmin,
  requireTeacher
};