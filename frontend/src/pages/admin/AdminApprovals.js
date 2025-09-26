import React from 'react';
import Header from '../../components/Header';
import AdminLayout from '../../components/AdminLayout';
import http from '../../services/http';
import { useAppStore } from '../../store/useAppStore';

export default function AdminApprovals() {
  const { user } = useAppStore();
  const role = user?.vai_tro || user?.role;

  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('cho_duyet');
  const [hocKy, setHocKy] = React.useState('');
  const [namHoc, setNamHoc] = React.useState('');
  const [selected, setSelected] = React.useState({});

  async function load() {
    setLoading(true);
    try {
      const res = await http.get('/api/admin/registrations', { params: { page, limit: 20, status, search, hoc_ky: hocKy || undefined, nam_hoc: namHoc || undefined } });
      const data = res.data?.data || {};
      setItems(Array.isArray(data.items) ? data.items : []);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(function(){ load(); }, [page, status]);

  async function approve(id) {
    await http.post(`/api/admin/registrations/${id}/approve`);
    load();
  }
  async function reject(id) {
    const reason = window.prompt('Lý do từ chối?');
    if (reason == null) return;
    await http.post(`/api/admin/registrations/${id}/reject`, { reason });
    load();
  }

  async function bulk(action){
    const ids = Object.entries(selected).filter(([,v])=>v).map(([k])=>k);
    if(ids.length===0) return alert('Chưa chọn bản ghi nào');
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

  return (
    <AdminLayout active="approvals">
      <main className="max-w-7xl mx-auto p-6">
          <h1 className="text-2xl font-semibold mb-4">Phê duyệt đăng ký</h1>

          <div className="bg-white rounded shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-6 gap-3">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm theo tên hoặc hoạt động" className="border rounded px-3 py-2" />
            <select value={status} onChange={e=>setStatus(e.target.value)} className="border rounded px-3 py-2">
              <option value="cho_duyet">Chờ duyệt</option>
              <option value="da_duyet">Đã duyệt</option>
              <option value="tu_choi">Từ chối</option>
              <option value="da_tham_gia">Đã tham gia</option>
            </select>
            <select value={hocKy} onChange={e=>setHocKy(e.target.value)} className="border rounded px-3 py-2">
              <option value="">Tất cả học kỳ</option>
              <option value="hoc_ky_1">Học kỳ I</option>
              <option value="hoc_ky_2">Học kỳ II</option>
            </select>
            <input value={namHoc} onChange={e=>setNamHoc(e.target.value)} placeholder="Năm học (YYYY-YYYY)" className="border rounded px-3 py-2" />
            <div className="flex gap-2">
              <button onClick={()=>{ setPage(1); load(); }} className="px-4 py-2 border rounded">Lọc</button>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={()=>bulk('approve')} className="px-4 py-2 rounded bg-green-600 text-white">Duyệt đã chọn</button>
              <button onClick={()=>bulk('reject')} className="px-4 py-2 rounded bg-red-600 text-white">Từ chối đã chọn</button>
            </div>
          </div>

          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="px-3 py-2"><input type="checkbox" onChange={e=>{
                    const checked = e.target.checked; const map={}; (items||[]).forEach(r=>{ map[r.id]=checked; }); setSelected(map);
                  }} /></th>
                  <th className="px-3 py-2">Sinh viên</th>
                  <th className="px-3 py-2">Lớp</th>
                  <th className="px-3 py-2">Hoạt động</th>
                  <th className="px-3 py-2">Trạng thái</th>
                  <th className="px-3 py-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {items.map(r => (
                  <tr key={r.id} className="border-b">
                    <td className="px-3 py-2"><input type="checkbox" checked={!!selected[r.id]} onChange={e=> setSelected(s=>({ ...s, [r.id]: e.target.checked }))} /></td>
                    <td className="px-3 py-2">{r.sinh_vien?.nguoi_dung?.ho_ten || ''}</td>
                    <td className="px-3 py-2">{r.sinh_vien?.lop?.ten_lop || ''}</td>
                    <td className="px-3 py-2">{r.hoat_dong?.ten_hd || ''}</td>
                    <td className="px-3 py-2">{r.trang_thai_dk}</td>
                    <td className="px-3 py-2 flex gap-2">
                      {r.trang_thai_dk === 'cho_duyet' && (
                        <>
                          <button onClick={()=>approve(r.id)} className="px-3 py-1 border rounded text-green-700">Duyệt</button>
                          <button onClick={()=>reject(r.id)} className="px-3 py-1 border rounded text-red-700">Từ chối</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && !loading && (
                  <tr><td className="px-3 py-4" colSpan={5}>Không có dữ liệu</td></tr>
                )}
              </tbody>
            </table>
          </div>
      </main>
    </AdminLayout>
  );
}


