import React, { useState, useEffect } from 'react';
import AdminUserTabs from '../../components/AdminUserTabs';
import Header from '../../components/Header';
import { User, Edit3, Save, X, Key, Eye, EyeOff } from 'lucide-react';
import http from '../../services/http';
import { useAppStore } from '../../store/useAppStore';
import { useNotification } from '../../contexts/NotificationContext';

export default function AdminUserProfile() {
  const { showSuccess, showError } = useNotification();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({});
  
  const { user } = useAppStore();
  const role = user?.vai_tro || user?.role;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await http.get('/users');
      const data = response?.data?.data || response?.data || {};
      
      if (data.users && Array.isArray(data.users)) {
        setUsers(data.users);
        if (data.users.length > 0) {
          setSelectedUser(data.users[0]);
          populateFormData(data.users[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const populateFormData = (userData) => {
    setFormData({
      ho_ten: userData.ho_ten || '',
      email: userData.email || '',
      ten_dn: userData.ten_dn || '',
      vai_tro: userData.vai_tro || '',
      // Thông tin sinh viên
      mssv: userData.sinh_vien?.mssv || '',
      ngay_sinh: userData.sinh_vien?.ngay_sinh || '',
      gt: userData.sinh_vien?.gt || '',
      dia_chi: userData.sinh_vien?.dia_chi || '',
      sdt: userData.sinh_vien?.sdt || '',
      // Thông tin bổ sung
      sdt_khan_cap: userData.sinh_vien?.sdt_khan_cap || '',
      email_phu: userData.sinh_vien?.email_phu || '',
      so_thich: userData.sinh_vien?.so_thich || '',
      ky_nang: userData.sinh_vien?.ky_nang || '',
      muc_tieu: userData.sinh_vien?.muc_tieu || '',
      // Thông tin gia đình
      ten_cha: userData.sinh_vien?.ten_cha || '',
      sdt_cha: userData.sinh_vien?.sdt_cha || '',
      ten_me: userData.sinh_vien?.ten_me || '',
      sdt_me: userData.sinh_vien?.sdt_me || '',
      dia_chi_gia_dinh: userData.sinh_vien?.dia_chi_gia_dinh || '',
      // Thông tin học vấn
      truong_thpt: userData.sinh_vien?.truong_thpt || '',
      nam_tot_nghiep_thpt: userData.sinh_vien?.nam_tot_nghiep_thpt || '',
      diem_thpt: userData.sinh_vien?.diem_thpt || '',
      // Cài đặt
      ngon_ngu: userData.sinh_vien?.ngon_ngu || 'vi',
      mui_gio: userData.sinh_vien?.mui_gio || 'Asia/Ho_Chi_Minh',
      thong_bao_email: userData.sinh_vien?.thong_bao_email ?? true,
      thong_bao_sdt: userData.sinh_vien?.thong_bao_sdt ?? true
    });
  };

  const handleUserSelect = (userData) => {
    setSelectedUser(userData);
    populateFormData(userData);
    setEditing(false);
    setActiveTab('basic');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // Update user profile logic here
      const updateData = {
        ho_ten: formData.ho_ten,
        email: formData.email,
        // Add other fields as needed
      };
      
      await http.put(`/admin/users/${selectedUser.id}`, updateData);
      showSuccess('Cập nhật thông tin thành công', 'Thành công', 12000);
      setEditing(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Lỗi cập nhật thông tin!');
    }
  };

  const renderTabContent = () => {
    if (!selectedUser) return null;

    switch (activeTab) {
      case 'basic':
        return renderBasicInfo();
      case 'contact':
        return renderContactInfo();
      case 'education':
        return renderEducationInfo();
      default:
        return renderBasicInfo();
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-500">Họ và tên</label>
          <p className="mt-1 text-sm text-gray-900">{selectedUser.ho_ten || 'Chưa cập nhật'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Email</label>
          <p className="mt-1 text-sm text-gray-900">{selectedUser.email || 'Chưa cập nhật'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">MSSV</label>
          <p className="mt-1 text-sm text-gray-900 font-mono">
            {selectedUser.sinh_vien?.mssv || 'Chưa có MSSV'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Tên đăng nhập</label>
          <p className="mt-1 text-sm text-gray-900 font-mono">{selectedUser.ten_dn}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Vai trò</label>
          <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
            selectedUser.vai_tro === 'ADMIN' ? 'bg-red-100 text-red-800' :
            selectedUser.vai_tro === 'GIANG_VIEN' ? 'bg-blue-100 text-blue-800' :
            selectedUser.vai_tro === 'LOP_TRUONG' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {selectedUser.vai_tro}
          </span>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Trạng thái</label>
          <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
            selectedUser.trang_thai === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {selectedUser.trang_thai === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
          </span>
        </div>
      </div>
    </div>
  );

  const renderContactInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
          <p className="mt-1 text-sm text-gray-900">{selectedUser.sinh_vien?.sdt || 'Chưa cập nhật'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">SĐT khẩn cấp</label>
          <p className="mt-1 text-sm text-gray-900">{selectedUser.sinh_vien?.sdt_khan_cap || 'Chưa cập nhật'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Email phụ</label>
          <p className="mt-1 text-sm text-gray-900">{selectedUser.sinh_vien?.email_phu || 'Chưa cập nhật'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
          <p className="mt-1 text-sm text-gray-900">{selectedUser.sinh_vien?.dia_chi || 'Chưa cập nhật'}</p>
        </div>
      </div>
    </div>
  );

  const renderEducationInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-500">Trường THPT</label>
          <p className="mt-1 text-sm text-gray-900">{selectedUser.sinh_vien?.truong_thpt || 'Chưa cập nhật'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Năm tốt nghiệp THPT</label>
          <p className="mt-1 text-sm text-gray-900">{selectedUser.sinh_vien?.nam_tot_nghiep_thpt || 'Chưa cập nhật'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Điểm TB THPT</label>
          <p className="mt-1 text-sm text-gray-900">{selectedUser.sinh_vien?.diem_thpt || 'Chưa cập nhật'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Lớp</label>
          <p className="mt-1 text-sm text-gray-900">{selectedUser.sinh_vien?.lop?.ten_lop || 'Chưa có lớp'}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto">
          <AdminUserTabs />
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto">
        <AdminUserTabs />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* User List Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow border">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-medium text-gray-900">Danh sách người dùng</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {users.map((userData) => (
                      <button
                        key={userData.id}
                        onClick={() => handleUserSelect(userData)}
                        className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                          selectedUser?.id === userData.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {userData.ho_ten}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {userData.sinh_vien?.mssv || userData.ten_dn}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Profile Detail */}
              <div className="lg:col-span-3">
                {selectedUser ? (
                  <div className="bg-white rounded-lg shadow border">
                    {/* Header */}
                    <div className="p-6 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <User className="h-8 w-8 text-blue-600" />
                          <div>
                            <h1 className="text-2xl font-bold text-gray-900">{selectedUser.ho_ten}</h1>
                            <p className="text-gray-600">Chi tiết thông tin người dùng</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setEditing(!editing)}
                          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                          {editing ? 'Hủy' : 'Chỉnh sửa'}
                        </button>
                      </div>
                    </div>

                    {/* Information Tabs */}
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-8 px-6">
                        {[
                          { id: 'basic', label: 'Thông tin cơ bản', icon: '👤' },
                          { id: 'contact', label: 'Liên hệ & Gia đình', icon: '📞' },
                          { id: 'education', label: 'Học vấn & Cá nhân', icon: '🎓' }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                              activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <span className="text-lg">{tab.icon}</span>
                            <span>{tab.label}</span>
                          </button>
                        ))}
                      </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                      {renderTabContent()}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow border p-6 text-center">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Chọn một người dùng để xem thông tin chi tiết</p>
                  </div>
                )}
              </div>
            </div>
        </div>
      </main>
    </div>
  );
}