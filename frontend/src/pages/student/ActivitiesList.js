import React from 'react';
import { http } from '../../services/http';

export default function ActivitiesList(){
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState({ type: '', status: '', from: '', to: '' });
  const [items, setItems] = React.useState([]);

  React.useEffect(function(){
    http.get('/activities', { params: { q: query, type: filters.type, status: filters.status, from: filters.from, to: filters.to } })
      .then(function(res){ setItems(res.data?.data || []); })
      .catch(function(){ setItems([]); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSearch(e){
    e.preventDefault();
    http.get('/activities', { params: { q: query, type: filters.type, status: filters.status, from: filters.from, to: filters.to } })
      .then(function(res){ setItems(res.data?.data || []); })
      .catch(function(){ setItems([]); });
  }

  function field(label, node, k){
    return React.createElement('div', { key: k || label, className: 'flex flex-col' }, [
      React.createElement('label', { key: 'l', className: 'text-xs text-gray-500 mb-1' }, label),
      React.createElement('div', { key: 'i' }, node)
    ]);
  }

  const grid = React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4 mt-4' },
    items.map(function(a, idx){
      return React.createElement('div', { key: String(a.id || idx), className: 'bg-white border rounded-xl p-4 flex flex-col gap-2' }, [
        React.createElement('div', { key: 'head', className: 'flex items-start justify-between gap-2' }, [
          React.createElement('div', { key: 'n', className: 'font-semibold' }, a.ten_hd || a.name || 'Hoạt động'),
          badge(a.trang_thai)
        ]),
        React.createElement('div', { key: 't', className: 'text-sm text-gray-500' }, (a.loai || a.loai_hd?.ten_loai_hd || '') + ' • ' + (a.ngay_bd || '')),
        React.createElement('div', { key: 'p', className: 'text-sm' }, 'Điểm RL: ' + (a.diem_rl || a.diem || 0)),
        React.createElement('div', { key: 'btns', className: 'mt-2' },
          React.createElement('a', { href: '/activities/' + (a.id || idx), className: 'inline-block px-3 py-1 rounded-lg bg-blue-600 text-white text-sm' }, 'Xem chi tiết')
        )
      ]);
    })
  );

  function badge(status){
    var s = String(status || '').toLowerCase();
    var map = {
      'cho_duyet': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ duyệt' },
      'da_duyet': { bg: 'bg-green-100', text: 'text-green-700', label: 'Đã duyệt' },
      'tu_choi': { bg: 'bg-red-100', text: 'text-red-700', label: 'Từ chối' },
      'ket_thuc': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Kết thúc' }
    };
    var sty = map[s] || { bg: 'bg-blue-100', text: 'text-blue-700', label: status || '—' };
    return React.createElement('span', { key: 'badge', className: 'px-2 py-0.5 rounded-full text-xs font-medium ' + sty.bg + ' ' + sty.text }, sty.label);
  }

  return React.createElement('div', null, [
    React.createElement('form', { key: 'f', onSubmit: onSearch, className: 'bg-white border rounded-xl p-4 grid grid-cols-1 md:grid-cols-5 gap-3' }, [
      field('Tìm kiếm', React.createElement('input', { key: 'q', type: 'text', value: query, onChange: function(e){ setQuery(e.target.value); }, className: 'px-3 py-2 border rounded-lg', placeholder: 'Nhập tên hoạt động' }), 'field-q'),
      field('Loại hoạt động', React.createElement('select', { key: 't', value: filters.type, onChange: function(e){ setFilters(Object.assign({}, filters, { type: e.target.value })); }, className: 'px-3 py-2 border rounded-lg' }, [
        React.createElement('option', { key: 'all', value: '' }, 'Tất cả')
      ]), 'field-type'),
      field('Trạng thái', React.createElement('select', { key: 's', value: filters.status, onChange: function(e){ setFilters(Object.assign({}, filters, { status: e.target.value })); }, className: 'px-3 py-2 border rounded-lg' }, [
        React.createElement('option', { key: 'all', value: '' }, 'Tất cả'),
        React.createElement('option', { key: 'open', value: 'open' }, 'Đang mở'),
        React.createElement('option', { key: 'soon', value: 'soon' }, 'Sắp diễn ra'),
        React.createElement('option', { key: 'closed', value: 'closed' }, 'Đã kết thúc')
      ]), 'field-status'),
      field('Từ ngày', React.createElement('input', { key: 'f', type: 'date', value: filters.from, onChange: function(e){ setFilters(Object.assign({}, filters, { from: e.target.value })); }, className: 'px-3 py-2 border rounded-lg' }), 'field-from'),
      field('Đến ngày', React.createElement('input', { key: 'to', type: 'date', value: filters.to, onChange: function(e){ setFilters(Object.assign({}, filters, { to: e.target.value })); }, className: 'px-3 py-2 border rounded-lg' }), 'field-to'),
      React.createElement('div', { key: 'btn', className: 'md:col-span-5' }, React.createElement('button', { type: 'submit', className: 'px-4 py-2 rounded-lg bg-blue-600 text-white' }, 'Lọc'))
    ]),
    grid
  ]);
}


