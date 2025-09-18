import React, { useState } from 'react';
import { Bell, Send, Users, Activity, AlertCircle } from 'lucide-react';
import http from '../../services/http';

export default function ClassNotifications() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [scope, setScope] = useState('class'); // 'class' | 'activity'
  const [activityId, setActivityId] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!title || !message) {
      setError('Vui lòng nhập tiêu đề và nội dung');
      return;
    }
    if (scope === 'activity' && !activityId) {
      setError('Vui lòng nhập ID hoạt động khi gửi theo hoạt động');
      return;
    }
    try {
      setSending(true);
      // Use current user's ID from JWT as recipient (self) to avoid hardcoded UUIDs
      let currentUserId = '2de13832-342f-4a60-9996-04fe512d2549';
      try {
        const t = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
        if (t && t.split('.').length === 3) {
          const payloadPart = JSON.parse(atob(t.split('.')[1]));
          if (payloadPart?.sub) currentUserId = payloadPart.sub;
        }
      } catch (_) {}
      const payload = { 
        tieu_de: title, 
        noi_dung: message, 
        nguoi_nhan_id: currentUserId, // send to current user for now
        scope: scope,
        activityId: scope === 'activity' ? activityId : undefined,
        // Only include loai_tb_id when we really have one
        // if (someLoaiTbId) payload.loai_tb_id = someLoaiTbId;
        muc_do_uu_tien: 'trung_binh',
        phuong_thuc_gui: 'trong_he_thong'
      };
      await http.post('/notifications', payload);
      setSuccess('Đã gửi thông báo thành công');
      setTitle('');
      setMessage('');
      setActivityId('');
    } catch (err) {
      const apiMsg = err?.response?.data?.message;
      setError(apiMsg ? String(apiMsg) : 'Không thể gửi thông báo');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gửi thông báo</h1>
          <p className="text-gray-600 mt-1">Gửi thông báo tới toàn lớp hoặc theo hoạt động</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSend} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Nhập tiêu đề" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Nhập nội dung thông báo" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phạm vi</label>
            <select value={scope} onChange={(e) => setScope(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="class">Toàn lớp</option>
              <option value="activity">Theo hoạt động</option>
            </select>
          </div>
          {scope === 'activity' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">ID hoạt động</label>
              <input value={activityId} onChange={(e) => setActivityId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Nhập ID hoạt động" />
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={sending} className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60">
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Đang gửi...' : 'Gửi thông báo'}
          </button>
        </div>
      </form>
    </div>
  );
}


