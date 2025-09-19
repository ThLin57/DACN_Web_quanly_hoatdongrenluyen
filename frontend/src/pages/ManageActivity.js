import React from 'react';
import { Calendar, MapPin, Award, Users, FileText, Info } from 'lucide-react';
import http from '../services/http';
import ClassManagementLayout from '../components/ClassManagementLayout';

export default function ManageActivity(){
  // Helpers to prefill học kỳ và năm học
  function getDefaultSemester(){
    const m = new Date().getMonth() + 1; // 1-12
    return m >= 1 && m <= 6 ? 'hoc_ky_2' : 'hoc_ky_1';
  }
  function getDefaultYearRange(){
    const today = new Date();
    const year = today.getFullYear();
    // Năm học bắt đầu từ 9 -> 8 năm sau
    const start = today.getMonth() + 1 >= 9 ? year : year - 1;
    return `${start}-${start + 1}`;
  }

  const [form, setForm] = React.useState({
    ten_hd: '',
    loai_hd_id: '',
    mo_ta: '',
    ngay_bd: '',
    ngay_kt: '',
    han_dk: '',
    diem_rl: 0,
    dia_diem: '',
    sl_toi_da: 50,
    nam_hoc: getDefaultYearRange(),
    hoc_ky: getDefaultSemester()
  });
  const [types, setTypes] = React.useState([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState('');
  const [error, setError] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState({});
  const tenHdRef = React.useRef(null);
  const diaDiemRef = React.useRef(null);

  // Dedicated handlers to avoid any unintended interference on generic handler
  const onChangeTenHd = React.useCallback(function(e){
    const el = e.target;
    const v = el.value;
    const caret = el.selectionStart || v.length;
    setForm(function(prev){ return Object.assign({}, prev, { ten_hd: v }); });
    setFieldErrors(function(prev){ const next = Object.assign({}, prev); delete next.ten_hd; return next; });
    // Restore focus & caret to avoid losing focus after re-render
    requestAnimationFrame(function(){
      if (tenHdRef.current) {
        try {
          tenHdRef.current.focus();
          tenHdRef.current.setSelectionRange(caret, caret);
        } catch(_) {}
      }
    });
  }, []);
  const onChangeDiaDiem = React.useCallback(function(e){
    const el = e.target;
    const v = el.value;
    const caret = el.selectionStart || v.length;
    setForm(function(prev){ return Object.assign({}, prev, { dia_diem: v }); });
    setFieldErrors(function(prev){ const next = Object.assign({}, prev); delete next.dia_diem; return next; });
    requestAnimationFrame(function(){
      if (diaDiemRef.current) {
        try {
          diaDiemRef.current.focus();
          diaDiemRef.current.setSelectionRange(caret, caret);
        } catch(_) {}
      }
    });
  }, []);

  React.useEffect(function(){
    let mounted = true;
    http.get('/activities/types/list')
      .then(function(res){ if(mounted) setTypes(res.data?.data || []); })
      .catch(function(){ /* ignore */ });
    return function(){ mounted = false; };
  }, []);

  function onChange(e){
    const { name, value } = e.target;
    setForm(function(prev){ return Object.assign({}, prev, { [name]: value }); });
    setFieldErrors(function(prev){ const next = Object.assign({}, prev); delete next[name]; return next; });
  }

  function validate(){
    const errs = {};
    if(!form.ten_hd?.trim()) errs.ten_hd = 'Vui lòng nhập tên hoạt động';
    if(form.ten_hd && form.ten_hd.trim().length < 3) errs.ten_hd = 'Tên hoạt động tối thiểu 3 ký tự';
    if(!form.loai_hd_id) errs.loai_hd_id = 'Vui lòng chọn loại hoạt động';
    if(!form.ngay_bd) errs.ngay_bd = 'Chọn thời gian bắt đầu';
    if(!form.ngay_kt) errs.ngay_kt = 'Chọn thời gian kết thúc';
    if(form.ngay_bd && form.ngay_kt && new Date(form.ngay_kt) < new Date(form.ngay_bd)) errs.ngay_kt = 'Thời gian kết thúc phải sau bắt đầu';
    if(form.diem_rl < 0) errs.diem_rl = 'Điểm không hợp lệ';
    if(!form.nam_hoc?.match(/^\d{4}-\d{4}$/)) errs.nam_hoc = 'Năm học dạng YYYY-YYYY';
    if(!form.hoc_ky) errs.hoc_ky = 'Chọn học kỳ';
    if(form.sl_toi_da && Number(form.sl_toi_da) < 1) errs.sl_toi_da = 'Số lượng tối thiểu là 1';
    if(form.dia_diem && form.dia_diem.trim().length < 2) errs.dia_diem = 'Địa điểm tối thiểu 2 ký tự';
    return errs;
  }

  function onSubmit(e){
    e.preventDefault();
    setSuccess('');
    setError('');
    const errs = validate();
    setFieldErrors(errs);
    if(Object.keys(errs).length > 0) return;

    setSubmitting(true);
    http.post('/activities', form)
      .then(function(){
        setSuccess('Tạo hoạt động thành công');
        // Điều hướng nhẹ sau 1.2s
        setTimeout(function(){ if (typeof window !== 'undefined') window.location.href = '/class/activities'; }, 1200);
      })
      .catch(function(err){
        setError(err?.response?.data?.message || 'Lỗi tạo hoạt động');
      })
      .finally(function(){ setSubmitting(false); });
  }

  function LabeledInput(props){
    const { id, label, hint, error, rightAddon, children } = props;
    return React.createElement('div', { className: 'space-y-1 col-span-2 md:col-span-1' }, [
      React.createElement('label', { key: 'l', htmlFor: id, className: 'text-sm font-medium text-gray-700' }, label),
      React.createElement('div', { key: 'c' }, children),
      hint ? React.createElement('p', { key: 'h', className: 'text-xs text-gray-500' }, hint) : null,
      error ? React.createElement('p', { key: 'e', className: 'text-xs text-red-600' }, error) : null,
      rightAddon || null
    ]);
  }

  const Header = React.createElement('div', { className: 'mb-5' }, [
    React.createElement('h2', { key: 't', className: 'text-2xl font-bold text-gray-900' }, 'Tạo hoạt động mới'),
    React.createElement('p', { key: 'd', className: 'text-gray-600 mt-1' }, 'Nhập thông tin chi tiết để công bố hoạt động rèn luyện')
  ]);

  const Feedback = React.createElement(React.Fragment, { key: 'fb' }, [
    success && React.createElement('div', { key: 's', className: 'mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800' }, success),
    error && React.createElement('div', { key: 'er', className: 'mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800' }, error)
  ]);

  return (
    <ClassManagementLayout role="lop_truong">
      <div className="max-w-3xl mx-auto bg-white border rounded-xl p-6 shadow-sm">
        {Header}
        {Feedback}
        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
          {/* Tên & Loại */}
          <LabeledInput id="ten_hd" label="Tên hoạt động" hint="Ví dụ: Hiến máu nhân đạo" error={fieldErrors.ten_hd}>
            <input 
              id="ten_hd" 
              type="text"
              name="ten_hd" 
              value={form.ten_hd} 
              onChange={onChangeTenHd}
              ref={tenHdRef}
              maxLength={200}
              autoComplete="off"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Nhập tên hoạt động" 
            />
            <div className="mt-1 text-xs text-gray-500">{(form.ten_hd || '').length}/200 ký tự</div>
          </LabeledInput>
          
          <LabeledInput id="loai_hd_id" label="Loại hoạt động" error={fieldErrors.loai_hd_id}>
            <select 
              id="loai_hd_id" 
              name="loai_hd_id" 
              value={form.loai_hd_id} 
              onChange={onChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Chọn loại hoạt động</option>
              {(types || []).map(t => (
                <option key={t.id} value={t.id}>{t.ten_loai_hd || t.name}</option>
              ))}
            </select>
          </LabeledInput>

          {/* Mô tả (full width) */}
          <div className="col-span-2">
            <label htmlFor="mo_ta" className="text-sm font-medium text-gray-700">Mô tả</label>
            <textarea 
              id="mo_ta" 
              name="mo_ta" 
              value={form.mo_ta} 
              onChange={onChange} 
              rows={4} 
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Mục tiêu, nội dung, đối tượng tham gia..."
            />
            {fieldErrors.mo_ta && <p className="text-xs text-red-600 mt-1">{fieldErrors.mo_ta}</p>}
          </div>

          {/* Thời gian */}
          <LabeledInput id="ngay_bd" label="Bắt đầu" error={fieldErrors.ngay_bd}>
            <input 
              id="ngay_bd" 
              type="datetime-local" 
              name="ngay_bd" 
              value={form.ngay_bd} 
              onChange={onChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </LabeledInput>
          
          <LabeledInput id="ngay_kt" label="Kết thúc" error={fieldErrors.ngay_kt}>
            <input 
              id="ngay_kt" 
              type="datetime-local" 
              name="ngay_kt" 
              value={form.ngay_kt} 
              onChange={onChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </LabeledInput>
          <LabeledInput id="han_dk" label="Hạn đăng ký (tuỳ chọn)" hint="Nếu để trống, hệ thống sẽ cho phép đăng ký đến khi bắt đầu" error={fieldErrors.han_dk}>
            <input 
              id="han_dk" 
              type="datetime-local" 
              name="han_dk" 
              value={form.han_dk} 
              onChange={onChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </LabeledInput>

          {/* Điểm & Địa điểm */}
          <LabeledInput id="diem_rl" label="Điểm rèn luyện (+)" hint="0 - 100, bước 0.5" error={fieldErrors.diem_rl}>
            <input 
              id="diem_rl" 
              type="number" 
              step="0.5" 
              min="0" 
              name="diem_rl" 
              value={form.diem_rl} 
              onChange={onChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </LabeledInput>
          
          <LabeledInput id="dia_diem" label="Địa điểm" hint="Ví dụ: Hội trường A" error={fieldErrors.dia_diem}>
            <input 
              id="dia_diem" 
              type="text"
              name="dia_diem" 
              value={form.dia_diem} 
              onChange={onChangeDiaDiem}
              ref={diaDiemRef}
              maxLength={120}
              autoComplete="off"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Nhập địa điểm" 
            />
            <div className="mt-1 text-xs text-gray-500">{(form.dia_diem || '').length}/120 ký tự</div>
          </LabeledInput>

          {/* Năm học & Học kỳ */}
          <LabeledInput id="nam_hoc" label="Năm học" hint="Dạng YYYY-YYYY" error={fieldErrors.nam_hoc}>
            <input 
              id="nam_hoc" 
              name="nam_hoc" 
              value={form.nam_hoc} 
              onChange={onChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Ví dụ: 2024-2025" 
            />
          </LabeledInput>
          
          <LabeledInput id="hoc_ky" label="Học kỳ" error={fieldErrors.hoc_ky}>
            <select 
              id="hoc_ky" 
              name="hoc_ky" 
              value={form.hoc_ky} 
              onChange={onChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="hoc_ky_1">Học kỳ I</option>
              <option value="hoc_ky_2">Học kỳ II</option>
            </select>
          </LabeledInput>

          {/* Số lượng tối đa (full width) */}
          <div className="col-span-2">
            <label htmlFor="sl_toi_da" className="text-sm font-medium text-gray-700">Số lượng tối đa</label>
            <input 
              id="sl_toi_da" 
              type="number" 
              min="1" 
              name="sl_toi_da" 
              value={form.sl_toi_da} 
              onChange={onChange} 
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
            {fieldErrors.sl_toi_da && <p className="text-xs text-red-600 mt-1">{fieldErrors.sl_toi_da}</p>}
          </div>

          {/* Actions */}
          <div className="col-span-2 flex items-center justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={() => window.history.back()} 
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={submitting || Object.keys(validate()).length > 0}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? 'Đang tạo...' : 'Tạo hoạt động'}
            </button>
          </div>
        </form>
      </div>
    </ClassManagementLayout>
  );
}
