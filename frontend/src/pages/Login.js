import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import http from '../services/http';
import { useAppStore } from '../store/useAppStore';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAppStore(function(s){ return s.setAuth; });
  const [formData, setFormData] = React.useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [demoAccounts] = React.useState([]); // Không dùng demo

  function handleInputChange(e) {
    const name = e.target.name;
    const value = e.target.value;
    setFormData(function update(prev) {
      return Object.assign({}, prev, { [name]: value });
    });
    if (errors[name]) {
      setErrors(function clear(prev) {
        var next = Object.assign({}, prev);
        delete next[name];
        return next;
      });
    }
  }

  function validateForm() {
    var newErrors = {};
    if (!formData.username) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập hoặc email';
    }
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      var res = await http.post('/auth/login', { maso: String(formData.username || '').trim().toLowerCase(), password: formData.password });
      var data = res.data?.data || res.data;
      var token = data?.token || data?.data?.token;
      if (token) {
        var user = data?.user || null;
        try { setAuth({ token, user }); } catch(_) {}
        window.localStorage.setItem('token', token);
        try { if (user) window.localStorage.setItem('user', JSON.stringify(user)); } catch (_) {}
        var role = (user?.role || '').toString().toUpperCase();
        var target = '/';
        if (role === 'ADMIN') target = '/admin';
        else if (role === 'GIANG_VIEN') target = '/teacher';
        else if (role === 'LOP_TRUONG') target = '/monitor';
        else if (role === 'SINH_VIEN' || role === 'STUDENT') target = '/student';
        navigate(target);
      } else {
        setErrors({ submit: 'Đăng nhập thất bại' });
      }
    } catch (err) {
      var message = err?.response?.data?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra thông tin.';
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  }

  const submitError = errors.submit
    ? React.createElement(
        'div',
        { className: 'rounded-md bg-red-50 p-4' },
        React.createElement('div', { className: 'text-sm text-red-700' }, errors.submit)
      )
    : null;

  return React.createElement(
    'div',
    { className: 'min-h-screen w-full bg-gray-50 flex items-center justify-center p-6 md:p-12' },
    React.createElement(
      'div',
      { className: 'w-full max-w-md bg-white rounded-xl shadow p-8' },
      [
        React.createElement('h1', { key: 'h1', className: 'text-2xl font-bold text-gray-900 mb-6 text-center' }, 'Đăng nhập'),
        React.createElement(
          'form',
          { key: 'form', className: 'space-y-6', onSubmit: handleSubmit },
          [
            React.createElement(
              'div',
              { key: 'user' },
              [
                React.createElement('label', { key: 'l', htmlFor: 'username', className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Tên đăng nhập hoặc Email'),
                React.createElement(
                  'div',
                  { key: 'wrap', className: 'relative' },
                  [
                    React.createElement(Mail, { key: 'icon', className: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' }),
                    React.createElement('input', {
                      key: 'i', id: 'username', type: 'text', value: formData.username || '', onChange: function onChange(e){ handleInputChange(e); }, name: 'username',
                      className: 'w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors',
                      placeholder: 'Nhập tên đăng nhập hoặc email', required: true,
                    }),
                  ]
                ),
              ]
            ),
            React.createElement(
              'div',
              { key: 'pass' },
              [
                React.createElement('label', { key: 'l', htmlFor: 'password', className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Mật khẩu'),
                React.createElement(
                  'div',
                  { key: 'wrap', className: 'relative' },
                  [
                    React.createElement(Lock, { key: 'icon', className: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' }),
                    React.createElement('input', {
                      key: 'i', id: 'password', type: showPassword ? 'text' : 'password', value: formData.password || '', onChange: function onChange(e){ handleInputChange(e); }, name: 'password',
                      className: 'w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors',
                      placeholder: 'Nhập mật khẩu', required: true,
                    }),
                    React.createElement(
                      'button',
                      { key: 'btn', type: 'button', onClick: function onClick(){ setShowPassword(!showPassword); }, className: 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors' },
                      showPassword ? React.createElement(EyeOff, { className: 'h-5 w-5' }) : React.createElement(Eye, { className: 'h-5 w-5' })
                    ),
                  ]
                ),
              ]
            ),
            submitError,
            React.createElement('button', { key: 'submit', type: 'submit', className: 'w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors', disabled: isLoading }, 'Đăng nhập'),
          ]
        )
      ]
    )
  );
}


