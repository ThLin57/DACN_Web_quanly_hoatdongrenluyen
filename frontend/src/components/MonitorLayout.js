import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MonitorLayout({ children }) {
  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-50' },
    [
      React.createElement(Header, { key: 'hdr' }),
      React.createElement('div', { key: 'body', className: 'flex' }, [
        React.createElement(Sidebar, { key: 'sb' }),
        React.createElement('main', { key: 'main', className: 'flex-1 p-6' }, children)
      ])
    ]
  );
} 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MonitorLayout({ children }) {
  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-50' },
    [
      React.createElement(Header, { key: 'hdr' }),
      React.createElement('div', { key: 'body', className: 'flex' }, [
        React.createElement(Sidebar, { key: 'sb' }),
        React.createElement('main', { key: 'main', className: 'flex-1 p-6' }, children)
      ])
    ]
  );
}