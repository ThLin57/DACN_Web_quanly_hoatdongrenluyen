// src/pages/admin/UserManagement.js
import { useState, useEffect } from 'react';
import AdminUserTabs from '../../components/AdminUserTabs';
import Header from '../../components/Header';
import AdminLayout from '../../components/AdminLayout';
import { useAppStore } from '../../store/useAppStore';
import http from '../../services/http';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    maso: '',
    email: '',
    hoten: '',
    role: 'SINH_VIEN',
    password: '',
    lop: '',
    khoa: '',
    sdt: ''
  });

  const { user } = useAppStore();
  const role = user?.vai_tro || user?.role;

  const roles = [
    { value: 'SINH_VIEN', label: 'Sinh viên' },
    { value: 'LOP_TRUONG', label: 'Lớp trưởng' },
    { value: 'GIANG_VIEN', label: 'Giảng viên' },
    { value: 'ADMIN', label: 'Quản trị viên' }
  ];

  useEffect(() => {
    fetchUsers();
  }, [page, filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await http.get('/api/admin/users', { params: { page, limit, search: search || undefined, role: filterRole || undefined, status: filterStatus || undefined } });
      const body = response?.data || {};
      const data = body.data || body || [];
      const arr = Array.isArray(data) ? data : (Array.isArray(data.users) ? data.users : []);
      const normalized = arr.map(function(u){
        return {
          id: u.id,
          ten_dn: u.ten_dn || u.maso || '',
          ho_ten: u.ho_ten || u.hoten || '',
          email: u.email || '',
          vai_tro: u.vai_tro || u.role || '',
          sinh_vien: u.sinh_vien || {
            lop: u.lop || '',
            khoa: u.khoa || '',
            sdt: u.sdt || ''
          },
          trang_thai: u.trang_thai || ''
        };
      });
      setUsers(normalized);
      // lấy tổng nếu có
      const pagination = body.pagination || body.meta || {};
      if (typeof pagination.total === 'number') setTotal(pagination.total);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      // Map form data to API format
      const userData = {
        maso: formData.maso,
        email: formData.email,
        hoten: formData.hoten,
        role: formData.role,
        password: formData.password,
        lop: formData.lop,
        khoa: formData.khoa,
        sdt: formData.sdt
      };
      
      await http.post('/api/admin/users', userData);
      alert('Tạo người dùng thành công!');
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.message || error.message;
      alert('Lỗi tạo người dùng: ' + errorMessage);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        hoten: formData.hoten,
        email: formData.email,
        role: formData.role,
        lop: formData.lop,
        khoa: formData.khoa,
        sdt: formData.sdt
      };
      
      // Only include password if it's provided
      if (formData.password && formData.password.trim()) {
        updateData.password = formData.password;
      }
      
      await http.put(`/api/admin/users/${editingUser.id}`, updateData);
      alert('Cập nhật người dùng thành công!');
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error.response?.data?.message || error.message;
      alert('Lỗi cập nhật người dùng: ' + errorMessage);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    
    try {
      await http.delete(`/api/admin/users/${userId}`);
      alert('Xóa người dùng thành công!');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.message || error.message;
      alert('Lỗi xóa người dùng: ' + errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      maso: '',
      email: '',
      hoten: '',
      role: 'SINH_VIEN',
      password: '',
      lop: '',
      khoa: '',
      sdt: ''
    });
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      maso: user.ten_dn || '',
      email: user.email || '',
      hoten: user.ho_ten || '',
      role: user.vai_tro || 'SINH_VIEN',
      password: '', // Don't prefill password for security
      lop: user.sinh_vien?.lop || '',
      khoa: user.sinh_vien?.khoa || '',
      sdt: user.sinh_vien?.sdt || ''
    });
  };

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
    <AdminLayout active="users">
      <main className="max-w-7xl mx-auto">
          <AdminUserTabs />
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Quản Lý Người Dùng</h1>
              <div className="flex items-center gap-2">
                <a
                  href={(() => {
                    const p = new URLSearchParams();
                    if (search) p.set('search', search);
                    if (filterRole) p.set('role', filterRole);
                    if (filterStatus) p.set('status', filterStatus);
                    const base = (typeof window !== 'undefined' ? (process.env.REACT_APP_API_URL || 'http://localhost:3001/api') : '')
                      .replace(/\/$/, '');
                    return base + '/admin/users/export?' + p.toString();
                  })()}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-md border border-green-600 text-green-700 hover:bg-green-50 transition-colors"
                >
                  Xuất CSV
                </a>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Thêm Người Dùng
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm theo tên, email, mã số" className="border rounded px-3 py-2" />
              <select value={filterRole} onChange={e=>setFilterRole(e.target.value)} className="border rounded px-3 py-2">
                <option value="">Tất cả vai trò</option>
                {roles.map(r=> <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="border rounded px-3 py-2">
                <option value="">Tất cả trạng thái</option>
                <option value="hoat_dong">Hoạt động</option>
                <option value="khong_hoat_dong">Không hoạt động</option>
                <option value="khoa">Khoá</option>
              </select>
              <div className="flex gap-2 md:justify-end">
                <button onClick={()=>{ setPage(1); fetchUsers(); }} className="px-4 py-2 border rounded">Lọc</button>
                <button onClick={()=>{ setSearch(''); setFilterRole(''); setFilterStatus(''); setPage(1); fetchUsers(); }} className="px-4 py-2 border rounded">Xoá lọc</button>
              </div>
              <div className="hidden md:flex" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Users Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã số
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Họ tên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lớp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khoa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.ten_dn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.ho_ten}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.vai_tro === 'ADMIN' ? 'bg-red-100 text-red-800' :
                          user.vai_tro === 'GIANG_VIEN' ? 'bg-blue-100 text-blue-800' :
                          user.vai_tro === 'LOP_TRUONG' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {roles.find(r => r.value === user.vai_tro)?.label || user.vai_tro}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.sinh_vien?.lop || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.sinh_vien?.khoa || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={7}>
                        Không có dữ liệu. Thử bỏ lọc hoặc về Trang 1.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-2 border rounded disabled:opacity-50">Trang trước</button>
              <span>Trang {page}</span>
              <button disabled={users.length < limit} onClick={()=>setPage(p=>p+1)} className="px-3 py-2 border rounded disabled:opacity-50">Trang sau</button>
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingUser) && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {editingUser ? 'Sửa Người Dùng' : 'Thêm Người Dùng'}
                  </h3>
                  
                  <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mã số</label>
                      <input
                        type="text"
                        value={formData.maso}
                        onChange={(e) => setFormData({...formData, maso: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                      <input
                        type="text"
                        value={formData.hoten}
                        onChange={(e) => setFormData({...formData, hoten: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      >
                        {roles.map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {editingUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required={!editingUser}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Lớp</label>
                      <input
                        type="text"
                        value={formData.lop}
                        onChange={(e) => setFormData({...formData, lop: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Khoa</label>
                      <input
                        type="text"
                        value={formData.khoa}
                        onChange={(e) => setFormData({...formData, khoa: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateModal(false);
                          setEditingUser(null);
                          resetForm();
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        {editingUser ? 'Cập nhật' : 'Tạo'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
      </main>
    </AdminLayout>
  );
};

export default UserManagement;