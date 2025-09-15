import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function MenuItem(props) {
  const { to, icon, label, badge, active } = props;
  return React.createElement(
    Link,
    { to: to, className: 'flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 ' + (active ? 'bg-gray-100 text-gray-900' : 'text-gray-700') },
    [
      React.createElement('div', { key: 'l', className: 'flex items-center gap-3' }, [
        icon || React.createElement('span', { key: 'dot', className: 'w-2 h-2 rounded-full bg-gray-300' }),
        React.createElement('span', { key: 't', className: 'text-sm font-medium' }, label)
      ]),
      badge ? React.createElement('span', { key: 'b', className: 'text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 uppercase' }, badge) : null
    ]
  );
}

function Group(props) {
  const { title, children, defaultOpen } = props;
  const [open, setOpen] = React.useState(!!defaultOpen);
  return React.createElement(
    'div',
    { className: 'mt-4' },
    [
      React.createElement(
        'button',
        { key: 'h', type: 'button', onClick: function onClick(){ setOpen(!open); }, className: 'w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase' },
        [
          React.createElement('span', { key: 't' }, title),
          React.createElement('span', { key: 'c', className: 'text-gray-400' }, open ? '▾' : '▸')
        ]
      ),
      open ? React.createElement('div', { key: 'b', className: 'mt-2 space-y-1' }, children) : null
    ]
  );
}

export default function Sidebar(props) {
  const { role } = props; // 'student' | 'monitor' | 'teacher' | 'admin'
  const location = useLocation();
  const path = location.pathname;

  function isActive(href){ return path === href; }

  const studentMenu = [
    React.createElement(MenuItem, { key: 'dash', to: '/', label: 'Dashboard', active: isActive('/') }),
    React.createElement(MenuItem, { key: 'activities', to: '/activities', label: 'Danh sách Hoạt động', active: path.startsWith('/activities') }),
    React.createElement(MenuItem, { key: 'my-activities', to: '/my-activities', label: 'Hoạt động của tôi', active: isActive('/my-activities') }),
    React.createElement(MenuItem, { key: 'scores', to: '/scores', label: 'Điểm rèn luyện', active: isActive('/scores') }),
  ];

  const monitorMenu = studentMenu.concat([
    React.createElement(Group, { key: 'class-mgmt', title: 'Quản lý Lớp', defaultOpen: true }, [
      React.createElement(MenuItem, { key: 'cm-1', to: '/class/activities', label: 'Hoạt động lớp', active: isActive('/class/activities') }),
      React.createElement(MenuItem, { key: 'cm-2', to: '/class/approvals', label: 'Phê duyệt đăng ký', active: isActive('/class/approvals') }),
      React.createElement(MenuItem, { key: 'cm-3', to: '/class/students', label: 'Quản lý Sinh viên', active: isActive('/class/students') }),
      React.createElement(MenuItem, { key: 'cm-4', to: '/class/reports', label: 'Báo cáo & Thống kê', active: isActive('/class/reports') }),
    ])
  ]);

  const teacherMenu = monitorMenu.concat([
    React.createElement(MenuItem, { key: 'approve-activities', to: '/teacher/approve', label: 'Phê duyệt Hoạt động', active: isActive('/teacher/approve') }),
    React.createElement(MenuItem, { key: 'manage-types', to: '/teacher/types', label: 'Quản lý Loại hoạt động', active: isActive('/teacher/types') }),
  ]);

  const adminMenu = [
    React.createElement(MenuItem, { key: 'sys-dashboard', to: '/admin', label: 'Dashboard Hệ thống', active: isActive('/admin') }),
    React.createElement(MenuItem, { key: 'users', to: '/admin/users', label: 'Quản lý Tài khoản', active: isActive('/admin/users') }),
    React.createElement(MenuItem, { key: 'all-activities', to: '/admin/activities', label: 'Quản lý Hoạt động', active: isActive('/admin/activities') }),
    React.createElement(Group, { key: 'system', title: 'Quản lý Hệ thống', defaultOpen: true }, [
      React.createElement(MenuItem, { key: 'roles', to: '/admin/roles', label: 'Quản lý Vai trò', active: isActive('/admin/roles') }),
      React.createElement(MenuItem, { key: 'types', to: '/admin/types', label: 'Quản lý Loại hoạt động', active: isActive('/admin/types') }),
      React.createElement(MenuItem, { key: 'notifications', to: '/admin/notifications', label: 'Quản lý Thông báo', active: isActive('/admin/notifications') }),
    ])
  ];

  let items = studentMenu;
  if (role === 'monitor' || role === 'lop_truong') items = monitorMenu;
  if (role === 'teacher' || role === 'giang_vien') items = teacherMenu;
  if (role === 'admin' || role === 'ADMIN') items = adminMenu;

  return React.createElement(
    'aside',
    { className: 'w-64 shrink-0 border-r bg-white min-h-screen sticky top-0' },
    [
      React.createElement('div', { key: 'brand', className: 'px-4 py-3 flex items-center gap-2 border-b' }, [
        React.createElement('div', { key: 'logo', className: 'w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold' }, 'TA'),
        React.createElement('div', { key: 'name', className: 'text-lg font-semibold text-gray-900' }, 'TailAdmin')
      ]),
      React.createElement('div', { key: 'menu', className: 'px-2 py-4' }, [
        React.createElement('div', { key: 'menu-title', className: 'px-2 text-xs text-gray-400 uppercase font-semibold' }, 'Menu'),
        React.createElement('div', { key: 'menu-items', className: 'mt-2 space-y-1' }, items)
      ])
    ]
  );
}


