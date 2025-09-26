import React, { useState, useEffect } from 'react';
import { User, Edit3, Save, X, Eye, EyeOff, Key, Camera } from 'lucide-react';
import http from '../../services/http';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { useAppStore } from '../../store/useAppStore';
import { useNotification } from '../../contexts/NotificationContext';

export default function UserProfile() {
  const { showSuccess, showError } = useNotification();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // Tab hiện tại
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const { user } = useAppStore();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log('Đang tải profile...');
      
      // Thử endpoint mới trước
      let response;
      try {
        response = await http.get('/users/profile');
        console.log('✅ Gọi API /users/profile thành công');
      } catch (error) {
        console.log('❌ API /users/profile lỗi, thử /auth/profile...');
        response = await http.get('/auth/profile');
        console.log('✅ Gọi API /auth/profile thành công');
      }
      
      const profileData = response?.data?.data || response?.data || {};
      
      console.log('Profile data received:', profileData);
      
      setProfile(profileData);
      setFormData({
        ho_ten: profileData.ho_ten || '',
        email: profileData.email || '',
        ngay_sinh: profileData.sinh_vien?.ngay_sinh ? 
          new Date(profileData.sinh_vien.ngay_sinh).toISOString().split('T')[0] : '',
        gt: profileData.sinh_vien?.gt || '',
        dia_chi: profileData.sinh_vien?.dia_chi || '',
        sdt: profileData.sinh_vien?.sdt || '',
        // Thông tin bổ sung
        sdt_khan_cap: profileData.sinh_vien?.sdt_khan_cap || '',
        email_phu: profileData.sinh_vien?.email_phu || '',
        so_thich: profileData.sinh_vien?.so_thich || '',
        ky_nang: profileData.sinh_vien?.ky_nang || '',
        muc_tieu: profileData.sinh_vien?.muc_tieu || '',
        // Thông tin gia đình
        ten_cha: profileData.sinh_vien?.ten_cha || '',
        sdt_cha: profileData.sinh_vien?.sdt_cha || '',
        ten_me: profileData.sinh_vien?.ten_me || '',
        sdt_me: profileData.sinh_vien?.sdt_me || '',
        dia_chi_gia_dinh: profileData.sinh_vien?.dia_chi_gia_dinh || '',
        // Thông tin học vấn
        truong_thpt: profileData.sinh_vien?.truong_thpt || '',
        nam_tot_nghiep_thpt: profileData.sinh_vien?.nam_tot_nghiep_thpt || '',
        diem_thpt: profileData.sinh_vien?.diem_thpt || '',
        // Cài đặt
        ngon_ngu: profileData.sinh_vien?.ngon_ngu || 'vi',
        thong_bao_email: profileData.sinh_vien?.thong_bao_email ?? true,
        thong_bao_sdt: profileData.sinh_vien?.thong_bao_sdt ?? false
      });
    } catch (error) {
      console.error('Failed to load profile:', error.response?.data?.message || error.message);
      
      // Fallback to old endpoint
      try {
        const response = await http.get('/auth/profile');
        const profileData = response?.data?.data || response?.data || {};
        setProfile(profileData);
        console.log('Fallback endpoint used');
      } catch (fallbackError) {
        console.error('Both endpoints failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...formData };
      
      await http.put('/users/profile', updateData);
      
      setEditing(false);
      loadProfile();
      showSuccess('Cập nhật thông tin thành công', 'Thành công', 12000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      showError('Lỗi khi cập nhật thông tin: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      showError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    try {
      await http.put('/users/change-password', passwordData);
      
      setChangingPassword(false);
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
      showSuccess('Đổi mật khẩu thành công', 'Thành công', 12000);
    } catch (error) {
      console.error('Failed to change password:', error);
      showError('Lỗi khi đổi mật khẩu: ' + (error.response?.data?.message || error.message));
    }
  };

  const getRoleText = (role) => {
    const texts = {
      'ADMIN': 'Quản trị viên',
      'GIANG_VIEN': 'Giảng viên',
      'LOP_TRUONG': 'Lớp trưởng',
      'SINH_VIEN': 'Sinh viên'
    };
    return texts[role] || role;
  };

  const getGenderText = (gender) => {
    const texts = {
      'nam': 'Nam',
      'nu': 'Nữ',
      'khac': 'Khác'
    };
    return texts[gender] || '';
  };

  const role = (user?.role || 'student').toLowerCase();

  const renderField = (label, value, formatter) => {
    const val = typeof formatter === 'function' ? formatter(value) : value;
    if (val === undefined || val === null || val === '' || (typeof val === 'number' && isNaN(val))) return null;
    return (
      <div>
        <label className="text-sm font-medium text-gray-500">{label}</label>
        <p className="mt-1 text-sm text-gray-900">{val}</p>
      </div>
    );
  };

  // Function to render tab content - gộp Basic + Contact
  const renderTabContent = () => {
    if (editing) {
      return renderEditForm();
    }

    switch (activeTab) {
      case 'info':
        return (
          <>
            {renderBasicInfo()}
            <div className="h-6" />
            {renderContactInfo()}
          </>
        );
      case 'education':
        return renderEducationAndPersonalInfo();
      default:
        return (
          <>
            {renderBasicInfo()}
            <div className="h-6" />
            {renderContactInfo()}
          </>
        );
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center gap-6 mb-6">
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-700">
          {profile.sinh_vien?.avatar_url ? (
            <img src={profile.sinh_vien.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
          ) : (
            (profile.ho_ten || profile.email || 'U').slice(0,1).toUpperCase()
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{profile.ho_ten || 'Chưa cập nhật'}</h3>
          {renderField('MSSV', profile.sinh_vien?.mssv)}
          {(profile.sinh_vien?.lop?.ten_lop || profile.sinh_vien?.lop?.khoa) && (
            <p className="text-sm text-gray-500">
              {profile.sinh_vien?.lop?.ten_lop || ''}{profile.sinh_vien?.lop?.ten_lop && profile.sinh_vien?.lop?.khoa ? ' • ' : ''}{profile.sinh_vien?.lop?.khoa || ''}
            </p>
          )}
        </div>
      </div>

      {/* Basic Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderField('Họ và tên', profile.ho_ten)}
        {renderField('Email', profile.email)}
        {renderField('Tên đăng nhập', profile.ten_dn)}
        {renderField('Ngày sinh', profile.sinh_vien?.ngay_sinh, (d) => new Date(d).toLocaleDateString('vi-VN'))}
        {renderField('Giới tính', getGenderText(profile.sinh_vien?.gt))}
        {profile.sinh_vien?.lop?.ten_lop && renderField('Lớp', profile.sinh_vien.lop.ten_lop)}
        {profile.sinh_vien?.lop?.khoa && renderField('Khoa', profile.sinh_vien.lop.khoa)}
        {profile.sinh_vien?.lop?.nien_khoa && renderField('Niên khóa', profile.sinh_vien.lop.nien_khoa)}
        {renderField('Địa chỉ hiện tại', profile.sinh_vien?.dia_chi)}
      </div>
    </div>
  );

  const renderContactInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {renderField('Số điện thoại', profile.sinh_vien?.sdt)}
      {renderField('SĐT khẩn cấp', profile.sinh_vien?.sdt_khan_cap)}
      {renderField('Email phụ', profile.sinh_vien?.email_phu)}
      {renderField('Tên cha', profile.sinh_vien?.ten_cha)}
      {renderField('SĐT cha', profile.sinh_vien?.sdt_cha)}
      {renderField('Tên mẹ', profile.sinh_vien?.ten_me)}
      {renderField('SĐT mẹ', profile.sinh_vien?.sdt_me)}
      {renderField('Địa chỉ gia đình', profile.sinh_vien?.dia_chi_gia_dinh)}
    </div>
  );

  const renderEducationAndPersonalInfo = () => (
    <div className="space-y-8">
      {/* Thông tin học vấn */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span>🎓</span> Thông tin học vấn
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField('Trường THPT', profile.sinh_vien?.truong_thpt)}
          {renderField('Năm tốt nghiệp THPT', profile.sinh_vien?.nam_tot_nghiep_thpt)}
          {renderField('Điểm TB THPT', profile.sinh_vien?.diem_thpt, (x)=> `${x}/10`)}
        </div>
      </div>

      {/* Thông tin cá nhân */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span>🌟</span> Thông tin cá nhân
        </h3>
        <div className="space-y-6">
          {renderField('Sở thích', profile.sinh_vien?.so_thich)}
          {renderField('Kỹ năng', profile.sinh_vien?.ky_nang)}
          {renderField('Mục tiêu', profile.sinh_vien?.muc_tieu)}
        </div>
      </div>

      {/* Cài đặt */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span>⚙️</span> Cài đặt tài khoản
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField('Ngôn ngữ', profile.sinh_vien?.ngon_ngu === 'vi' ? 'Tiếng Việt' : (profile.sinh_vien?.ngon_ngu === 'en' ? 'English' : null))}
          {renderField('Múi giờ', profile.sinh_vien?.mui_gio)}
          {(profile.sinh_vien?.thong_bao_email !== undefined) && (
            <div>
              <label className="text-sm font-medium text-gray-500">Thông báo Email</label>
              <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
                profile.sinh_vien?.thong_bao_email ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {profile.sinh_vien?.thong_bao_email ? 'Bật' : 'Tắt'}
              </span>
            </div>
          )}
          {(profile.sinh_vien?.thong_bao_sdt !== undefined) && (
            <div>
              <label className="text-sm font-medium text-gray-500">Thông báo SMS</label>
              <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
                profile.sinh_vien?.thong_bao_sdt ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {profile.sinh_vien?.thong_bao_sdt ? 'Bật' : 'Tắt'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Thống kê tài khoản */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span>📊</span> Thông tin tài khoản
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Ngày tạo tài khoản</label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(profile.ngay_tao).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Lần cuối đăng nhập</label>
            <p className="mt-1 text-sm text-gray-900">
              {profile.lan_cuoi_dn ? 
                new Date(profile.lan_cuoi_dn).toLocaleString('vi-VN') : 'Chưa có thông tin'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Cập nhật lần cuối</label>
            <p className="mt-1 text-sm text-gray-900">
              {profile.sinh_vien?.ngay_cap_nhat ? 
                new Date(profile.sinh_vien.ngay_cap_nhat).toLocaleString('vi-VN') : 'Chưa có'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );



  const renderEditForm = () => (
    <form onSubmit={handleUpdateProfile} className="space-y-6">
      {/* Tab content based on activeTab - gộp Basic + Contact */}
      {activeTab === 'info' && (
        <>
          {renderBasicEditForm()}
          <div className="h-6" />
          {renderContactEditForm()}
        </>
      )}
      {activeTab === 'education' && renderEducationAndPersonalEditForm()}
      
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <X className="h-4 w-4" />
          Hủy
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          Lưu thay đổi
        </button>
      </div>
    </form>
  );

  const renderBasicEditForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
        <input
          type="text"
          value={formData.ho_ten}
          onChange={(e) => setFormData(prev => ({ ...prev, ho_ten: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
        <input
          type="date"
          value={formData.ngay_sinh}
          onChange={(e) => setFormData(prev => ({ ...prev, ngay_sinh: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
        <select
          value={formData.gt}
          onChange={(e) => setFormData(prev => ({ ...prev, gt: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Chọn giới tính</option>
          <option value="nam">Nam</option>
          <option value="nu">Nữ</option>
          <option value="khac">Khác</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
        <textarea
          value={formData.dia_chi}
          onChange={(e) => setFormData(prev => ({ ...prev, dia_chi: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderContactEditForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
        <input
          type="tel"
          value={formData.sdt}
          onChange={(e) => setFormData(prev => ({ ...prev, sdt: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">SĐT khẩn cấp</label>
        <input
          type="tel"
          value={formData.sdt_khan_cap}
          onChange={(e) => setFormData(prev => ({ ...prev, sdt_khan_cap: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email phụ</label>
        <input
          type="email"
          value={formData.email_phu}
          onChange={(e) => setFormData(prev => ({ ...prev, email_phu: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên cha</label>
        <input
          type="text"
          value={formData.ten_cha}
          onChange={(e) => setFormData(prev => ({ ...prev, ten_cha: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">SĐT cha</label>
        <input
          type="tel"
          value={formData.sdt_cha}
          onChange={(e) => setFormData(prev => ({ ...prev, sdt_cha: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên mẹ</label>
        <input
          type="text"
          value={formData.ten_me}
          onChange={(e) => setFormData(prev => ({ ...prev, ten_me: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">SĐT mẹ</label>
        <input
          type="tel"
          value={formData.sdt_me}
          onChange={(e) => setFormData(prev => ({ ...prev, sdt_me: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ gia đình</label>
        <textarea
          value={formData.dia_chi_gia_dinh}
          onChange={(e) => setFormData(prev => ({ ...prev, dia_chi_gia_dinh: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderEducationAndPersonalEditForm = () => (
    <div className="space-y-8">
      {/* Form Thông tin học vấn */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span>🎓</span> Thông tin học vấn
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trường THPT</label>
            <input
              type="text"
              value={formData.truong_thpt}
              onChange={(e) => setFormData(prev => ({ ...prev, truong_thpt: e.target.value }))}
              placeholder="Nhập tên trường THPT"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Năm tốt nghiệp THPT</label>
            <input
              type="number"
              min="2000"
              max="2030"
              value={formData.nam_tot_nghiep_thpt}
              onChange={(e) => setFormData(prev => ({ ...prev, nam_tot_nghiep_thpt: e.target.value }))}
              placeholder="Ví dụ: 2023"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Điểm TB THPT</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={formData.diem_thpt}
              onChange={(e) => setFormData(prev => ({ ...prev, diem_thpt: e.target.value }))}
              placeholder="Ví dụ: 8.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Form Thông tin cá nhân */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span>🌟</span> Thông tin cá nhân
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sở thích</label>
            <textarea
              value={formData.so_thich}
              onChange={(e) => setFormData(prev => ({ ...prev, so_thich: e.target.value }))}
              rows={3}
              placeholder="Hãy chia sẻ về những sở thích của bạn..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kỹ năng</label>
            <textarea
              value={formData.ky_nang}
              onChange={(e) => setFormData(prev => ({ ...prev, ky_nang: e.target.value }))}
              rows={3}
              placeholder="Những kỹ năng mà bạn có hoặc đang học..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mục tiêu</label>
            <textarea
              value={formData.muc_tieu}
              onChange={(e) => setFormData(prev => ({ ...prev, muc_tieu: e.target.value }))}
              rows={3}
              placeholder="Mục tiêu học tập và nghề nghiệp của bạn..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Form Cài đặt */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span>⚙️</span> Cài đặt tài khoản
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngôn ngữ</label>
            <select
              value={formData.ngon_ngu}
              onChange={(e) => setFormData(prev => ({ ...prev, ngon_ngu: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thông báo Email</label>
            <select
              value={formData.thong_bao_email}
              onChange={(e) => setFormData(prev => ({ ...prev, thong_bao_email: e.target.value === 'true' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="true">Bật</option>
              <option value="false">Tắt</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thông báo SMS</label>
            <select
              value={formData.thong_bao_sdt}
              onChange={(e) => setFormData(prev => ({ ...prev, thong_bao_sdt: e.target.value === 'true' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="true">Bật</option>
              <option value="false">Tắt</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar role={role} />
          <main className="flex-1">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar role={role} />
          <main className="flex-1">
            <div className="text-center py-8">
              <p className="text-gray-500">Không thể tải thông tin profile</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar role={role} />
        <main className="flex-1">
          <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
            <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
          </div>
        </div>
        {!editing && !changingPassword && (
          <div className="flex gap-2">
            <button
              onClick={() => setChangingPassword(true)}
              className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Key className="h-4 w-4" />
              Đổi mật khẩu
            </button>
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              Chỉnh sửa
            </button>
          </div>
        )}
      </div>

            {/* Information Tabs - gộp Basic + Contact theo dữ liệu Prisma */}
            <div className="bg-white rounded-lg border">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  {[
                    { id: 'info', label: 'Thông tin & Liên hệ', icon: '👤', description: 'Cơ bản, liên hệ, gia đình' },
                    { id: 'education', label: 'Học vấn & Cá nhân', icon: '🎓', description: 'THPT, sở thích, kỹ năng, cài đặt' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex flex-col items-center gap-1 py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{tab.icon}</span>
                        <span>{tab.label}</span>
                      </div>
                      <span className="text-xs text-gray-400 font-normal">{tab.description}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {renderTabContent()}
              </div>
            </div>

      {/* Change Password Modal */}
      {changingPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Đổi mật khẩu</h3>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.old ? "text" : "password"}
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, old_password: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setChangingPassword(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Đổi mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
          </div>
        </main>
      </div>
    </div>
  );
}