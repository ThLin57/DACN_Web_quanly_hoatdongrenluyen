import React, { useEffect, useState } from 'react';
import { Calendar, Download, BarChart3, Users, Activity as ActivityIcon, CheckCircle, XCircle } from 'lucide-react';
import http from '../../services/http';
import SemesterFilter from '../../components/SemesterFilter';

export default function AdminReports() {
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState({ byStatus: [], topActivities: [], dailyRegs: [] });

  useEffect(() => {
    loadOverview();
  }, [semester]);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const res = await http.get('/admin/reports/overview', { params: { semester: semester || undefined } });
      const data = res?.data?.data || { byStatus: [], topActivities: [], dailyRegs: [] };
      setOverview({
        byStatus: Array.isArray(data.byStatus) ? data.byStatus : [],
        topActivities: Array.isArray(data.topActivities) ? data.topActivities : [],
        dailyRegs: Array.isArray(data.dailyRegs) ? data.dailyRegs : []
      });
      setError('');
    } catch (e) {
      setError('Không thể tải báo cáo tổng quan');
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = async (kind = 'activities') => {
    try {
      const res = await http.get(`/admin/reports/export/${kind}`, {
        params: { semester: semester || undefined },
        responseType: 'arraybuffer'
      });
      // Ensure UTF-8 BOM for Excel compatibility
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
      const blob = new Blob([bom, res.data], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${kind}-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export error:', e);
      const msg = e?.response?.data?.message || e?.message || 'Không thể xuất file.';
      alert(msg);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Có lỗi xảy ra</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const totalByStatus = (status) => {
    const item = overview.byStatus.find(s => s.trang_thai === status);
    return item?._count?._all || 0;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Báo cáo hệ thống</h1>
        <p className="text-gray-600">Thống kê tổng quan hoạt động và đăng ký trong hệ thống</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <div className="w-64">
              <SemesterFilter value={semester} onChange={setSemester} label="" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => exportCsv('activities')} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download className="w-4 h-4" /> Xuất hoạt động (CSV)
            </button>
            <button onClick={() => exportCsv('registrations')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" /> Xuất đăng ký (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg"><ActivityIcon className="w-6 h-6" /></div>
            <span className="text-indigo-200 text-sm">Chờ duyệt</span>
          </div>
          <div className="text-3xl font-bold mb-1">{totalByStatus('cho_duyet')}</div>
          <div className="text-indigo-200 text-sm">Hoạt động</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg"><CheckCircle className="w-6 h-6" /></div>
            <span className="text-emerald-200 text-sm">Đã duyệt</span>
          </div>
          <div className="text-3xl font-bold mb-1">{totalByStatus('da_duyet')}</div>
          <div className="text-emerald-200 text-sm">Hoạt động</div>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg"><XCircle className="w-6 h-6" /></div>
            <span className="text-rose-200 text-sm">Từ chối</span>
          </div>
          <div className="text-3xl font-bold mb-1">{totalByStatus('tu_choi')}</div>
          <div className="text-rose-200 text-sm">Hoạt động</div>
        </div>
        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg"><BarChart3 className="w-6 h-6" /></div>
            <span className="text-gray-200 text-sm">Tổng đăng ký/ngày</span>
          </div>
          <div className="text-3xl font-bold mb-1">{overview.dailyRegs?.reduce((s, d) => s + (d?._count?._all || 0), 0) || 0}</div>
          <div className="text-gray-200 text-sm">Tổng cộng</div>
        </div>
      </div>

      {/* Top activities */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top hoạt động theo số đăng ký</h3>
        {overview.topActivities.length === 0 ? (
          <div className="text-gray-500">Không có dữ liệu</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overview.topActivities.map(a => (
              <div key={a.id} className="p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow">
                <div className="font-semibold text-gray-900 mb-1 line-clamp-2">{a.ten_hd}</div>
                <div className="text-sm text-gray-600">Đăng ký: <span className="font-semibold text-indigo-600">{a.count}</span></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
