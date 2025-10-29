import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import http from '../services/http';
import { useAppStore } from '../store/useAppStore';
import sessionStorageManager from '../services/sessionStorageManager';
import { useTabSession } from '../contexts/TabSessionContext';
import { normalizeRole } from '../utils/role';

export default function LoginRedesign() {
  const navigate = useNavigate();
  const setAuth = useAppStore(s => s.setAuth);
  const { saveSession: saveTabSession } = useTabSession();
  const [formData, setFormData] = React.useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    <div 
      className="bg-cover bg-gradient-to-br from-[#7337FF] via-[#000000] to-[#0C7EA8] min-h-screen"
      style={{
        backgroundImage: 'url(https://res.cloudinary.com/dkt1t22qc/image/upload/v1742348950/Prestataires_Documents/fopt5esl9cgvlcawz1z4.jpg)'
      }}
    >
      <div className="h-screen flex justify-center items-center backdrop-brightness-50">
        <div className="flex flex-col items-center space-y-8">
          {/* Logo */}
          <div>
            <img
              src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/a409cac8-3a40-4097-9461-db92841b1a22.png"
              alt="Điểm Rèn Luyện Logo"
              className="cursor-pointer h-24 w-24 rounded-xl"
            />
          </div>

          {/* Login Form Card */}
          <div
            className="rounded-[20px] w-80 p-8 bg-[#310D84]"
            style={{ boxShadow: '-6px 3px 20px 4px #0000007d' }}
          >
            <h1 className="text-white text-3xl font-bold mb-4">Đăng nhập</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username input */}
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Tên đăng nhập hoặc Email"
                className="bg-[#8777BA] w-full p-2.5 rounded-md placeholder:text-gray-300 shadow-md shadow-blue-950 outline-none focus:ring-2 focus:ring-purple-400"
              />
              {errors.username && (
                <p className="text-red-400 text-xs ml-2">{errors.username}</p>
              )}

              {/* Password input */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Mật khẩu"
                  className="bg-[#8777BA] w-full p-2.5 pr-10 rounded-md placeholder:text-gray-300 shadow-md shadow-blue-950 outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs ml-2">{errors.password}</p>
              )}

              {/* Submit error */}
              {errors.submit && (
                <p className="text-red-400 text-xs ml-2">{errors.submit}</p>
              )}
            </form>

            {/* Forget Password link */}
            <div className="mb-4">
              <span className="text-[#228CE0] text-[10px] ml-2 cursor-pointer hover:underline">
                Quên mật khẩu?
              </span>
            </div>

            {/* Sign In button */}
            <div className="flex justify-center mb-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="h-10 w-full cursor-pointer text-white rounded-md bg-gradient-to-br from-[#7336FF] to-[#3269FF] shadow-md shadow-blue-950 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </div>

            {/* Sign up link */}
            <div className="text-gray-300 text-center text-xs">
              Chưa có tài khoản?{' '}
              <span className="text-[#228CE0] cursor-pointer hover:underline">
                Đăng ký
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

