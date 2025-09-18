import React, { useState, useEffect } from 'react';
import { QrCode, Users, Clock, MapPin, Settings, Eye, Plus, Calendar, CheckCircle, XCircle } from 'lucide-react';
import http from '../services/http';
import ClassManagementLayout from '../components/ClassManagementLayout';

export default function QRAttendanceManagement() {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal states
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showAttendanceList, setShowAttendanceList] = useState(false);
  const [newSession, setNewSession] = useState({
    ten_buoi: '',
    mo_ta: '',
    tg_bat_dau: '',
    tg_ket_thuc: '',
    gps_location: '',
    gps_radius: 100,
    ip_whitelist: []
  });

  // Load activities when component mounts
  useEffect(() => {
    loadActivities();
  }, []);

  // Load sessions when activity is selected
  useEffect(() => {
    if (selectedActivity) {
      loadSessions(selectedActivity.id);
    }
  }, [selectedActivity]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await http.get('/activities/my-activities');
      setActivities(response.data.data || []);
    } catch (err) {
      setError('Không thể tải danh sách hoạt động');
      console.error('Load activities error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async (activityId) => {
    try {
      setLoading(true);
      const response = await http.get(`/attendance/sessions/${activityId}`);
      setSessions(response.data.data || []);
    } catch (err) {
      setError('Không thể tải danh sách phiên điểm danh');
      console.error('Load sessions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    try {
      setLoading(true);
      const response = await http.post(`/attendance/sessions/${selectedActivity.id}`, newSession);
      
      await loadSessions(selectedActivity.id);
      setShowCreateSession(false);
      setNewSession({
        ten_buoi: '',
        mo_ta: '',
        tg_bat_dau: '',
        tg_ket_thuc: '',
        gps_location: '',
        gps_radius: 100,
        ip_whitelist: []
      });
      
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo phiên điểm danh');
    } finally {
      setLoading(false);
    }
  };

  const updateSessionStatus = async (sessionId, status) => {
    try {
      await http.put(`/attendance/sessions/${sessionId}/status`, { status });
      await loadSessions(selectedActivity.id);
    } catch (err) {
      setError('Không thể cập nhật trạng thái phiên điểm danh');
    }
  };

  const loadAttendanceList = async (sessionId) => {
    try {
      setLoading(true);
      const response = await http.get(`/attendance/sessions/${sessionId}/attendances`);
      setAttendances(response.data.data || []);
      setShowAttendanceList(true);
    } catch (err) {
      setError('Không thể tải danh sách điểm danh');
    } finally {
      setLoading(false);
    }
  };

  const triggerPointCalculation = async (activityId) => {
    try {
      setLoading(true);
      const response = await http.post(`/attendance/calculate-points/${activityId}`);
      alert('Tính điểm thành công! ' + JSON.stringify(response.data.data));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tính điểm');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-yellow-600 bg-yellow-100';
      case 'closed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <ClassManagementLayout role="lop_truong">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý điểm danh QR</h1>
          <p className="text-gray-600">Tạo và quản lý các phiên điểm danh QR cho hoạt động</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError('')} className="text-red-600 underline text-sm mt-1">
              Đóng
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activities List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Hoạt động của tôi</h2>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map(activity => (
                  <div
                    key={activity.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedActivity?.id === activity.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedActivity(activity)}
                  >
                    <h3 className="font-medium text-gray-800">{activity.ten_hd}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDateTime(activity.ngay_bd)} - {formatDateTime(activity.ngay_kt)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(activity.trang_thai)}`}>
                        {activity.trang_thai}
                      </span>
                      <span className="text-sm text-gray-500">{activity.diem_rl} điểm</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sessions Management */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Phiên điểm danh</h2>
              {selectedActivity && (
                <button
                  onClick={() => setShowCreateSession(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Tạo phiên
                </button>
              )}
            </div>

            {!selectedActivity ? (
              <p className="text-gray-500 text-center py-8">Chọn hoạt động để xem phiên điểm danh</p>
            ) : (
              <div className="space-y-3">
                {sessions.map(session => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-800">{session.ten_buoi}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(session.trang_thai)}`}>
                        {session.trang_thai}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{session.mo_ta}</p>
                    
                    <div className="space-y-1 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(session.tg_bat_dau)} - {formatDateTime(session.tg_ket_thuc)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {session.attendanceCount || 0} người đã điểm danh
                      </div>
                      {session.gps_location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          GPS: {session.gps_radius}m
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => loadAttendanceList(session.id)}
                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm flex items-center justify-center gap-1 hover:bg-gray-200"
                      >
                        <Eye className="w-3 h-3" />
                        Xem DS
                      </button>
                      
                      {session.canManage && session.trang_thai === 'active' && (
                        <button
                          onClick={() => updateSessionStatus(session.id, 'closed')}
                          className="flex-1 bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
                        >
                          Đóng
                        </button>
                      )}
                      
                      {session.canManage && session.trang_thai === 'closed' && (
                        <button
                          onClick={() => updateSessionStatus(session.id, 'active')}
                          className="flex-1 bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200"
                        >
                          Mở lại
                        </button>
                      )}
                    </div>

                    {/* QR Code Display */}
                    {session.qr_code && session.trang_thai === 'active' && (
                      <div className="mt-3 text-center">
                        <img 
                          src={session.qr_code} 
                          alt="QR Code" 
                          className="w-32 h-32 mx-auto border border-gray-200 rounded"
                        />
                        <p className="text-xs text-gray-500 mt-1">QR Code điểm danh</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Thao tác</h2>
            
            {selectedActivity ? (
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-2">{selectedActivity.ten_hd}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Thời gian:</strong> {formatDateTime(selectedActivity.ngay_bd)} - {formatDateTime(selectedActivity.ngay_kt)}</p>
                    <p><strong>Điểm rèn luyện:</strong> {selectedActivity.diem_rl}</p>
                    <p><strong>Địa điểm:</strong> {selectedActivity.dia_diem || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <button
                  onClick={() => triggerPointCalculation(selectedActivity.id)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700"
                  disabled={loading}
                >
                  <CheckCircle className="w-4 h-4" />
                  Tính điểm rèn luyện
                </button>

                <button
                  onClick={() => window.open(`/activities/${selectedActivity.id}`, '_blank')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4" />
                  Xem chi tiết hoạt động
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Chọn hoạt động để xem thao tác</p>
            )}
          </div>
        </div>

        {/* Create Session Modal */}
        {showCreateSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Tạo phiên điểm danh mới</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên phiên</label>
                  <input
                    type="text"
                    value={newSession.ten_buoi}
                    onChange={(e) => setNewSession({...newSession, ten_buoi: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="VD: Phiên 1 - Khai mạc"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={newSession.mo_ta}
                    onChange={(e) => setNewSession({...newSession, mo_ta: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows="2"
                    placeholder="Mô tả phiên điểm danh..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu</label>
                    <input
                      type="datetime-local"
                      value={newSession.tg_bat_dau}
                      onChange={(e) => setNewSession({...newSession, tg_bat_dau: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc</label>
                    <input
                      type="datetime-local"
                      value={newSession.tg_ket_thuc}
                      onChange={(e) => setNewSession({...newSession, tg_ket_thuc: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí GPS (tùy chọn)</label>
                  <input
                    type="text"
                    value={newSession.gps_location}
                    onChange={(e) => setNewSession({...newSession, gps_location: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="VD: 10.762622,106.660172"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bán kính cho phép (m)</label>
                  <input
                    type="number"
                    value={newSession.gps_radius}
                    onChange={(e) => setNewSession({...newSession, gps_radius: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    min="10"
                    max="1000"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateSession(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={createSession}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  disabled={loading || !newSession.ten_buoi || !newSession.tg_bat_dau || !newSession.tg_ket_thuc}
                >
                  {loading ? 'Đang tạo...' : 'Tạo phiên'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Attendance List Modal */}
        {showAttendanceList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Danh sách điểm danh</h3>
                <button
                  onClick={() => setShowAttendanceList(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Họ tên</th>
                      <th className="text-left py-2">MSSV</th>
                      <th className="text-left py-2">Thời gian</th>
                      <th className="text-left py-2">Điểm</th>
                      <th className="text-left py-2">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendances.map(att => (
                      <tr key={att.id} className="border-b">
                        <td className="py-2">{att.studentName}</td>
                        <td className="py-2">{att.mssv}</td>
                        <td className="py-2">{formatDateTime(att.scanTime)}</td>
                        <td className="py-2">{att.pointsAwarded || 'Chưa có'}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            att.status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {att.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClassManagementLayout>
  );
}