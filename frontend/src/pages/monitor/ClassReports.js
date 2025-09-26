import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Calendar, Award, Download, RefreshCw, Filter, BarChart3, PieChart as PieIcon, LineChart as LineIcon, FileText, AlertCircle } from 'lucide-react';
import http from '../../services/http';

export default function ClassReports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('semester');
  const [selectedChart, setSelectedChart] = useState('activities');
  const [error, setError] = useState('');

  // Chart colors
  const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5A2B'];

  useEffect(() => {
    loadReportData();
  }, [timeRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/class/reports?timeRange=${timeRange}`);
      const raw = response?.data?.data;
      // Normalize to a plain object and ensure minimal shape without mock fallbacks
      const data = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? { ...raw } : null;
      if (data) {
        data.overview = data.overview && typeof data.overview === 'object' ? data.overview : {
          totalStudents: 0,
          totalActivities: 0,
          avgPoints: 0,
          participationRate: 0
        };
        data.monthlyActivities = Array.isArray(data.monthlyActivities) ? data.monthlyActivities : [];
        data.pointsDistribution = Array.isArray(data.pointsDistribution) ? data.pointsDistribution : [];
        data.attendanceRate = Array.isArray(data.attendanceRate) ? data.attendanceRate : [];
        data.activityTypes = Array.isArray(data.activityTypes) ? data.activityTypes : [];
        data.topStudents = Array.isArray(data.topStudents) ? data.topStudents : [];
      }
      setReportData(data);
      setError('');
    } catch (err) {
      console.error('Error loading report data:', err);
      setError('Không thể tải dữ liệu báo cáo');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadBlob = (blob, filename) => {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = async () => {
    try {
      const res = await http.get(`/class/reports/export?timeRange=${timeRange}&format=xlsx`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      downloadBlob(blob, `bao_cao_lop_${timeRange}.xlsx`);
    } catch (err) {
      setError('Không thể xuất Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      const res = await http.get(`/class/reports/export?timeRange=${timeRange}&format=pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      downloadBlob(blob, `bao_cao_lop_${timeRange}.pdf`);
    } catch (err) {
      setError('Không thể xuất PDF');
    }
  };

  const generateReportHTML = () => {
    if (!reportData) return '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Báo cáo hoạt động lớp - ${timeRange}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2 { color: #333; }
          table { border-collapse: collapse; width: 100%; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .summary { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>Báo cáo hoạt động rèn luyện lớp</h1>
        <p><strong>Thời gian:</strong> ${timeRange === 'semester' ? 'Học kỳ hiện tại' : 'Năm học hiện tại'}</p>
        <p><strong>Ngày xuất:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
        
        <div class="summary">
          <h2>Tổng quan</h2>
          <p>Tổng số sinh viên: ${reportData.overview.totalStudents}</p>
          <p>Tổng số hoạt động: ${reportData.overview.totalActivities}</p>
          <p>Điểm trung bình lớp: ${reportData.overview.avgPoints}</p>
          <p>Tỷ lệ tham gia: ${reportData.overview.participationRate}%</p>
        </div>

        <h2>Top 5 sinh viên xuất sắc</h2>
        <table>
          <tr><th>Hạng</th><th>Họ tên</th><th>MSSV</th><th>Điểm RL</th><th>Số hoạt động</th></tr>
          ${reportData.topStudents.map(student => 
            `<tr><td>${student.rank}</td><td>${student.name}</td><td>${student.mssv}</td><td>${student.points}</td><td>${student.activities}</td></tr>`
          ).join('')}
        </table>

        <h2>Phân bố điểm rèn luyện</h2>
        <table>
          <tr><th>Khoảng điểm</th><th>Số sinh viên</th><th>Tỷ lệ (%)</th></tr>
          ${reportData.pointsDistribution.map(dist => 
            `<tr><td>${dist.range}</td><td>${dist.count}</td><td>${dist.percentage}%</td></tr>`
          ).join('')}
        </table>
      </body>
      </html>
    `;
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'purple' }) => {
    const colorClasses = {
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    };

    return (
      <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="h-8 w-8">{icon}</div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có dữ liệu báo cáo</h3>
          <p className="text-gray-600">Vui lòng thử lại sau</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
            <p className="text-gray-600 mt-1">Phân tích hoạt động rèn luyện của lớp</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="semester">Học kỳ hiện tại</option>
              <option value="year">Năm học hiện tại</option>
              <option value="all">Tất cả</option>
            </select>
            <button
              onClick={loadReportData}
              className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleExportExcel}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Xuất Excel
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Xuất PDF
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Tổng sinh viên"
            value={reportData?.overview?.totalStudents || 0}
            subtitle="Trong lớp"
            icon={<Users className="h-8 w-8" />}
            color="blue"
          />
          <StatCard
            title="Tổng hoạt động"
            value={reportData?.overview?.totalActivities || 0}
            subtitle="Đã tổ chức"
            icon={<Calendar className="h-8 w-8" />}
            color="green"
          />
          <StatCard
            title="Điểm TB lớp"
            value={(reportData?.overview?.avgPoints || 0).toFixed(1)}
            subtitle="Điểm rèn luyện"
            icon={<Award className="h-8 w-8" />}
            color="purple"
          />
          <StatCard
            title="Tỷ lệ tham gia"
            value={`${reportData?.overview?.participationRate || 0}%`}
            subtitle="Sinh viên tích cực"
            icon={<TrendingUp className="h-8 w-8" />}
            color="yellow"
          />
        </div>

        {/* Chart Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Loại biểu đồ:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedChart('activities')}
                className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedChart === 'activities' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Hoạt động theo tháng
              </button>
              <button
                onClick={() => setSelectedChart('points')}
                className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedChart === 'points' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <PieIcon className="h-4 w-4 mr-2" />
                Phân bố điểm
              </button>
              <button
                onClick={() => setSelectedChart('attendance')}
                className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedChart === 'attendance' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LineIcon className="h-4 w-4 mr-2" />
                Tỷ lệ tham dự
              </button>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedChart === 'activities' && 'Hoạt động theo tháng'}
              {selectedChart === 'points' && 'Phân bố điểm rèn luyện'}
              {selectedChart === 'attendance' && 'Tỷ lệ tham dự theo tháng'}
            </h3>
            <div className="h-80">
              {selectedChart === 'activities' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData?.monthlyActivities || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="activities" fill="#8B5CF6" name="Số hoạt động" />
                    <Bar dataKey="participants" fill="#10B981" name="Lượt tham gia" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {selectedChart === 'points' && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportData?.pointsDistribution || []}
                      dataKey="count"
                      nameKey="range"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ range, percentage }) => `${range}: ${percentage}%`}
                    >
                      {(reportData?.pointsDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {selectedChart === 'attendance' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData?.attendanceRate || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ tham dự']} />
                    <Line 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                      dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Activity Types Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động theo loại</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData?.activityTypes || []} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" name="Số hoạt động" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Students Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top 5 sinh viên xuất sắc</h3>
            <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              Xem tất cả →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Hạng</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Họ tên</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">MSSV</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Điểm RL</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Hoạt động</th>
                </tr>
              </thead>
              <tbody>
                {(reportData?.topStudents || []).map((student, index) => (
                  <tr key={student.mssv} className={index < 3 ? 'bg-yellow-50' : ''}>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-300 text-gray-700' :
                          index === 2 ? 'bg-orange-400 text-orange-900' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {student.rank}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{student.name}</td>
                    <td className="py-3 px-4 text-gray-600">{student.mssv}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {student.points} điểm
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{student.activities}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Points Distribution Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết phân bố điểm</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {reportData.pointsDistribution.map((dist, index) => (
              <div key={dist.range} className="text-center p-4 rounded-lg border border-gray-200">
                <div 
                  className="text-2xl font-bold mb-1"
                  style={{ color: COLORS[index % COLORS.length] }}
                >
                  {dist.count}
                </div>
                <div className="text-sm text-gray-600">{dist.range} điểm</div>
                <div className="text-xs text-gray-500">{dist.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
