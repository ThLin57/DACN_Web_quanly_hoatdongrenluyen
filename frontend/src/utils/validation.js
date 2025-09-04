/**
 * Các hàm tiện ích cho việc xác thực form
 */

// Xác thực email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Xác thực mật khẩu
export const isValidPassword = (password) => {
  // Ít nhất 6 ký tự, có chữ hoa, chữ thường, số
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
  return passwordRegex.test(password);
};

// Xác thực số điện thoại (định dạng Việt Nam)
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/;
  return phoneRegex.test(phone);
};

// Xác thực trường bắt buộc
export const isRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

// Xác thực độ dài tối thiểu
export const hasMinLength = (value, minLength) => {
  return value && value.toString().length >= minLength;
};

// Xác thực độ dài tối đa
export const hasMaxLength = (value, maxLength) => {
  return value && value.toString().length <= maxLength;
};

// Xác thực số
export const isNumber = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};

// Xác thực ngày tháng
export const isValidDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

// Xác thực ngày trong tương lai
export const isFutureDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  return d > now;
};

// Xác thực ngày trong quá khứ
export const isPastDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  return d < now;
};

// Xác thực kích thước file (tính bằng MB)
export const isValidFileSize = (file, maxSizeMB) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file && file.size <= maxSizeBytes;
};

// Xác thực loại file
export const isValidFileType = (file, allowedTypes) => {
  return file && allowedTypes.includes(file.type);
};

// Xác thực URL
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Xác thực tên tiếng Việt
export const isValidVietnameseName = (name) => {
  const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊẾÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêếìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/;
  return nameRegex.test(name);
};

// Xác thực mã số sinh viên (7 chữ số)
export const isValidStudentId = (studentId) => {
  const studentIdRegex = /^\d{7}$/;
  return studentIdRegex.test(studentId);
};

// Các thông báo lỗi xác thực
export const getValidationMessage = (field, rule, value = null) => {
  const messages = {
    required: `${field} là bắt buộc`,
    email: `${field} không đúng định dạng`,
    password: `${field} phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số`,
    phone: `${field} không đúng định dạng số điện thoại Việt Nam`,
    minLength: `${field} phải có ít nhất ${value} ký tự`,
    maxLength: `${field} không được vượt quá ${value} ký tự`,
    number: `${field} phải là số`,
    date: `${field} không đúng định dạng ngày`,
    futureDate: `${field} phải là ngày trong tương lai`,
    pastDate: `${field} phải là ngày trong quá khứ`,
    fileSize: `${field} không được vượt quá ${value}MB`,
    fileType: `${field} không đúng định dạng file`,
    url: `${field} không đúng định dạng URL`,
    vietnameseName: `${field} chỉ được chứa chữ cái và khoảng trắng`,
    studentId: `${field} phải có đúng 7 chữ số`
  };
  
  return messages[rule] || `${field} không hợp lệ`;
};
