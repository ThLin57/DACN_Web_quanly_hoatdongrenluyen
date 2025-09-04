import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService, healthService } from '../services/api';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
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
        // Kiểm tra health status
        const healthResponse = await healthService.check();
        const healthPayload = healthResponse.data?.data || healthResponse.data;
        setHealthStatus(healthPayload);

        // Lấy danh sách users
        const usersResponse = await userService.getUsers();
        const usersPayload = usersResponse.data?.data || usersResponse.data;
        setUsers(Array.isArray(usersPayload) ? usersPayload : []);
      } catch (error) {
        // Xử lý lỗi validation từ backend
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

  const handleActivityRegister = (activityName) => {
    toast.success(`Đã đăng ký tham gia: ${activityName}`);
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
              <p className="text-sm text-gray-600">Tổng sinh viên</p>
              <p className="text-2xl font-bold text-gray-800">1,245</p>
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
              <p className="text-2xl font-bold text-gray-800">28</p>
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
              <p className="text-2xl font-bold text-gray-800">85.7</p>
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
                      <span className="ml-3 text-sm">MSSV: 21130001</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-user text-blue-600 w-5"></i>
                      <span className="ml-3 text-sm">{user?.name || 'Nguyễn Văn A'}</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-building text-blue-600 w-5"></i>
                      <span className="ml-3 text-sm">Khoa CNTT - Lớp 21DTH1</span>
                    </div>
                  </div>
                </div>
                
                {/* Tiến độ điểm */}
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4">Tiến độ điểm rèn luyện</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Học kỳ 1: 85/100</span>
                        <span className="text-sm">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Học kỳ 2: 45/100</span>
                        <span className="text-sm">45%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: '45%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
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
                    {[
                      { name: 'Hội thao khoa CNTT 2024', type: 'Đoàn - Hội', desc: 'Thi đấu các môn thể thao giữa các lớp', points: 15, days: 2, color: 'green' },
                      { name: 'Đêm hội văn nghệ sinh viên', type: 'Văn nghệ', desc: 'Biểu diễn văn nghệ chào mừng năm học mới', points: 20, days: 5, color: 'purple' },
                      { name: 'Giải bóng đá sinh viên', type: 'Thể thao', desc: 'Thi đấu bóng đá giữa các khoa', points: 25, days: 1, color: 'orange' },
                      { name: 'Cuộc thi lập trình', type: 'Học thuật', desc: 'Thi đấu lập trình giải thuật', points: 30, days: 7, color: 'blue' }
                    ].map((activity, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <span className={`bg-${activity.color}-100 text-${activity.color}-800 text-xs px-2 py-1 rounded`}>
                            {activity.type}
                          </span>
                          <span className="text-xs text-gray-500">Còn {activity.days} ngày</span>
                        </div>
                        <h4 className="font-semibold mb-2">{activity.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{activity.desc}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-600">+{activity.points} điểm</span>
                          <button 
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            onClick={() => handleActivityRegister(activity.name)}
                          >
                            Đăng ký
                          </button>
                        </div>
                      </div>
                    ))}
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
                        <tr className="border-b">
                          <td className="px-4 py-3">Hội thao khoa CNTT</td>
                          <td className="px-4 py-3">15/12/2024</td>
                          <td className="px-4 py-3">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Đã duyệt</span>
                          </td>
                          <td className="px-4 py-3">+15</td>
                          <td className="px-4 py-3">
                            <button className="text-blue-600 hover:text-blue-800 text-sm" onClick={handleQRScan}>
                              <i className="fas fa-qrcode mr-1"></i>QR
                            </button>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-4 py-3">Đêm hội văn nghệ</td>
                          <td className="px-4 py-3">20/12/2024</td>
                          <td className="px-4 py-3">
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Chờ duyệt</span>
                          </td>
                          <td className="px-4 py-3">+20</td>
                          <td className="px-4 py-3">
                            <button className="text-red-600 hover:text-red-800 text-sm">
                              <i className="fas fa-times mr-1"></i>Hủy
                            </button>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-4 py-3">Giải bóng đá</td>
                          <td className="px-4 py-3">25/12/2024</td>
                          <td className="px-4 py-3">
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Từ chối</span>
                          </td>
                          <td className="px-4 py-3">0</td>
                          <td className="px-4 py-3">
                            <button className="text-blue-600 hover:text-blue-800 text-sm">
                              <i className="fas fa-info-circle mr-1"></i>Chi tiết
                            </button>
                          </td>
                        </tr>
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
