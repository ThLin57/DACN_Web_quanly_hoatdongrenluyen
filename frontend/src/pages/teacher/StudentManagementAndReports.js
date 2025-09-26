import React from 'react';
import http from '../../services/http';
import TeacherLayout from '../../components/TeacherLayout';

export default function StudentManagementAndReports() {
  const [students, setStudents] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [tab, setTab] = React.useState('students'); // 'students' | 'reports'

  async function loadStudents(){
    setLoading(true);
    try {
      const res = await http.get('/class/students').catch(()=>({ data:{ data: [] } }));
      setStudents(Array.isArray(res.data?.data) ? res.data.data : []);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(function(){ loadStudents(); }, []);

  function handleImport(){
    alert('Tính năng import từ Excel: Tạo tài khoản từ file Excel (placeholder).\nHãy kết nối endpoint upload để hoàn thiện.');
  }

  function exportReport(){
    alert('Xuất báo cáo (PDF/Excel) - placeholder. Kết nối service xuất file để hoàn thiện.');
  }

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Quản lý Sinh viên & Báo cáo Thống kê</h1>
          <p className="text-purple-100 mt-1">Quản lý danh sách sinh viên và xem báo cáo tổng hợp</p>
        </div>

        <div className="bg-white rounded-lg border">
          <div className="border-b px-4 pt-4">
            <div className="flex gap-4">
              <button className={"pb-3 border-b-2 " + (tab==='students' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600')} onClick={()=>setTab('students')}>Sinh viên</button>
              <button className={"pb-3 border-b-2 " + (tab==='reports' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600')} onClick={()=>setTab('reports')}>Báo cáo - Thống kê</button>
            </div>
          </div>

          {tab==='students' ? (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <button onClick={handleImport} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Tạo tài khoản từ file Excel</button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="px-3 py-2">MSSV</th>
                      <th className="px-3 py-2">Họ tên</th>
                      <th className="px-3 py-2">Lớp</th>
                      <th className="px-3 py-2">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(function(s){ return (
                      <tr key={s.id} className="border-b">
                        <td className="px-3 py-2">{s.mssv}</td>
                        <td className="px-3 py-2">{s.nguoi_dung?.ho_ten || ''}</td>
                        <td className="px-3 py-2">{s.lop?.ten_lop || ''}</td>
                        <td className="px-3 py-2">{s.nguoi_dung?.email || ''}</td>
                      </tr>
                    ); })}
                    {students.length === 0 && !loading && (
                      <tr><td className="px-3 py-2" colSpan={4}>Không có dữ liệu</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Tổng quan</h3>
                <button onClick={exportReport} className="px-4 py-2 border rounded">Xuất báo cáo (PDF/Excel)</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <div className="font-medium text-gray-700 mb-2">Tỷ lệ tham gia</div>
                  <div className="text-sm text-gray-500">Biểu đồ placeholder. Tích hợp thư viện chart (recharts) nếu cần.</div>
                </div>
                <div className="p-4 border rounded">
                  <div className="font-medium text-gray-700 mb-2">Điểm trung bình các lớp</div>
                  <div className="text-sm text-gray-500">Biểu đồ placeholder. Tích hợp dữ liệu từ /class/reports.</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}


