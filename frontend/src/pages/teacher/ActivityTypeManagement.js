import React from 'react';
import http from '../../services/http';
import TeacherLayout from '../../components/TeacherLayout';

export default function ActivityTypeManagement() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [form, setForm] = React.useState({ id: null, ten_loai_hd: '', mo_ta: '' });

  async function load() {
    setLoading(true);
    try {
      const res = await http.get('/admin/activity-types').catch(()=>({ data:{ data:{ items: [] } } }));
      const data = res.data?.data || {};
      setItems(Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(function(){ load(); }, []);

  function resetForm(){ setForm({ id: null, ten_loai_hd: '', mo_ta: '' }); }

  async function submit(e){
    e.preventDefault();
    const payload = { ten_loai_hd: form.ten_loai_hd, mo_ta: form.mo_ta };
    if (form.id) await http.put(`/admin/activity-types/${form.id}`, payload).catch(()=>{});
    else await http.post('/admin/activity-types', payload).catch(()=>{});
    resetForm();
    load();
  }

  async function remove(id){
    if (!window.confirm('Xóa loại hoạt động này?')) return;
    await http.delete(`/admin/activity-types/${id}`).catch(()=>{});
    load();
  }

  function edit(item){ setForm({ id: item.id, ten_loai_hd: item.ten_loai_hd || '', mo_ta: item.mo_ta || '' }); }

  const filtered = items.filter(function(it){
    if (!search) return true;
    return (it.ten_loai_hd || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Quản lý Loại hoạt động</h1>
          <p className="text-green-100 mt-1">Quản lý danh mục hoạt động cho khoa/trường</p>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Thêm loại hoạt động mới</h2>
          </div>
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên loại</label>
              <input className="w-full border rounded px-3 py-2" value={form.ten_loai_hd} onChange={e=>setForm({...form, ten_loai_hd: e.target.value})} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Mô tả</label>
              <input className="w-full border rounded px-3 py-2" value={form.mo_ta} onChange={e=>setForm({...form, mo_ta: e.target.value})} />
            </div>
            <div className="md:col-span-3 flex gap-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">{form.id ? 'Cập nhật' : 'Thêm mới'}</button>
              {form.id && <button type="button" onClick={resetForm} className="px-4 py-2 border rounded">Hủy</button>}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-3">
            <input placeholder="Tìm kiếm" value={search} onChange={e=>setSearch(e.target.value)} className="border rounded px-3 py-2" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="px-3 py-2">Tên loại</th>
                  <th className="px-3 py-2">Mô tả</th>
                  <th className="px-3 py-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(function(r){ return (
                  <tr key={r.id} className="border-b">
                    <td className="px-3 py-2">{r.ten_loai_hd}</td>
                    <td className="px-3 py-2">{r.mo_ta || ''}</td>
                    <td className="px-3 py-2 flex gap-2">
                      <button onClick={()=>edit(r)} className="px-3 py-1 border rounded">Sửa</button>
                      <button onClick={()=>remove(r.id)} className="px-3 py-1 border rounded text-red-600">Xóa</button>
                    </td>
                  </tr>
                ); })}
                {filtered.length === 0 && !loading && (
                  <tr><td className="px-3 py-2" colSpan={3}>Không có dữ liệu</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}


