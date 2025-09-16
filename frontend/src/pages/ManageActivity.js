import React from 'react';
import http from '../services/http';

export default function ManageActivity(){
  const [form, setForm] = React.useState({ ten_hd: '', loai_hd_id: '', ngay_bd: '', ngay_kt: '', han_dk: '', diem_rl: 0, dia_diem: '', sl_toi_da: 50 });
  const [msg, setMsg] = React.useState('');
  const [types, setTypes] = React.useState([]);

  React.useEffect(function(){
    http.get('/activities/types/list').then(function(res){ setTypes(res.data?.data || []); }).catch(function(){});
  }, []);

  function onChange(e){
    setForm(Object.assign({}, form, { [e.target.name]: e.target.value }));
  }

  function onSubmit(e){
    e.preventDefault();
    setMsg('');
    http.post('/activities', form).then(function(){ setMsg('Tạo hoạt động thành công'); }).catch(function(err){ setMsg(err?.response?.data?.message || 'Lỗi tạo hoạt động'); });
  }

  return React.createElement('div', { className: 'max-w-2xl bg-white border rounded-xl p-6' }, [
    React.createElement('h2', { key: 'h', className: 'text-lg font-semibold mb-4' }, 'Tạo hoạt động mới'),
    msg ? React.createElement('div', { key: 'm', className: 'mb-3 text-sm ' + (msg.includes('thành công') ? 'text-green-700' : 'text-red-700') }, msg) : null,
    React.createElement('form', { key: 'f', onSubmit: onSubmit, className: 'grid grid-cols-2 gap-4' }, [
      React.createElement('input', { key: 'ten', name: 'ten_hd', placeholder: 'Tên hoạt động', value: form.ten_hd, onChange: onChange, className: 'px-3 py-2 border rounded-lg col-span-2' }),
      React.createElement('select', { key: 'loai', name: 'loai_hd_id', value: form.loai_hd_id, onChange: onChange, className: 'px-3 py-2 border rounded-lg col-span-2' },
        [React.createElement('option', { key: 'none', value: '' }, 'Chọn loại hoạt động')].concat(
          types.map(function(t){ return React.createElement('option', { key: t.id, value: t.id }, t.name); })
        )
      ),
      React.createElement('input', { key: 'bd', type: 'datetime-local', name: 'ngay_bd', value: form.ngay_bd, onChange: onChange, className: 'px-3 py-2 border rounded-lg' }),
      React.createElement('input', { key: 'kt', type: 'datetime-local', name: 'ngay_kt', value: form.ngay_kt, onChange: onChange, className: 'px-3 py-2 border rounded-lg' }),
      React.createElement('input', { key: 'han', type: 'datetime-local', name: 'han_dk', value: form.han_dk, onChange: onChange, className: 'px-3 py-2 border rounded-lg col-span-2' }),
      React.createElement('input', { key: 'diem', type: 'number', step: '0.5', min: '0', name: 'diem_rl', value: form.diem_rl, onChange: onChange, className: 'px-3 py-2 border rounded-lg' }),
      React.createElement('input', { key: 'dd', name: 'dia_diem', placeholder: 'Địa điểm', value: form.dia_diem, onChange: onChange, className: 'px-3 py-2 border rounded-lg' }),
      React.createElement('input', { key: 'sl', type: 'number', min: '1', name: 'sl_toi_da', value: form.sl_toi_da, onChange: onChange, className: 'px-3 py-2 border rounded-lg col-span-2' }),
      React.createElement('button', { key: 'submit', type: 'submit', className: 'px-4 py-2 rounded-lg bg-blue-600 text-white col-span-2' }, 'Tạo hoạt động')
    ])
  ]);
}
