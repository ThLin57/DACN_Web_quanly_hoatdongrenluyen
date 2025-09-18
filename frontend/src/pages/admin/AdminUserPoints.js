import React, { useState, useEffect } from 'react';
import AdminUserTabs from '../../components/AdminUserTabs';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { User, Award, Calendar, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import http from '../../services/http';
import { useAppStore } from '../../store/useAppStore';

export default function AdminUserPoints() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pointsData, setPointsData] = useState({
    summary: null,
    details: [],
    attendance: []
  });
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(true);
  
  const { user } = useAppStore();
  const role = user?.vai_tro || user?.role;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserPoints(selectedUser.id);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await http.get('/users');
      const data = response?.data?.data || response?.data || {};
      
      if (data.users && Array.isArray(data.users)) {
        const studentUsers = data.users.filter(u => u.sinh_vien);
        setUsers(studentUsers);
        if (studentUsers.length > 0) {
          setSelectedUser(studentUsers[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async (userId) => {
    try {
      // Fetch student points data - simulated for now
      const mockData = {
        summary: {
          totalPoints: 85,
          currentSemester: 'HK1 2024-2025',
          activities: 12,
          avgPoints: 7.1,
          rank: 'Khá',
          trends: [
            { semester: 'HK1 2023-2024', points: 78 },
            { semester: 'HK2 2023-2024', points: 82 },
            { semester: 'HK1 2024-2025', points: 85 }
          ]
        },
        details: [
          {
            id: 1,
            name: 'Hiến máu nhân đạo lần thứ 15',
            type: 'Hoạt động tình nguyện',
            points: 15,
            date: '2024-03-15',
            status: 'completed',
            semester: 'HK2 2023-2024'
          },
          {
            id: 2,
            name: 'Hoạt động tình nguyện mùa hè xanh 2024',
            type: 'Hoạt động tình nguyện',
            points: 20,
            date: '2024-07-15',
            status: 'completed',
            semester: 'Hè 2024'
          },
          {
            id: 3,
            name: 'Cuộc thi Olympic Tin học sinh viên',
            type: 'Hoạt động học thuật',
            points: 12,
            date: '2024-04-05',
            status: 'completed',
            semester: 'HK2 2023-2024'
          }
        ],
        attendance: [
          {
            id: 1,
            activity: 'Hiến máu nhân đạo lần thứ 15',
            date: '2024-03-15',
            status: 'present',
            points: 15
          },
          {
            id: 2,
            activity: 'Sinh hoạt lớp đầu năm học 2024-2025',
            date: '2024-09-01',
            status: 'absent',
            points: 0
          },
          {
            id: 3,
            activity: 'Hoạt động văn nghệ chào mừng ngày 8/3',
            date: '2024-03-08',
            status: 'present',
            points: 10
          }
        ]
      };
      
      setPointsData(mockData);
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const handleUserSelect = (userData) => {
    setSelectedUser(userData);
    setActiveTab('summary');
  };

  const renderSummaryTab = () => {
    if (!pointsData.summary) return <div>Chưa có dữ liệu</div>;

    return (
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Tổng điểm</p>
                <p className="text-2xl font-bold text-blue-900">{pointsData.summary.totalPoints}</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Hoạt động</p>
                <p className="text-2xl font-bold text-green-900">{pointsData.summary.activities}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Điểm TB</p>
                <p className="text-2xl font-bold text-yellow-900">{pointsData.summary.avgPoints}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Xếp loại</p>
                <p className="text-2xl font-bold text-purple-900">{pointsData.summary.rank}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Semester Progress */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tiến độ theo học kỳ</h3>
          <div className="space-y-3">
            {pointsData.summary.trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{trend.semester}</span>
                <span className="text-blue-600 font-semibold">{trend.points} điểm</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDetailsTab = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Chi tiết điểm rèn luyện</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hoạt động
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Điểm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học kỳ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pointsData.details.map((activity) => (
                <tr key={activity.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{activity.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {activity.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(activity.date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-green-600">+{activity.points}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.semester}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAttendanceTab = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Lịch sử điểm danh</h3>
        </div>
        <div className="p-6 space-y-4">
          {pointsData.attendance.map((record) => (
            <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {record.status === 'present' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{record.activity}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(record.date).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-semibold ${
                  record.status === 'present' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {record.status === 'present' ? 'Có mặt' : 'Vắng mặt'}
                </span>
                <p className="text-xs text-gray-500">
                  {record.points > 0 ? `+${record.points} điểm` : 'Không tính điểm'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return renderSummaryTab();
      case 'details':
        return renderDetailsTab();
      case 'attendance':
        return renderAttendanceTab();
      default:
        return renderSummaryTab();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar role={role} />
          <main className="flex-1">
            <AdminUserTabs />
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar role={role} />
        <main className="flex-1">
          <AdminUserTabs />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* User List Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow border">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-medium text-gray-900">Sinh viên</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {users.map((userData) => (
                      <button
                        key={userData.id}
                        onClick={() => handleUserSelect(userData)}
                        className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                          selectedUser?.id === userData.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {userData.ho_ten}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {userData.sinh_vien?.mssv}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Points Detail */}
              <div className="lg:col-span-3">
                {selectedUser ? (
                  <div className="bg-white rounded-lg shadow border">
                    {/* Header */}
                    <div className="p-6 border-b">
                      <div className="flex items-center gap-3">
                        <Award className="h-8 w-8 text-blue-600" />
                        <div>
                          <h1 className="text-2xl font-bold text-gray-900">
                            Điểm rèn luyện - {selectedUser.ho_ten}
                          </h1>
                          <p className="text-gray-600">MSSV: {selectedUser.sinh_vien?.mssv}</p>
                        </div>
                      </div>
                    </div>

                    {/* Points Tabs */}
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-8 px-6">
                        {[
                          { id: 'summary', label: 'Tổng kết', icon: '📊' },
                          { id: 'details', label: 'Chi tiết điểm', icon: '📝' },
                          { id: 'attendance', label: 'Lịch sử điểm danh', icon: '✅' }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                              activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <span className="text-lg">{tab.icon}</span>
                            <span>{tab.label}</span>
                          </button>
                        ))}
                      </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                      {renderTabContent()}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow border p-6 text-center">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Chọn một sinh viên để xem điểm rèn luyện</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}