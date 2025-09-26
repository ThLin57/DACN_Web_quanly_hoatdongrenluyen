// src/pages/admin/AdminDashboard.js
import { useState, useEffect } from 'react';
import http from '../../services/http';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalActivities: 0,
    totalRegistrations: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingRegs, setPendingRegs] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [res, pendingRes] = await Promise.all([
        http.get('/api/admin/dashboard'),
        http.get('/api/admin/registrations', { params: { page: 1, limit: 5, status: 'cho_duyet' } }).catch(() => ({ data: { data: { items: [] } } }))
      ]);
      const payload = res?.data?.data || res?.data || {};
      setStats({
        totalUsers: Number(payload.totalUsers || 0),
        totalActivities: Number(payload.totalActivities || 0),
        totalRegistrations: Number(payload.totalRegistrations || 0),
        pendingApprovals: Number(payload.pendingApprovals || 0)
      });
      const items = pendingRes?.data?.data?.items || [];
      setPendingRegs(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      setStats({
        totalUsers: 0,
        totalActivities: 0,
        totalRegistrations: 0,
        pendingApprovals: 0
      });
      setPendingRegs([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <AdminLayout active="dashboard">
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Quản Trị</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng Người Dùng
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalUsers.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng Hoạt Động
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalActivities.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 002 2h4a2 2 0 002-2V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM8 7a1 1 0 000 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng Đăng Ký
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalRegistrations.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Chờ Phê Duyệt
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.pendingApprovals.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending registrations (preview) */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Đăng ký chờ duyệt gần nhất</h2>
          <button onClick={() => window.location.href = '/admin/approvals'} className="text-blue-600">Xem tất cả</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="px-3 py-2">Sinh viên</th>
                <th className="px-3 py-2">Hoạt động</th>
                <th className="px-3 py-2">Ngày đăng ký</th>
              </tr>
            </thead>
            <tbody>
              {pendingRegs.map(r => (
                <tr key={r.id} className="border-b">
                  <td className="px-3 py-2">{r.sinh_vien?.nguoi_dung?.ho_ten || ''}</td>
                  <td className="px-3 py-2">{r.hoat_dong?.ten_hd || ''}</td>
                  <td className="px-3 py-2">{r.ngay_dang_ky ? new Date(r.ngay_dang_ky).toLocaleString() : ''}</td>
                </tr>
              ))}
              {pendingRegs.length === 0 && (
                <tr><td className="px-3 py-3" colSpan={3}>Không có đăng ký chờ duyệt</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Thao Tác Nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            onClick={() => window.location.href = '/admin/users'}
          >
            Quản Lý Người Dùng
          </button>
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
            onClick={() => window.location.href = '/admin/activities'}
          >
            Quản Lý Hoạt Động
          </button>
          <button 
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors"
            onClick={() => window.location.href = '/admin/approvals'}
          >
            Phê Duyệt Đăng Ký
          </button>
          <button 
            className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-md transition-colors"
            onClick={() => window.location.href = '/admin/roles'}
          >
            Quản Lý Vai Trò
          </button>
          <button 
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
            onClick={() => window.location.href = '/admin/activity-types'}
          >
            Loại Hoạt Động
          </button>
          <a 
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md transition-colors text-center"
            href={(function(){ const base=(typeof window!=='undefined'?(process.env.REACT_APP_API_URL||'http://localhost:3001/api'):'').replace(/\/$/,''); return base + '/admin/users/export'; })()}
          >
            Xuất Người Dùng
          </a>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminDashboard;