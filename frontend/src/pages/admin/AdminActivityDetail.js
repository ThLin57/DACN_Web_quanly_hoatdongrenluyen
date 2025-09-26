import React from 'react';
import Header from '../../components/Header';
import AdminLayout from '../../components/AdminLayout';
import http from '../../services/http';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export default function AdminActivityDetail(){
  const { user } = useAppStore();
  const role = user?.vai_tro || user?.role;
  const { id } = useParams();
  const [activity, setActivity] = React.useState(null);
  const [registrations, setRegistrations] = React.useState([]);
  const [selected, setSelected] = React.useState({});

  async function load(){
    const [aRes, rRes] = await Promise.all([
      http.get('/api/activities/' + id),
      http.get('/api/admin/registrations', { params: { activityId: id, status: 'cho_duyet', page: 1, limit: 100 } })
    ]);
    setActivity(aRes.data?.data || null);
    setRegistrations(rRes.data?.data?.items || []);
  }

  React.useEffect(function(){ load(); }, [id]);

  async function bulk(action){
    const ids = Object.entries(selected).filter(([,v])=>v).map(([k])=>k);
    if(ids.length===0) return alert('Chưa chọn bản ghi');
    let payload = { ids, action };
    if (action === 'reject') {
      const reason = window.prompt('Lý do từ chối?');
      if (reason == null) return;
      payload.reason = reason;
    }
    await http.post('/api/admin/registrations/bulk', payload);
    setSelected({});
    load();
  }

  if (!activity) {
    return (
      <AdminLayout active="activities">
        <main className="flex-1 p-6">Đang tải...</main>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout active="activities">
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Chi tiết hoạt động</h1>
            <div className="flex gap-2">
              <button onClick={()=>window.location.href=`/admin/activities/${id}/edit`} className="px-4 py-2 rounded bg-blue-600 text-white">Chỉnh sửa</button>
            </div>
          </div>

          <div className="bg-white rounded shadow p-4 grid grid-cols-2 gap-4">
            <div><div className="text-xs text-gray-500">Tên</div><div className="font-medium">{activity.ten_hd}</div></div>
            <div><div className="text-xs text-gray-500">Loại</div><div className="font-medium">{activity.loai || activity.loai_hd?.ten_loai_hd || ''}</div></div>
            <div><div className="text-xs text-gray-500">Điểm</div><div className="font-medium">{activity.diem_rl}</div></div>
            <div><div className="text-xs text-gray-500">Trạng thái</div><div className="font-medium">{activity.trang_thai}</div></div>
            <div className="col-span-2"><div className="text-xs text-gray-500">Mô tả</div><div className="font-medium whitespace-pre-wrap">{activity.mo_ta || ''}</div></div>
          </div>

          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium">Đăng ký chờ duyệt</h2>
              <div className="flex gap-2">
                <button onClick={()=>bulk('approve')} className="px-3 py-2 rounded bg-green-600 text-white">Duyệt đã chọn</button>
                <button onClick={()=>bulk('reject')} className="px-3 py-2 rounded bg-red-600 text-white">Từ chối đã chọn</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead><tr className="text-left border-b"><th className="px-3 py-2"><input type="checkbox" onChange={e=>{ const checked = e.target.checked; const map={}; (registrations||[]).forEach(r=>{ map[r.id]=checked; }); setSelected(map); }} /></th><th className="px-3 py-2">Sinh viên</th><th className="px-3 py-2">Lớp</th><th className="px-3 py-2">Trạng thái</th></tr></thead>
                <tbody>
                  {(registrations||[]).map(r => (
                    <tr key={r.id} className="border-b">
                      <td className="px-3 py-2"><input type="checkbox" checked={!!selected[r.id]} onChange={e=> setSelected(s=>({ ...s, [r.id]: e.target.checked }))} /></td>
                      <td className="px-3 py-2">{r.sinh_vien?.nguoi_dung?.ho_ten || ''}</td>
                      <td className="px-3 py-2">{r.sinh_vien?.lop?.ten_lop || ''}</td>
                      <td className="px-3 py-2">{r.trang_thai_dk}</td>
                    </tr>
                  ))}
                  {(!registrations || registrations.length===0) && <tr><td className="px-3 py-3" colSpan={4}>Không có đăng ký chờ duyệt</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </main>
    </AdminLayout>
  );
}


