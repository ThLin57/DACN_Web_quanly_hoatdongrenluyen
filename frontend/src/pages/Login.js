import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Users } from 'lucide-react';
import http from '../services/http';
import { useAppStore } from '../store/useAppStore';
import sessionStorageManager from '../services/sessionStorageManager';
import { useTabSession } from '../contexts/TabSessionContext';
import { normalizeRole } from '../utils/role';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAppStore(function(s){ return s.setAuth; });
  const { saveSession: saveTabSession } = useTabSession();
  const [formData, setFormData] = React.useState({ username: '', password: '', remember: false });
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const sliderImages = [
    '/images/cntt.png',
    '/images/dhdl.jpg'
  ];
  const [slide, setSlide] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setSlide(prev => (prev + 1) % sliderImages.length);
    }, 5000); // 5s per slide
    return () => clearInterval(id);
  }, [sliderImages.length]);

  function handleInputChange(e) {
    const name = e.target.name;
    const value = e.target.value;
    setFormData(function update(prev) {
      return Object.assign({}, prev, { [name]: value });
    });
    if (errors[name]) {
      setErrors(function clear(prev) {
        var next = Object.assign({}, prev);
        delete next[name];
        return next;
      });
    }
  }

  function validateForm() {
    var newErrors = {};
    if (!formData.username) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập hoặc email';
    }
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      var res = await http.post('/auth/login', { 
        maso: String(formData.username || '').trim(), 
        password: formData.password 
      });
      var data = res.data?.data || res.data;
      var token = data?.token || data?.data?.token;
      if (token) {
        var user = data?.user || null;
        var roleRaw = (user?.role || user?.roleCode || '').toString();
        var role = normalizeRole(roleRaw);
        saveTabSession({ token, user, role });
        try {
          window.localStorage.setItem('token', token);
          window.localStorage.setItem('user', JSON.stringify(user));
        } catch(_) {}
        try { setAuth({ token, user, role }); } catch(_) {}
        var target = '/';
        if (role === 'ADMIN') target = '/admin';
        else if (role === 'GIANG_VIEN') target = '/teacher';
        else if (role === 'LOP_TRUONG') target = '/monitor';
        else if (role === 'SINH_VIEN' || role === 'STUDENT') target = '/student';
        navigate(target);
      } else {
        setErrors({ submit: 'Đăng nhập thất bại' });
      }
    } catch (err) {
      console.error('[Login] Error details:', err);
      var status = err?.response?.status;
      var backendMsg = err?.response?.data?.message;
      var message;
      if (status === 401) message = backendMsg || 'Sai tên đăng nhập hoặc mật khẩu';
      else if (status === 500) message = 'Lỗi máy chủ. Vui lòng thử lại sau.';
      else if (err?.code === 'ECONNABORTED') message = 'Kết nối quá thời gian. Vui lòng kiểm tra mạng và thử lại.';
      else if (err?.message && /Network\s?Error/i.test(err.message)) message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.';
      else message = backendMsg || 'Đăng nhập không thành công. Vui lòng kiểm tra thông tin.';
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  }

  const submitError = errors.submit
    ? React.createElement(
        'div',
        { className: 'rounded-md bg-red-50 p-4' },
        React.createElement('div', { className: 'text-sm text-red-700' }, errors.submit)
      )
    : null;

  // Left: Slider panel (no text content)
  const leftPanel = (
    <div className="hidden md:flex flex-1 w-full md:w-1/2 justify-center items-center relative overflow-hidden bg-black">
      {sliderImages.map((src, idx) => (
        <img
          key={src}
          src={src}
          alt="slider"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${idx === slide ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      <div className="absolute inset-0 bg-black/30" />
      {/* Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
        {sliderImages.map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i === slide ? 'bg-white' : 'bg-white/40'}`}></div>
        ))}
      </div>
    </div>
  );

  // Right: Form with brand header
  const rightPanel = (
    <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8">
      <div className="w-full">
        {/* Top big heading - full width */}
        <div className="mb-8 text-center w-full">
          <h1 className="mx-auto text-2xl md:text-4xl lg:text-5xl font-extrabold text-green-600 leading-loose tracking-wide">
            <span className="block whitespace-nowrap">HỆ THỐNG QUẢN LÝ HOẠT ĐỘNG</span>
            <span className="block whitespace-nowrap mt-2">RÈN LUYỆN CỦA SINH VIÊN</span>
          </h1>
        </div>
        {/* Narrow content container for brand + form */}
        <div className="w-full max-w-md mx-auto">
        {/* Brand header moved from left */}
        <div className="flex flex-col items-center text-center mb-8">
          <img src="/images/it.jpg" alt="Logo" className="w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-lg object-cover" />
          <div className="mt-3 leading-snug">
            <div className="text-indigo-700 font-extrabold text-xl md:text-2xl tracking-wide">Đăng Nhập An Toàn</div>
            <div className="text-gray-500 text-xs md:text-sm max-w-[360px]">Hệ thống quản lý hoạt động rèn luyện. Dữ liệu của bạn được bảo vệ 100%.</div>
          </div>
        </div>
        <div className="text-center lg:text-left">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Chào Mừng Trở Lại</h2>
          <p className="text-gray-600 mb-8">Vui lòng đăng nhập vào tài khoản của bạn</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên đăng nhập hoặc Email</label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username || ''}
                onChange={handleInputChange}
                className="pl-10 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tên đăng nhập hoặc email"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password || ''}
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
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" checked={!!formData.remember} onChange={(e) => setFormData(p => ({ ...p, remember: e.target.checked }))} />
              <span className="ml-2 text-sm text-gray-700">Ghi nhớ đăng nhập</span>
            </label>
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500" onClick={(e) => { e.preventDefault(); window.location.href = '/forgot'; }}>Quên mật khẩu?</a>
          </div>
          {submitError}
          <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          Chưa có tài khoản? <a href="/register" className="text-blue-600 hover:text-blue-500 font-semibold">Đăng ký ngay</a>
        </div>
      </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:flex-row items-stretch">
      {leftPanel}
      {rightPanel}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px) } to { opacity: 1; transform: translateY(0) } .animate-fade-in { animation: fadeIn .5s ease-out forwards }`}</style>
    </div>
  );
}

