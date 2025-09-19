import React from 'react';
import http from '../../services/http';

export default function AdminActivityTypes() {
  const [items, setItems] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({ id: null, ten_loai_hd: '', mo_ta: '', diem_mac_dinh: '', diem_toi_da: '', mau_sac: '' });

  async function load(page = 1) {
    setLoading(true);
    try {
      const res = await http.get('/api/admin/activity-types', { params: { page, limit: 20, search } });
      const data = res.data?.data || {};
      setItems(data.items || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(function(){ load(); }, []);

  function edit(item) {
    setForm({
      id: item.id,
      ten_loai_hd: item.ten_loai_hd || '',
      mo_ta: item.mo_ta || '',
      diem_mac_dinh: item.diem_mac_dinh != null ? String(item.diem_mac_dinh) : '',
      diem_toi_da: item.diem_toi_da != null ? String(item.diem_toi_da) : '',
      mau_sac: item.mau_sac || ''
    });
  }

  function resetForm() { setForm({ id: null, ten_loai_hd: '', mo_ta: '', diem_mac_dinh: '', diem_toi_da: '', mau_sac: '' }); }

  async function submit(e) {
    e.preventDefault();
    const payload = {
      ten_loai_hd: form.ten_loai_hd,
      mo_ta: form.mo_ta,
      diem_mac_dinh: form.diem_mac_dinh ? Number(form.diem_mac_dinh) : undefined,
      diem_toi_da: form.diem_toi_da ? Number(form.diem_toi_da) : undefined,
      mau_sac: form.mau_sac || undefined
    };
    if (form.id) await http.put('/api/admin/activity-types/' + form.id, payload);
    else await http.post('/api/admin/activity-types', payload);
    resetForm();
    load();
  }

  async function remove(id) {
    if (!window.confirm('Xóa loại hoạt động?')) return;
    await http.delete('/api/admin/activity-types/' + id);
    load();
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Quản lý loại hoạt động</h1>

      <div className="bg-white rounded shadow p-4">
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên loại</label>
              <input value={form.ten_loai_hd} onChange={e=>setForm({...form, ten_loai_hd: e.target.value})} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Màu sắc (hex)</label>
              <input value={form.mau_sac} onChange={e=>setForm({...form, mau_sac: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="#22c55e" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Điểm mặc định</label>
              <input value={form.diem_mac_dinh} onChange={e=>setForm({...form, diem_mac_dinh: e.target.value})} className="w-full border rounded px-3 py-2" type="number" step="0.5" min="0" max="10" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Điểm tối đa</label>
              <input value={form.diem_toi_da} onChange={e=>setForm({...form, diem_toi_da: e.target.value})} className="w-full border rounded px-3 py-2" type="number" step="0.5" min="0" max="10" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea value={form.mo_ta} onChange={e=>setForm({...form, mo_ta: e.target.value})} className="w-full border rounded px-3 py-2" rows={4} />
          </div>
          <div className="flex gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">{form.id ? 'Cập nhật' : 'Tạo mới'}</button>
            {form.id && <button type="button" onClick={resetForm} className="px-4 py-2 border rounded">Hủy</button>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded shadow p-4">
        <div className="flex items-center gap-2 mb-3">
          <input placeholder="Tìm kiếm" value={search} onChange={e=>setSearch(e.target.value)} className="border rounded px-3 py-2" />
          <button onClick={()=>load(1)} className="px-3 py-2 border rounded">Lọc</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="px-3 py-2">Tên loại</th>
                <th className="px-3 py-2">Điểm mặc định</th>
                <th className="px-3 py-2">Điểm tối đa</th>
                <th className="px-3 py-2">Màu sắc</th>
                <th className="px-3 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {items.map(function(r){ return (
                <tr key={r.id} className="border-b">
                  <td className="px-3 py-2">{r.ten_loai_hd}</td>
                  <td className="px-3 py-2">{Number(r.diem_mac_dinh || 0)}</td>
                  <td className="px-3 py-2">{Number(r.diem_toi_da || 0)}</td>
                  <td className="px-3 py-2">{r.mau_sac || ''}</td>
                  <td className="px-3 py-2 flex gap-2">
                    <button onClick={()=>edit(r)} className="px-3 py-1 border rounded">Sửa</button>
                    <button onClick={()=>remove(r.id)} className="px-3 py-1 border rounded text-red-600">Xóa</button>
                  </td>
                </tr>
              ); })}
              {items.length === 0 && !loading && (
                <tr><td className="px-3 py-2" colSpan={5}>Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


