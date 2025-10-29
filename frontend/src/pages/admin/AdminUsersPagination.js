import React, { useState, useEffect } from 'react';
import { 
  Users, Search, UserPlus, Eye, Trash2, Shield, Filter,
  CheckCircle, XCircle, Mail, User, GraduationCap, Calendar
} from 'lucide-react';
import http from '../../services/http';
import Pagination from '../../components/Pagination';

const AdminUsersWithPagination = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    // Reset to page 1 when filters change
    if (searchTerm || roleFilter || statusFilter) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      
      const response = await http.get(`/admin/users?${params.toString()}`);
      const data = response.data?.data || response.data;
      
      if (data.users && data.pagination) {
        setUsers(data.users);
        setPagination(data.pagination);
      } else {
        setUsers([]);
      }
      
      console.log(`Users: ${data.users?.length || 0}, Page: ${data.pagination?.page || 1}/${data.pagination?.totalPages || 1}`);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'hoat_dong': return { bg: '#dcfce7', color: '#15803d', text: 'Hoạt động' };
      case 'khong_hoat_dong': return { bg: '#f3f4f6', color: '#374151', text: 'Không hoạt động' };
      case 'khoa': return { bg: '#fef2f2', color: '#dc2626', text: 'Bị khóa' };
      default: return { bg: '#fef3c7', color: '#92400e', text: 'Chưa xác định' };
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return { bg: '#fef2f2', color: '#dc2626' };
      case 'GIẢNG_VIÊN': return { bg: '#fef3c7', color: '#92400e' };
      case 'LỚP_TRƯỞNG': return { bg: '#dbeafe', color: '#1e40af' };
      case 'SINH_VIÊN': return { bg: '#dcfce7', color: '#15803d' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginLeft: '16px' }}>Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <style>
        {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
      </style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            Quản Lý Tài Khoản (Có Phân Trang)
          </h1>
          <p style={{ color: '#6b7280' }}>
            Tổng: {pagination.total} người dùng
          </p>
        </div>
        <button style={{
          padding: '12px 24px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <UserPlus size={20} />
          Thêm Người Dùng
        </button>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Shield size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'white'
              }}
            >
              <option value="">Tất cả vai trò</option>
              <option value="ADMIN">ADMIN</option>
              <option value="GIẢNG_VIÊN">GIẢNG_VIÊN</option>
              <option value="LỚP_TRƯỞNG">LỚP_TRƯỞNG</option>
              <option value="SINH_VIÊN">SINH_VIÊN</option>
            </select>
          </div>

          <div style={{ position: 'relative' }}>
            <Filter size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                border: ' ´1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'white'
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="hoat_dong">Hoạt động</option>
              <option value="khong_hoat_dong">Không hoạt động</option>
              <option value="khoa">Bị khóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {users.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#6b7280' }} />
            <p style={{ fontSize: '16px', fontWeight: '500', color: '#6b7280' }}>
              Không tìm thấy người dùng nào
            </p>
          </div>
        ) : (
          users.map((user) => {
            const statusInfo = getStatusColor(user.trang_thai);
            const roleInfo = getRoleColor(user.role);
            
            return (
              <div key={user.id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: roleInfo.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: roleInfo.color,
                    fontWeight: '600',
                    fontSize: '18px'
                  }}>
                    {(user.ho_ten || user.ten_dn || 'U')[0].toUpperCase()}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '4px න්.
                      {user.ho_ten || 'Chưa có tên'}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: roleInfo.bg,
                        color: roleInfo.color
                      }}>
                        {user.role || 'Chưa xác định'}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.color
                      }}>
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#6b7280' }}>
                    <Mail size={14} />
                    {user.email || 'Chưa có email'}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#6b7280' }}>
                    <User size={14} />
                    {user.ten_dn || user.maso || 'Chưa có username'}
                  </div>

                  {user.sinh_vien && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#6b7280' }}>
                        <GraduationCap size={14} />
                        MSSV: {user.sinh_vien.mssv}
                      </div>
                      
                      {user.sinh_vien.lop && (
                        <div style={{ display: 'flex', alignItems: 'center', gap amalgam='8px', marginBottom: '8px', fontSize: '14px', color: '#6b7280' }}>
                          <Users size={14} />
                          Lớp: {user.sinh_vien.lop.ten_lop}
                        </div>
                      )}
                    </>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                    <Calendar size={14} />
                    Tham gia: {user.ngay_tao ? new Date(user.ngay_tao).toLocaleDateString('vi-VN') : 'Không xác định'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                  <button style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: sidebar,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flex: 1,
                    justifyContent: 'center'
                  }}>
                    <Eye size={16} />
                    Chi tiết
                  </button>
                  <button style={{
                    padding: '8px 12px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ marginTop: '24px' }}>
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default AdminUsersWithPagination;

