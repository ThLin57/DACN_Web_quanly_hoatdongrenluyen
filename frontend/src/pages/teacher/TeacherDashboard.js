import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, Calendar, Award, Clock, CheckCircle, XCircle, AlertCircle, Tag, Bell, TrendingUp } from 'lucide-react';
import http from '../../services/http';
import TeacherLayout from '../../components/TeacherLayout';

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

function ActivityCard({ activity, onSelect }) {
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
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect && onSelect(activity)}>
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
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalActivities: 0,
    pendingApprovals: 0,
    totalStudents: 0,
    avgAttendance: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [allActivities, setAllActivities] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '', 'cho_duyet', 'da_duyet', 'tu_choi', 'ket_thuc'
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const refreshDashboard = () => {
    loadDashboardData();
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load statistics - use correct API endpoints for teacher
      const [activitiesRes, pendingActivitiesRes, classStudentsRes, classReportsRes, notificationsRes, profileRes] = await Promise.all([
        http.get('/activities').catch(err => ({ data: { data: [] } })),
        http.get('/activities?status=cho_duyet').catch(err => ({ data: { data: [] } })),
        http.get('/class/students').catch(err => ({ data: { data: [] } })),
        http.get('/class/reports').catch(err => ({ data: { data: { overview: {} } } })),
        http.get('/notifications?limit=5').catch(err => ({ data: { data: [] } })),
        http.get('/auth/profile').catch(()=>({ data:{ data:{} } }))
      ]);

      const activitiesData = activitiesRes.data?.data;
      const pendingData = pendingActivitiesRes.data?.data;
      const studentsData = classStudentsRes.data?.data;
      let activities = Array.isArray(activitiesData?.items) ? activitiesData.items : (Array.isArray(activitiesData) ? activitiesData : []);
      let pendingActivities = Array.isArray(pendingData?.items) ? pendingData.items : (Array.isArray(pendingData) ? pendingData : []);
      let students = Array.isArray(studentsData) ? studentsData : [];
      const reports = classReportsRes.data?.data || {};
      let notifications = Array.isArray(notificationsRes.data?.data) ? notificationsRes.data.data : [];
      const profile = profileRes.data?.data || {};

      
      // Calculate participation rate from reports or activities
      let participationRate = 0;
      if (reports.overview?.participationRate) {
        participationRate = reports.overview.participationRate;
      } else if (Array.isArray(activities) && activities.length > 0) {
        const totalRegistrations = activities.reduce((sum, activity) => {
          return sum + (activity.dang_ky_hd?.length || 0);
        }, 0);
        const totalApprovedRegistrations = activities.reduce((sum, activity) => {
          return sum + (activity.dang_ky_hd?.filter(reg => reg.trang_thai_dk === 'da_duyet').length || 0);
        }, 0);
        participationRate = totalRegistrations > 0 ? Math.round((totalApprovedRegistrations / totalRegistrations) * 100) : 0;
      }
      
      // Rely on backend filtering by role (teacher scope). Do not filter by class on FE.
      const activitiesFiltered = Array.isArray(activities) ? activities : [];

      setStats({
        totalActivities: activitiesFiltered.length,
        pendingApprovals: (pendingActivities || []).filter(a=>activitiesFiltered.some(f=>f.id===a.id)).length,
        totalStudents: students.length,
        avgAttendance: participationRate
      });

      // Set recent activities (last 5)
      const sortedActivities = Array.isArray(activitiesFiltered) ? activitiesFiltered
        .sort((a, b) => new Date(b.ngay_tao || b.ngay_bd) - new Date(a.ngay_tao || a.ngay_bd))
        .slice(0, 5) : [];
      setRecentActivities(sortedActivities);

      // Set recent notifications (last 5)
      setRecentNotifications(notifications.slice(0, 5));

      // Save all activities for table section
      setAllActivities(activitiesFiltered);

    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Không thể tải dữ liệu dashboard');
      // Set fallback data
      setStats({
        totalActivities: 0,
        pendingApprovals: 0,
        totalStudents: 0,
        avgAttendance: 0
      });
      setRecentActivities([]);
      setRecentNotifications([]);
      setAllActivities([]);
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
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Dashboard Giảng viên</h1>
              <p className="text-blue-100 mt-1">Tổng quan về hoạt động và quản lý sinh viên</p>
            </div>
            <button
              onClick={refreshDashboard}
              className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Làm mới
            </button>
          </div>
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

      {/* Quick Actions - theo menu Giảng viên */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/activities')}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700 transition-colors"
          >
            <Calendar className="h-5 w-5" />
            Danh sách Hoạt động
          </button>
          <button 
            onClick={() => navigate('/teacher/approve')}
            className="flex items-center justify-center gap-2 bg-purple-600 text-white rounded-lg py-3 hover:bg-purple-700 transition-colors"
          >
            <CheckCircle className="h-5 w-5" />
            Phê duyệt Hoạt động
          </button>
          <button 
            onClick={() => navigate('/teacher/activity-types')}
            className="flex items-center justify-center gap-2 bg-orange-600 text-white rounded-lg py-3 hover:bg-orange-700 transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
            Quản lý Loại HĐ
          </button>
          <button 
            onClick={() => navigate('/teacher/students')}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-lg py-3 hover:bg-indigo-700 transition-colors"
          >
            <Users className="h-5 w-5" />
            QL Sinh viên & BC
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h2>
          <button 
            onClick={() => navigate('/activities')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Xem tất cả →
            </button>
          </div>
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} onSelect={setSelected} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Chưa có hoạt động nào</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thống kê nhanh</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Hoạt động chờ duyệt</p>
                  <p className="text-xs text-gray-500">Cần xem xét và phê duyệt</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{stats.pendingApprovals}</p>
                {stats.pendingApprovals > 0 && (
                  <button 
                    onClick={() => window.location.href = '/teacher/approve'}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Xem ngay →
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Sinh viên trong lớp</p>
                  <p className="text-xs text-gray-500">Tổng số sinh viên quản lý</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">{stats.totalStudents}</p>
                <button 
                  onClick={() => window.location.href = '/class/students'}
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  Quản lý →
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Tỷ lệ tham gia</p>
                  <p className="text-xs text-gray-500">Trung bình các hoạt động</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">{stats.avgAttendance}%</p>
                <button 
                  onClick={() => window.location.href = '/class/reports'}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  Báo cáo →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Danh sách hoạt động</h2>
          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(e)=>{ setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm theo tên hoạt động..."
              className="border rounded px-3 py-2 text-sm"
            />
            <select
              value={statusFilter}
              onChange={(e)=>{ setStatusFilter(e.target.value); setPage(1); }}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="cho_duyet">Chờ duyệt</option>
              <option value="da_duyet">Đã duyệt</option>
              <option value="tu_choi">Từ chối</option>
              <option value="ket_thuc">Kết thúc</option>
            </select>
            <button
              onClick={() => {
                // Export current filtered rows to CSV (client-side)
                const filtered = (allActivities || []).filter(a => {
                  const okText = search ? (String(a.ten_hd || '').toLowerCase().includes(search.toLowerCase())) : true;
                  const okStatus = statusFilter ? (String(a.trang_thai || '') === statusFilter) : true;
                  return okText && okStatus;
                });
                const header = ['Ten hoat dong','Nguoi tao','Lop','Thoi gian','Diem RL','Trang thai'];
                const rows = filtered.map(a => [
                  '"' + String(a.ten_hd || '').replaceAll('"','""') + '"',
                  '"' + String(a.nguoi_tao?.ho_ten || a.nguoi_tao?.email || '').replaceAll('"','""') + '"',
                  '"' + String(a.lop?.ten_lop || a.nguoi_tao?.lop?.ten_lop || '').replaceAll('"','""') + '"',
                  '"' + new Date(a.ngay_bd).toLocaleDateString('vi-VN') + ' - ' + new Date(a.ngay_kt).toLocaleDateString('vi-VN') + '"',
                  String(Number(a.diem_rl || 0)),
                  '"' + String(a.trang_thai || '') + '"'
                ]);
                const csv = [header.join(','), ...rows.map(r=>r.join(','))].join('\n');
                const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'activities.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="border rounded px-3 py-2 text-sm"
            >Xuất CSV</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="px-3 py-2">Tên hoạt động</th>
                <th className="px-3 py-2">Người tạo</th>
                <th className="px-3 py-2">Lớp</th>
                <th className="px-3 py-2">Thời gian</th>
                <th className="px-3 py-2">Điểm RL</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const filtered = (allActivities || []).filter(a => {
                  const okText = search ? (String(a.ten_hd || '').toLowerCase().includes(search.toLowerCase())) : true;
                  const okStatus = statusFilter ? (String(a.trang_thai || '') === statusFilter) : true;
                  return okText && okStatus;
                });
                const start = (page - 1) * pageSize;
                const rows = filtered.slice(start, start + pageSize);
                if (rows.length === 0) {
                  return <tr><td className="px-3 py-6 text-gray-500" colSpan={7}>Không có hoạt động phù hợp</td></tr>;
                }
                return rows.map((activity) => (
                  <tr key={activity.id} className="border-b">
                    <td className="px-3 py-2 font-medium text-gray-900"><button className="text-left hover:underline" onClick={()=>setSelected(activity)}>{activity.ten_hd}</button></td>
                    <td className="px-3 py-2">{activity.nguoi_tao?.ho_ten || activity.nguoi_tao?.email || ''}</td>
                    <td className="px-3 py-2">{activity.lop?.ten_lop || activity.nguoi_tao?.lop?.ten_lop || ''}</td>
                    <td className="px-3 py-2">{new Date(activity.ngay_bd).toLocaleDateString('vi-VN')} - {new Date(activity.ngay_kt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-3 py-2">{Number(activity.diem_rl || 0)}</td>
                    <td className="px-3 py-2 capitalize">{String(activity.trang_thai || '').replaceAll('_',' ')}</td>
                    <td className="px-3 py-2 flex gap-2">
                      <button onClick={()=>navigate(`/activities/${activity.id}`)} className="px-3 py-1 border rounded">Xem</button>
                      {activity.trang_thai === 'cho_duyet' && (
                        <button onClick={()=>navigate('/teacher/approve')} className="px-3 py-1 border rounded text-purple-600">Phê duyệt</button>
                      )}
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <div>
            Trang {page}
          </div>
          <div className="flex gap-2">
            <button disabled={page===1} onClick={()=>setPage(Math.max(1, page-1))} className={`px-3 py-1 border rounded ${page===1?'opacity-50 cursor-not-allowed':''}`}>Trước</button>
            <button onClick={()=>setPage(page+1)} className="px-3 py-1 border rounded">Sau</button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={()=>setSelected(null)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Chi tiết hoạt động</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div><span className="font-medium">Tên:</span> {selected.ten_hd}</div>
              <div><span className="font-medium">Ngày tạo:</span> {selected.ngay_tao ? new Date(selected.ngay_tao).toLocaleString('vi-VN') : '—'}</div>
              <div><span className="font-medium">Thời gian:</span> {new Date(selected.ngay_bd).toLocaleString('vi-VN')} — {new Date(selected.ngay_kt).toLocaleString('vi-VN')}</div>
              {selected.dia_diem && <div><span className="font-medium">Địa điểm:</span> {selected.dia_diem}</div>}
              <div><span className="font-medium">Điểm RL:</span> {selected.diem_rl}</div>
              <div><span className="font-medium">Sức chứa:</span> {selected.sl_toi_da}</div>
              <div><span className="font-medium">Trạng thái:</span> {String(selected.trang_thai || '').replaceAll('_',' ')}</div>
              <div><span className="font-medium">Người tạo:</span> {selected.nguoi_tao?.ho_ten || selected.nguoi_tao?.email || '—'}</div>
              {selected.mo_ta && <div className="mt-2"><span className="font-medium">Mô tả:</span><div className="text-gray-600 mt-1">{selected.mo_ta}</div></div>}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={()=>setSelected(null)} className="px-4 py-2 border rounded">Đóng</button>
              <button onClick={()=>{ setSelected(null); navigate(`/activities/${selected.id}`); }} className="px-4 py-2 bg-blue-600 text-white rounded">Đi tới chi tiết</button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Notifications */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Thông báo gần đây</h2>
          <button 
            onClick={() => window.location.href = '/class/notifications'}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Xem tất cả →
          </button>
        </div>
        {recentNotifications.length > 0 ? (
          <div className="space-y-3">
            {recentNotifications.map(notification => (
              <div key={notification.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.time).toLocaleDateString('vi-VN')} - {new Date(notification.time).toLocaleTimeString('vi-VN')}
                  </p>
                </div>
                {!notification.unread && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Chưa có thông báo nào</p>
          </div>
        )}
      </div>
      </div>
    </TeacherLayout>
  );
}