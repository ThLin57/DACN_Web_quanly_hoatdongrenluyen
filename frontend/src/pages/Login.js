import React from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { http } from '../services/http';

export default function Login() {
  const [formData, setFormData] = React.useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [demoAccounts, setDemoAccounts] = React.useState([]);

  React.useEffect(function loadDemo() {
    let mounted = true;
    http
      .get('/auth/demo-accounts')
      .then(function (res) {
        if (!mounted) return;
        var payload = res.data?.data || [];
        setDemoAccounts(payload);
      })
      .catch(function () {})
      .finally(function () {});
    return function cleanup() {
      mounted = false;
    };
  }, []);

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
      var res = await http.post('/auth/login', { maso: formData.username, password: formData.password });
      var data = res.data?.data || res.data;
      var token = data?.token || data?.data?.token;
      if (token) {
        window.localStorage.setItem('token', token);
        window.location.href = '/';
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

  async function loginWithDemo(username, password) {
    setErrors({});
    setIsLoading(true);
    setFormData({ username: username || '', password: password || '' });
    try {
      var res = await http.post('/auth/login', { maso: username, password: password });
      var data = res.data?.data || res.data;
      var token = data?.token || data?.data?.token;
      if (token) {
        window.localStorage.setItem('token', token);
        window.location.href = '/';
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

  function EyeIcon(props) {
    return React.createElement(
      'svg',
      Object.assign({ className: 'h-5 w-5 text-gray-400', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, props),
      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' }),
      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' })
    );
  }

  function EyeSlashIcon(props) {
    return React.createElement(
      'svg',
      Object.assign({ className: 'h-5 w-5 text-gray-400', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, props),
      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M3 3l18 18' }),
      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M10.584 10.587A3 3 0 0012 15a3 3 0 002.829-4.058M9.88 9.88C9.341 10.42 9 11.17 9 12a3 3 0 003 3c.83 0 1.58-.34 2.12-.88M6.1 6.1C4.25 7.28 2.83 8.98 2.458 12 3.732 16.057 7.523 19 12 19c1.54 0 3-.31 4.29-.87' })
    );
  }

  const emailField = React.createElement(
    'div',
    null,
    [
      React.createElement('label', { key: 'l', htmlFor: 'username', className: 'block text-sm font-medium text-gray-700' }, 'Tên đăng nhập hoặc Email'),
      React.createElement(
        'div',
        { key: 'w', className: 'mt-1' },
        [
          React.createElement('input', {
            key: 'i',
            id: 'username',
            name: 'username',
            type: 'text',
            autoComplete: 'username',
            value: formData.username || '',
            onChange: handleInputChange,
            className:
              'appearance-none relative block w-full px-3 py-2 border ' +
              (errors.username ? 'border-red-300' : 'border-gray-300') +
              ' placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm',
            placeholder: 'Nhập tên đăng nhập hoặc email',
          }),
          errors.username
            ? React.createElement('p', { key: 'e', className: 'mt-1 text-sm text-red-600' }, errors.username)
            : null,
        ]
      ),
    ]
  );

  const passwordField = React.createElement(
    'div',
    null,
    [
      React.createElement('label', { key: 'l', htmlFor: 'password', className: 'block text-sm font-medium text-gray-700' }, 'Mật khẩu'),
      React.createElement(
        'div',
        { key: 'w', className: 'mt-1 relative' },
        [
          React.createElement('input', {
            key: 'i',
            id: 'password',
            name: 'password',
            type: showPassword ? 'text' : 'password',
            autoComplete: 'current-password',
            value: formData.password || '',
            onChange: handleInputChange,
            className:
              'appearance-none relative block w-full px-3 py-2 pr-10 border ' +
              (errors.password ? 'border-red-300' : 'border-gray-300') +
              ' placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm',
            placeholder: 'Nhập mật khẩu',
          }),
          React.createElement(
            'button',
            { key: 'btn', type: 'button', className: 'absolute inset-y-0 right-0 pr-3 flex items-center', onClick: function onClick() { setShowPassword(!showPassword); } },
            showPassword ? React.createElement(EyeSlashIcon) : React.createElement(EyeIcon)
          ),
          errors.password
            ? React.createElement('p', { key: 'e', className: 'mt-1 text-sm text-red-600' }, errors.password)
            : null,
        ]
      ),
    ]
  );

  const rememberForgot = React.createElement(
    'div',
    { className: 'flex items-center justify-between' },
    [
      React.createElement(
        'div',
        { key: 'remember', className: 'flex items-center' },
        [
          React.createElement('input', { key: 'c', id: 'remember-me', name: 'remember-me', type: 'checkbox', className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded' }),
          React.createElement('label', { key: 'cl', htmlFor: 'remember-me', className: 'ml-2 block text-sm text-gray-900' }, 'Ghi nhớ đăng nhập'),
        ]
      ),
      React.createElement('a', { key: 'forgot', href: '/forgot-password', className: 'text-sm font-medium text-blue-600 hover:text-blue-500' }, 'Quên mật khẩu?'),
    ]
  );

  const submitError = errors.submit
    ? React.createElement(
        'div',
        { className: 'rounded-md bg-red-50 p-4' },
        React.createElement('div', { className: 'text-sm text-red-700' }, errors.submit)
      )
    : null;

  const submitButton = React.createElement(
    'button',
    {
      type: 'submit',
      disabled: isLoading,
      className:
        'group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ' +
        (isLoading
          ? 'bg-blue-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'),
    },
    isLoading
      ? React.createElement(
          'div',
          { className: 'flex items-center' },
          [
            React.createElement(
              'svg',
              { key: 'spin', className: 'animate-spin -ml-1 mr-3 h-5 w-5 text-white', xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24' },
              [
                React.createElement('circle', { key: 'c', className: 'opacity-25', cx: '12', cy: '12', r: '10', stroke: 'currentColor', strokeWidth: '4' }),
                React.createElement('path', { key: 'p', className: 'opacity-75', fill: 'currentColor', d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' }),
              ]
            ),
            'Đang đăng nhập...',
          ]
        )
      : 'Đăng nhập'
  );

  // Left: Form per requested design
  const leftForm = React.createElement(
    'div',
    { className: 'flex-1 w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-16' },
    React.createElement(
      'div',
      { className: 'w-full max-w-md' },
      [
        React.createElement(
          'div',
          { key: 'hdr', className: 'mb-8 text-center md:text-left' },
          [
            React.createElement('h1', { key: 'h1', className: 'text-3xl font-bold text-gray-900 mb-2' }, 'Đăng nhập'),
            React.createElement('p', { key: 'p', className: 'text-gray-600' }, 'Chào mừng trở lại! Vui lòng đăng nhập vào tài khoản của bạn.'),
          ]
        ),
        React.createElement(
          'form',
          { key: 'form', className: 'space-y-6', onSubmit: handleSubmit },
          [
            // Username/email
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
                      key: 'i',
                      id: 'username',
                      type: 'text',
                      value: formData.username || '',
                      onChange: function onChange(e) { handleInputChange(e); },
                      name: 'username',
                      className: 'w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors',
                      placeholder: 'Nhập tên đăng nhập hoặc email',
                      required: true,
                    }),
                  ]
                ),
              ]
            ),
            // Password
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
                      key: 'i',
                      id: 'password',
                      type: showPassword ? 'text' : 'password',
                      value: formData.password || '',
                      onChange: function onChange(e) { handleInputChange(e); },
                      name: 'password',
                      className: 'w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors',
                      placeholder: 'Nhập mật khẩu',
                      required: true,
                    }),
                    React.createElement(
                      'button',
                      { key: 'btn', type: 'button', onClick: function onClick() { setShowPassword(!showPassword); }, className: 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors' },
                      showPassword ? React.createElement(EyeOff, { className: 'h-5 w-5' }) : React.createElement(Eye, { className: 'h-5 w-5' })
                    ),
                  ]
                ),
              ]
            ),
            // Submit error
            submitError,
            // Submit
            React.createElement(
              'button',
              { key: 'submit', type: 'submit', className: 'w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors', disabled: isLoading },
              'Đăng nhập'
            ),
            // Links
            React.createElement(
              'div',
              { key: 'links', className: 'text-center space-y-3' },
              [
                React.createElement('a', { key: 'forgot', href: '#forgot-password', className: 'text-sm text-blue-600 hover:text-blue-800 transition-colors' }, 'Quên mật khẩu?'),
                React.createElement(
                  'div',
                  { key: 'signup', className: 'text-gray-600 text-sm' },
                  ['Chưa có tài khoản? ', React.createElement('a', { key: 'a', href: '/register', className: 'text-blue-600 hover:text-blue-800 font-semibold transition-colors' }, 'Đăng ký')]
                ),
              ]
            ),
          ]
        ),
      ]
    )
  );

  // Right: Logo + demo info
  const rightPanel = React.createElement(
    'div',
    { className: 'flex-1 w-full md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 md:p-12 lg:p-16 flex flex-col justify-center items-center overflow-hidden' },
    React.createElement(
      'div',
      { className: 'text-center max-w-md' },
      [
        React.createElement(
          'div',
          { key: 'logo', className: 'mb-8' },
          React.createElement('img', {
            src: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/a409cac8-3a40-4097-9461-db92841b1a22.png',
            alt: 'Logo của ứng dụng với thiết kế hiện đại và màu sắc tươi sáng',
            className: 'mx-auto w-24 h-24 rounded-xl shadow-lg object-cover',
          })
        ),
        React.createElement(
          'div',
          { key: 'demo', className: 'bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg overflow-auto max-h-full w-full' },
          [
            React.createElement('h2', { key: 'title', className: 'text-xl font-semibold mb-4' }, 'Tài khoản Demo'),
            React.createElement(
              'ul',
              { key: 'list', className: 'space-y-2 text-sm' },
              (demoAccounts.length > 0 ? demoAccounts : []).map(function(acc, idx){
                return React.createElement(
                  'li',
                  { key: acc.username || String(idx), className: 'rounded-md bg-white/15 px-4 py-3 flex items-center justify-between' },
                  [
                    React.createElement('div', { key: 'info' }, [
                      React.createElement('div', { key: 'u', className: 'font-mono' }, acc.username + (acc.email ? ' • ' + acc.email : '')),
                      React.createElement('div', { key: 'p', className: 'text-blue-100' }, 'Pass: ' + (acc.password || '***')),
                    ]),
                    React.createElement('button', {
                      key: 'use',
                      type: 'button',
                      className: 'text-xs px-3 py-1 rounded-md bg-white text-blue-700 hover:bg-gray-100',
                      onClick: function onClick(){ loginWithDemo(acc.username, acc.password || ''); },
                    }, 'Dùng')
                  ]
                );
              })
            ),
          ]
        ),
        React.createElement(
          'div',
          { key: 'more', className: 'mt-8 text-blue-100' },
          [
            React.createElement('h3', { key: 'h', className: 'font-semibold mb-2' }, 'Tính năng nổi bật'),
            React.createElement('ul', { key: 'ul', className: 'text-sm space-y-1' }, [
              React.createElement('li', { key: '1' }, '• Quản lý dữ liệu thông minh'),
              React.createElement('li', { key: '2' }, '• Giao diện thân thiện người dùng'),
              React.createElement('li', { key: '3' }, '• Bảo mật cao'),
            ]),
          ]
        ),
      ]
    )
  );

  return React.createElement('div', { className: 'min-h-screen w-full bg-gray-50 flex flex-col md:flex-row items-stretch' }, [leftForm, rightPanel]);
}


