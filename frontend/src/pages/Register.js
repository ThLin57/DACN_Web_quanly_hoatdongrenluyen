import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, User, Calendar, MapPin, Phone, ArrowLeft, ShieldCheck } from 'lucide-react';
import http from '../services/http';
import { useAppStore } from '../store/useAppStore';
import { normalizeRole } from '../utils/role';

export default function RegisterComplete() {
  const navigate = useNavigate();
  const setAuth = useAppStore(s => s.setAuth);
  const [formData, setFormData] = React.useState({
    // NguoiDung fields
    ten_dn: '',
    mat_khau: '',
    email: '',
    ho_ten: '',
    vai_tro: 'SINH_VIEN',
    agreeToTerms: false
  });
  const [studentData, setStudentData] = React.useState({
    mssv: '',
    ngay_sinh: '',
    gt: '',
    lop_id: '',
    dia_chi: '',
    sdt: ''
  });
  const [classes, setClasses] = React.useState([]);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // Load classes (public endpoint)
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
    const { name, value, type, checked } = e.target;
    if (name.includes('student_')) {
      const fieldName = name.replace('student_', '');
      setStudentData(prev => ({ ...prev, [fieldName]: value }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.ten_dn) newErrors.ten_dn = 'Vui lòng nhập tên đăng nhập';
    if (!formData.email) newErrors.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.mat_khau) newErrors.mat_khau = 'Vui lòng nhập mật khẩu';
    else if (formData.mat_khau.length < 6) {
      newErrors.mat_khau = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!confirmPassword) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    else if (confirmPassword !== formData.mat_khau) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    if (!formData.ho_ten) newErrors.ho_ten = 'Vui lòng nhập họ tên';

    if (!studentData.mssv) newErrors.mssv = 'Vui lòng nhập MSSV';
    if (!studentData.ngay_sinh) newErrors.ngay_sinh = 'Vui lòng nhập ngày sinh';
    if (!studentData.gt) newErrors.gt = 'Vui lòng chọn giới tính';
    if (!studentData.lop_id) newErrors.lop_id = 'Vui lòng chọn lớp';

    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'Vui lòng đồng ý với điều khoản';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const payload = {
        name: formData.ho_ten,
        maso: formData.ten_dn,
        email: formData.email,
        password: formData.mat_khau,
        confirmPassword: confirmPassword,
        lopId: studentData.lop_id || undefined,
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

  // Password strength (đơn giản: độ dài + đa dạng ký tự)
  const passwordScore = React.useMemo(() => {
    const p = formData.mat_khau || '';
    let s = 0;
    if (p.length >= 6) s += 25;
    if (p.length >= 10) s += 25;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s += 25;
    if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s += 25;
    return Math.min(100, s);
  }, [formData.mat_khau]);

  const strengthColor = passwordScore < 50 ? 'bg-red-500' : passwordScore < 80 ? 'bg-yellow-500' : 'bg-green-600';
  const strengthText = passwordScore < 50 ? 'Yếu' : passwordScore < 80 ? 'Trung bình' : 'Mạnh';

  return (
    <section className="bg-white min-h-screen py-10 sm:py-12 relative overflow-hidden animate-page-enter">
      {/* Decorative dynamic accents */}
      <div className="pointer-events-none absolute -top-28 -left-28 w-96 h-96 rounded-full bg-blue-50 blur-3xl opacity-60 animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-indigo-50 blur-3xl opacity-60 animate-pulse" />

      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 mb-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors" aria-label="Quay lại">
          <ArrowLeft className="h-5 w-5" /> Quay lại
        </button>
      </div>

      {/* Form */}
      {/* Colorful gradient border while keeping white background */}
      <div className="w-[92%] max-w-[980px] mx-auto p-[2px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-card-enter">
      <form
        onSubmit={handleSubmit}
        className="flex rounded-[14px] mx-auto p-6 sm:p-8 flex-col items-center gap-6 bg-white w-full shadow-xl transition-all hover:shadow-2xl"
      >
        {/* Title */}
        <div className="w-full flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 text-3xl sm:text-4xl font-extrabold tracking-tight">Tạo tài khoản</h1>
            <p className="text-gray-600 text-sm mt-1">Gia nhập hệ thống quản lý hoạt động rèn luyện.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-blue-600 font-semibold">
            <ShieldCheck className="h-5 w-5" />
            Bảo mật bởi SSL
          </div>
        </div>

        {/* Personal info */}
        <div className="w-full text-left mt-2 mb-1 text-xs font-semibold uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Thông tin cá nhân</div>
        <div className="flex w-full gap-4">
          <div className="flex flex-col gap-2 w-full">
            <label className="w-full text-gray-700 text-sm font-medium">Họ tên</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                name="ho_ten"
                value={formData.ho_ten}
                onChange={handleInputChange}
                placeholder="Nguyễn Văn A"
                className="w-full bg-white text-gray-900 outline-none py-3 pl-10 pr-4 text-base rounded-lg border border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {errors.ho_ten && <p className="text-red-400 text-sm mt-1">{errors.ho_ten}</p>}
          </div>
        </div>

        {/* Account info */}
        <div className="w-full text-left mt-2 mb-1 text-xs font-semibold uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Thông tin tài khoản</div>
        <div className="flex w-full gap-4">
          <div className="flex flex-col gap-2 w-full">
            <label className="w-full text-gray-700 text-sm font-medium">Tên đăng nhập</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                name="ten_dn"
                value={formData.ten_dn}
                onChange={handleInputChange}
                placeholder="username123"
                className="w-full bg-white text-gray-900 outline-none py-3 pl-10 pr-4 text-base rounded-lg border border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {errors.ten_dn && <p className="text-red-400 text-sm mt-1">{errors.ten_dn}</p>}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="w-full text-gray-700 text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@email.com"
                className="w-full bg-white text-gray-900 outline-none py-3 pl-10 pr-4 text-base rounded-lg border border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Student: MSSV & Class */}
        <div className="flex w-full gap-4">
          <div className="flex flex-col gap-2 w-full">
            <label className="w-full text-gray-700 text-sm font-medium">MSSV</label>
            <input
              type="text"
              name="student_mssv"
              value={studentData.mssv}
              onChange={handleInputChange}
              placeholder="202110001"
              className="w-full bg-white text-gray-900 outline-none py-3 px-4 text-base rounded-lg border border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.mssv && <p className="text-red-400 text-sm mt-1">{errors.mssv}</p>}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="w-full text-gray-700 text-sm font-medium">Lớp</label>
            <select
              name="student_lop_id"
              value={studentData.lop_id}
              onChange={handleInputChange}
              className="w-full bg-white text-gray-900 outline-none py-3 px-4 text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn lớp</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.ten_lop} - {cls.khoa}
                </option>
              ))}
            </select>
            {errors.lop_id && <p className="text-red-400 text-sm mt-1">{errors.lop_id}</p>}
          </div>
        </div>

        {/* Birthday & Gender */}
        <div className="flex w-full gap-4">
          <div className="flex flex-col gap-2 w-full">
            <label className="w-full text-gray-700 text-sm font-medium">Ngày sinh</label>
            <input
              type="date"
              name="student_ngay_sinh"
              value={studentData.ngay_sinh}
              onChange={handleInputChange}
              className="w-full bg-white text-gray-900 outline-none py-3 px-4 text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.ngay_sinh && <p className="text-red-400 text-sm mt-1">{errors.ngay_sinh}</p>}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="w-full text-gray-700 text-sm font-medium">Giới tính</label>
            <select
              name="student_gt"
              value={studentData.gt}
              onChange={handleInputChange}
              className="w-full bg-white text-gray-900 outline-none py-3 px-4 text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn giới tính</option>
              <option value="nam">Nam</option>
              <option value="nu">Nữ</option>
              <option value="khac">Khác</option>
            </select>
            {errors.gt && <p className="text-red-400 text-sm mt-1">{errors.gt}</p>}
          </div>
        </div>

        {/* Address & Phone */}
        <div className="flex w-full gap-4">
          <div className="flex flex-col gap-2 w-full">
            <label className="w-full text-gray-700 text-sm font-medium">Địa chỉ</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                name="student_dia_chi"
                value={studentData.dia_chi}
                onChange={handleInputChange}
                placeholder="Địa chỉ nhà"
                className="w-full bg-white text-gray-900 outline-none py-3 pl-10 pr-4 text-base rounded-lg border border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label className="w-full text-gray-700 text-sm font-medium">Số điện thoại</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="tel"
                name="student_sdt"
                value={studentData.sdt}
                onChange={handleInputChange}
                placeholder="0123456789"
                className="w-full bg-white text-gray-900 outline-none py-3 pl-10 pr-4 text-base rounded-lg border border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="flex w-full gap-4">
          <div className="flex flex-col gap-2 w-full">
            <label className="w-full text-gray-700 text-sm font-medium">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="mat_khau"
                value={formData.mat_khau}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full bg-white text-gray-900 outline-none py-3 px-4 pr-12 text-base rounded-lg border border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {/* Strength bar */}
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${strengthColor} transition-all duration-300`} style={{ width: `${passwordScore}%` }} />
            </div>
            <span className="text-xs text-gray-600">Độ mạnh mật khẩu: <strong className="uppercase">{strengthText}</strong></span>
            {errors.mat_khau && <p className="text-red-400 text-sm mt-1">{errors.mat_khau}</p>}
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex w-full gap-4">
          <div className="flex flex-col gap-2 w-full">
            <label className="w-full text-gray-700 text-sm font-medium">Xác nhận mật khẩu</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirm_password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white text-gray-900 outline-none py-3 px-4 pr-12 text-base rounded-lg border border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>

        {/* Terms */}
        <div className="flex gap-2 items-center w-full max-w-[520px]">
          <input
            type="checkbox"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            className="w-[18px] h-[18px] appearance-none bg-white border-2 border-gray-300 rounded-[4px] checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-500 transition"
          />
          <span className="text-gray-700 text-sm">Tôi đồng ý với Điều khoản & Điều kiện.</span>
        </div>
        {errors.agreeToTerms && <p className="text-red-400 text-sm">{errors.agreeToTerms}</p>}

        {/* Submit error */}
        {errors.submit && (
          <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full max-w-[320px] h-[52px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-pink-600 rounded-xl shadow-lg justify-center items-center inline-flex text-white text-lg font-semibold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px"
        >
          {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>

        {/* Login Link */}
        <span className="text-gray-700 text-sm font-medium">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 cursor-pointer underline">
            Đăng nhập
          </Link>
        </span>
      </form>
      </div>
      <style>{`
        @keyframes pageEnter { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cardEnter { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        .animate-page-enter { animation: pageEnter .35s ease-out both; }
        .animate-card-enter { animation: cardEnter .45s ease-out both; }
      `}</style>
    </section>
  );
}

