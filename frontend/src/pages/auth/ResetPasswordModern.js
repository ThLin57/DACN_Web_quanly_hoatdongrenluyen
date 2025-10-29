import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import http from '../../services/http';
import './AuthModern.css';

export default function ResetPasswordModern() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = React.useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [success, setSuccess] = React.useState('');

  const token = searchParams.get('token');

  React.useEffect(() => {
    if (!token) {
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const res = await http.post('/auth/reset', {
        token: token,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      if (res.data?.success || res.data?.data) {
        setSuccess('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.error('[ResetPassword] Error:', err);
      const backendMsg = err?.response?.data?.message;
      setErrors({ submit: backendMsg || 'Có lỗi xảy ra, vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
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
                <h1>ĐẶT LẠI MẬT KHẨU</h1>
                
                <div className="password-login">
                  <input 
                    className="inpt" 
                    type={showPassword ? 'text' : 'password'} 
                    name="password" 
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Mật khẩu mới" 
                    required 
                  />
                  <i 
                    className={showPassword ? "fa fa-eye" : "fa fa-eye-slash"}
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: 'pointer' }}
                  ></i>
                </div>
                {errors.password && <div className="error-message">{errors.password}</div>}

                <div className="password-login">
                  <input 
                    className="inpt" 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    name="confirmPassword" 
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Xác nhận mật khẩu mới" 
                    required 
                  />
                  <i 
                    className={showConfirmPassword ? "fa fa-eye" : "fa fa-eye-slash"}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ cursor: 'pointer' }}
                  ></i>
                </div>
                {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}

                {errors.submit && <div className="error-message">{errors.submit}</div>}
                {success && <div className="success-message">{success}</div>}

                <button type="submit" className="btn" disabled={isLoading}>
                  {isLoading ? 'Đang xử lý...' : 'ĐẶT LẠI MẬT KHẨU'}
                </button>
              </form>
              <div className="register-link">
                <p>Nhớ mật khẩu rồi? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Đăng nhập</a></p>
              </div>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
