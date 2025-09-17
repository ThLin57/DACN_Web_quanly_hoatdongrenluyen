import React from 'react';
import { http } from '../../services/http';
import { Clock, MapPin, ChevronRight } from 'lucide-react';

export default function ActivitiesList(){
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState({ type: '', status: '', from: '', to: '' });
  const [items, setItems] = React.useState([]);
  const [detail, setDetail] = React.useState(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [loadingDetail, setLoadingDetail] = React.useState(false);
  const [regStatus, setRegStatus] = React.useState({ status: null, loading: false });
  const [regMessage, setRegMessage] = React.useState(null);
  const [regError, setRegError] = React.useState(null);
  const [regReason, setRegReason] = React.useState('');

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

  function openDetail(id){
    if (!id) return;
    setLoadingDetail(true);
    setDetailOpen(true);
    setDetail(null);
    setRegMessage(null);
    setRegError(null);
    http.get('/activities/' + id)
      .then(function(res){ setDetail(res.data?.data || null); })
      .catch(function(){ setDetail(null); })
      .finally(function(){ setLoadingDetail(false); });

    // fetch registration status
    setRegStatus({ status: null, loading: true });
    http.get('/activities/' + id + '/registration')
      .then(function(res){ setRegStatus({ status: res.data?.data?.status || null, loading: false }); })
      .catch(function(){ setRegStatus({ status: null, loading: false }); });
  }

  function registerForActivity(){
    if (!detail?.id || regStatus.loading) return;
    setRegMessage(null);
    setRegError(null);
    setRegStatus(function(prev){ return { status: prev.status, loading: true }; });
    http.post('/activities/' + detail.id + '/register', { reason: regReason || undefined })
      .then(function(res){
        var status = res.data?.data?.status || regStatus.status;
        var msg = res.data?.message || 'Đăng ký thành công';
        setRegStatus({ status: status, loading: false });
        setRegMessage(msg);
      })
      .catch(function(err){ 
        setRegStatus(function(prev){ return { status: prev.status, loading: false }; }); 
        setRegError(err?.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại.');
      });
  }

  function renderRegistrationChip(){
    var status = regStatus.status;
    if (!status) return null;
    var map = {
      'cho_duyet': { text: 'Chờ duyệt', cls: 'bg-yellow-100 text-yellow-800' },
      'da_duyet': { text: 'Đã duyệt', cls: 'bg-green-100 text-green-700' },
      'tu_choi': { text: 'Từ chối', cls: 'bg-red-100 text-red-700' },
      'da_tham_gia': { text: 'Đã tham gia', cls: 'bg-blue-100 text-blue-700' }
    };
    var info = map[String(status)] || { text: String(status), cls: 'bg-gray-100 text-gray-700' };
    return React.createElement('span', { className: `px-3 py-1 rounded-md text-sm ${info.cls}` }, info.text);
  }

  function field(label, node, k){
    return React.createElement('div', { key: k || label, className: 'flex flex-col' }, [
      React.createElement('label', { key: 'l', className: 'text-xs text-gray-500 mb-1' }, label),
      React.createElement('div', { key: 'i' }, node)
    ]);
  }

  const grid = React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4 mt-4' },
    items.map(function(a, idx){
      const date = new Date(a.ngay_bd);
      const dateStr = isNaN(date.getTime()) ? '' : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      const timeStr = isNaN(date.getTime()) ? '' : date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      
      return React.createElement('div', { key: String(a.id || idx), className: 'bg-white border rounded-xl p-4 hover:shadow-md transition-shadow' }, [
        React.createElement('div', { key: 'head', className: 'flex items-start justify-between gap-2 mb-3' }, [
          React.createElement('div', { key: 'n', className: 'font-semibold text-gray-900 line-clamp-2' }, a.ten_hd || a.name || 'Hoạt động'),
          React.createElement('span', { key: 'points', className: 'bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full' }, `+${a.diem_rl || a.diem || 0} điểm`)
        ]),
        React.createElement('div', { key: 'details', className: 'space-y-2 text-sm text-gray-600 mb-4' }, [
          React.createElement('div', { key: 'time', className: 'flex items-center' }, [React.createElement(Clock, { key: 'icon', className: 'h-4 w-4 mr-2' }), React.createElement('span', { key: 'text' }, dateStr && timeStr ? `${dateStr} • ${timeStr}` : '—')]),
          React.createElement('div', { key: 'location', className: 'flex items-center' }, [React.createElement(MapPin, { key: 'icon', className: 'h-4 w-4 mr-2' }), React.createElement('span', { key: 'text' }, a.dia_diem || '—')])
        ]),
        React.createElement('div', { key: 'footer', className: 'flex justify-between items-center' }, [
          badge(a.trang_thai),
          React.createElement('button', { 
            key: 'detail', 
            type: 'button', 
            onClick: function(){ openDetail(a.id); }, 
            className: 'inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium' 
          }, [
            'Xem chi tiết',
            React.createElement(ChevronRight, { key: 'arrow', className: 'h-4 w-4 ml-1 text-current' })
          ])
        ])
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
    grid,

    // Detail Modal
    detailOpen ? React.createElement('div', { key: 'modal', className: 'fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center' }, [
      React.createElement('div', { key: 'backdrop', className: 'fixed inset-0 bg-black/30', onClick: function(){ setDetailOpen(false); } }),
      React.createElement('div', { key: 'panel', className: 'relative w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-lg p-0 mx-auto overflow-hidden' }, [
        // Header
        React.createElement('div', { key: 'hero', className: 'bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 text-white' }, [
          React.createElement('div', { key: 'heroRow', className: 'flex items-start justify-between' }, [
            React.createElement('div', { key: 'heroText' }, [
              React.createElement('h3', { key: 'h', className: 'text-lg font-semibold' }, 'Chi tiết hoạt động'),
              detail ? React.createElement('p', { key: 'p', className: 'text-blue-100 text-sm mt-1 line-clamp-1' }, detail.ten_hd || '—') : null
            ]),
            React.createElement('button', { key: 'x', type: 'button', onClick: function(){ setDetailOpen(false); }, className: 'text-white/80 hover:text-white text-sm' }, 'Đóng')
          ])
        ]),
        // Body
        React.createElement('div', { key: 'bodyWrap', className: 'p-6' }, [
          React.createElement('div', { key: 'header', className: 'flex items-center justify-between mb-4' }, [
            React.createElement('div', { key: 'left', className: 'flex items-center gap-2' }, [
              React.createElement('span', { key: 'badge', className: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800' }, detail?.loai || 'Hoạt động')
            ]),
            React.createElement('div', { key: 'right', className: 'flex items-center gap-2' }, [
              regStatus.loading ? React.createElement('button', { key: 'loading', type: 'button', className: 'px-4 py-2 rounded-md bg-blue-400 text-white cursor-wait' }, 'Đang xử lý...') : (
                regStatus.status ? React.createElement(React.Fragment, { key: 'status' }, renderRegistrationChip()) :
                React.createElement('button', { key: 'reg', type: 'button', onClick: registerForActivity, disabled: (function(){
                  if (!detail) return false;
                  var now = new Date();
                  var deadline = detail.han_dk ? new Date(detail.han_dk) : null;
                  var open = (detail.trang_thai === 'da_duyet' || detail.trang_thai === 'cho_duyet');
                  var notExpired = !deadline || now <= deadline;
                  return !(open && notExpired);
                })(), className: 'px-4 py-2 rounded-md text-white text-sm font-medium ' + ((function(){
                  if (!detail) return 'bg-blue-600 hover:bg-blue-700';
                  var now = new Date();
                  var deadline = detail.han_dk ? new Date(detail.han_dk) : null;
                  var open = (detail.trang_thai === 'da_duyet' || detail.trang_thai === 'cho_duyet');
                  var notExpired = !deadline || now <= deadline;
                  return (open && notExpired) ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed';
                })()) }, 'Đăng ký hoạt động')
              )
            ])
          ]),
          // Reason input (only when can register and not yet registered)
          (!regStatus.status) ? React.createElement('div', { key: 'reason', className: 'mb-3' }, [
            React.createElement('label', { key: 'l', className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Lý do đăng ký (tuỳ chọn)'),
            React.createElement('textarea', { key: 't', value: regReason, onChange: function(e){ setRegReason(e.target.value || ''); }, rows: 3, className: 'w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500', placeholder: 'Nhập lý do tham gia hoạt động...' })
          ]) : null,
          regMessage ? React.createElement('div', { key: 'msg', className: 'mb-3 rounded-md bg-green-50 text-green-700 px-3 py-2 text-sm' }, regMessage) : null,
          regError ? React.createElement('div', { key: 'err', className: 'mb-3 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm' }, regError) : null,
          loadingDetail ? React.createElement('div', { key: 'loading', className: 'py-12 text-center text-gray-500' }, 'Đang tải...') :
          (detail ? React.createElement('div', { key: 'body', className: 'space-y-3 text-sm' }, [
            React.createElement('div', { key: 'name', className: 'text-base font-semibold text-gray-900' }, detail.ten_hd || '—'),
            React.createElement('div', { key: 'desc', className: 'text-gray-700 whitespace-pre-line' }, detail.mo_ta || 'Không có mô tả'),
            React.createElement('div', { key: 'grid', className: 'grid grid-cols-1 sm:grid-cols-2 gap-3' }, [
              React.createElement('div', { key: 'diem' }, [React.createElement('div', { className: 'text-gray-500' }, 'Điểm rèn luyện'), React.createElement('div', { className: 'font-medium' }, String(detail.diem_rl || 0))]),
              React.createElement('div', { key: 'loai' }, [React.createElement('div', { className: 'text-gray-500' }, 'Loại hoạt động'), React.createElement('div', { className: 'font-medium' }, detail.loai || '—')]),
              React.createElement('div', { key: 'time' }, [React.createElement('div', { className: 'text-gray-500' }, 'Thời gian'), React.createElement('div', { className: 'font-medium' }, (detail.ngay_bd ? new Date(detail.ngay_bd).toLocaleString('vi-VN') : '—') + (detail.ngay_kt ? ' - ' + new Date(detail.ngay_kt).toLocaleString('vi-VN') : ''))]),
              React.createElement('div', { key: 'place' }, [React.createElement('div', { className: 'text-gray-500' }, 'Địa điểm'), React.createElement('div', { className: 'font-medium' }, detail.dia_diem || '—')])
            ]),
            React.createElement('div', { key: 'creator' }, [
              React.createElement('div', { className: 'text-gray-500' }, 'Người tạo'),
              React.createElement('div', { className: 'font-medium' }, (detail.nguoi_tao?.name || '—') + (detail.nguoi_tao?.email ? ' • ' + detail.nguoi_tao.email : ''))
            ])
          ]) : React.createElement('div', { key: 'empty', className: 'py-12 text-center text-gray-500' }, 'Không tìm thấy chi tiết hoạt động'))
        ])
      ])
    ]) : null
  ]);
}


