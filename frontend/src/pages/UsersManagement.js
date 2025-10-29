import React from 'react';
import AdminTable from '../components/AdminTable';
import { http } from '../services/http';

/**
 * Example usage of AdminTable component for users management
 */
export default function UsersManagement() {
  // Define table columns
  const columns = [
    { header: 'Mã số', accessor: 'maso' },
    { header: 'Họ tên', accessor: 'hoten' },
    { header: 'Email', accessor: 'email' },
    { header: 'Vai trò', accessor: 'role' },
    { header: 'Lớp', accessor: 'lop' },
    { header: 'Trạng thái', accessor: 'trang_thai' },
    { header: 'Thao tác', accessor: 'actions' }
  ];

  // Custom row renderer
  const renderRow = (user) => (
    <>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {user.maso}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {user.hoten}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {user.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
          user.role === 'GIẢNG_VIÊN' ? 'bg-blue-100 text-blue-800' :
          user.role === 'LỚP_TRƯỞNG' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {user.lop || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.trang_thai === 'hoat_dong' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {user.trang_thai === 'hoat_dong' ? 'Hoạt động' : 'Không hoạt động'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <button className="text-blue-600 hover:text-blue-900">
            Xem
          </button>
          <button className="text-green-600 hover:text-green-900">
            Sửa
          </button>
          <button className="text-red-600 hover:text-red-900">
            Xóa
          </button>
        </div>
      </td>
    </>
  );

  // Fetch function for users data
  const fetchUsers = async (queryParams) => {
    try {
      const response = await http.get(`/admin/users?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  };

  // Additional filters component
  const filters = (
    <div className="flex items-center space-x-4">
      <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
        <option value="">Tất cả vai trò</option>
        <option value="ADMIN">Admin</option>
        <option value="GIẢNG_VIÊN">Giảng viên</option>
        <option value="LỚP_TRƯỞNG">Lớp trưởng</option>
        <option value="SINH_VIÊN">Sinh viên</option>
      </select>
      
      <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
        <option value="">Tất cả trạng thái</option>
        <option value="hoat_dong">Hoạt động</option>
        <option value="khong_hoat_dong">Không hoạt động</option>
        <option value="khoa">Khóa</option>
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Quản lý người dùng</h1>
        <p className="text-gray-600">
          Quản lý danh sách người dùng trong hệ thống với phân trang và tìm kiếm.
        </p>
      </div>

      <AdminTable
        fetchData={fetchUsers}
        columns={columns}
        renderRow={renderRow}
        title="Danh sách người dùng"
        filters={filters}
        initialParams={{
          limit: 20,
          page: 1
        }}
      />
    </div>
  );
}
