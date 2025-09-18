import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Award, TrendingUp, Clock, CheckCircle, AlertTriangle, QrCode,
  Star, ChevronRight, MapPin, BarChart3, Medal, Trophy, Target, Activity,
  UserCheck, ClipboardList, FileText, Bell, BookOpen
} from 'lucide-react';
import http from '../../services/http';
// import classService from '../../services/classService';

export default function MonitorDashboard() {
  const [summary, setSummary] = useState({ 
    totalStudents: 0, 
    totalActivities: 0, 
    pendingApprovals: 0, 
    avgClassScore: 0,
    myPoints: 0,
    progress: 0
  });
  const [upcomingActivities, setUpcomingActivities] = useState([]);
  const [recentApprovals, setRecentApprovals] = useState([]);
  const [classProgress, setClassProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monitorName, setMonitorName] = useState('Lớp trưởng');

  useEffect(() => {
    try {
      const cached = window.localStorage.getItem('user');
      if (cached) {
        const u = JSON.parse(cached);
        setMonitorName(u?.ho_ten || u?.name || 'Lớp trưởng');
      }
    } catch (_) {}
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const activitiesRes = await http.get('/activities').catch(() => ({ data: { data: [] } }));
      const rawActivities = activitiesRes?.data?.data;
      const activities = Array.isArray(rawActivities)
        ? rawActivities
        : Array.isArray(rawActivities?.items)
          ? rawActivities.items
          : [];
      const students = [
        { id: 1, totalPoints: 85, activitiesJoined: 12 },
        { id: 2, totalPoints: 78, activitiesJoined: 10 },
        { id: 3, totalPoints: 92, activitiesJoined: 15 },
        { id: 4, totalPoints: 65, activitiesJoined: 8 },
        { id: 5, totalPoints: 88, activitiesJoined: 11 }
      ];
      const approvals = [];
      const totalStudents = students.length;
      const totalActivities = activities.length;
      const pendingApprovals = approvals.length;
      const avgScore = students.length > 0 
        ? students.reduce((sum, s) => sum + (s.totalPoints || 0), 0) / students.length 
        : 0;
      setSummary({
        totalStudents,
        totalActivities,
        pendingApprovals,
        avgClassScore: Math.round(avgScore),
        myPoints: 75,
        progress: Math.min(avgScore / 100, 1)
      });
      setUpcomingActivities(activities.slice ? activities.slice(0, 3) : []);
      setRecentApprovals(approvals);
      const mockClassProgress = [
        { id: 1, name: 'Học thuật', studentsCompleted: Math.floor(totalStudents * 0.8), totalStudents, averagePoints: 18, maxPoints: 25, color: '#3B82F6', icon: '📚' },
        { id: 2, name: 'Tình nguyện', studentsCompleted: Math.floor(totalStudents * 0.6), totalStudents, averagePoints: 15, maxPoints: 25, color: '#10B981', icon: '🤝' },
        { id: 3, name: 'Thể thao', studentsCompleted: Math.floor(totalStudents * 0.4), totalStudents, averagePoints: 8, maxPoints: 20, color: '#F59E0B', icon: '🏃' },
        { id: 4, name: 'Văn nghệ', studentsCompleted: Math.floor(totalStudents * 0.3), totalStudents, averagePoints: 6, maxPoints: 15, color: '#8B5CF6', icon: '🎭' }
      ];
      setClassProgress(mockClassProgress);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setSummary({ totalStudents: 25, totalActivities: 8, pendingApprovals: 3, avgClassScore: 75, myPoints: 75, progress: 0.75 });
      setUpcomingActivities([]);
      setRecentApprovals([]);
      setClassProgress([]);
    } finally { setLoading(false); }
  };

  function statsCard(title, value, icon, color = 'blue', subtitle, trend) {
    const colorClasses = { blue: 'bg-blue-50 text-blue-700 border-blue-200', green: 'bg-green-50 text-green-700 border-green-200', purple: 'bg-purple-50 text-purple-700 border-purple-200', orange: 'bg-orange-50 text-orange-700 border-orange-200', yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
    return React.createElement('div', { 
      className: `rounded-xl border p-6 ${colorClasses[color]} hover:shadow-lg transition-all duration-200` 
    }, [
      React.createElement('div', { key: 'header', className: 'flex items-center justify-between mb-4' }, [
        React.createElement('div', { key: 'icon', className: 'h-12 w-12 rounded-lg bg-white bg-opacity-50 flex items-center justify-center' }, icon),
        trend && React.createElement('div', { key: 'trend', className: 'text-sm font-medium text-green-600' }, trend)
      ]),
      React.createElement('div', { key: 'content' }, [
        React.createElement('p', { key: 'title', className: 'text-sm font-medium text-gray-600 mb-1' }, title),
        React.createElement('p', { key: 'value', className: 'text-3xl font-bold mb-1' }, value),
        subtitle && React.createElement('p', { key: 'subtitle', className: 'text-sm text-gray-500' }, subtitle)
      ])
    ]);
  }

  const progressPercent = Math.round((summary.progress || 0) * 100);
  const progressCircle = React.createElement('div', { className: 'relative w-32 h-32' }, [
    React.createElement('svg', { key: 'svg', className: 'w-32 h-32 transform -rotate-90' }, [
      React.createElement('circle', { key: 'bg', cx: '64', cy: '64', r: '56', stroke: 'currentColor', strokeWidth: '8', fill: 'transparent', className: 'text-gray-200' }),
      React.createElement('circle', { key: 'progress', cx: '64', cy: '64', r: '56', stroke: 'currentColor', strokeWidth: '8', fill: 'transparent', strokeDasharray: Math.PI * 2 * 56, strokeDashoffset: Math.PI * 2 * 56 * (1 - (summary.progress || 0)), className: 'text-purple-600', strokeLinecap: 'round' })
    ]),
    React.createElement('div', { key: 'text', className: 'absolute inset-0 flex items-center justify-center' }, [
      React.createElement('div', { key: 'content', className: 'text-center' }, [
        React.createElement('div', { key: 'percent', className: 'text-2xl font-bold text-gray-900' }, `${progressPercent}%`),
        React.createElement('div', { key: 'label', className: 'text-xs text-gray-500' }, 'TB Lớp')
      ])
    ])
  ]);

  // Match student dashboard criteria progress
  function classProgressBar(progress) {
    const pointsPercentage = Math.round((progress.averagePoints / progress.maxPoints) * 100);
    return React.createElement('div', { key: progress.id, className: 'bg-white rounded-lg border p-4' }, [
      React.createElement('div', { key: 'header', className: 'flex items-center justify-between mb-2' }, [
        React.createElement('div', { key: 'left', className: 'flex items-center gap-2' }, [
          React.createElement('span', { key: 'icon', className: 'text-lg' }, progress.icon),
          React.createElement('h3', { key: 'name', className: 'font-medium text-gray-900 text-sm' }, progress.name)
        ]),
        React.createElement('span', { key: 'value', className: 'text-sm text-gray-600' }, `${progress.averagePoints}/${progress.maxPoints}`)
      ]),
      React.createElement('div', { key: 'bar', className: 'h-2 w-full bg-gray-100 rounded-full overflow-hidden' }, [
        React.createElement('div', { key: 'fill', className: 'h-2 rounded-full', style: { width: `${pointsPercentage}%`, backgroundColor: progress.color } })
      ])
    ]);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return React.createElement('div', { className: 'space-y-6' }, [
    React.createElement('div', { key: 'welcome', className: 'bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white' }, [
      React.createElement('h1', { key: 'title', className: 'text-2xl font-bold mb-2' }, `Dashboard ${monitorName}`),
      React.createElement('p', { key: 'subtitle', className: 'text-purple-100' }, 'Quản lý và theo dõi hoạt động rèn luyện của lớp')
    ]),

    React.createElement('div', { key: 'stats', className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' }, [
      statsCard('Sinh viên lớp', summary.totalStudents, React.createElement(Users, { className: 'h-6 w-6' }), 'blue', 'Tổng số sinh viên', '+2 sinh viên'),
      statsCard('Hoạt động đã tạo', summary.totalActivities, React.createElement(Calendar, { className: 'h-6 w-6' }), 'green', 'Học kỳ này', '+3 hoạt động'),
      statsCard('Chờ phê duyệt', summary.pendingApprovals, React.createElement(Clock, { className: 'h-6 w-6' }), 'yellow', 'Cần xử lý'),
      React.createElement('div', { key: 'progress-circle', className: 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 flex flex-col items-center justify-center' }, [progressCircle, React.createElement('p', { key: 'label', className: 'text-sm text-gray-600 mt-2' }, 'Điểm TB lớp')])
    ]),

    React.createElement('div', { key: 'class-progress', className: 'space-y-4' }, [
      React.createElement('div', { key: 'header', className: 'flex items-center gap-2' }, [
        React.createElement(BarChart3, { key: 'icon', className: 'h-5 w-5 text-purple-600' }),
        React.createElement('h2', { key: 'title', className: 'text-xl font-semibold text-gray-900' }, 'Tiến độ theo lĩnh vực'),
        React.createElement('span', { key: 'badge', className: 'bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full' }, `${classProgress.length} lĩnh vực`)
      ]),
      React.createElement('div', { key: 'grid', className: 'grid grid-cols-1 md:grid-cols-2 lg-grid-cols-4 lg:grid-cols-4 gap-4' }, classProgress.map(classProgressBar))
    ]),

    React.createElement('div', { key: 'quick-actions', className: 'bg-white rounded-lg border p-6' }, [
      React.createElement('div', { key: 'header', className: 'flex items-center gap-2 mb-4' }, [
        React.createElement(Star, { key: 'icon', className: 'h-5 w-5 text-purple-500' }),
        React.createElement('h3', { key: 'title', className: 'font-semibold text-gray-900' }, 'Thao tác nhanh - Lớp trưởng')
      ]),
      React.createElement('div', { key: 'actions-grid', className: 'grid grid-cols-1 md:grid-cols-4 gap-4' }, [
        React.createElement('button', { key: 'create-activity', onClick: () => window.location.href = '/activities/create', className: 'flex items-center justify-center gap-2 bg-purple-600 text-white rounded-lg py-3 hover:bg-purple-700 transition-colors' }, [React.createElement(Calendar, { key: 'icon', className: 'h-5 w-5' }), React.createElement('span', { key: 'text' }, 'Tạo hoạt động')]),
        React.createElement('button', { key: 'reports', onClick: () => window.location.href = '/class/reports', className: 'flex items-center justify-center gap-2 bg-orange-600 text-white rounded-lg py-3 hover:bg-orange-700 transition-colors' }, [React.createElement(FileText, { key: 'icon', className: 'h-5 w-5' }), React.createElement('span', { key: 'text' }, 'Báo cáo')])
      ])
    ]),

    React.createElement('div', { key: 'content-grid', className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' }, [
      React.createElement('div', { key: 'upcoming', className: 'bg-white rounded-xl border p-6' }, [
        React.createElement('div', { key: 'header', className: 'flex items-center justify-between mb-6' }, [
          React.createElement('h2', { key: 'title', className: 'text-lg font-semibold text-gray-900' }, 'Hoạt động sắp diễn ra'),
          React.createElement('button', { key: 'view-all', onClick: () => window.location.href = '/class/activities', className: 'text-purple-600 hover:text-purple-700 text-sm font-medium' }, 'Xem tất cả →')
        ]),
        React.createElement('div', { key: 'content', className: 'space-y-4' }, upcomingActivities.length > 0 ? upcomingActivities.map(function(activity) { return React.createElement('div', { key: activity.id, className: 'border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white' }, [React.createElement('div', { key: 'header', className: 'flex justify-between items-start mb-3' }, [React.createElement('h3', { key: 'title', className: 'font-semibold text-gray-900 line-clamp-2' }, activity.ten_hd), React.createElement('span', { key: 'points', className: 'bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full' }, `+${activity.diem_rl} điểm`)]), React.createElement('div', { key: 'details', className: 'space-y-2 text-sm text-gray-600' }, [React.createElement('div', { key: 'time', className: 'flex items-center' }, [React.createElement(Clock, { key: 'icon', className: 'h-4 w-4 mr-2' }), React.createElement('span', { key: 'text' }, new Date(activity.ngay_bd).toLocaleDateString('vi-VN'))]), React.createElement('div', { key: 'location', className: 'flex items-center' }, [React.createElement(MapPin, { key: 'icon', className: 'h-4 w-4 mr-2' }), React.createElement('span', { key: 'text' }, activity.dia_diem)])])]); }) : [React.createElement('div', { key: 'empty', className: 'text-center py-8 text-gray-500' }, [React.createElement(Calendar, { key: 'icon', className: 'h-12 w-12 mx-auto mb-4 text-gray-300' }), React.createElement('p', { key: 'text' }, 'Chưa có hoạt động sắp diễn ra'), React.createElement('button', { key: 'create', onClick: () => window.location.href = '/class/activities', className: 'mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium' }, 'Tạo hoạt động đầu tiên')])])
      ]),

      React.createElement('div', { key: 'approvals', className: 'bg-white rounded-xl border p-6' }, [
        React.createElement('div', { key: 'header', className: 'flex items-center justify-between mb-6' }, [
          React.createElement('h2', { key: 'title', className: 'text-lg font-semibold text-gray-900' }, 'Đăng ký chờ duyệt'),
          React.createElement('span', { key: 'view-all', className: 'text-gray-400 text-sm' }, '—')
        ]),
        React.createElement('div', { key: 'content', className: 'text-gray-500 text-sm' }, 'Không có đăng ký chờ duyệt')
      ])
    ])
  ]);
}