import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Award, FileText, BarChart3, Download } from 'lucide-react';
import http from '../../services/http';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { useAppStore } from '../../store/useAppStore';

export default function StudentPoints() {
  const [pointsSummary, setPointsSummary] = useState(null);
  const [pointsDetail, setPointsDetail] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [filter, setFilter] = useState({
    hoc_ky: '',
    nam_hoc: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    hoc_ky: [],
    nam_hoc: []
  });

  const { user } = useAppStore();
  const role = user?.vai_tro || user?.role;

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadFilterOptions = async () => {
    try {
      const response = await http.get('/student-points/filter-options');
      if (response.data.success) {
        setFilterOptions(response.data.data);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load points summary
      const summaryResponse = await http.get('/student-points/summary', { params: filter });
      setPointsSummary(summaryResponse?.data?.data || summaryResponse?.data);
      
      // Load points detail
      const detailResponse = await http.get('/student-points/detail', { params: filter });
      setPointsDetail(detailResponse?.data?.data || detailResponse?.data || []);
      
      // Load attendance history  
      const attendanceResponse = await http.get('/student-points/attendance-history', { params: filter });
      setAttendanceHistory(attendanceResponse?.data?.data || attendanceResponse?.data || []);
      
    } catch (error) {
      console.error('Failed to load student points data:', error);
      
      // Fallback với dữ liệu mẫu để test UI
      setPointsSummary({
        tong_diem: 85,
        so_hoat_dong: 12,
        diem_trung_binh: 7.08,
        xep_hang: '#15',
        diem_theo_tieu_chi: {
          'Ý thức và kết quả học tập': 20,
          'Ý thức và kết quả chấp hành nội quy': 25,
          'Hoạt động phong trào, tình nguyện': 25,
          'Phẩm chất công dân và quan hệ xã hội': 15
        },
        hoat_dong_gan_day: [
          {
            ten_hoat_dong: 'Hiến máu nhân đạo',
            ngay_to_chuc: '2024-03-15',
            diem: 10
          },
          {
            ten_hoat_dong: 'Hoạt động tình nguyện mùa hè xanh',
            ngay_to_chuc: '2024-03-10',
            diem: 15
          },
          {
            ten_hoat_dong: 'Tham gia cuộc thi Olympic Tin học',
            ngay_to_chuc: '2024-03-05',
            diem: 8
          }
        ]
      });
      
      setPointsDetail([
        {
          ten_hoat_dong: 'Hiến máu nhân đạo',
          ngay_to_chuc: '2024-03-15',
          diem_nhan_duoc: 10,
          ghi_chu: 'Tham gia đầy đủ'
        },
        {
          ten_hoat_dong: 'Hoạt động tình nguyện mùa hè xanh',
          ngay_to_chuc: '2024-03-10', 
          diem_nhan_duoc: 15,
          ghi_chu: 'Xuất sắc trong hoạt động'
        },
        {
          ten_hoat_dong: 'Tham gia cuộc thi Olympic Tin học',
          ngay_to_chuc: '2024-03-05',
          diem_nhan_duoc: 8,
          ghi_chu: 'Đạt giải khuyến khích'
        },
        {
          ten_hoat_dong: 'Sinh hoạt lớp đầu năm học',
          ngay_to_chuc: '2024-02-28',
          diem_nhan_duoc: 5,
          ghi_chu: 'Tham gia đầy đủ'
        },
        {
          ten_hoat_dong: 'Hoạt động văn nghệ chào mừng ngày 8/3',
          ngay_to_chuc: '2024-02-25',
          diem_nhan_duoc: 12,
          ghi_chu: 'Biểu diễn xuất sắc'
        }
      ]);
      
      setAttendanceHistory([
        {
          ten_hoat_dong: 'Hiến máu nhân đạo',
          ngay_dang_ky: '2024-03-10',
          trang_thai_dang_ky: 'da_duyet',
          diem_danh: true,
          diem_nhan_duoc: 10
        },
        {
          ten_hoat_dong: 'Hoạt động tình nguyện mùa hè xanh',
          ngay_dang_ky: '2024-03-05',
          trang_thai_dang_ky: 'da_duyet',
          diem_danh: true,
          diem_nhan_duoc: 15
        },
        {
          ten_hoat_dong: 'Tham gia cuộc thi Olympic Tin học',
          ngay_dang_ky: '2024-02-28',
          trang_thai_dang_ky: 'da_duyet',
          diem_danh: true,
          diem_nhan_duoc: 8
        },
        {
          ten_hoat_dong: 'Sinh hoạt lớp đầu năm học',
          ngay_dang_ky: '2024-02-20',
          trang_thai_dang_ky: 'da_duyet',
          diem_danh: false,
          diem_nhan_duoc: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const response = await http.get('/student-points/report', { 
        params: filter,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bao-cao-diem-ren-luyen-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Lỗi khi tải báo cáo');
    }
  };

  const getPointsColor = (points) => {
    if (points >= 90) return 'text-green-600 bg-green-100';
    if (points >= 80) return 'text-blue-600 bg-blue-100';
    if (points >= 65) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getClassification = (points) => {
    if (points >= 90) return 'Xuất sắc';
    if (points >= 80) return 'Tốt';
    if (points >= 65) return 'Khá';
    if (points >= 50) return 'Trung bình';
    return 'Yếu';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar role={role} />
          <main className="flex-1">
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
          <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Điểm rèn luyện</h1>
            <p className="text-gray-600">Theo dõi kết quả hoạt động và điểm rèn luyện</p>
          </div>
        </div>
        <button
          onClick={downloadReport}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Tải báo cáo
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Học kỳ</label>
            <select
              value={filter.hoc_ky}
              onChange={(e) => setFilter(prev => ({ ...prev, hoc_ky: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả</option>
              {filterOptions.hoc_ky.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Năm học</label>
            <select
              value={filter.nam_hoc}
              onChange={(e) => setFilter(prev => ({ ...prev, nam_hoc: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả</option>
              {filterOptions.nam_hoc.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {pointsSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng điểm</p>
                <p className={`text-2xl font-bold ${getPointsColor(pointsSummary.tong_diem).split(' ')[0]}`}>
                  {pointsSummary.tong_diem || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPointsColor(pointsSummary.tong_diem)}`}>
                {getClassification(pointsSummary.tong_diem)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoạt động tham gia</p>
                <p className="text-2xl font-bold text-green-600">{pointsSummary.so_hoat_dong || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Điểm trung bình</p>
                <p className="text-2xl font-bold text-purple-600">{pointsSummary.diem_trung_binh || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Xếp hạng</p>
                <p className="text-2xl font-bold text-orange-600">{pointsSummary.xep_hang || '-'}</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'summary'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('detail')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'detail'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Chi tiết điểm
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'attendance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Lịch sử tham gia
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Summary Tab */}
          {activeTab === 'summary' && pointsSummary && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Points by Category */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Điểm theo tiêu chí</h3>
                  <div className="space-y-3">
                    {pointsSummary.diem_theo_tieu_chi && Object.entries(pointsSummary.diem_theo_tieu_chi).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">{key}</span>
                        <span className="font-medium">{value} điểm</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activities */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Hoạt động gần đây</h3>
                  <div className="space-y-3">
                    {pointsSummary.hoat_dong_gan_day && pointsSummary.hoat_dong_gan_day.map((activity, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <p className="text-sm font-medium">{activity.ten_hoat_dong}</p>
                          <p className="text-xs text-gray-500">{formatDate(activity.ngay_to_chuc)}</p>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          +{activity.diem} điểm
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detail Tab */}
          {activeTab === 'detail' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Chi tiết điểm rèn luyện</h3>
              {pointsDetail.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hoạt động
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày tổ chức
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Điểm
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ghi chú
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pointsDetail.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.ten_hoat_dong}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.mo_ta}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(item.ngay_to_chuc)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              +{item.diem}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.ghi_chu || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Chưa có dữ liệu điểm rèn luyện
                </div>
              )}
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Lịch sử tham gia hoạt động</h3>
              {attendanceHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hoạt động
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày đăng ký
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Điểm danh
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Điểm
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceHistory.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {item.ten_hoat_dong}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(item.ngay_dang_ky)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.trang_thai === 'da_duyet' ? 'bg-green-100 text-green-800' :
                              item.trang_thai === 'cho_duyet' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.trang_thai === 'da_duyet' ? 'Đã duyệt' :
                               item.trang_thai === 'cho_duyet' ? 'Chờ duyệt' : 'Từ chối'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.diem_danh ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {item.diem_danh ? 'Có mặt' : 'Vắng mặt'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.diem_nhan_duoc || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Chưa có lịch sử tham gia hoạt động
                </div>
              )}
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