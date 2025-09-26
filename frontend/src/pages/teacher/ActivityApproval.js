import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Calendar, MapPin, Users, Award, Search } from 'lucide-react';
import http from '../../services/http';
import { useNotification } from '../../contexts/NotificationContext';
import TeacherLayout from '../../components/TeacherLayout';

export default function ActivityApproval() {
  const { showSuccess, showError, confirm } = useNotification();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => { loadActivities(); }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await http.get('/activities', {
        params: {
          trangThai: 'cho_duyet',
          q: query || undefined,
          sort: 'ngay_tao',
          order: 'desc',
          page: 1,
          limit: 50
        }
      });
      const data = response.data?.data;
      const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      setActivities(items);
      setTotal(Number(data?.total || items.length || 0));
      setError('');
    } catch (err) {
      console.error('Error loading activities:', err);
      setError('Không thể tải danh sách hoạt động');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (activityId) => {
    try {
      await http.post(`/activities/${activityId}/approve`);
      await loadActivities();
      showSuccess('Đã phê duyệt hoạt động thành công', 'Phê duyệt');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      console.error('Error approving activity:', err);
      showError(String(msg || 'Lỗi khi phê duyệt'));
    }
  };

  const handleReject = async (activityId) => {
    // Hỏi xác nhận có lý do
    const ok = await confirm({ title: 'Từ chối hoạt động', message: 'Bạn chắc chắn muốn từ chối hoạt động này? Vui lòng xác nhận để nhập lý do từ chối.' });
    if (!ok) return;
    let reason = '';
    try {
      reason = window.prompt('Nhập lý do từ chối: (bắt buộc)');
      if (!reason || !reason.trim()) {
        showError('Vui lòng nhập lý do từ chối');
        return;
      }
      await http.post(`/activities/${activityId}/reject`, { reason: reason.trim() });
      await loadActivities();
      showSuccess('Đã từ chối hoạt động với lý do: ' + reason.trim(), 'Từ chối');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      console.error('Error rejecting activity:', err);
      showError(String(msg || 'Lỗi khi từ chối hoạt động'));
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Đang tải...</div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Phê duyệt Hoạt động</h1>
          <p className="text-purple-100 mt-1">Xét duyệt các hoạt động do Lớp trưởng tạo và gửi lên</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Search & Activities list */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Hoạt động chờ phê duyệt ({total})
              </h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={query}
                    onChange={(e)=>setQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 border rounded-lg text-sm w-64"
                    placeholder="Tìm theo tên hoạt động..."
                  />
                </div>
              </div>
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Không có hoạt động nào chờ phê duyệt</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {activity.ten_hd}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>
                              {new Date(activity.ngay_bd).toLocaleDateString('vi-VN')} - 
                              {new Date(activity.ngay_kt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          
                          {activity.dia_diem && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{activity.dia_diem}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Award className="h-4 w-4 mr-2" />
                            <span>{activity.diem_rl} điểm RL</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            <span>Tối đa {activity.sl_toi_da} người</span>
                          </div>
                        </div>

                        {activity.mo_ta && (
                          <p className="text-sm text-gray-600 mb-4">{activity.mo_ta}</p>
                        )}

                        <div className="text-xs text-gray-500">
                          Tạo bởi: {activity.nguoi_tao?.ho_ten || 'N/A'} • 
                          Ngày tạo: {activity.ngay_tao ? new Date(activity.ngay_tao).toLocaleDateString('vi-VN') : '—'}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setSelected(activity)}
                          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() => handleApprove(activity.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Phê duyệt
                        </button>
                        
                        <button
                          onClick={() => handleReject(activity.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          Từ chối
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal chi tiết */}
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
                <div><span className="font-medium">Người tạo:</span> {selected.nguoi_tao?.ho_ten || selected.nguoi_tao?.email || '—'}</div>
                {selected.mo_ta && <div className="mt-2"><span className="font-medium">Mô tả:</span><div className="text-gray-600 mt-1">{selected.mo_ta}</div></div>}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={()=>setSelected(null)} className="px-4 py-2 border rounded">Đóng</button>
                <button onClick={()=>{ setSelected(null); handleReject(selected.id); }} className="px-4 py-2 bg-red-600 text-white rounded">Từ chối</button>
                <button onClick={()=>{ setSelected(null); handleApprove(selected.id); }} className="px-4 py-2 bg-green-600 text-white rounded">Phê duyệt</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
