// Integrated from attached design: Dashboard/TeacherDashboard.js
import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Calendar, Award, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { http } from '../../services/http';

function StatCard({ title, value, icon, color = 'blue', change, trend }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    React.createElement('div', { className: `rounded-lg border p-6 ${colorClasses[color]}` }, [
      React.createElement('div', { key: 'row', className: 'flex items-center justify-between' }, [
        React.createElement('div', { key: 'left' }, [
          React.createElement('p', { key: 't', className: 'text-sm font-medium text-gray-600' }, title),
          React.createElement('p', { key: 'v', className: 'text-3xl font-bold mt-1' }, value),
          change ? React.createElement('p', { key: 'c', className: 'text-sm mt-1' }, [
            React.createElement('span', { key: 'chg', className: trend === 'up' ? 'text-green-600' : 'text-red-600' }, `${trend === 'up' ? '↗' : '↘'} ${change}`),
            React.createElement('span', { key: 'cmp', className: 'text-gray-500 ml-1' }, 'so với tháng trước')
          ]) : null
        ]),
        React.createElement('div', { key: 'icon', className: 'h-12 w-12 rounded-full bg-white bg-opacity-50 flex items-center justify-center' }, icon)
      ])
    ])
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
    React.createElement('div', { className: 'border rounded-lg p-4 hover:shadow-md transition-shadow' }, [
      React.createElement('div', { key: 'hdr', className: 'flex justify-between items-start mb-2' }, [
        React.createElement('h3', { key: 'title', className: 'font-semibold text-gray-900' }, activity.ten_hd),
        React.createElement('span', { key: 'st', className: `px-2 py-1 rounded-full text-xs font-medium ${statusColors[activity.trang_thai]}` }, statusLabels[activity.trang_thai])
      ]),
      React.createElement('p', { key: 'desc', className: 'text-sm text-gray-600 mb-3' }, activity.mo_ta),
      React.createElement('div', { key: 'grid', className: 'grid grid-cols-2 gap-4 text-sm' }, [
        React.createElement('div', { key: 'p' }, [
          React.createElement('span', { className: 'text-gray-500' }, 'Điểm:'),
          React.createElement('span', { className: 'ml-1 font-medium' }, activity.diem_rl)
        ]),
        React.createElement('div', { key: 'loc' }, [
          React.createElement('span', { className: 'text-gray-500' }, 'Địa điểm:'),
          React.createElement('span', { className: 'ml-1' }, activity.dia_diem)
        ]),
        React.createElement('div', { key: 'bd' }, [
          React.createElement('span', { className: 'text-gray-500' }, 'Bắt đầu:'),
          React.createElement('span', { className: 'ml-1' }, new Date(activity.ngay_bd).toLocaleDateString('vi-VN'))
        ]),
        React.createElement('div', { key: 'kt' }, [
          React.createElement('span', { className: 'text-gray-500' }, 'Kết thúc:'),
          React.createElement('span', { className: 'ml-1' }, new Date(activity.ngay_kt).toLocaleDateString('vi-VN'))
        ])
      ])
    ])
  );
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState({ totalActivities: 0, pendingApprovals: 0, totalStudents: 0, avgAttendance: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [activitiesRes, usersRes] = await Promise.all([
        http.get('/activities').catch(() => ({ data: { data: [] } })),
        http.get('/users').catch(() => ({ data: { data: [] } }))
      ]);
      const activities = activitiesRes.data?.data || [];
      const users = usersRes.data?.data || [];
      const students = users.filter(u => u.vai_tro?.ten_vt?.toUpperCase().includes('SINH_VIEN') || u.vai_tro?.ten_vt?.toUpperCase().includes('STUDENT'));
      setStats({
        totalActivities: activities.length,
        pendingApprovals: activities.filter(a => a.trang_thai === 'cho_duyet').length,
        totalStudents: students.length,
        avgAttendance: 85
      });
      const sortedActivities = activities
        .sort((a, b) => new Date(b.ngay_tao || b.ngay_bd) - new Date(a.ngay_tao || a.ngay_bd))
        .slice(0, 5);
      setRecentActivities(sortedActivities);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Không tải được dữ liệu.');
      setStats({ totalActivities: 0, pendingApprovals: 0, totalStudents: 0, avgAttendance: 0 });
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return React.createElement('div', { className: 'flex items-center justify-center h-64' },
      React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600' }));
  }
  if (error) {
    return React.createElement('div', { className: 'bg-red-50 border border-red-200 rounded-lg p-4' },
      React.createElement('div', { className: 'flex items-center' }, [
        React.createElement(AlertCircle, { key: 'i', className: 'h-5 w-5 text-red-500 mr-2' }),
        React.createElement('span', { key: 't', className: 'text-red-700' }, error)
      ]));
  }

  return (
    React.createElement('div', { className: 'space-y-6' }, [
      React.createElement('div', { key: 'hdr', className: 'bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white' }, [
        React.createElement('h1', { key: 'h', className: 'text-2xl font-bold' }, 'Dashboard Giảng viên'),
        React.createElement('p', { key: 'p', className: 'text-blue-100 mt-1' }, 'Tổng quan về hoạt động và quản lý sinh viên')
      ]),
      React.createElement('div', { key: 'stats', className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' }, [
        React.createElement(StatCard, { key: 's1', title: 'Tổng Hoạt động', value: stats.totalActivities, icon: React.createElement(Calendar, { className: 'h-6 w-6' }), color: 'blue', change: '+12%', trend: 'up' }),
        React.createElement(StatCard, { key: 's2', title: 'Chờ phê duyệt', value: stats.pendingApprovals, icon: React.createElement(Clock, { className: 'h-6 w-6' }), color: 'yellow' }),
        React.createElement(StatCard, { key: 's3', title: 'Tổng Sinh viên', value: stats.totalStudents, icon: React.createElement(Users, { className: 'h-6 w-6' }), color: 'green', change: '+3%', trend: 'up' }),
        React.createElement(StatCard, { key: 's4', title: 'Tỷ lệ tham gia', value: `${stats.avgAttendance}%`, icon: React.createElement(Award, { className: 'h-6 w-6' }), color: 'green', change: '+5%', trend: 'up' })
      ]),
      React.createElement('div', { key: 'qa', className: 'bg-white rounded-lg border p-6' }, [
        React.createElement('h2', { key: 't', className: 'text-lg font-semibold text-gray-900 mb-4' }, 'Thao tác nhanh'),
        React.createElement('div', { key: 'g', className: 'grid grid-cols-1 md:grid-cols-3 gap-4' }, [
          React.createElement('button', { key: 'a', onClick: () => window.location.href = '/activities/create', className: 'flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700 transition-colors' }, [React.createElement(Calendar, { key: 'i', className: 'h-5 w-5' }), 'Tạo hoạt động mới']),
          React.createElement('button', { key: 'b', onClick: () => window.location.href = '/qr-management', className: 'flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg py-3 hover:bg-green-700 transition-colors' }, [React.createElement(CheckCircle, { key: 'i', className: 'h-5 w-5' }), 'Quản lý QR điểm danh']),
          React.createElement('button', { key: 'c', onClick: () => window.location.href = '/teacher/approve', className: 'flex items-center justify-center gap-2 bg-purple-600 text-white rounded-lg py-3 hover:bg-purple-700 transition-colors' }, [React.createElement(BarChart3, { key: 'i', className: 'h-5 w-5' }), 'Phê duyệt hoạt động'])
        ])
      ]),
      React.createElement('div', { key: 'recent', className: 'bg-white rounded-lg border p-6' }, [
        React.createElement('div', { key: 'hdr', className: 'flex justify-between items-center mb-4' }, [
          React.createElement('h2', { key: 't', className: 'text-lg font-semibold text-gray-900' }, 'Hoạt động gần đây'),
          React.createElement('button', { key: 'btn', onClick: () => window.location.href = '/admin/activities', className: 'text-blue-600 hover:text-blue-700 text-sm font-medium' }, 'Xem tất cả →')
        ]),
        recentActivities.length > 0 ? React.createElement('div', { key: 'list', className: 'space-y-4' }, recentActivities.map(a => React.createElement(ActivityCard, { key: a.id, activity: a }))) :
          React.createElement('div', { key: 'empty', className: 'text-center py-8 text-gray-500' }, [React.createElement(Calendar, { key: 'i', className: 'h-12 w-12 mx-auto mb-4 text-gray-300' }), React.createElement('p', { key: 'p' }, 'Chưa có hoạt động nào')])
      ])
    ])
  );
}


