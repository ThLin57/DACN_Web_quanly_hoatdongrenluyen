import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor yêu cầu để thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor phản hồi để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Dịch vụ xác thực
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateSelf: (payload) => api.put('/auth/profile', payload),
  updateContacts: (contacts) => api.put('/auth/contacts', { contacts }),
  forgotPassword: (identifier) => api.post('/auth/forgot', { identifier }),
  resetPassword: (payload) => api.post('/auth/reset', payload),
  changePassword: (payload) => api.post('/auth/change', payload),
};

// Dịch vụ người dùng
export const userService = {
  getUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Kiểm tra sức khỏe
export const healthService = {
  check: () => api.get('/health'),
};

// Dashboard services
export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary'),
  getOngoingActivities: () => api.get('/dashboard/activities/ongoing'),
  getMyActivities: () => api.get('/dashboard/activities/me'),
};

export const activitiesService = {
  register: (activityId) => api.post(`/activities/${activityId}/register`),
};

export default api;
