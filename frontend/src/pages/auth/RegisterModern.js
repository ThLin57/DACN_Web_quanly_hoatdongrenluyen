import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, User, Calendar, MapPin, Phone } from 'lucide-react';
import http from '../../services/http';
import { useAppStore } from '../../store/useAppStore';
import { normalizeRole } from '../../utils/role';
import './AuthModern.css';

export default function RegisterModern() {
  const navigate = useNavigate();
  const setAuth = useAppStore(s => s.setAuth);
  const [formData, setFormData] = React.useState({
    name: '',
    maso: '',
    email: '',
    password: '',
    confirmPassword: '',
    lopId: '',
    khoa: ''
  });
  const [classes, setClasses] = React.useState([]);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await http.get('/auth/classes');
        const raw = res.data?.data || res.data || [];
        const normalized = Array.isArray(raw)
          ? raw.map((c) => ({ id: c.value || c.id, ten_lop: c.label || c.ten_lop, khoa: c.khoa }))
          : [];
        setClasses(normalized);
      } catch (err) {
        console.error('Error loading classes:', err);
        setClasses([]);
      }
    };
    loadClasses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Vui lòng nhập họ tên';
    if (!formData.maso) newErrors.maso = 'Vui lòng nhập mã số sinh viên';
    else if (!/^\d{7}$/.test(formData.maso)) {
      newErrors.maso = 'Mã số sinh viên phải có đúng 7 chữ số';
    }
    if (!formData.email) newErrors.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    if (!formData.khoa) newErrors.khoa = 'Vui lòng chọn khoa';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        maso: formData.maso,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        lopId: formData.lopId || undefined,
        khoa: formData.khoa
      };

      const res = await http.post('/auth/register', payload);
      const data = res.data?.data || res.data;
      if (data || res.data?.success) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      }
    } catch (err) {
      console.error('[Register] Error:', err);
      const backendMsg = err?.response?.data?.message;
      const validationErrors = err?.response?.data?.errors;
      const message = backendMsg || (Array.isArray(validationErrors) && validationErrors[0]?.message) || 'Đăng ký thất bại';
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="box-signup">
            <ul>
              <form onSubmit={handleSubmit}>
                <h1>ĐĂNG KÝ</h1>
                
                <div className="user-signup">
                  <input 
                    className="inpt" 
                    type="text" 
                    name="name" 
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Họ và tên" 
                  />
                  <i className="fa fa-user"></i>
                </div>
                {errors.name && <div className="error-message">{errors.name}</div>}

                <div className="user-signup">
                  <input 
                    className="inpt" 
                    type="text" 
                    name="maso" 
                    value={formData.maso}
                    onChange={handleInputChange}
                    placeholder="Mã số sinh viên (7 chữ số)" 
                  />
                  <i className="fa fa-id-card"></i>
                </div>
                {errors.maso && <div className="error-message">{errors.maso}</div>}

                <div className="email-signup">
                  <input 
                    className="inpt" 
                    type="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email" 
                    required 
                  />
                  <i className='fa fa-envelope'></i>
                </div>
                {errors.email && <div className="error-message">{errors.email}</div>}

                <div className="user-signup">
                  <select 
                    className="inpt" 
                    name="khoa" 
                    value={formData.khoa}
                    onChange={handleInputChange}
                    style={{ color: 'white', backgroundColor: 'transparent' }}
                  >
                    <option value="">Chọn khoa</option>
                    <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                    <option value="Kinh tế">Kinh tế</option>
                    <option value="Ngoại ngữ">Ngoại ngữ</option>
                    <option value="Khoa học xã hội">Khoa học xã hội</option>
                  </select>
                  <i className="fa fa-graduation-cap"></i>
                </div>
                {errors.khoa && <div className="error-message">{errors.khoa}</div>}

                <div className="password-signup">
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
                    id="eye-signup" 
                    className={showPassword ? "fa fa-eye" : "fa fa-eye-slash"}
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: 'pointer' }}
                  ></i>
                </div>
                {errors.password && <div className="error-message">{errors.password}</div>}

                <div className="password-signup">
                  <input 
                    className="inpt" 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    name="confirmPassword" 
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Xác nhận mật khẩu" 
                    required 
                  />
                  <i 
                    id="eye-confirm" 
                    className={showConfirmPassword ? "fa fa-eye" : "fa fa-eye-slash"}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ cursor: 'pointer' }}
                  ></i>
                </div>
                {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}

                {errors.submit && <div className="error-message">{errors.submit}</div>}

                <button type="submit" className="btn" disabled={isLoading}>
                  {isLoading ? 'Đang đăng ký...' : 'ĐĂNG KÝ'}
                </button>
              </form>
              <div className="register-link">
                <p>Đã có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Đăng nhập</a></p>
              </div>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
