import React, { useState, useEffect } from 'react';
import { Calendar, Edit, Trash2, Eye, Plus, Search, Filter, Users, Clock, MapPin, Award, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import http from '../../services/http';
import { useNotification } from '../../contexts/NotificationContext';

export default function ClassActivities() {
  const { showSuccess, showError, showWarning, confirm } = useNotification();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editActivity, setEditActivity] = useState(null);
  const [error, setError] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Status mappings
  const statusLabels = {
    'cho_duyet': 'Chờ duyệt',
    'da_duyet': 'Đã duyệt', 
    'tu_choi': 'Từ chối',
    'dang_dien_ra': 'Đang diễn ra',
    'hoan_thanh': 'Hoàn thành',
    'huy': 'Đã hủy'
  };

  const statusColors = {
    'cho_duyet': 'bg-yellow-100 text-yellow-800',
    'da_duyet': 'bg-green-100 text-green-800',
    'tu_choi': 'bg-red-100 text-red-800', 
    'dang_dien_ra': 'bg-blue-100 text-blue-800',
    'hoan_thanh': 'bg-purple-100 text-purple-800',
    'huy': 'bg-gray-100 text-gray-800'
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await http.get('/dashboard/activities/class/all');
      setActivities(response.data?.data || []);
      setError('');
    } catch (err) {
      console.error('Error loading class activities:', err);
      showError('Không thể tải danh sách hoạt động', 'Lỗi tải dữ liệu');
      setError('Không thể tải danh sách hoạt động');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = () => {
    window.location.href = '/activities/create';
  };

  const handleEditActivity = (activity) => {
    window.location.href = `/activities/edit/${activity.id}`;
  };

  const handleDeleteActivity = async (activity) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa hoạt động',
      message: `Bạn có chắc chắn muốn xóa hoạt động "${activity.ten_hd}"? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa',
      cancelText: 'Hủy'
    });

    if (!confirmed) {
      return;
    }

    try {
      await http.delete(`/activities/${activity.id}`);
      await loadActivities();
      showSuccess(`Đã xóa hoạt động "${activity.ten_hd}" thành công`, 'Xóa hoạt động');
    } catch (err) {
      console.error('Error deleting activity:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Không thể xóa hoạt động';
      showError(errorMessage, 'Lỗi xóa hoạt động');
    }
  };

  const handleViewDetails = (activity) => {
    setSelectedActivity(activity);
    setIsDetailModalOpen(true);
  };

  // Filter activities based on search term and status
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.ten_hd?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.mo_ta?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || activity.trang_thai === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const ActivityCard = ({ activity }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.ten_hd}</h3>
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[activity.trang_thai]}`}>
            {statusLabels[activity.trang_thai]}
          </span>
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => handleViewDetails(activity)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Xem chi tiết"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEditActivity(activity)}
            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteActivity(activity)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Xóa"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-2">{activity.mo_ta}</p>

      {/* Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{new Date(activity.ngay_bd).toLocaleDateString('vi-VN')}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          <span>{new Date(activity.ngay_bd).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{activity.dia_diem}</span>
        </div>
        <div className="flex items-center text-green-600">
          <Award className="h-4 w-4 mr-2" />
          <span>{activity.diem_rl} điểm RL</span>
        </div>
      </div>

      {/* Registration Stats */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>Đăng ký: {activity.registrationCount || 0} sinh viên</span>
          </div>
          <div className="text-gray-500">
            Loại: {activity.loai_hd?.ten_loai_hd}
          </div>
        </div>
      </div>
    </div>
  );

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
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Hoạt động Lớp</h1>
            <p className="text-gray-600 mt-1">Quản lý tất cả hoạt động của lớp bạn</p>
          </div>
          <button
            onClick={handleCreateActivity}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Tạo hoạt động mới
          </button>
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
                  placeholder="Tìm kiếm hoạt động..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="cho_duyet">Chờ duyệt</option>
                <option value="da_duyet">Đã duyệt</option>
                <option value="tu_choi">Từ chối</option>
                <option value="dang_dien_ra">Đang diễn ra</option>
                <option value="hoan_thanh">Hoàn thành</option>
                <option value="huy">Đã hủy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activities List */}
        {filteredActivities.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredActivities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy hoạt động' : 'Chưa có hoạt động nào'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                : 'Tạo hoạt động đầu tiên cho lớp của bạn'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={handleCreateActivity}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Tạo hoạt động mới
              </button>
            )}
          </div>
        )}

        {/* Summary Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê tổng quan</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{activities.length}</div>
              <div className="text-sm text-gray-600">Tổng hoạt động</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {activities.filter(a => a.trang_thai === 'cho_duyet').length}
              </div>
              <div className="text-sm text-gray-600">Chờ duyệt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {activities.filter(a => a.trang_thai === 'da_duyet').length}
              </div>
              <div className="text-sm text-gray-600">Đã duyệt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {activities.filter(a => a.trang_thai === 'hoan_thanh').length}
              </div>
              <div className="text-sm text-gray-600">Hoàn thành</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={handleEditActivity}
        />
      )}
    </>
  );
}

// Modal Component for Activity Details
const ActivityDetailModal = ({ activity, onClose, onEdit }) => {
  if (!activity) return null;

  const statusLabels = {
    'cho_duyet': 'Chờ duyệt', 'da_duyet': 'Đã duyệt', 'tu_choi': 'Từ chối',
    'dang_dien_ra': 'Đang diễn ra', 'hoan_thanh': 'Hoàn thành', 'huy': 'Đã hủy'
  };

  const statusColors = {
    'cho_duyet': 'bg-yellow-100 text-yellow-800', 'da_duyet': 'bg-green-100 text-green-800',
    'tu_choi': 'bg-red-100 text-red-800', 'dang_dien_ra': 'bg-blue-100 text-blue-800',
    'hoan_thanh': 'bg-purple-100 text-purple-800', 'huy': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Chi tiết hoạt động</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          <h3 className="text-2xl font-semibold text-gray-800">{activity.ten_hd}</h3>
          <div>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusColors[activity.trang_thai]}`}>
              {statusLabels[activity.trang_thai]}
            </span>
          </div>
          <p className="text-gray-600 whitespace-pre-wrap">{activity.mo_ta}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-start text-gray-700">
              <Calendar className="h-5 w-5 mr-3 flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium">Ngày bắt đầu</p>
                <p>{new Date(activity.ngay_bd).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
            <div className="flex items-start text-gray-700">
              <Clock className="h-5 w-5 mr-3 flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium">Thời gian</p>
                <p>{new Date(activity.ngay_bd).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <div className="flex items-start text-gray-700">
              <MapPin className="h-5 w-5 mr-3 flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium">Địa điểm</p>
                <p>{activity.dia_diem}</p>
              </div>
            </div>
            <div className="flex items-start text-green-700">
              <Award className="h-5 w-5 mr-3 flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium">Điểm rèn luyện</p>
                <p>{activity.diem_rl} điểm</p>
              </div>
            </div>
            <div className="flex items-start text-gray-700">
              <Users className="h-5 w-5 mr-3 flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium">Số lượng đăng ký</p>
                <p>{activity.registrationCount || 0} sinh viên</p>
              </div>
            </div>
            <div className="flex items-start text-gray-700">
              <Filter className="h-5 w-5 mr-3 flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium">Loại hoạt động</p>
                <p>{activity.loai_hd?.ten_loai_hd}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end items-center p-4 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 mr-2">
            Đóng
          </button>
          <button onClick={() => { onEdit(activity); onClose(); }} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center">
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
};
