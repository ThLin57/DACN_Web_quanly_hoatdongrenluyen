import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Users } from 'lucide-react';
import http from '../services/http';
import { useAppStore } from '../store/useAppStore';
import sessionStorageManager from '../services/sessionStorageManager';
import { useTabSession } from '../contexts/TabSessionContext';
import { normalizeRole } from '../utils/role';

export default function LoginModern() {
  const navigate = useNavigate();
  const setAuth = useAppStore(s => s.setAuth);
  const { saveSession: saveTabSession } = useTabSession();
  const [formData, setFormData] = React.useState({ username: '', password: '', remember: false });
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Vui lòng nhập tên đăng nhập hoặc email';
    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (formData.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const res = await http.post('/auth/login', { 
        maso: String(formData.username || '').trim(), 
        password: formData.password 
      });
      const data = res.data?.data || res.data;
      const token = data?.token || data?.data?.token;
      if (token) {
        const user = data?.user || null;
        const roleRaw = (user?.role || user?.roleCode || '').toString();
        const role = normalizeRole(roleRaw);
        
        saveTabSession({ token, user, role });
        try {
          window.localStorage.setItem('token', token);
          window.localStorage.setItem('user', JSON.stringify(user));
          if (formData.remember) {
            window.localStorage.setItem('remember_me', 'true');
          }
        } catch(_) {}
        
        try { setAuth({ token, user, role }); } catch(_) {}
        
        let target = '/';
        if (role === 'ADMIN') target = '/admin';
        else if (role === 'GIANG_VIEN') target = '/teacher';
        else if (role === 'LOP_TRUONG') target = '/monitor';
        else if (role === 'SINH_VIEN' || role === 'STUDENT') target = '/student';
        
        console.log('[Login] Logged in with role:', role, 'to tab:', sessionStorageManager.getTabId());
        navigate(target);
      } else {
        setErrors({ submit: 'Đăng nhập thất bại' });
      }
    } catch (err) {
      console.error('[Login] Error details:', err);
      const status = err?.response?.status;
      const backendMsg = err?.response?.data?.message;
      let message;
      
      if (status === 401) {
        message = backendMsg || 'Sai tên đăng nhập hoặc mật khẩu';
      } else if (status === 500) {
        message = 'Lỗi máy chủ. Vui lòng thử lại sau.';
      } else if (err?.code === 'ECONNABORTED') {
        message = 'Kết nối quá thời gian. Vui lòng kiểm tra mạng và thử lại.';
      } else if (err?.message && /Network\s?Error/i.test(err.message)) {
        message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.';
      } else {
        message = backendMsg || 'Đăng nhập không thành công. Vui lòng kiểm tra thông tin.';
      }
      
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 flex justify-center items-center w-screen h-screen p-5">
      <div className="min-h-screen flex w-full">
        {/* Left Side - Visual Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-blue-800 to-purple-700 justify-center items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10 px-10 text-center">
            <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl">
              <img
                src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/a409cac8-3a40-4097-9461-db92841b1a22.png"
                alt="Điểm Rèn Luyện Logo"
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Đăng Nhập An Toàn</h1>
            <p className="text-white/80 text-lg mb-8">
              Hệ thống quản lý hoạt động rèn luyện. Dữ liệu của bạn được bảo vệ 100% với các giao thức bảo mật mới nhất.
            </p>
            <div className="flex justify-center space-x-4">
              <div className="w-3 h-3 rounded-full bg-white/30"></div>
              <div className="w-3 h-3 rounded-full bg-white"></div>
              <div className="w-3 h-3 rounded-full bg-white/30"></div>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute -bottom-32 -left-40 w-80 h-80 border-4 border-white/30 rounded-full"></div>
          <div className="absolute -bottom-40 -left-20 w-80 h-80 border-4 border-white/30 rounded-full"></div>
          <div className="absolute top-0 -right-20 w-80 h-80 border-4 border-white/30 rounded-full"></div>
        </div>

        {/* Right Side - Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
          <div className="w-full max-w-md">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Chào Mừng Trở Lại</h2>
              <p className="text-gray-600 mb-8">Vui lòng đăng nhập vào tài khoản của bạn</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username/Email */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Tên đăng nhập hoặc Email
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="pl-10 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập tên đăng nhập hoặc email"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember & Forget Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    checked={formData.remember}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Quên mật khẩu?
                </a>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="rounded-md bg-red-50 p-3">
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang đăng nhập...
                    </span>
                  ) : (
                    'Đăng nhập'
                  )}
                </button>
              </div>
            </form>

            {/* Social Login Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">hoặc đăng nhập với</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="ml-2">Facebook</span>
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                  </svg>
                  <span className="ml-2">Google</span>
                </button>
              </div>
            </div>

            {/* Sign Up Link */}
            <p className="mt-8 text-center text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Đăng ký ngay
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

