const UserModel = require('../models/user.model');
const { ApiResponse, sendResponse } = require('../utils/response');
const { logInfo, logError } = require('../utils/logger');

// Lấy danh sách tất cả người dùng
exports.list = async (req, res) => {
  try {
    const users = await UserModel.findAll();
    logInfo('Users list retrieved', { count: users.length });
    sendResponse(res, ApiResponse.success(users, 'Lấy danh sách users thành công'));
  } catch (error) {
    logError('List users error', error);
    sendResponse(res, ApiResponse.error('Lỗi server, vui lòng thử lại sau'));
  }
};

// Lấy thông tin người dùng theo ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);
    if (!user) {
      return sendResponse(res, ApiResponse.notFound('Không tìm thấy người dùng'));
    }
    sendResponse(res, ApiResponse.success(user, 'Lấy thông tin người dùng thành công'));
  } catch (error) {
    logError('Get user by ID error', error);
    sendResponse(res, ApiResponse.error('Lỗi server, vui lòng thử lại sau'));
  }
};

// Cập nhật thông tin người dùng
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    // Cập nhật thông tin cơ bản của người dùng
    const updatedUser = await UserModel.updateBasic(id, { name });
    if (!updatedUser) {
      return sendResponse(res, ApiResponse.notFound('Không tìm thấy người dùng'));
    }

    // Cập nhật email nếu có - sẽ chuyển sang model sau nếu cần thiết
    if (email) {
      // Có thể gọi service EmailContact.updateForUser(id, email) tại đây
    }

    sendResponse(res, ApiResponse.success({ ...updatedUser, email }, 'Cập nhật người dùng thành công'));
  } catch (error) {
    logError('Update user error', error);
    sendResponse(res, ApiResponse.error('Lỗi server, vui lòng thử lại sau'));
  }
};

// Xóa người dùng
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await UserModel.deleteById(id);
    if (!ok) {
      return sendResponse(res, ApiResponse.notFound('Không tìm thấy người dùng'));
    }
    sendResponse(res, ApiResponse.success(null, 'Xóa người dùng thành công'));
  } catch (error) {
    logError('Delete user error', error);
    sendResponse(res, ApiResponse.error('Lỗi server, vui lòng thử lại sau'));
  }
};

// Tạo người dùng mới - giữ nguyên logic hiện tại hoặc sẽ tách ra model riêng nếu được sử dụng nhiều
exports.create = async (req, res) => {
  sendResponse(res, ApiResponse.error('Chức năng tạo user trực tiếp chưa được kích hoạt', 501));
};