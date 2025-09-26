import React from 'react';
import Header from '../../components/Header';
import AdminLayout from '../../components/AdminLayout';
import http from '../../services/http';
import { useAppStore } from '../../store/useAppStore';

export default function AdminReports(){
  const { user } = useAppStore();
  const role = user?.vai_tro || user?.role;
  const [overview, setOverview] = React.useState({ byStatus: [], topActivities: [], dailyRegs: [] });
  const [loading, setLoading] = React.useState(false);

  async function load(){
    setLoading(true);
    try{
      const res = await http.get('/api/admin/reports/overview');
      setOverview(res.data?.data || {});
    }finally{ setLoading(false); }
  }

  React.useEffect(function(){ load(); }, []);

  function exportUrl(type){
    const base = (typeof window !== 'undefined' ? (process.env.REACT_APP_API_URL || 'http://localhost:3001/api') : '').replace(/\/$/, '');
    if (type === 'activities') return base + '/admin/reports/export/activities';
    if (type === 'registrations') return base + '/admin/reports/export/registrations';
    return '#';
  }

  return (
    <AdminLayout active="reports">
        <main className="flex-1 p-6 space-y-6">
          <h1 className="text-2xl font-semibold">Báo cáo – Thống kê</h1>

          <div className="bg-white rounded shadow p-4">
            <h2 className="font-medium mb-3">Hoạt động theo trạng thái</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {(overview.byStatus || []).map((s, i) => (
                <div key={i} className="p-3 border rounded">
                  <div className="text-xs text-gray-500">{s.trang_thai}</div>
                  <div className="text-xl font-semibold">{s._count?._all || s._count || 0}</div>
                </div>
              ))}
              {(!overview.byStatus || overview.byStatus.length===0) && <div className="text-sm text-gray-500">Không có dữ liệu</div>}
            </div>
          </div>

          <div className="bg-white rounded shadow p-4">
            <h2 className="font-medium mb-3">Top 10 hoạt động nhiều đăng ký</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead><tr className="text-left border-b"><th className="px-3 py-2">Hoạt động</th><th className="px-3 py-2">Số đăng ký</th></tr></thead>
                <tbody>
                  {(overview.topActivities || []).map(a => (
                    <tr key={a.id} className="border-b"><td className="px-3 py-2">{a.ten_hd}</td><td className="px-3 py-2">{a.count}</td></tr>
                  ))}
                  {(!overview.topActivities || overview.topActivities.length===0) && <tr><td className="px-3 py-3">Không có dữ liệu</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded shadow p-4">
            <h2 className="font-medium mb-3">Xuất dữ liệu</h2>
            <div className="flex gap-3">
              <a className="px-4 py-2 rounded bg-purple-600 text-white" href={exportUrl('activities')}>Xuất Hoạt động</a>
              <a className="px-4 py-2 rounded bg-emerald-600 text-white" href={exportUrl('registrations')}>Xuất Đăng ký</a>
            </div>
          </div>
        </main>
    </AdminLayout>
  );
}


