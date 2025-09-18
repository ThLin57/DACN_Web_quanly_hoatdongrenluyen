import React from 'react';
import { useParams } from 'react-router-dom';
import http from '../../services/http';

export default function ActivityDetail(){
  const params = useParams();
  const id = params.id;
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState('');

  React.useEffect(function(){
    setLoading(true);
    http.get('/activities/' + id).then(function(res){ setData(res.data?.data || null); }).catch(function(){ setErr('Không tải được hoạt động'); }).finally(function(){ setLoading(false); });
  }, [id]);

  if (loading) return React.createElement('div', null, 'Đang tải...');
  if (err) return React.createElement('div', { className: 'text-red-600' }, err);
  if (!data) return React.createElement('div', null, 'Không có dữ liệu');

  const start = data?.ngay_bd ? new Date(data.ngay_bd) : null;
  const end = data?.ngay_kt ? new Date(data.ngay_kt) : null;
  const now = new Date();
  const withinTime = start && end ? (start <= now && end >= now) || start > now : true;
  const canRegister = data?.trang_thai === 'da_duyet' && withinTime && !data?.is_registered;

  return React.createElement('div', { className: 'bg-white border rounded-xl p-6 space-y-4' }, [
    React.createElement('div', { key: 'title', className: 'text-2xl font-bold' }, data.ten_hd || data.name || 'Hoạt động'),
    data.hinh_anh ? React.createElement('img', { key: 'img', src: data.hinh_anh[0], alt: 'Poster', className: 'w-full max-h-64 object-cover rounded-lg' }) : null,
    React.createElement('div', { key: 'desc', className: 'text-gray-700' }, data.mo_ta || '—'),
    React.createElement('div', { key: 'meta', className: 'grid grid-cols-1 md:grid-cols-3 gap-3' }, [
      meta('Loại hoạt động', data.loai || data.loai_hd?.ten_loai_hd || '—'),
      meta('Điểm rèn luyện', String(data.diem_rl || 0)),
      meta('Thời gian', data.ngay_bd || '—'),
      meta('Địa điểm', data.dia_diem || '—'),
      meta('SL tối đa', String(data.sl_toi_da || 0)),
    ]),
    React.createElement('div', { key: 'act' }, [
      data?.is_registered
        ? React.createElement('span', { className: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200' }, data.registration_status === 'da_duyet' ? 'Đã đăng ký (Đã duyệt)' : 'Đã đăng ký (Chờ duyệt)')
        : React.createElement('span', { className: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200' }, canRegister ? 'Chưa đăng ký' : 'Không thể đăng ký')
    ])
  ]);
}

function meta(label, value){
  return React.createElement('div', { className: 'p-3 bg-gray-50 rounded-lg border' }, [
    React.createElement('div', { key: 'l', className: 'text-xs text-gray-500' }, label),
    React.createElement('div', { key: 'v', className: 'font-medium' }, value)
  ]);
}


