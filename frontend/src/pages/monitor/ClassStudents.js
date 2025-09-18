import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Award, TrendingUp, Eye, Mail, Phone, Calendar, User, BookOpen, Trophy, AlertCircle, Download, RefreshCw } from 'lucide-react';
import http from '../../services/http';
import ClassManagementLayout from '../../components/ClassManagementLayout';

export default function ClassStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('points_desc');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
  const response = await http.get('/class/students');
      setStudents(response.data?.data || []);
      setError('');
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Không thể tải danh sách sinh viên');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    // Convert students data to CSV format
    const headers = ['MSSV', 'Họ tên', 'Email', 'Điểm RL', 'Số hoạt động', 'Xếp hạng', 'GPA', 'Trạng thái'];
    const csvData = students.map(student => [
      student.mssv,
      student.nguoi_dung.ho_ten,
      student.nguoi_dung.email,
      student.totalPoints,
      student.activitiesJoined,
      student.rank,
      student.gpa,
      getStatusLabel(student.status)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `danh_sach_sinh_vien_lop_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusLabel = (status) => {
    const labels = {
      'active': 'Tốt',
      'warning': 'Cảnh báo',
      'critical': 'Nguy cơ'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'warning': 'bg-yellow-100 text-yellow-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Sort students
  const sortedStudents = [...students].sort((a, b) => {
    switch (sortBy) {
      case 'points_desc':
        return b.totalPoints - a.totalPoints;
      case 'points_asc':
        return a.totalPoints - b.totalPoints;
      case 'name_asc':
        return a.nguoi_dung.ho_ten.localeCompare(b.nguoi_dung.ho_ten);
      case 'name_desc':
        return b.nguoi_dung.ho_ten.localeCompare(a.nguoi_dung.ho_ten);
      case 'mssv_asc':
        return a.mssv.localeCompare(b.mssv);
      case 'activities_desc':
        return b.activitiesJoined - a.activitiesJoined;
      default:
        return 0;
    }
  });

  // Filter students
  const filteredStudents = sortedStudents.filter(student =>
    student.nguoi_dung.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.mssv.includes(searchTerm) ||
    student.nguoi_dung.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StudentCard = ({ student }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{student.nguoi_dung.ho_ten}</h3>
            <p className="text-sm text-gray-600">MSSV: {student.mssv}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
            {getStatusLabel(student.status)}
          </span>
          <button
            onClick={() => setShowDetails(student)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            title="Xem chi tiết"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{Number(student.totalPoints || 0).toFixed(1)}</div>
          <div className="text-xs text-gray-600">Điểm RL</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{Number(student.activitiesJoined || 0)}</div>
          <div className="text-xs text-gray-600">Hoạt động</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">#{Number(student.rank || 0)}</div>
          <div className="text-xs text-gray-600">Xếp hạng</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{Number(student.gpa || 0).toFixed(1)}</div>
          <div className="text-xs text-gray-600">GPA</div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <Mail className="h-4 w-4 mr-2" />
          <span>{student.nguoi_dung.email}</span>
        </div>
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2" />
          <span>{student.nguoi_dung.sdt}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Hoạt động cuối: {new Date(student.lastActivityDate).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Tiến độ điểm RL</span>
          <span>{Number(student.totalPoints || 0).toFixed(1)}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(Number(student.totalPoints || 0), 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  const StudentDetailModal = ({ student, onClose }) => {
    if (!student) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Chi tiết sinh viên</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cơ bản</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Họ tên:</span>
                  <span className="ml-2 font-medium">{student.nguoi_dung.ho_ten}</span>
                </div>
                <div>
                  <span className="text-gray-600">MSSV:</span>
                  <span className="ml-2 font-medium">{student.mssv}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2">{student.nguoi_dung.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Điện thoại:</span>
                  <span className="ml-2">{student.nguoi_dung.sdt}</span>
                </div>
                <div>
                  <span className="text-gray-600">Khóa học:</span>
                  <span className="ml-2">{student.academicYear}</span>
                </div>
                <div>
                  <span className="text-gray-600">GPA:</span>
                  <span className="ml-2 font-medium">{student.gpa}</span>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thành tích rèn luyện</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{student.totalPoints}</div>
                  <div className="text-sm text-gray-600">Tổng điểm RL</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{student.activitiesJoined}</div>
                  <div className="text-sm text-gray-600">Hoạt động tham gia</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">#{student.rank}</div>
                  <div className="text-sm text-gray-600">Xếp hạng lớp</div>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Hoạt động gần đây</h3>
              <div className="text-sm text-gray-600">
                <p>Hoạt động cuối cùng: {new Date(student.lastActivityDate).toLocaleDateString('vi-VN')}</p>
                <p className="mt-2 text-gray-500">Danh sách hoạt động chi tiết sẽ được hiển thị ở đây...</p>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={() => window.location.href = `/students/${student.id}/activities`}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Xem hoạt động
            </button>
          </div>
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

  return (
    <ClassManagementLayout role="lop_truong">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Sinh viên Lớp</h1>
          <p className="text-gray-600 mt-1">Theo dõi tiến độ rèn luyện của sinh viên trong lớp</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadStudents}
            className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </button>
          <button
            onClick={handleExportData}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, MSSV hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="md:w-64">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="points_desc">Điểm RL: Cao → Thấp</option>
              <option value="points_asc">Điểm RL: Thấp → Cao</option>
              <option value="name_asc">Tên: A → Z</option>
              <option value="name_desc">Tên: Z → A</option>
              <option value="mssv_asc">MSSV: Tăng dần</option>
              <option value="activities_desc">Hoạt động: Nhiều → Ít</option>
            </select>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">{students.length}</div>
              <div className="text-sm text-gray-600">Tổng sinh viên</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">
                {students.filter(s => s.totalPoints >= 80).length}
              </div>
              <div className="text-sm text-gray-600">Điểm RL ≥ 80</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">
                {students.filter(s => s.totalPoints < 50).length}
              </div>
              <div className="text-sm text-gray-600">Cần quan tâm</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">
                {(students.reduce((sum, s) => sum + s.totalPoints, 0) / students.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Điểm TB lớp</div>
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.map(student => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Không tìm thấy sinh viên' : 'Chưa có sinh viên nào'}
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Danh sách sinh viên sẽ được cập nhật tự động'}
          </p>
        </div>
      )}

      {/* Student Detail Modal */}
      <StudentDetailModal 
        student={showDetails} 
        onClose={() => setShowDetails(null)} 
      />
      </div>
    </ClassManagementLayout>
  );
}
