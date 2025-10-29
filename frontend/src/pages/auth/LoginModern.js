import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import http from '../../services/http';
import { useAppStore } from '../../store/useAppStore';
import sessionStorageManager from '../../services/sessionStorageManager';
import { useTabSession } from '../../contexts/TabSessionContext';
import { normalizeRole } from '../../utils/role';
import './AuthModern.css';

export default function LoginModern() {
  const navigate = useNavigate();
  const setAuth = useAppStore(function(s){ return s.setAuth; });
  const { saveSession: saveTabSession } = useTabSession();
  const [formData, setFormData] = React.useState({ username: '', password: '', remember: false });
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

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

  return (
    <div
      className="auth-container"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL || ''}/images/VNUR.jpg)`
      }}
    >
      <div className="auth-heading">
        <span className="line1">HỆ THỐNG QUẢN LÝ</span>
        <span className="line2">HOẠT ĐỘNG RÈN LUYỆN CỦA SINH VIÊN</span>
      </div>
      <div className="box">
        <div className="flip-card-inner">
          <div className="box-login">
            <ul>
              <form onSubmit={handleSubmit}>
                <h1>ĐĂNG NHẬP</h1>
                <div className="email-login">
                  <input 
                    className="inpt" 
                    type="text" 
                    name="username" 
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Mã số sinh viên hoặc Email" 
                    required 
                  />
                  <i className='fa fa-envelope'></i>
                </div>
                {errors.username && <div className="error-message">{errors.username}</div>}

                <div className="password-login">
                  <input 
                    className="inpt" 
                    type={showPassword ? 'text' : 'password'} 
                    name="password" 
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Mật khẩu" 
                    required 
                  />
                  <i 
                    id="eye-login" 
                    className={showPassword ? "fa fa-eye" : "fa fa-eye-slash"}
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: 'pointer' }}
                  ></i>
                </div>
                {errors.password && <div className="error-message">{errors.password}</div>}

                <div className="forget">
                  <input 
                    type="checkbox" 
                    name="remember" 
                    id="checkbox"
                    checked={formData.remember}
                    onChange={(e) => setFormData(p => ({ ...p, remember: e.target.checked }))}
                  />
                  <label htmlFor="checkbox">Ghi nhớ đăng nhập</label>
                  <a href="/forgot-password" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>Quên mật khẩu?</a>
                </div>

                {errors.submit && <div className="error-message">{errors.submit}</div>}

                <button type="submit" className="btn" disabled={isLoading}>
                  {isLoading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
                </button>
              </form>
              <div className="register-link">
                <p>Chưa có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Đăng ký ngay</a></p>
              </div>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
