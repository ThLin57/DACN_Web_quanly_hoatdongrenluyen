import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (error) {
      // Xử lý lỗi validation từ backend
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errors.forEach(err => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        const message = error.response?.data?.message || 'Đăng nhập thất bại!';
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Nền với dải màu và hiệu ứng */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800">
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Các hình nổi */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-white/5 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-white/5 rounded-full animate-bounce"></div>
      </div>

      {/* Nội dung chính */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Logo/Thương hiệu */}
          <div className="text-center mb-8 animate-slide-in-up">
            <div className="mx-auto h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 animate-glow">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 animate-fade-in">
              Đăng nhập hệ thống
            </h2>
            <p className="text-white/80 text-sm animate-fade-in">
              Dành cho sinh viên, giảng viên và quản trị
            </p>
          </div>

          {/* Form đăng nhập */}
          <div className="glass-card p-8 animate-scale-in">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Ô nhập mã số sinh viên */}
              <div className="space-y-2">
                <label htmlFor="maso" className="block text-sm font-medium text-white/90">
                  Mã số sinh viên
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {/* Icon người dùng thống nhất với trang đăng ký */}
                    <svg className="h-5 w-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="maso"
                    name="maso"
                    type="text"
                    autoComplete="username"
                    {...register('maso', {
                      required: 'Mã số là bắt buộc',
                      minLength: {
                        value: 3,
                        message: 'Mã số phải có ít nhất 3 ký tự',
                      },
                    })}
                    className="modern-input pl-10 pr-4"
                    placeholder="Nhập mã số sinh viên (7 số)"
                  />
                </div>
                {errors.maso && (
                  <p className="text-red-300 text-sm flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.maso.message}
                  </p>
                )}
              </div>

              {/* Ô nhập mật khẩu */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-white/90">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {/* Icon khóa thống nhất với trang đăng ký */}
                    <svg className="h-5 w-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...register('password', {
                      required: 'Mật khẩu là bắt buộc',
                      minLength: {
                        value: 6,
                        message: 'Mật khẩu phải có ít nhất 6 ký tự',
                      },
                    })}
                    className="modern-input pl-10 pr-12"
                    placeholder="Nhập mật khẩu của bạn"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-white/60 hover:text-white/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-white/60 hover:text-white/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-300 text-sm flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Nút đăng nhập */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-gray-900 py-3 px-4 rounded-xl font-semibold hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent"></div>
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Đăng nhập</span>
                  </>
                )}
              </button>
            </form>

            {/* Liên kết đăng ký */}
            <div className="mt-6 text-center">
              <p className="text-white/80 text-sm">
                Chưa có tài khoản?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-white hover:text-white/80 transition-colors duration-200 underline decoration-2 underline-offset-2"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>

          {/* Thông tin tài khoản demo */}
          <div className="mt-8 glass-card p-6 animate-slide-in-up">
            <h3 className="text-white font-semibold mb-3 text-center">Tài khoản demo</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/80">
                <span>Admin:</span>
                <span className="font-mono">AD001 / Admin@123</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Giảng viên:</span>
                <span className="font-mono">GV001 / Teacher@123</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Sinh viên:</span>
                <span className="font-mono">SV210001 / Student@123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
