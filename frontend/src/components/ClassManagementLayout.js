import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function ClassManagementLayout({ children, role = 'lop_truong' }) {
  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-50' },
    [
      React.createElement(Header, { key: 'header' }),
      React.createElement('div', { key: 'body', className: 'flex' }, [
        React.createElement(Sidebar, { key: 'sidebar', role: role }),
        React.createElement('main', { key: 'main', className: 'flex-1 p-6' }, [
          children
        ])
      ])
    ]
  );
}
