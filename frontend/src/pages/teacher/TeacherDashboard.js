import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Calendar, Award, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import http from '../../services/http';

function StatCard({ title, value, icon, color = 'blue', change, trend }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {change && (
            <p className="text-sm mt-1">
              <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                {trend === 'up' ? '↗' : '↘'} {change}
              </span>
              <span className="text-gray-500 ml-1">so với tháng trước</span>
            </p>
          )}
        </div>
        <div className="h-12 w-12 rounded-full bg-white bg-opacity-50 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActivityCard({ activity }) {
  const statusColors = {
    'cho_duyet': 'bg-yellow-100 text-yellow-800',
    'da_duyet': 'bg-green-100 text-green-800', 
    'tu_choi': 'bg-red-100 text-red-800',
    'hoan_thanh': 'bg-blue-100 text-blue-800'
  };

  const statusLabels = {
    'cho_duyet': 'Chờ duyệt',
    'da_duyet': 'Đã duyệt',
    'tu_choi': 'Từ chối',
    'hoan_thanh': 'Hoàn thành'
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900">{activity.ten_hd}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[activity.trang_thai]}`}>
          {statusLabels[activity.trang_thai]}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{activity.mo_ta}</p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Điểm:</span>
          <span className="ml-1 font-medium">{activity.diem_rl}</span>
        </div>
        <div>
          <span className="text-gray-500">Địa điểm:</span>
          <span className="ml-1">{activity.dia_diem}</span>
        </div>
        <div>
          <span className="text-gray-500">Bắt đầu:</span>
          <span className="ml-1">{new Date(activity.ngay_bd).toLocaleDateString('vi-VN')}</span>
        </div>
        <div>
          <span className="text-gray-500">Kết thúc:</span>
          <span className="ml-1">{new Date(activity.ngay_kt).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    totalActivities: 0,
    pendingApprovals: 0,
    totalStudents: 0,
    avgAttendance: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load statistics - use existing APIs
      const [activitiesRes, usersRes] = await Promise.all([
        http.get('/api/activities').catch(err => ({ data: { data: [] } })),
        http.get('/api/users').catch(err => ({ data: { data: [] } }))
      ]);

      const activities = activitiesRes.data?.data || [];
      const users = usersRes.data?.data || [];
      const students = users.filter(u => u.vai_tro?.ten_vt?.toUpperCase().includes('SINH_VIEN') || u.vai_tro?.ten_vt?.toUpperCase().includes('STUDENT'));
      
      setStats({
        totalActivities: activities.length,
        pendingApprovals: activities.filter(a => a.trang_thai === 'cho_duyet').length,
        totalStudents: students.length,
        avgAttendance: 85 // Mock data for now
      });

      // Set recent activities (last 5)
      const sortedActivities = activities
        .sort((a, b) => new Date(b.ngay_tao || b.ngay_bd) - new Date(a.ngay_tao || a.ngay_bd))
        .slice(0, 5);
      setRecentActivities(sortedActivities);

    } catch (err) {
      console.error('Error loading dashboard:', err);
      // Set fallback data instead of error
      setStats({
        totalActivities: 0,
        pendingApprovals: 0,
        totalStudents: 0,
        avgAttendance: 0
      });
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Dashboard Giảng viên</h1>
        <p className="text-blue-100 mt-1">Tổng quan về hoạt động và quản lý sinh viên</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng Hoạt động"
          value={stats.totalActivities}
          icon={<Calendar className="h-6 w-6" />}
          color="blue"
          change="+12%"
          trend="up"
        />
        <StatCard
          title="Chờ phê duyệt"
          value={stats.pendingApprovals}
          icon={<Clock className="h-6 w-6" />}
          color="yellow"
        />
        <StatCard
          title="Tổng Sinh viên"
          value={stats.totalStudents}
          icon={<Users className="h-6 w-6" />}
          color="green"
          change="+3%"
          trend="up"
        />
        <StatCard
          title="Tỷ lệ tham gia"
          value={`${stats.avgAttendance}%`}
          icon={<Award className="h-6 w-6" />}
          color="green"
          change="+5%"
          trend="up"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => window.location.href = '/activities/create'}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700 transition-colors"
          >
            <Calendar className="h-5 w-5" />
            Tạo hoạt động mới
          </button>
          <button 
            onClick={() => window.location.href = '/qr-management'}
            className="flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg py-3 hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="h-5 w-5" />
            Quản lý QR điểm danh
          </button>
          <button 
            onClick={() => window.location.href = '/teacher/approve'}
            className="flex items-center justify-center gap-2 bg-purple-600 text-white rounded-lg py-3 hover:bg-purple-700 transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
            Phê duyệt hoạt động
          </button>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h2>
          <button 
            onClick={() => window.location.href = '/admin/activities'}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Xem tất cả →
          </button>
        </div>
        {recentActivities.length > 0 ? (
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Chưa có hoạt động nào</p>
          </div>
        )}
      </div>
    </div>
  );
}