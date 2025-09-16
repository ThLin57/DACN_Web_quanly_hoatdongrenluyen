const { ApiResponse, sendResponse } = require('../utils/response');
const { logInfo, logError } = require('../utils/logger');

// Định nghĩa permission system
const PERMISSIONS = {
  // User management
  'users.view': ['ADMIN'],
  'users.create': ['ADMIN'],
  'users.update': ['ADMIN'],
  'users.delete': ['ADMIN'],
  'users.update_own': ['SINH_VIEN', 'LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'],
  
  // Activity types management
  'activity_types.view': ['LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'],
  'activity_types.create': ['GIANG_VIEN', 'ADMIN'],
  'activity_types.update': ['GIANG_VIEN', 'ADMIN'],
  'activity_types.delete': ['ADMIN'],
  
  // Activity management
  'activities.view': ['SINH_VIEN', 'LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'],
  'activities.create': ['LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'],
  'activities.update': ['LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'],
  'activities.delete': ['LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'],
  'activities.approve': ['GIANG_VIEN', 'ADMIN'],
  'activities.reject': ['GIANG_VIEN', 'ADMIN'],
  
  // Activity registration management
  'registrations.view': ['LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'],
  'registrations.approve': ['LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'],
  'registrations.reject': ['LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'],
  'registrations.register': ['SINH_VIEN'],
  'registrations.cancel': ['SINH_VIEN'],
  'registrations.view_own': ['SINH_VIEN', 'LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'],
  
  // Attendance management
  'attendance.mark': ['SINH_VIEN'],
  'attendance.view': ['LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'],
  'attendance.manage': ['LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'],
  
  // Points and scores
  'points.view_own': ['SINH_VIEN', 'LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'],
  'points.view_all': ['LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'],
  'points.calculate': ['ADMIN'],
  
  // Reports and statistics
  'reports.view': ['LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'],
  'reports.export': ['LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'],
  'reports.system': ['ADMIN'],
  
  // Notifications
  'notifications.view': ['SINH_VIEN', 'LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'],
  'notifications.create': ['LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'],
  'notifications.manage': ['ADMIN'],
  
  // System management
  'system.dashboard': ['ADMIN'],
  'system.roles': ['ADMIN'],
  'system.settings': ['ADMIN'],
  'system.logs': ['ADMIN']
};

// Check if user has permission
function hasPermission(userRole, permission) {
  const normalizedRole = String(userRole || '').toUpperCase();
  const allowedRoles = PERMISSIONS[permission] || [];
  return allowedRoles.includes(normalizedRole);
}

// Middleware factory for permission checking
function requirePermission(permission) {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    if (!hasPermission(userRole, permission)) {
      logInfo('Permission denied', { 
        userId: req.user?.sub, 
        userRole, 
        permission, 
        ip: req.ip 
      });
      return sendResponse(res, 403, ApiResponse.forbidden(
        `Bạn không có quyền "${permission}". Vai trò hiện tại: ${userRole}`
      ));
    }
    
    next();
  };
}

// Resource ownership checking
function requireOwnership(getResourceOwnerId) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.sub;
      const userRole = req.user?.role;
      
      // Admin có thể truy cập tất cả
      if (userRole === 'ADMIN') {
        return next();
      }
      
      // Lấy ID của chủ sở hữu resource
      const ownerId = await getResourceOwnerId(req);
      
      if (userId !== ownerId) {
        return sendResponse(res, 403, ApiResponse.forbidden(
          'Bạn chỉ có thể truy cập tài nguyên của chính mình'
        ));
      }
      
      next();
    } catch (error) {
      logError('Ownership check error', error, { userId: req.user?.sub });
      return sendResponse(res, 500, ApiResponse.error('Lỗi kiểm tra quyền sở hữu'));
    }
  };
}

// Class/department-based access control
function requireClassAccess() {
  return async (req, res, next) => {
    try {
      const userRole = req.user?.role;
      const userId = req.user?.sub;
      
      // Admin có thể truy cập tất cả
      if (userRole === 'ADMIN') {
        return next();
      }
      
      // Giảng viên có thể truy cập các lớp mình phụ trách
      if (userRole === 'GIANG_VIEN') {
        // TODO: Implement teacher class access check
        return next();
      }
      
      // Lớp trưởng chỉ truy cập lớp của mình
      if (userRole === 'LOP_TRUONG') {
        // TODO: Implement monitor class access check
        return next();
      }
      
      // Sinh viên chỉ truy cập thông tin của lớp mình
      if (userRole === 'SINH_VIEN') {
        // TODO: Implement student class access check
        return next();
      }
      
      return sendResponse(res, 403, ApiResponse.forbidden('Không có quyền truy cập'));
    } catch (error) {
      logError('Class access check error', error, { userId: req.user?.sub });
      return sendResponse(res, 500, ApiResponse.error('Lỗi kiểm tra quyền truy cập lớp'));
    }
  };
}

// Activity-specific permissions
const ActivityPolicies = {
  // Kiểm tra quyền tạo hoạt động
  canCreate: requirePermission('activities.create'),
  
  // Kiểm tra quyền cập nhật hoạt động
  canUpdate: requirePermission('activities.update'),
  
  // Kiểm tra quyền xóa hoạt động
  canDelete: requirePermission('activities.delete'),
  
  // Kiểm tra quyền phê duyệt hoạt động
  canApprove: requirePermission('activities.approve'),
  
  // Kiểm tra quyền từ chối hoạt động
  canReject: requirePermission('activities.reject')
};

// Registration-specific permissions
const RegistrationPolicies = {
  // Kiểm tra quyền đăng ký hoạt động
  canRegister: requirePermission('registrations.register'),
  
  // Kiểm tra quyền hủy đăng ký
  canCancel: requirePermission('registrations.cancel'),
  
  // Kiểm tra quyền phê duyệt đăng ký
  canApprove: requirePermission('registrations.approve'),
  
  // Kiểm tra quyền từ chối đăng ký
  canReject: requirePermission('registrations.reject'),
  
  // Kiểm tra quyền xem đăng ký
  canView: requirePermission('registrations.view')
};

// User management policies
const UserPolicies = {
  canView: requirePermission('users.view'),
  canCreate: requirePermission('users.create'),
  canUpdate: requirePermission('users.update'),
  canDelete: requirePermission('users.delete'),
  canUpdateOwn: requirePermission('users.update_own')
};

// System management policies
const SystemPolicies = {
  canAccessDashboard: requirePermission('system.dashboard'),
  canManageRoles: requirePermission('system.roles'),
  canManageSettings: requirePermission('system.settings'),
  canViewLogs: requirePermission('system.logs')
};

module.exports = {
  PERMISSIONS,
  hasPermission,
  requirePermission,
  requireOwnership,
  requireClassAccess,
  ActivityPolicies,
  RegistrationPolicies,
  UserPolicies,
  SystemPolicies
};