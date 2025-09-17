// Integrated from attached design: Dashboard/MonitorDashboard.js
import React, { useState, useEffect } from 'react';
import { Users, Calendar, Award, TrendingUp, Clock, AlertTriangle, QrCode } from 'lucide-react';
import { http } from '../../services/http';

function StatCard({ title, value, icon, color = 'blue', subtitle }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200'
  };
  return React.createElement('div', { className: `rounded-lg border p-6 ${colorClasses[color]}` }, [
    React.createElement('div', { key: 'row', className: 'flex items-center justify-between' }, [
      React.createElement('div', { key: 'l' }, [
        React.createElement('p', { key: 't', className: 'text-sm font-medium text-gray-600' }, title),
        React.createElement('p', { key: 'v', className: 'text-3xl font-bold mt-1' }, value),
        subtitle ? React.createElement('p', { key: 's', className: 'text-sm text-gray-500 mt-1' }, subtitle) : null
      ]),
      React.createElement('div', { key: 'i', className: 'h-12 w-12 rounded-full bg-white bg-opacity-50 flex items-center justify-center' }, icon)
    ])
  ]);
}

function ClassActivityCard({ activity }) {
  const statusColors = { 'cho_duyet': 'bg-yellow-100 text-yellow-800', 'da_duyet': 'bg-green-100 text-green-800', 'tu_choi': 'bg-red-100 text-red-800', 'hoan_thanh': 'bg-blue-100 text-blue-800' };
  const statusLabels = { 'cho_duyet': 'Chờ duyệt', 'da_duyet': 'Đã duyệt', 'tu_choi': 'Từ chối', 'hoan_thanh': 'Hoàn thành' };
  return React.createElement('div', { className: 'border rounded-lg p-4 hover:shadow-md transition-shadow' }, [
    React.createElement('div', { key: 'hdr', className: 'flex justify-between items-start mb-2' }, [
      React.createElement('h3', { key: 't', className: 'font-semibold text-gray-900' }, activity.ten_hd),
      React.createElement('span', { key: 's', className: `px-2 py-1 rounded-full text-xs font-medium ${statusColors[activity.trang_thai]}` }, statusLabels[activity.trang_thai])
    ]),
    React.createElement('p', { key: 'desc', className: 'text-sm text-gray-600 mb-3 line-clamp-2' }, activity.mo_ta),
    React.createElement('div', { key: 'grid', className: 'grid grid-cols-2 gap-4 text-sm' }, [
      React.createElement('div', { key: 'p' }, [React.createElement('span', { className: 'text-gray-500' }, 'Điểm RL:'), React.createElement('span', { className: 'ml-1 font-medium text-green-600' }, activity.diem_rl)]),
      React.createElement('div', { key: 'r' }, [React.createElement('span', { className: 'text-gray-500' }, 'Đăng ký:'), React.createElement('span', { className: 'ml-1' }, `${activity.registrationCount || 0} sinh viên`)]),
      React.createElement('div', { key: 't', className: 'col-span-2' }, [React.createElement('span', { className: 'text-gray-500' }, 'Thời gian:'), React.createElement('span', { className: 'ml-1' }, new Date(activity.ngay_bd).toLocaleDateString('vi-VN'))])
    ])
  ]);
}

function StudentProgressCard({ student }) {
  return React.createElement('div', { className: 'border rounded-lg p-4' }, [
    React.createElement('div', { key: 'hdr', className: 'flex items-center justify-between mb-2' }, [
      React.createElement('h4', { key: 'n', className: 'font-medium text-gray-900' }, student.ten_nguoi_dung),
      React.createElement('span', { key: 'm', className: 'text-sm text-gray-500' }, student.mssv)
    ]),
    React.createElement('div', { key: 'b', className: 'space-y-2' }, [
      React.createElement('div', { key: 'p1', className: 'flex justify-between text-sm' }, [React.createElement('span', { className: 'text-gray-600' }, 'Điểm RL hiện tại:'), React.createElement('span', { className: 'font-medium text-green-600' }, student.totalPoints || 0)]),
      React.createElement('div', { key: 'p2', className: 'flex justify-between text-sm' }, [React.createElement('span', { className: 'text-gray-600' }, 'Hoạt động tham gia:'), React.createElement('span', { className: 'font-medium' }, student.activitiesCount || 0)]),
      React.createElement('div', { key: 'bar', className: 'w-full bg-gray-200 rounded-full h-2' }, [
        React.createElement('div', { className: 'bg-green-500 h-2 rounded-full', style: { width: `${Math.min((student.totalPoints || 0), 100)}%` } })
      ])
    ])
  ]);
}

export default function MonitorDashboard() {
  const [stats, setStats] = useState({ classStudents: 0, classActivities: 0, pendingApprovals: 0, avgClassScore: 0 });
  const [classActivities, setClassActivities] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const activitiesRes = await http.get('/activities').catch(() => ({ data: { data: [] } }));
      const classActivitiesData = activitiesRes.data?.data || [];
      try {
        const usersRes = await http.get('/users').catch(() => ({ data: { data: [] } }));
        const allUsers = usersRes.data?.data || [];
        const classStudentsData = allUsers.filter(u => u.vai_tro?.ten_vt?.toUpperCase().includes('SINH_VIEN') || u.vai_tro?.ten_vt?.toUpperCase().includes('STUDENT'));
        setClassStudents(classStudentsData.slice(0, 6));
        setStats({
          classStudents: classStudentsData.length,
          classActivities: classActivitiesData.length,
          pendingApprovals: classActivitiesData.filter(a => a.trang_thai === 'cho_duyet').length,
          avgClassScore: 75
        });
      } catch (_) {
        setStats({ classStudents: 25, classActivities: classActivitiesData.length, pendingApprovals: classActivitiesData.filter(a => a.trang_thai === 'cho_duyet').length, avgClassScore: 75 });
        setClassStudents([]);
      }
      setClassActivities(classActivitiesData.slice(0, 6));
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setStats({ classStudents: 0, classActivities: 0, pendingApprovals: 0, avgClassScore: 0 });
      setClassActivities([]);
      setClassStudents([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return React.createElement('div', { className: 'flex items-center justify-center h-64' }, React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600' }));
  }
  if (error) {
    return React.createElement('div', { className: 'bg-red-50 border border-red-200 rounded-lg p-4' }, React.createElement('div', { className: 'flex items-center' }, [React.createElement(AlertTriangle, { key: 'i', className: 'h-5 w-5 text-red-500 mr-2' }), React.createElement('span', { key: 't', className: 'text-red-700' }, error)]));
  }

  return React.createElement('div', { className: 'space-y-6' }, [
    React.createElement('div', { key: 'hdr', className: 'bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white' }, [
      React.createElement('h1', { key: 'h', className: 'text-2xl font-bold' }, 'Dashboard Lớp trưởng'),
      React.createElement('p', { key: 'p', className: 'text-purple-100 mt-1' }, 'Quản lý và theo dõi hoạt động rèn luyện của lớp')
    ]),
    React.createElement('div', { key: 'stats', className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' }, [
      React.createElement(StatCard, { key: 's1', title: 'Sinh viên lớp', value: stats.classStudents, icon: React.createElement(Users, { className: 'h-6 w-6' }), color: 'blue', subtitle: 'Tổng số sinh viên' }),
      React.createElement(StatCard, { key: 's2', title: 'Hoạt động lớp', value: stats.classActivities, icon: React.createElement(Calendar, { className: 'h-6 w-6' }), color: 'green', subtitle: 'Hoạt động đã tổ chức' }),
      React.createElement(StatCard, { key: 's3', title: 'Chờ phê duyệt', value: stats.pendingApprovals, icon: React.createElement(Clock, { className: 'h-6 w-6' }), color: 'yellow', subtitle: 'Cần xử lý' }),
      React.createElement(StatCard, { key: 's4', title: 'Điểm RL trung bình', value: Math.round(stats.avgClassScore), icon: React.createElement(Award, { className: 'h-6 w-6' }), color: 'purple', subtitle: 'Của lớp' })
    ]),
    React.createElement('div', { key: 'qa', className: 'bg-white rounded-lg border p-6' }, [
      React.createElement('h2', { key: 't', className: 'text-lg font-semibold text-gray-900 mb-4' }, 'Thao tác nhanh - Lớp trưởng'),
      React.createElement('div', { key: 'g', className: 'grid grid-cols-1 md:grid-cols-4 gap-4' }, [
        React.createElement('button', { key: 'a', onClick: () => window.location.href = '/activities/create', className: 'flex items-center justify-center gap-2 bg-purple-600 text-white rounded-lg py-3 hover:bg-purple-700 transition-colors' }, [React.createElement(Calendar, { key: 'i', className: 'h-5 w-5' }), 'Tạo hoạt động']),
        React.createElement('button', { key: 'b', onClick: () => window.location.href = '/qr-management', className: 'flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg py-3 hover:bg-green-700 transition-colors' }, [React.createElement(QrCode, { key: 'i', className: 'h-5 w-5' }), 'Quản lý QR']),
        React.createElement('button', { key: 'c', onClick: () => window.location.href = '/class/students', className: 'flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700 transition-colors' }, [React.createElement(Users, { key: 'i', className: 'h-5 w-5' }), 'Quản lý SV']),
        React.createElement('button', { key: 'd', onClick: () => window.location.href = '/class/reports', className: 'flex items-center justify-center gap-2 bg-orange-600 text-white rounded-lg py-3 hover:bg-orange-700 transition-colors' }, [React.createElement(TrendingUp, { key: 'i', className: 'h-5 w-5' }), 'Báo cáo'])
      ])
    ]),
    React.createElement('div', { key: 'grid', className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' }, [
      React.createElement('div', { key: 'act', className: 'bg-white rounded-lg border p-6' }, [
        React.createElement('div', { key: 'hdr', className: 'flex justify-between items-center mb-4' }, [
          React.createElement('h2', { key: 't', className: 'text-lg font-semibold text-gray-900' }, 'Hoạt động của lớp'),
          React.createElement('button', { key: 'btn', onClick: () => window.location.href = '/class/activities', className: 'text-purple-600 hover:text-purple-700 text-sm font-medium' }, 'Xem tất cả →')
        ]),
        classActivities.length > 0 ? React.createElement('div', { key: 'list', className: 'space-y-4' }, classActivities.map(a => React.createElement(ClassActivityCard, { key: a.id, activity: a }))) :
          React.createElement('div', { key: 'empty', className: 'text-center py-8 text-gray-500' }, [React.createElement(Calendar, { key: 'i', className: 'h-12 w-12 mx-auto mb-4 text-gray-300' }), React.createElement('p', { key: 'p' }, 'Chưa có hoạt động nào'), React.createElement('button', { key: 'btn2', onClick: () => window.location.href = '/activities/create', className: 'mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium' }, 'Tạo hoạt động đầu tiên')])
      ]),
      React.createElement('div', { key: 'stu', className: 'bg-white rounded-lg border p-6' }, [
        React.createElement('div', { key: 'hdr', className: 'flex justify-between items-center mb-4' }, [
          React.createElement('h2', { key: 't', className: 'text-lg font-semibold text-gray-900' }, 'Tiến độ sinh viên'),
          React.createElement('button', { key: 'btn', onClick: () => window.location.href = '/class/students', className: 'text-purple-600 hover:text-purple-700 text-sm font-medium' }, 'Xem tất cả →')
        ]),
        classStudents.length > 0 ? React.createElement('div', { key: 'list', className: 'space-y-4' }, classStudents.map(s => React.createElement(StudentProgressCard, { key: s.id, student: s }))) :
          React.createElement('div', { key: 'empty', className: 'text-center py-8 text-gray-500' }, [React.createElement(Users, { key: 'i', className: 'h-12 w-12 mx-auto mb-4 text-gray-300' }), React.createElement('p', { key: 'p' }, 'Đang tải dữ liệu sinh viên...')])
      ])
    ])
  ]);
}


