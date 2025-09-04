import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [contactInfo, setContactInfo] = useState([]);
  const fileInputRef = useRef(null);

  // Initialize contact list from user context
  useEffect(() => {
    const normalized = Array.isArray(user?.contacts)
      ? user.contacts.map((c, idx) => ({ id: c.id || idx + 1, type: c.type || 'other', value: c.value || '', priority: c.priority || idx + 1 }))
      : (user?.email ? [{ id: 'email-1', type: 'email', value: user.email, priority: 1 }] : []);
    setContactInfo(normalized);
  }, [user]);

  // Determine if current user is a student/admin from either DTO style (role) or nested vaiTro
  const isStudent = (user?.role === 'student') || (user?.vaiTro?.tenvt === 'Sinh viên');
  const isAdmin = (user?.role === 'admin') || (
    typeof user?.vaiTro?.tenvt === 'string' && (
      user.vaiTro.tenvt.toLowerCase().includes('admin') ||
      user.vaiTro.tenvt.toLowerCase().includes('quản trị')
    )
  );
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      maso: user?.maso || '',
      hoten: user?.hoten || user?.name || '',
      ngaysinh: user?.ngaysinh ? new Date(user.ngaysinh).toISOString().split('T')[0] : '',
      gt: user?.gt || '',
      cccd: user?.cccd || '',
      lopid: user?.lopid || '',
      trangthai: user?.trangthai || 'hot',
    },
  });

  // Keep form values in sync whenever user changes in context
  useEffect(() => {
    reset({
      maso: user?.maso || '',
      hoten: user?.hoten || user?.name || '',
      ngaysinh: user?.ngaysinh ? new Date(user.ngaysinh).toISOString().split('T')[0] : '',
      gt: user?.gt || '',
      cccd: user?.cccd || '',
      lopid: user?.lopid || '',
      trangthai: user?.trangthai || 'hot',
    });
  }, [user, reset]);

  const onSubmit = async (data) => {
    if (isStudent) {
      delete data.trangthai;
    }

    setLoading(true);
    try {
      const profilePayload = {
        ...(isAdmin ? { maso: data.maso } : {}),
        name: data.hoten,
        ngaysinh: data.ngaysinh || null,
        gt: data.gt || '',
        cccd: data.cccd || '',
        ...(typeof data.trangthai !== 'undefined' && !isStudent ? { trangthai: data.trangthai } : {}),
      };

      const contactsPayload = contactInfo
        .filter(c => c.type !== 'email' && c.value)
        .map(c => ({ type: c.type, value: c.value, priority: c.priority }));

      const [profileRes, contactsRes] = await Promise.allSettled([
        authService.updateSelf(profilePayload),
        authService.updateContacts(contactsPayload),
      ]);

      // Merge successful results
      let merged = { ...user };
      if (profileRes.status === 'fulfilled') {
        const u = profileRes.value.data?.data || profileRes.value.data;
        merged = { ...merged, ...u };
      }
      if (contactsRes.status === 'fulfilled') {
        const u = contactsRes.value.data?.data || contactsRes.value.data;
        merged = { ...merged, ...u };
      }

      updateProfile(merged);

      // Reset form with latest values
      reset({
        maso: merged?.maso || '',
        hoten: merged?.hoten || merged?.name || '',
        ngaysinh: merged?.ngaysinh ? new Date(merged.ngaysinh).toISOString().split('T')[0] : '',
        gt: merged?.gt || '',
        cccd: merged?.cccd || '',
        lopid: merged?.lopid || '',
        trangthai: merged?.trangthai || 'hot',
      });

      if (Array.isArray(merged?.contacts)) {
        const normalized = merged.contacts.map((c, idx) => ({ id: c.id || idx + 1, type: c.type || 'other', value: c.value || '', priority: c.priority || idx + 1 }));
        setContactInfo(normalized);
      }

      // Toaster messages
      if (profileRes.status === 'fulfilled' && contactsRes.status === 'fulfilled') {
        toast.success('Cập nhật thông tin và liên hệ thành công!');
      } else if (profileRes.status === 'fulfilled') {
        toast.success('Cập nhật thông tin cá nhân thành công');
        toast.error('Cập nhật liên hệ thất bại');
      } else if (contactsRes.status === 'fulfilled') {
        toast.success('Cập nhật thông tin liên hệ thành công');
        toast.error('Cập nhật thông tin cá nhân thất bại');
      } else {
        toast.error('Cập nhật thất bại');
      }

      setIsEditing(false);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(error.response?.data?.message || 'Bạn không có quyền thực hiện');
      } else if (error.response?.data?.errors) {
        const errs = error.response.data.errors;
        errs.forEach(err => toast.error(`${err.field}: ${err.message}`));
      } else {
        const message = error.response?.data?.message || 'Cập nhật thất bại!';
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    reset({
      maso: user?.maso || '',
      hoten: user?.hoten || user?.name || '',
      ngaysinh: user?.ngaysinh ? new Date(user.ngaysinh).toISOString().split('T')[0] : '',
      gt: user?.gt || '',
      cccd: user?.cccd || '',
      lopid: user?.lopid || '',
      trangthai: user?.trangthai || 'hot',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarPreview(null);
    reset();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addContactInfo = () => {
    if (loading) return;
    const nextId = Math.max(0, ...contactInfo.map(c => (typeof c.id === 'number' ? c.id : 0))) + 1;
    setContactInfo([...contactInfo, { id: nextId, type: 'other', value: '', priority: (contactInfo.length + 1) }]);
  };

  const removeContactInfo = (id) => {
    if (loading) return;
    const contact = contactInfo.find(c => c.id === id);
    if (contact?.type === 'email') return; // protect email row
    setContactInfo(contactInfo.filter(c => c.id !== id));
  };

  const updateContactInfo = (id, field, value) => {
    setContactInfo(contactInfo.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'hot': return 'bg-green-100 text-green-800';
      case 'kho': return 'bg-red-100 text-red-800';
      case 'trung_thi': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'hot': return 'Hoạt động';
      case 'kho': return 'Khóa';
      case 'trung_thi': return 'Trung thỉ';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header với Avatar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                {avatarPreview || user?.anhdaidien ? (
                  <img 
                    src={avatarPreview || user?.anhdaidien} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="fas fa-user text-3xl text-white/70"></i>
                )}
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-colors"
                >
                  <i className="fas fa-camera text-sm"></i>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{user?.hoten || user?.name || 'Người dùng'}</h1>
              <p className="text-blue-100 text-lg">{user?.maso || 'Chưa có mã số'}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(user?.trangthai)}`}>
                  {getStatusText(user?.trangthai)}
                </span>
                <span className="text-blue-100 text-sm">
                  <i className="fas fa-calendar-alt mr-1"></i>
                  Tham gia: {user?.ngaytao ? new Date(user.ngaytao).toLocaleDateString('vi-VN') : 'N/A'}
                </span>
              </div>
            </div>
            <div className="text-right">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Chỉnh sửa
                </button>
              ) : (
                <div className="space-x-3">
                  <button
                    onClick={handleCancel}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                    ) : (
                      <i className="fas fa-save mr-2"></i>
                    )}
                    Lưu
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab điều hướng */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'personal', label: 'Thông tin cá nhân', icon: 'fas fa-user' },
              { id: 'contact', label: 'Thông tin liên hệ', icon: 'fas fa-address-book' },
              { id: 'academic', label: 'Thông tin học tập', icon: 'fas fa-graduation-cap' },
              { id: 'security', label: 'Bảo mật', icon: 'fas fa-shield-alt' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Nội dung */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Tab thông tin cá nhân */}
          {activeTab === 'personal' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <i className="fas fa-user text-blue-600 mr-3"></i>
                Thông tin cá nhân
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-id-card text-gray-400 mr-2"></i>
                    Mã số sinh viên
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing || !isAdmin}
                    {...register('maso', {
                      required: 'Mã số là bắt buộc',
                      pattern: {
                        value: /^[A-Za-z0-9]{6,15}$/,
                        message: 'Mã số phải từ 6-15 ký tự, chỉ chứa chữ và số',
                      },
                    })}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      (!isEditing || !isAdmin) ? 'bg-gray-50 text-gray-500' : ''
                    }`}
                    placeholder="Nhập mã số sinh viên/nhân viên"
                  />
                  {errors.maso && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.maso.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-user text-gray-400 mr-2"></i>
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    {...register('hoten', {
                      required: 'Họ và tên là bắt buộc',
                      minLength: {
                        value: 2,
                        message: 'Họ và tên phải có ít nhất 2 ký tự',
                      },
                      maxLength: {
                        value: 50,
                        message: 'Họ và tên không được quá 50 ký tự',
                      },
                    })}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      !isEditing ? 'bg-gray-50 text-gray-500' : ''
                    }`}
                    placeholder="Nhập họ và tên đầy đủ"
                  />
                  {errors.hoten && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.hoten.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-calendar text-gray-400 mr-2"></i>
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    disabled={!isEditing}
                    {...register('ngaysinh')}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      !isEditing ? 'bg-gray-50 text-gray-500' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-venus-mars text-gray-400 mr-2"></i>
                    Giới tính
                  </label>
                  <select
                    disabled={!isEditing}
                    {...register('gt')}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      !isEditing ? 'bg-gray-50 text-gray-500' : ''
                    }`}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="nam">Nam</option>
                    <option value="nu">Nữ</option>
                    <option value="khac">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-id-card-alt text-gray-400 mr-2"></i>
                    Số CCCD/CMND
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    {...register('cccd', {
                      pattern: {
                        value: /^[0-9]{9,12}$/,
                        message: 'CCCD/CMND phải từ 9-12 chữ số',
                      },
                    })}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      !isEditing ? 'bg-gray-50 text-gray-500' : ''
                    }`}
                    placeholder="Nhập số CCCD/CMND"
                  />
                  {errors.cccd && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.cccd.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-toggle-on text-gray-400 mr-2"></i>
                    Trạng thái tài khoản
                  </label>
                  <select
                    disabled={!isEditing || isStudent}
                    {...register('trangthai')}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      (!isEditing || isStudent) ? 'bg-gray-50 text-gray-500' : ''
                    }`}
                  >
                    <option value="hot">Hoạt động</option>
                    <option value="kho">Khóa</option>
                    <option value="trung_thi">Trung thỉ</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab thông tin liên hệ */}
          {activeTab === 'contact' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <i className="fas fa-address-book text-blue-600 mr-3"></i>
                  Thông tin liên hệ
                </h2>
                {isEditing && (
                  <button
                    type="button"
                    onClick={addContactInfo}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Thêm liên hệ khác
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {contactInfo.map((contact) => (
                  <div key={contact.id} className={`flex items-center space-x-4 p-4 border rounded-lg ${contact.type === 'email' ? 'bg-gray-50' : ''}`}>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại liên hệ</label>
                        <select
                          disabled={!isEditing || contact.type === 'email'}
                          value={contact.type}
                          onChange={(e) => updateContactInfo(contact.id, 'type', e.target.value)}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${(!isEditing || contact.type === 'email') ? 'bg-gray-50 text-gray-500' : ''}`}
                        >
                          {contact.type === 'email' && (<option value="email">Email</option>)}
                          <option value="phone">Điện thoại</option>
                          <option value="address">Địa chỉ</option>
                          <option value="facebook">Facebook</option>
                          <option value="zalo">Zalo</option>
                          <option value="other">Khác</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thông tin liên hệ</label>
                        <input
                          type="text"
                          disabled={!isEditing || contact.type === 'email'}
                          value={contact.value}
                          onChange={(e) => updateContactInfo(contact.id, 'value', e.target.value)}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${(!isEditing || contact.type === 'email') ? 'bg-gray-50 text-gray-500' : ''}`}
                          placeholder="Nhập thông tin liên hệ"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Độ ưu tiên</label>
                        <select
                          disabled={!isEditing || contact.type === 'email'}
                          value={contact.priority}
                          onChange={(e) => updateContactInfo(contact.id, 'priority', parseInt(e.target.value))}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${(!isEditing || contact.type === 'email') ? 'bg-gray-50 text-gray-500' : ''}`}
                        >
                          <option value={1}>Cao</option>
                          <option value={2}>Trung bình</option>
                          <option value={3}>Thấp</option>
                        </select>
                      </div>
                    </div>
                    {isEditing && contact.type !== 'email' && (
                      <button
                        type="button"
                        onClick={() => removeContactInfo(contact.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab thông tin học tập */}
          {activeTab === 'academic' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <i className="fas fa-graduation-cap text-blue-600 mr-3"></i>
                Thông tin học tập
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-university text-gray-400 mr-2"></i>
                    Lớp học
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.lop?.tenlop || 'Chưa xác định'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-building text-gray-400 mr-2"></i>
                    Khoa
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.lop?.khoa?.tenkhoa || 'Chưa xác định'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-calendar-check text-gray-400 mr-2"></i>
                    Niên khóa
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.lop?.nienkhoa?.tennk || 'Chưa xác định'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-user-tag text-gray-400 mr-2"></i>
                    Vai trò
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.vaiTro?.tenvt || 'Sinh viên'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab bảo mật */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <i className="fas fa-shield-alt text-blue-600 mr-3"></i>
                Thông tin bảo mật
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-sign-in-alt text-gray-400 mr-2"></i>
                    Lần đăng nhập cuối
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.lancuoidn ? new Date(user.lancuoidn).toLocaleString('vi-VN') : 'Chưa có thông tin'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-counter text-gray-400 mr-2"></i>
                    Số lần đăng nhập
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.solandn || 0}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-network-wired text-gray-400 mr-2"></i>
                    IP đăng nhập cuối
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.diachiipcuoi || 'Chưa có thông tin'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-calendar-plus text-gray-400 mr-2"></i>
                    Ngày tạo tài khoản
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.ngaytao ? new Date(user.ngaytao).toLocaleString('vi-VN') : 'Chưa có thông tin'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <i className="fas fa-exclamation-triangle text-yellow-600 mt-1 mr-3"></i>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Lưu ý bảo mật</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Để đảm bảo an toàn tài khoản, hãy thường xuyên thay đổi mật khẩu và không chia sẻ thông tin đăng nhập với người khác.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
