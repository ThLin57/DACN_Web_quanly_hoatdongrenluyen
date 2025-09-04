/**
 * Các hàm tiện ích để định dạng dữ liệu
 */

// Định dạng ngày theo kiểu Việt Nam
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  const vietnameseDate = new Intl.DateTimeFormat('vi-VN', defaultOptions);
  return vietnameseDate.format(new Date(date));
};

// Định dạng ngày theo thời gian tương đối (ví dụ: "2 giờ trước")
export const formatRelativeTime = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now - targetDate) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Vừa xong';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }
  
  return formatDate(date, { year: 'numeric', month: 'short', day: 'numeric' });
};

// Định dạng tiền tệ (Việt Nam Đồng)
export const formatCurrency = (amount, currency = 'VND') => {
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(amount);
};

// Định dạng số theo ngôn ngữ Việt Nam
export const formatNumber = (number, options = {}) => {
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  };
  
  return new Intl.NumberFormat('vi-VN', defaultOptions).format(number);
};

// Định dạng số điện thoại
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('84')) {
    return `+84 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  if (cleaned.startsWith('0')) {
    return `0${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
};

// Định dạng kích thước tệp
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Định dạng tên (viết hoa chữ cái đầu)
export const formatName = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Định dạng hiển thị vai trò
export const formatRole = (role) => {
  const roleMap = {
    'admin': 'Quản trị viên',
    'teacher': 'Giảng viên',
    'student': 'Sinh viên'
  };
  
  return roleMap[role] || role;
};

// Định dạng hiển thị trạng thái
export const formatStatus = (status) => {
  const statusMap = {
    'hot': 'Hoạt động',
    'khoa': 'Đã khóa',
    'pending': 'Chờ xử lý',
    'approved': 'Đã duyệt',
    'rejected': 'Từ chối'
  };
  
  return statusMap[status] || status;
};

// Cắt ngắn văn bản
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

// Tạo chữ cái đầu từ tên
export const getInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};
