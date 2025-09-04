import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService, healthService, dashboardService, activitiesService } from '../services/api';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ totalActiveStudents: 0, ongoingActivities: 0, averageScore: 0 });
  const [ongoingActivities, setOngoingActivities] = useState([]);
  const [myActivities, setMyActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState(null);
  const [activeTab, setActiveTab] = useState(user?.role || 'student');

  const ROLES_CONFIG = {
    student: ['student'],
    teacher: ['teacher', 'student'],
    leader: ['leader', 'teacher', 'student'],
    organizer: ['organizer', 'student'],
    admin: ['admin', 'organizer', 'leader', 'teacher', 'student'],
  };

  const TABS = {
    student: 'Sinh viên',
    teacher: 'Giảng viên',
    leader: 'Lớp trưởng',
    organizer: 'Ban tổ chức',
    admin: 'Quản trị viên',
  };

  const visibleTabs = ROLES_CONFIG[user?.role] || ROLES_CONFIG.student;
  const [showQRScanner, setShowQRScanner] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const healthResponse = await healthService.check();
        const healthPayload = healthResponse.data?.data || healthResponse.data;
        setHealthStatus(healthPayload);

        const usersResponse = await userService.getUsers();
        const usersPayload = usersResponse.data?.data || usersResponse.data;
        setUsers(Array.isArray(usersPayload) ? usersPayload : []);

        const [summaryRes, ongoingRes, myRes] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getOngoingActivities(),
          dashboardService.getMyActivities()
        ]);
        const s = summaryRes.data?.data || summaryRes.data || {};
        setSummary({
          totalActiveStudents: Number(s.totalActiveStudents || 0),
          ongoingActivities: Number(s.ongoingActivities || 0),
          averageScore: Number(s.averageScore || 0)
        });
        const acts = ongoingRes.data?.data || ongoingRes.data || [];
        setOngoingActivities(Array.isArray(acts) ? acts : []);
        const mine = myRes.data?.data || myRes.data || [];
        setMyActivities(Array.isArray(mine) ? mine : []);
      } catch (error) {
        if (error.response?.data?.errors) {
          const errors = error.response.data.errors;
          errors.forEach(err => {
            toast.error(`${err.field}: ${err.message}`);
          });
        } else {
          toast.error('Không thể tải dữ liệu!');
        }
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refreshMyData = async () => {
    try {
      const [ongoingRes, myRes, summaryRes] = await Promise.all([
        dashboardService.getOngoingActivities(),
        dashboardService.getMyActivities(),
        dashboardService.getSummary(),
      ]);
      const acts = ongoingRes.data?.data || ongoingRes.data || [];
      setOngoingActivities(Array.isArray(acts) ? acts : []);
      const mine = myRes.data?.data || myRes.data || [];
      setMyActivities(Array.isArray(mine) ? mine : []);
      const s = summaryRes.data?.data || summaryRes.data || {};
      setSummary({
        totalActiveStudents: Number(s.totalActiveStudents || 0),
        ongoingActivities: Number(s.ongoingActivities || 0),
        averageScore: Number(s.averageScore || 0)
      });
    } catch (e) {
      // ignore UI refresh failure
    }
  };

  const handleActivityRegister = async (activityId, activityName) => {
    try {
      await activitiesService.register(activityId);
      toast.success(`Đã đăng ký tham gia: ${activityName}`);
      refreshMyData();
    } catch (error) {
      const msg = error.response?.data?.message || 'Đăng ký thất bại';
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => toast.error(`${err.field}: ${err.message}`));
      } else {
        toast.error(msg);
      }
    }
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
    toast.success('Đang mở camera để quét mã QR...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Tổng quan Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <i className="fas fa-users text-blue-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Tổng sinh viên đang hoạt động</p>
              <p className="text-2xl font-bold text-gray-800">{summary.totalActiveStudents}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <i className="fas fa-calendar-check text-green-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Hoạt động đang diễn ra</p>
              <p className="text-2xl font-bold text-gray-800">{summary.ongoingActivities}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <i className="fas fa-chart-line text-purple-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Điểm trung bình</p>
              <p className="text-2xl font-bold text-gray-800">{summary.averageScore.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab nội dung theo vai trò */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {visibleTabs.map((tabKey) => (
              <button
                key={tabKey}
                className={`py-4 px-6 border-b-2 font-medium ${
                  activeTab === tabKey
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-blue-600'
                }`}
                onClick={() => setActiveTab(tabKey)}
              >
                {TABS[tabKey]}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Dashboard sinh viên */}
          {activeTab === 'student' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Thông tin cá nhân */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Thông tin cá nhân</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <i className="fas fa-id-card text-blue-600 w-5"></i>
                      <span className="ml-3 text-sm">MSSV: {user?.maso || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-user text-blue-600 w-5"></i>
                      <span className="ml-3 text-sm">{user?.name || 'Nguyễn Văn A'}</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-building text-blue-600 w-5"></i>
                      <span className="ml-3 text-sm">{user?.khoa || 'Khoa N/A'} - Lớp {user?.lop || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Bỏ tiến độ điểm rèn luyện theo yêu cầu */}
              </div>

              {/* Đăng ký hoạt động */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Hoạt động đang mở đăng ký</h3>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                      <i className="fas fa-search mr-2"></i>Tìm kiếm
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Thẻ hoạt động */}
                    {ongoingActivities.map((activity) => {
                      const start = new Date(activity.startDate);
                      const end = new Date(activity.endDate);
                      const now = new Date();
                      const msLeft = Math.max(0, end - now);
                      const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
                      return (
                        <div key={activity.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <span className={`bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded`}>
                              {activity.type}
                            </span>
                            <span className="text-xs text-gray-500">Còn {daysLeft} ngày</span>
                          </div>
                          <h4 className="font-semibold mb-2">{activity.name}</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            {start.toLocaleDateString('vi-VN')} - {end.toLocaleDateString('vi-VN')}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-600">+{activity.points || 0} điểm</span>
                            <button
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                              onClick={() => handleActivityRegister(activity.id, activity.name)}
                            >
                              Đăng ký
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Hoạt động của tôi */}
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4">Hoạt động của tôi</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left">Hoạt động</th>
                          <th className="px-4 py-2 text-left">Thời gian</th>
                          <th className="px-4 py-2 text-left">Trạng thái</th>
                          <th className="px-4 py-2 text-left">Điểm</th>
                          <th className="px-4 py-2 text-left">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myActivities.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-gray-500">Chưa có hoạt động nào</td>
                          </tr>
                        )}
                        {myActivities.map((item) => {
                          const start = item.startDate ? new Date(item.startDate).toLocaleDateString('vi-VN') : 'N/A';
                          const statusMap = {
                            duyet: 'Đã duyệt',
                            cho_duyet: 'Chờ duyệt',
                            tu_choi: 'Từ chối',
                            hoan_thanh: 'Hoàn thành'
                          };
                          const badgeClass = {
                            duyet: 'bg-green-100 text-green-800',
                            cho_duyet: 'bg-yellow-100 text-yellow-800',
                            tu_choi: 'bg-red-100 text-red-800',
                            hoan_thanh: 'bg-blue-100 text-blue-800'
                          }[item.status] || 'bg-gray-100 text-gray-800';
                          return (
                            <tr key={item.id} className="border-b">
                              <td className="px-4 py-3">{item.name}</td>
                              <td className="px-4 py-3">{start}</td>
                              <td className="px-4 py-3">
                                <span className={`${badgeClass} px-2 py-1 rounded text-xs`}>{statusMap[item.status] || 'Không rõ'}</span>
                              </td>
                              <td className="px-4 py-3">{item.points ? `+${item.points}` : 0}</td>
                              <td className="px-4 py-3">
                                <button className="text-blue-600 hover:text-blue-800 text-sm" onClick={handleQRScan}>
                                  <i className="fas fa-qrcode mr-1"></i>QR
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nội dung giữ chỗ cho các tab khác */}
          {activeTab !== 'student' && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nội dung cho tab {activeTab} sẽ được phát triển trong tương lai.</p>
            </div>
          )}
        </div>
      </div>

      {/* Khu vực điểm danh QR */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Điểm danh bằng QR Code</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-3 border-dashed border-green-400 rounded-lg p-6 text-center animate-pulse">
            <i className="fas fa-camera text-4xl text-green-600 mb-4"></i>
            <p className="text-sm text-gray-600 mb-4">Quét mã QR để điểm danh tham gia hoạt động</p>
            <button
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              onClick={handleQRScan}
            >
              <i className="fas fa-camera mr-2"></i>Bật camera
            </button>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Hướng dẫn điểm danh</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <i className="fas fa-check-circle text-green-600 mt-1 mr-2"></i>
                <span>Đến đúng địa điểm hoạt động</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-green-600 mt-1 mr-2"></i>
                <span>Mở camera và quét mã QR tại sự kiện</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-green-600 mt-1 mr-2"></i>
                <span>Xác nhận thông tin điểm danh</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-green-600 mt-1 mr-2"></i>
                <span>Điểm sẽ được tự động cộng vào hệ thống</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
