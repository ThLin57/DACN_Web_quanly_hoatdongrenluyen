import React from 'react';
import Header from '../../components/Header';
import AdminLayout from '../../components/AdminLayout';
import http from '../../services/http';
import { useAppStore } from '../../store/useAppStore';

export default function AdminActivities(){
  const { user } = useAppStore();
  const role = user?.vai_tro || user?.role;
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [types, setTypes] = React.useState([]);
  const [typeId, setTypeId] = React.useState('');
  const [hocKy, setHocKy] = React.useState('');
  const [namHoc, setNamHoc] = React.useState('');

  async function load(){
    setLoading(true);
    try{
      const [res, tRes] = await Promise.all([
        http.get('/api/activities', { params: { search: search || undefined, status: status || undefined, typeId: typeId || undefined, hoc_ky: hocKy || undefined, nam_hoc: namHoc || undefined } }),
        http.get('/activities/types/list').catch(()=>({ data: { data: [] } }))
      ]);
      setItems(Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.items || []));
      setTypes(tRes.data?.data || []);
    }finally{ setLoading(false); }
  }

  React.useEffect(function(){ load(); }, []);

  async function remove(id){
    if(!window.confirm('Xóa hoạt động này?')) return;
    await http.delete('/api/activities/' + id).catch(()=>{});
    load();
  }

  async function approve(id){
    try{ await http.post(`/api/activities/${id}/approve`); load(); }catch(e){ alert('Không thể duyệt hoạt động'); }
  }
  async function reject(id){
    const reason = window.prompt('Lý do từ chối?');
    if (reason == null) return;
    try{ await http.post(`/api/activities/${id}/reject`, { reason }); load(); }catch(e){ alert('Không thể từ chối'); }
  }

  function statusBadge(s){
    const map = { cho_duyet: 'bg-yellow-100 text-yellow-700', da_duyet: 'bg-green-100 text-green-700', tu_choi: 'bg-red-100 text-red-700', da_huy: 'bg-gray-100 text-gray-700', ket_thuc: 'bg-indigo-100 text-indigo-700' };
    return <span className={'px-2 py-1 rounded text-xs ' + (map[s] || 'bg-gray-100 text-gray-700')}>{s}</span>;
  }

  return (
    <AdminLayout active="activities">
      <main className="max-w-7xl mx-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Quản lý Hoạt động</h1>
            <button onClick={()=>window.location.href='/admin/activities/create'} className="px-4 py-2 rounded bg-blue-600 text-white">Thêm hoạt động</button>
          </div>

          <div className="bg-white rounded shadow p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm theo tên" className="border rounded px-3 py-2" />
            <select value={typeId} onChange={e=>setTypeId(e.target.value)} className="border rounded px-3 py-2">
              <option value="">Tất cả loại</option>
              {(types||[]).map(t=> <option key={t.id} value={t.id}>{t.ten_loai_hd || t.name}</option>)}
            </select>
            <select value={status} onChange={e=>setStatus(e.target.value)} className="border rounded px-3 py-2">
              <option value="">Tất cả trạng thái</option>
              <option value="cho_duyet">Chờ duyệt</option>
              <option value="da_duyet">Đã duyệt</option>
              <option value="tu_choi">Từ chối</option>
              <option value="da_huy">Đã hủy</option>
              <option value="ket_thuc">Kết thúc</option>
            </select>
            <select value={hocKy} onChange={e=>setHocKy(e.target.value)} className="border rounded px-3 py-2">
              <option value="">Tất cả học kỳ</option>
              <option value="hoc_ky_1">Học kỳ I</option>
              <option value="hoc_ky_2">Học kỳ II</option>
            </select>
            <input value={namHoc} onChange={e=>setNamHoc(e.target.value)} placeholder="Năm học (YYYY-YYYY)" className="border rounded px-3 py-2" />
            <div className="flex gap-2">
              <button onClick={()=>{ load(); }} className="px-4 py-2 border rounded">Lọc</button>
              <button onClick={()=>{ setSearch(''); setStatus(''); setTypeId(''); load(); }} className="px-4 py-2 border rounded">Xóa lọc</button>
            </div>
          </div>

          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="px-3 py-2">Mã</th>
                  <th className="px-3 py-2">Tên</th>
                  <th className="px-3 py-2">Loại</th>
                  <th className="px-3 py-2">Điểm</th>
                  <th className="px-3 py-2">Trạng thái</th>
                  <th className="px-3 py-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {items.map(a => (
                  <tr key={a.id} className="border-b">
                    <td className="px-3 py-2">{a.ma_hd || '-'}</td>
                    <td className="px-3 py-2">{a.ten_hd}</td>
                    <td className="px-3 py-2">{a.loai || a.loai_hd?.ten_loai_hd || ''}</td>
                    <td className="px-3 py-2">{a.diem_rl}</td>
                    <td className="px-3 py-2">{statusBadge(a.trang_thai)}</td>
                    <td className="px-3 py-2 flex gap-2">
                      <button onClick={()=>window.location.href=`/admin/activities/${a.id}/edit`} className="px-3 py-1 border rounded">Sửa</button>
                      <button onClick={()=>remove(a.id)} className="px-3 py-1 border rounded text-red-700">Xóa</button>
                      {a.trang_thai === 'cho_duyet' && (
                        <>
                          <button onClick={()=>approve(a.id)} className="px-3 py-1 border rounded text-green-700">Duyệt</button>
                          <button onClick={()=>reject(a.id)} className="px-3 py-1 border rounded text-orange-700">Từ chối</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && !loading && (<tr><td className="px-3 py-3" colSpan={6}>Không có dữ liệu</td></tr>)}
              </tbody>
            </table>
          </div>
      </main>
    </AdminLayout>
  );
}


