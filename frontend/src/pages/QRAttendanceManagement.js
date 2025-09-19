import React, { useState, useEffect } from 'react';
import { Users, Eye, CheckCircle } from 'lucide-react';
import http from '../services/http';
import ClassManagementLayout from '../components/ClassManagementLayout';

export default function QRAttendanceManagement() {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadActivities(); }, []);
  useEffect(() => { if (selectedActivity) loadAttendanceList(selectedActivity.id); }, [selectedActivity]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      // Reuse student activities API (or your own source of creator activities)
      const res = await http.get('/activities');
      const items = res.data?.data?.items || [];
      setActivities(items);
    } catch (err) {
      setError('Không thể tải danh sách hoạt động');
      console.error(err);
    } finally { setLoading(false); }
  };

  const loadAttendanceList = async (activityId) => {
    try {
      setLoading(true);
      const res = await http.get(`/activities/${activityId}/attendance`);
      setAttendances(res.data?.data || []);
    } catch (err) {
      setError('Không thể tải danh sách điểm danh');
    } finally { setLoading(false); }
  };

  const selfCheckIn = async () => {
    if (!selectedActivity) return;
    try {
      setLoading(true);
      await http.post(`/activities/${selectedActivity.id}/attendance`);
      await loadAttendanceList(selectedActivity.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể điểm danh');
    } finally { setLoading(false); }
  };

  const formatDateTime = (dateString) => new Date(dateString).toLocaleString('vi-VN');

  return (
    <ClassManagementLayout role="lop_truong">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý điểm danh</h1>
          <p className="text-gray-600">Điểm danh trực tiếp vào hoạt động (không cần phiên QR)</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError('')} className="text-red-600 underline text-sm mt-1">Đóng</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Danh sách hoạt động</h2>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map(a => (
                  <div key={a.id} className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedActivity?.id===a.id?'border-blue-500 bg-blue-50':'border-gray-200 hover:border-gray-300'}`} onClick={()=>setSelectedActivity(a)}>
                    <h3 className="font-medium text-gray-800">{a.ten_hd}</h3>
                    <p className="text-sm text-gray-600 mt-1">{formatDateTime(a.ngay_bd)} - {formatDateTime(a.ngay_kt)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">{a.trang_thai}</span>
                      <span className="text-sm text-gray-500">{a.diem_rl} điểm</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Điểm danh</h2>
              {selectedActivity && (
                <button onClick={selfCheckIn} className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 hover:bg-green-700" disabled={loading}>
                  <CheckCircle className="w-4 h-4" /> Điểm danh bản thân
                </button>
              )}
            </div>
            {!selectedActivity ? (
              <p className="text-gray-500 text-center py-8">Chọn hoạt động để xem danh sách điểm danh</p>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-gray-600 mb-2">Tổng: {attendances.length}</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="px-3 py-2">Họ tên</th>
                        <th className="px-3 py-2">MSSV</th>
                        <th className="px-3 py-2">Thời gian</th>
                        <th className="px-3 py-2">Phương thức</th>
                        <th className="px-3 py-2">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendances.map(r => (
                        <tr key={r.id} className="border-b">
                          <td className="px-3 py-2">{r.ho_ten}</td>
                          <td className="px-3 py-2">{r.mssv}</td>
                          <td className="px-3 py-2">{formatDateTime(r.tg)}</td>
                          <td className="px-3 py-2">{r.thuc}</td>
                          <td className="px-3 py-2">{r.tt}</td>
                        </tr>
                      ))}
                      {attendances.length===0 && (
                        <tr><td className="px-3 py-3 text-gray-500" colSpan={5}>Chưa có điểm danh</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

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
                <button onClick={()=>window.open(`/activities/${selectedActivity.id}`, '_blank')} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700">
                  <Eye className="w-4 h-4" /> Xem chi tiết hoạt động
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Chọn hoạt động để xem thao tác</p>
            )}
          </div>
        </div>
      </div>
    </ClassManagementLayout>
  );
}