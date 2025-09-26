import React from 'react';
import http from '../../services/http';

export default function AdminRoles() {
  const [items, setItems] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({ id: null, ten_vt: '', mo_ta: '', quyen_han: '' });

  async function load(page = 1) {
    setLoading(true);
    try {
      const res = await http.get('/api/admin/roles', { params: { page, limit: 20, search } });
      const data = res.data?.data || {};
      setItems(data.items || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(function(){ load(); }, []);

  function edit(item) {
    setForm({ id: item.id, ten_vt: item.ten_vt || '', mo_ta: item.mo_ta || '', quyen_han: JSON.stringify(item.quyen_han || {}, null, 2) });
  }

  function resetForm() { setForm({ id: null, ten_vt: '', mo_ta: '', quyen_han: '' }); }

  async function submit(e) {
    e.preventDefault();
    const payload = { ten_vt: form.ten_vt, mo_ta: form.mo_ta, quyen_han: safeParseJSON(form.quyen_han) };
    if (form.id) await http.put('/api/admin/roles/' + form.id, payload);
    else await http.post('/api/admin/roles', payload);
    resetForm();
    load();
  }

  async function remove(id) {
    if (!window.confirm('Xóa vai trò?')) return;
    await http.delete('/api/admin/roles/' + id);
    load();
  }

  function safeParseJSON(s) {
    if (!s) return null;
    try { return JSON.parse(s); } catch(_){ return null; }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Quản lý vai trò</h1>

      <div className="bg-white rounded shadow p-4">
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên vai trò</label>
              <input value={form.ten_vt} onChange={e=>setForm({...form, ten_vt: e.target.value})} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mô tả</label>
              <input value={form.mo_ta} onChange={e=>setForm({...form, mo_ta: e.target.value})} className="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quyền hạn (JSON)</label>
            <textarea value={form.quyen_han} onChange={e=>setForm({...form, quyen_han: e.target.value})} className="w-full border rounded px-3 py-2 font-mono" rows={6} placeholder={`{\n  "canManageUsers": true\n}`} />
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
                <th className="px-3 py-2">Tên vai trò</th>
                <th className="px-3 py-2">Mô tả</th>
                <th className="px-3 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {items.map(function(r){ return (
                <tr key={r.id} className="border-b">
                  <td className="px-3 py-2">{r.ten_vt}</td>
                  <td className="px-3 py-2">{r.mo_ta || ''}</td>
                  <td className="px-3 py-2 flex gap-2">
                    <button onClick={()=>edit(r)} className="px-3 py-1 border rounded">Sửa</button>
                    <button onClick={()=>remove(r.id)} className="px-3 py-1 border rounded text-red-600">Xóa</button>
                  </td>
                </tr>
              ); })}
              {items.length === 0 && !loading && (
                <tr><td className="px-3 py-2" colSpan={3}>Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


