import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, User, Calendar, MapPin, Phone } from 'lucide-react';
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
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // Load classes
    const loadClasses = async () => {
      try {
        const res = await http.get('/admin/classes');
        const data = res.data?.data || res.data || [];
        setClasses(Array.isArray(data) ? data : []);
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
    
    // NguoiDung validation
    if (!formData.ten_dn) newErrors.ten_dn = 'Vui lòng nhập tên đăng nhập';
    if (!formData.email) newErrors.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.mat_khau) newErrors.mat_khau = 'Vui lòng nhập mật khẩu';
    else if (formData.mat_khau.length < 6) {
      newErrors.mat_khau = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!formData.ho_ten) newErrors.ho_ten = 'Vui lòng nhập họ tên';

    // SinhVien validation
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
        ten_dn: formData.ten_dn,
        mat_khau: formData.mat_khau,
        email: formData.email,
        ho_ten: formData.ho_ten,
        vai_tro: formData.vai_tro,
        mssv: studentData.mssv,
        ngay_sinh: studentData.ngay_sinh,
        gt: studentData.gt,
        lop_id: studentData.lop_id,
        dia_chi: studentData.dia_chi,
        sdt: studentData.sdt
      };

      const res = await http.post('/auth/register', payload);
      
      const data = res.data?.data || res.data;
      if (data || res.data?.success) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      }
    } catch (err) {
      console.error('[Register] Error:', err);
      const message = err?.response?.data?.message || err?.response?.data?.msg || 'Đăng ký thất bại';
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-[#200052] min-h-screen py-12">
      {/* Top Wave SVG */}
      <svg viewBox="0 0 1437 116" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0.0415039 108.599L15 93.6191C29.9584 78.8634 59.8754 48.5667 89.7923 33.8111C119.709 18.831 149.626 18.8309 179.543 18.8309C209.46 18.8309 239.377 18.831 269.294 45.7614C299.211 72.6919 337.083 42.1423 367 69.0728C373 111.573 434.625 87.672 464.542 81.6687C494.458 75.8899 541.125 84.474 571.042 81.6687C600.958 78.8634 636.083 126.385 666 108.599C695.917 90.4772 700.583 108.767 730.5 93.6191C760.417 78.4707 791.083 72.8602 821 93.6191C850.917 114.378 867.633 60.9098 897.55 63.715C927.467 66.5203 948.083 87.8403 978 63.715C1007.92 39.5898 1047.13 42.9562 1077.05 42.7879C1106.97 42.9562 1136.89 66.5203 1166.8 63.715C1196.72 60.9098 1226.64 30.6131 1256.55 39.7582C1286.47 48.5667 1316.39 96.8171 1346.3 111.573C1376.22 126.553 1381.54 90.6455 1396.5 81.6687L1436.05 90.6455V0.877274H1421.1C1406.14 0.877274 1376.22 0.877274 1346.3 0.877274C1316.39 0.877274 1286.47 0.877274 1256.55 0.877274C1226.64 0.877274 1196.72 0.877274 1166.8 0.877274C1136.89 0.877274 1106.97 0.877274 1077.05 0.877274C1047.13 0.877274 1017.22 0.877274 987.3 0.877274C957.384 0.877274 927.467 0.877274 897.55 0.877274C867.633 0.877274 837.716 0.877274 807.799 0.877274C777.882 0.877274 747.965 0.877274 718.048 0.877274C688.131 0.877274 658.214 0.877274 628.297 0.877274C598.38 0.877274 568.463 0.877274 538.546 0.877274C508.629 0.877274 478.713 0.877274 448.796 0.877274C418.879 0.877274 388.962 0.877274 359.045 0.877274C329.128 0.877274 299.211 0.877274 269.294 0.877274C239.377 0.877274 209.46 0.877274 179.543 0.877274C149.626 0.877274 119.709 0.877274 89.7923 0.877274C59.8754 0.877274 29.9584 0.877274 15 0.877274H0.0415039V108.599Z"
          fill="#7A0BC0"
        />
      </svg>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex rounded-[30px] mx-auto p-8 flex-col items-center gap-6 bg-[#270082] w-full max-w-[800px]"
      >
        <h1 className="pt-7 mx-auto text-white text-5xl font-bold tracking-widest">Đăng ký</h1>

        {/* Họ và tên */}
        <div className="flex w-full gap-4">
          <div className="flex flex-col gap-2 w-full">
            <label className="w-full text-white text-lg font-medium tracking-wide">Họ tên</label>
            <input
              type="text"
              name="ho_ten"
              value={formData.ho_ten}
              onChange={handleInputChange}
              placeholder="Nguyễn Văn A"
              className="w-full text-white bg-[#270082] focus:border-white outline-none py-3 px-8 text-xl rounded-[50px] border-[3px] border-[#7A0BC0] focus:ring-2 focus:ring-purple-400"
            />
            {errors.ho_ten && <p className="text-red-400 text-sm mt-1">{errors.ho_ten}</p>}
          </div>
        </div>

        {/* Tên đăng nhập và Email */}
        <div className="flex w-full gap-4">
          <div className="flex flex-col gap-2 w-full">
            <label className="w-full text-white text-lg font-medium tracking-wide">Tên đăng nhập</label>
            <input
              type="text"
              name="ten_dn"
              value={formData.ten_dn}
              onChange={handleInputChange}
              placeholder="username123"
              className="w-full text-white bg-[#270082] focus:border-white outline-none py-3 px-8 text-xl rounded-[50px] border-[3px] border-[#7A0BC0] focus:ring-2 focus:ring-purple-400"
            />
            {errors.ten_dn && <p className="text-red-400 text-sm mt-1">{errors.ten_dn}</p>}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="w-full text-white text-lg font-medium tracking-wide">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@email.com"
              className="w-full text-white bg-[#270082] focus:border-white outline-none py-3 px-8 text-xl rounded-[50px] border-[3px] border-[#7A0BC0] focus:ring-2 focus:ring-purple-400"
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* MSSV và Lớp */}
        <div className="flex w-full gap-4">
          <div className="flex flex-col gap-2 w-full">
            <label className="w-full text-white text-lg font-medium tracking-wide">MSSV</label>
            <input
              type="text"
              name="student_mssv"
              value={studentData.mssv}
              onChange={handleInputChange}
              placeholder="202110001"
              className="w-full text-white bg-[#270082] focus:border-white outline-none py-3 px-8 text-xl rounded-[50px] border-[3px] border-[#7A0BC0] focus:ring-2 focus:ring-purple-400"
            />
            {errors.mssv && <p className="text-red-400 text-sm mt-1">{errors.mssv}</p>}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="w-full text-white text-lg font-medium tracking-wide">Lớp</label>
            <select
              name="student_lop_id"
              value={studentData.lop_id}
              onChange={handleInputChange}
              className="w-full text-white bg-[#270082] focus:border-white outline-none py-3 px-8 text-xl rounded-[50px] border-[3px] border-[#7A0BC0] focus:ring-2 focus:ring-purple-400"
            >
              <option value="">Chọn lớp</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id} style={{ backgroundColor: '#270082' }}>
                  {cls.ten_lop} - {cls.khoa}
                </option>
              ))}
            </select>
            {errors.lop_id && <p className="text-red-400 text-sm mt-1">{errors.lop_id}</p>}
          </div>
        </div>

        {/* Ngày sinh và Giới tính */}
        <div className="flex w-full gap-4">
          <div className="flex flex-col gap-2 w-full">
            <label className="w-full text-white text-lg font-medium tracking-wide">Ngày sinh</label>
            <input
              type="date"
              name="student_ngay_sinh"
              value={studentData.ngay_sinh}
              onChange={handleInputChange}
              className="w-full text-white bg-[#270082] focus:border-white outline-none py-3 px-8 text-xl rounded-[50px] border-[3px] border-[#7A0BC0] focus:ring-2 focus:ring-purple-400"
            />
            {errors.ngay_sinh && <p className="text-red-400 text-sm mt-1">{errors.ngay_sinh}</p>}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="w-full text-white text-lg font-medium tracking-wide">Giới tính</label>
            <select
              name="student_gt"
              value={studentData.gt}
              onChange={handleInputChange}
              className="w-full text-white bg-[#270082] focus:border-white outline-none py-3 px-8 text-xl rounded-[50px] border-[3px] border-[#7A0BC0] focus:ring-2 focus:ring-purple-400"
            >
              <option value="">Chọn giới tính</option>
              <option value="nam">Nam</option>
              <option value="nu">Nữ</option>
              <option value="khac">Khác</option>
            </select>
            {errors.gt && <p className="text-red-400 text-sm mt-1">{errors.gt}</p>}
          </div>
        </div>

        {/* Địa chỉ và SĐT */}
        <div className="flex w-full gap-4">
          <div className="flex flex-col gap-2 w-full">
            <label className="w-full text-white text-lg font-medium tracking-wide">Địa chỉ</label>
            <input
              type="text"
              name="student_dia_chi"
              value={studentData.dia_chi}
              onChange={handleInputChange}
              placeholder="Địa chỉ nhà"
              className="w-full text-white bg-[#270082] focus:border-white outline-none py-3 px-8 text-xl rounded-[50px] border-[3px] border-[#7A0BC0] focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="w-full text-white text-lg font-medium tracking-wide">Số điện thoại</label>
            <input
              type="tel"
              name="student_sdt"
              value={studentData.sdt}
              onChange={handleInputChange}
              placeholder="0123456789"
              className="w-full text-white bg-[#270082] focus:border-white outline-none py-3 px-8 text-xl rounded-[50px] border-[3px] border-[#7A0BC0] focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>

        {/* Mật khẩu */}
        <div className="flex w-full gap-4">
          <div className="flex flex-col gap-2 w-full">
            <label className="w-full text-white text-lg font-medium tracking-wide">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="mat_khau"
                value={formData.mat_khau}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full text-white bg-[#270082] focus:border-white outline-none py-3 px-8 pr-12 text-xl rounded-[50px] border-[3px] border-[#7A0BC0] focus:ring-2 focus:ring-purple-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.mat_khau && <p className="text-red-400 text-sm mt-1">{errors.mat_khau}</p>}
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="flex gap-2 items-center w-full max-w-[505px]">
          <input
            type="checkbox"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            className="w-[23px] h-[23px] appearance-none bg-[#270082] border-2 border-[#7a0bc0] rounded-[5px] checked:bg-[#7a0bc0] checked:border-[#270082] focus:ring-2 focus:ring-[#7a0bc0] transition"
          />
          <span className="text-white text-sm font-normal tracking-tight">
            Tôi xác nhận đã đọc kỹ các Điều khoản & Điều kiện và đồng ý với chúng.
          </span>
        </div>
        {errors.agreeToTerms && <p className="text-red-400 text-sm">{errors.agreeToTerms}</p>}

        {/* Submit Error */}
        {errors.submit && (
          <div className="w-full bg-red-500/20 border border-red-500 rounded-lg p-3">
            <p className="text-red-300 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-[300px] h-[62px] bg-gradient-to-r from-[#7a0bc0] to-[#fa58b6] rounded-[10px] shadow-[4px_4px_60px_0px_rgba(0,0,0,0.25)] justify-center items-center gap-2.5 inline-flex text-white text-2xl font-bold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>

        {/* Login Link */}
        <span className="text-white text-sm font-medium tracking-tight">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-[#fa58b6] cursor-pointer underline">
            Đăng nhập
          </Link>
        </span>
      </form>

      {/* Bottom Wave SVG */}
      <svg viewBox="0 0 1190 195" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0 35L51 18.1756C70.8333 36.1083 79.3333 0.243001 119 9.33327C158.667 18.4235 198.333 0.243002 238 0.490919C277.667 0.243002 317.333 18.4235 357 18.1756C396.667 18.4235 436.333 0.243003 476 13.7131C515.667 26.6874 555.333 71.3124 595 88.6666C634.667 106.021 674.333 97.7568 714 93.0464C753.667 88.6666 793.333 88.6665 833 71.0645C872.667 53.1318 912.333 18.4235 952 9.33327C991.667 0.243001 1031.33 18.4235 1071 22.5555C1110.67 26.6874 1150.33 18.4235 1170.17 13.7131L1190 9.33327V194.444H1170.17C1150.33 194.444 1110.67 194.444 1071 194.444C1031.33 194.444 991.667 194.444 952 194.444C912.333 194.444 872.667 194.444 833 194.444C793.333 194.444 753.667 194.444 714 194.444C674.333 194.444 634.667 194.444 595 194.444C555.333 194.444 515.667 194.444 476 194.444C436.333 194.444 396.667 194.444 357 194.444C317.333 194.444 277.667 194.444 238 194.444C198.333 194.444 158.667 194.444 119 194.444C79.3333 194.444 39.6667 194.444 19.8333 194.444H0V35Z"
          fill="#7A0BC0"
        />
      </svg>
    </section>
  );
}

