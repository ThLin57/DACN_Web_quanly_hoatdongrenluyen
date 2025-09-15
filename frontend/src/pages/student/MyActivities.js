import React from 'react';

export default function MyActivities(){
  const [tab, setTab] = React.useState('pending');
  const [data, setData] = React.useState({ pending: [], approved: [], joined: [], rejected: [] });

  React.useEffect(function(){
    // Placeholder data to avoid 404 until API exists
    setData({
      pending: [ { id: 'p1', ten_hd: 'Giải cầu lông khoa', ngay_dk: '2025-09-18', trang_thai: 'Chờ phê duyệt' } ],
      approved: [ { id: 'a1', ten_hd: 'Hiến máu nhân đạo', ngay_dk: '2025-09-10', trang_thai: 'Đã duyệt' } ],
      joined: [ { id: 'j1', ten_hd: 'Dọn vệ sinh trường', ngay_dk: '2025-09-01', trang_thai: 'Đã tham gia' } ],
      rejected: []
    });
  }, []);

  function table(items){
    return React.createElement('table', { className: 'w-full text-sm' }, [
      React.createElement('thead', { key: 'h' }, React.createElement('tr', { key: 'r' }, [
        th('Tên hoạt động'), th('Ngày đăng ký'), th('Trạng thái')
      ])),
      React.createElement('tbody', { key: 'b', className: 'divide-y' }, items.map(function(a, idx){
        return React.createElement('tr', { key: String(a.id || idx) }, [
          td(a.ten_hd || a.name || '—'), td(a.ngay_dk || a.ngay_dang_ky || '—'), td(a.trang_thai || '—')
        ]);
      }))
    ]);
  }

  return React.createElement('div', { className: 'space-y-4' }, [
    React.createElement('div', { key: 'tabs', className: 'flex items-center gap-2' }, [
      tabBtn('Chờ phê duyệt', 'pending', tab, setTab),
      tabBtn('Đã duyệt', 'approved', tab, setTab),
      tabBtn('Đã tham gia', 'joined', tab, setTab),
      tabBtn('Bị từ chối', 'rejected', tab, setTab)
    ]),
    React.createElement('div', { key: 'table', className: 'bg-white border rounded-xl p-4' },
      table(data[tab] || [])
    )
  ]);
}

function tabBtn(title, value, current, setCurrent){
  var active = current === value;
  return React.createElement('button', { key: value, type: 'button', onClick: function(){ setCurrent(value); }, className: 'px-3 py-1.5 rounded-lg text-sm ' + (active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700') }, title);
}

function th(text){ return React.createElement('th', { className: 'text-left py-2 text-gray-500 font-medium' }, text); }
function td(text){ return React.createElement('td', { className: 'py-2' }, text); }


