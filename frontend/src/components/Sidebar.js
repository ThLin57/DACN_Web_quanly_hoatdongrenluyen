import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

function MenuItem(props) {
  const { to, icon, label, badge, active } = props;
  return React.createElement(
    Link,
    { to: to, replace: false, onClick: function onClick(){ try{ console.log('Sidebar click navigate', { to, label }); }catch(_){} }, className: 'group relative flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ' + (active ? 'bg-gray-100 text-gray-900' : 'text-gray-700') },
    [
      // Indicator bar (active/hover)
      React.createElement('span', { key: 'i', className: 'absolute left-0 top-0 h-full w-1 rounded-r transition-all duration-200 ' + (active ? 'bg-purple-600 opacity-100' : 'bg-purple-600 opacity-0 group-hover:opacity-50') }),
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
  const storeRole = useAppStore(function(s){ return s.role; });
  const roleProp = (props && props.role) || null;
  const role = (roleProp || storeRole || '').toString().toLowerCase(); // 'student' | 'monitor' | 'teacher' | 'admin'
  const location = useLocation();
  const path = location.pathname;
  const roleUpper = (role || '').toUpperCase();
  
  // Debug info for troubleshooting
  console.log('Sidebar Debug:', { role, storeRole, roleProp, path });
  
  // State for monitor mode toggle
  const [monitorMode, setMonitorMode] = React.useState(
    path.startsWith('/class/') || path === '/monitor' || localStorage.getItem('monitorMode') === 'true'
  );

  React.useEffect(() => {
    localStorage.setItem('monitorMode', monitorMode.toString());
  }, [monitorMode]);

  function isActive(href){ return path === href; }

  const studentMenu = [
    React.createElement(MenuItem, { key: 'dash', to: '/', label: 'Dashboard', active: isActive('/') }),
    React.createElement(MenuItem, { key: 'activities', to: '/activities', label: 'Danh sách Hoạt động', active: path.startsWith('/activities') }),
    React.createElement(MenuItem, { key: 'my-activities', to: '/my-activities', label: 'Hoạt động của tôi', active: isActive('/my-activities') }),
    React.createElement(MenuItem, { key: 'scores', to: '/scores', label: 'Điểm rèn luyện', active: isActive('/scores') }),
    React.createElement(MenuItem, { key: 'qr-scanner', to: '/qr-scanner', label: 'QR Điểm danh', active: isActive('/qr-scanner') }),
  ];

  // Thêm nút chuyển đổi chế độ cho lớp trưởng
  const [isPersonalMode, setIsPersonalMode] = React.useState(() => {
    // Nếu đang ở trang quản lý thì false, còn lại là true
    return !path.startsWith('/class/') && !path.startsWith('/activities/create') && !path.startsWith('/qr-management');
  });

  // Removed switch-mode navigation button per request

  const monitorMenu = [
    // Menu sinh viên
    ...studentMenu,
    // Nhóm quản lý lớp
    React.createElement(Group, { key: 'class-mgmt', title: 'Quản lý Lớp', defaultOpen: !isPersonalMode }, [
      React.createElement(MenuItem, { key: 'create-activity', to: '/activities/create', label: 'Tạo Hoạt động', active: isActive('/activities/create') }),
      React.createElement(MenuItem, { key: 'qr-management', to: '/qr-management', label: 'Quản lý QR', active: isActive('/qr-management') }),
      React.createElement(MenuItem, { key: 'cm-1', to: '/class/activities', label: 'Hoạt động lớp', active: isActive('/class/activities') }),
      React.createElement(MenuItem, { key: 'cm-2', to: '/class/approvals', label: 'Phê duyệt đăng ký', active: isActive('/class/approvals') }),
      React.createElement(MenuItem, { key: 'cm-3', to: '/class/students', label: 'Quản lý Sinh viên', active: isActive('/class/students') }),
      React.createElement(MenuItem, { key: 'cm-4', to: '/class/reports', label: 'Báo cáo & Thống kê', active: isActive('/class/reports') }),
      React.createElement(MenuItem, { key: 'cm-5', to: '/class/notifications', label: 'Thông báo', active: isActive('/class/notifications') }),
    ])
  ];

  const teacherMenu = [
    // Menu giảng viên - các mục cần thiết
    React.createElement(MenuItem, { key: 'dash-teacher', to: '/teacher', label: 'Dashboard', active: isActive('/teacher') || (isActive('/') && roleUpper === 'GIANG_VIEN') }),
    React.createElement(MenuItem, { key: 'activities-teacher', to: '/activities', label: 'Danh sách Hoạt động', active: path.startsWith('/activities') && !path.startsWith('/activities/create') }),
    React.createElement(MenuItem, { key: 'approve-activities-teacher', to: '/teacher/approve', label: 'Phê duyệt Hoạt động', active: isActive('/teacher/approve') }),
    React.createElement(MenuItem, { key: 'manage-activity-types-teacher', to: '/teacher/activity-types', label: 'Quản lý Loại HĐ', active: isActive('/teacher/activity-types') }),
    React.createElement(MenuItem, { key: 'manage-students-reports-teacher', to: '/teacher/students', label: 'QL Sinh viên & BC', active: isActive('/teacher/students') })
  ];

  const adminMenu = [
    React.createElement(MenuItem, { key: 'sys-dashboard', to: '/admin', label: 'Dashboard Hệ thống', active: isActive('/admin') }),
    React.createElement(MenuItem, { key: 'users', to: '/admin/users', label: 'Quản lý Tài khoản', active: isActive('/admin/users') }),
    React.createElement(MenuItem, { key: 'qr-management-admin', to: '/qr-management', label: 'Quản lý QR Điểm danh', active: isActive('/qr-management') }),
    React.createElement(MenuItem, { key: 'all-activities', to: '/admin/activities', label: 'Quản lý Hoạt động', active: isActive('/admin/activities') }),
    React.createElement(MenuItem, { key: 'approvals', to: '/admin/approvals', label: 'Phê duyệt Đăng ký', active: isActive('/admin/approvals') }),
    React.createElement(MenuItem, { key: 'reports', to: '/admin/reports', label: 'Báo cáo - Thống kê', active: isActive('/admin/reports') }),
    React.createElement(Group, { key: 'system', title: 'Quản lý Hệ thống', defaultOpen: true }, [
      React.createElement(MenuItem, { key: 'roles', to: '/admin/roles', label: 'Quản lý Vai trò', active: isActive('/admin/roles') }),
      React.createElement(MenuItem, { key: 'types', to: '/admin/activity-types', label: 'Quản lý Loại hoạt động', active: isActive('/admin/activity-types') }),
      React.createElement(MenuItem, { key: 'notifications', to: '/admin/notifications', label: 'Quản lý Thông báo', active: isActive('/admin/notifications') }),
      React.createElement(MenuItem, { key: 'settings', to: '/admin/settings', label: 'Cấu hình Hệ thống', active: isActive('/admin/settings') }),
    ])
  ];

  let items = studentMenu;
  // Check for monitor role with various possible values (case-insensitive)
  // Show monitor menu only for monitor roles or explicit /monitor path
  if (roleUpper === 'MONITOR' || roleUpper === 'LOP_TRUONG' || roleUpper === 'CLASS_MONITOR' || path === '/monitor' || path.startsWith('/monitor')) {
    items = monitorMenu;
  }
  if (roleUpper === 'TEACHER' || roleUpper === 'GIANG_VIEN') items = teacherMenu;
  if (roleUpper === 'ADMIN') items = adminMenu;

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


