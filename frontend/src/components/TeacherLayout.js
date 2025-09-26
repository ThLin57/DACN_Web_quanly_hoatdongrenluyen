import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function TeacherLayout({ children }) {
  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-50' },
    [
      React.createElement(Header, { key: 'header' }),
      React.createElement('div', { key: 'body', className: 'flex' }, [
        React.createElement(Sidebar, { key: 'sidebar', role: 'giang_vien' }),
        React.createElement('main', { key: 'main', className: 'flex-1 p-6' }, children)
      ])
    ]
  );
}