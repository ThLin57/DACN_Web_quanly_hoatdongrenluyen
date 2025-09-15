import React from 'react';

export default function Scores(){
  const [viewBy, setViewBy] = React.useState('hoc_ky');
  const [options, setOptions] = React.useState([]);
  const [selected, setSelected] = React.useState('');
  const [total, setTotal] = React.useState(0);
  const [rows, setRows] = React.useState([]);

  React.useEffect(function(){ setOptions([{ value: '2024-2025_HK1', label: 'HK1 2024-2025' }, { value: '2024-2025_HK2', label: 'HK2 2024-2025' }]); setSelected('2024-2025_HK1'); }, []);

  React.useEffect(function(){ if(!selected) return; 
    // Placeholder data to avoid 404 until API exists
    setTotal(82);
    setRows([
      { id: 's1', ten_hd: 'Hiến máu', ngay: '2025-09-11', diem: 4 },
      { id: 's2', ten_hd: 'Chạy vì sức khỏe', ngay: '2025-09-12', diem: 3 }
    ]);
  }, [viewBy, selected]);

  return React.createElement('div', { className: 'space-y-4' }, [
    React.createElement('div', { key: 'filters', className: 'bg-white border rounded-xl p-4 flex flex-wrap gap-3 items-end' }, [
      field('Xem theo', React.createElement('select', { key: 'by', value: viewBy, onChange: function(e){ setViewBy(e.target.value); }, className: 'px-3 py-2 border rounded-lg' }, [
        React.createElement('option', { key: 'hk', value: 'hoc_ky' }, 'Học kỳ'),
        React.createElement('option', { key: 'nh', value: 'nam_hoc' }, 'Năm học')
      ])),
      field('Chọn', React.createElement('select', { key: 'sel', value: selected, onChange: function(e){ setSelected(e.target.value); }, className: 'px-3 py-2 border rounded-lg' },
        options.map(function(o){ return React.createElement('option', { key: o.value, value: o.value }, o.label); })
      )),
      React.createElement('div', { key: 'total', className: 'ml-auto text-sm font-medium' }, 'Tổng điểm đạt được: ' + total)
    ]),
    React.createElement('div', { key: 'table', className: 'bg-white border rounded-xl p-4' }, [
      React.createElement('table', { key: 't', className: 'w-full text-sm' }, [
        React.createElement('thead', { key: 'h' }, React.createElement('tr', null, [th('Tên hoạt động'), th('Ngày tham gia'), th('Điểm rèn luyện')])),
        React.createElement('tbody', { key: 'b', className: 'divide-y' }, rows.map(function(r, idx){ return React.createElement('tr', { key: r.id || idx }, [td(r.ten_hd || r.name || '—'), td(r.ngay || r.ngay_tham_gia || '—'), td(String(r.diem || r.diem_rl || 0))]); }))
      ])
    ])
  ]);
}

function field(label, node){ return React.createElement('div', { className: 'flex flex-col' }, [React.createElement('label', { key: 'l', className: 'text-xs text-gray-500 mb-1' }, label), node]); }
function th(text){ return React.createElement('th', { className: 'text-left py-2 text-gray-500 font-medium' }, text); }
function td(text){ return React.createElement('td', { className: 'py-2' }, text); }


