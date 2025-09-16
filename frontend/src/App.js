import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ManageActivity from './pages/ManageActivity';
import QRScanner from './pages/QRScanner';
import QRAttendanceManagement from './pages/QRAttendanceManagement';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import MonitorDashboard from './pages/monitor/MonitorDashboard';
import { useAppStore } from './store/useAppStore';

function RoleGuard({ allow, element }) {
  const role = useAppStore(function(s){ return s.role; });
  const token = useAppStore(function(s){ return s.token; });
  const allowSet = (allow || []).map(function(r){ return String(r).toUpperCase(); });
  const current = (role || '').toString().toUpperCase();
  if (!token && typeof window !== 'undefined') {
    // Fallback: nếu refresh trang, thử dùng token từ localStorage
    const t = window.localStorage.getItem('token');
    if (!t) return React.createElement(Navigate, { to: '/login', replace: true });
  }
  if (allowSet.length > 0 && current && allowSet.indexOf(current) === -1) {
    return React.createElement(Navigate, { to: '/', replace: true });
  }
  return element;
}

function StudentHome() { return React.createElement(Dashboard, null); }
function TeacherHome() { return React.createElement(TeacherDashboard, null); }
function MonitorHome() { return React.createElement(MonitorDashboard, null); }
function AdminHome() { return React.createElement(AdminDashboard, null); }

function HomeRouter() {
  const role = useAppStore(function(s){ return s.role; });
  const r = (role || '').toUpperCase();
  if (r === 'ADMIN') return React.createElement(AdminHome);
  if (r === 'GIANG_VIEN') return React.createElement(TeacherHome);
  if (r === 'LOP_TRUONG') return React.createElement(MonitorHome);
  // Mặc định sinh viên
  return React.createElement(StudentHome);
}

function App() {
  return React.createElement(
    BrowserRouter,
    null,
    React.createElement(
      Routes,
      null,
      [
        React.createElement(Route, { key: 'login', path: '/login', element: React.createElement(Login) }),
        React.createElement(Route, { key: 'register', path: '/register', element: React.createElement(Register) }),
        React.createElement(Route, { key: 'profile', path: '/profile', element: React.createElement(RoleGuard, { allow: [], element: React.createElement(Profile) }) }),
        React.createElement(Route, { key: 'admin', path: '/admin', element: React.createElement(RoleGuard, { allow: ['ADMIN'], element: React.createElement(AdminHome) }) }),
        React.createElement(Route, { key: 'admin-users', path: '/admin/users', element: React.createElement(RoleGuard, { allow: ['ADMIN'], element: React.createElement(UserManagement) }) }),
  React.createElement(Route, { key: 'teacher', path: '/teacher', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','ADMIN'], element: React.createElement(TeacherHome) }) }),
  React.createElement(Route, { key: 'create-activity', path: '/activities/create', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','LOP_TRUONG','ADMIN'], element: React.createElement(ManageActivity) }) }),
  React.createElement(Route, { key: 'qr-scanner', path: '/qr-scanner', element: React.createElement(RoleGuard, { allow: [], element: React.createElement(QRScanner) }) }),
  React.createElement(Route, { key: 'qr-management', path: '/qr-management', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','LOP_TRUONG','ADMIN'], element: React.createElement(QRAttendanceManagement) }) }),
        React.createElement(Route, { key: 'monitor', path: '/monitor', element: React.createElement(RoleGuard, { allow: ['LOP_TRUONG','ADMIN'], element: React.createElement(MonitorHome) }) }),
        React.createElement(Route, { key: 'student', path: '/student', element: React.createElement(RoleGuard, { allow: ['SINH_VIEN','STUDENT','LOP_TRUONG','GIANG_VIEN','ADMIN'], element: React.createElement(StudentHome) }) }),
        // Student routes - nested under Dashboard
        React.createElement(Route, { key: 'dashboard', path: '/*', element: React.createElement(RoleGuard, { allow: [], element: React.createElement(Dashboard) }) }),
        React.createElement(Route, { key: 'catchall', path: '*', element: React.createElement(Navigate, { to: '/', replace: true }) })
      ]
    )
  );
}

export default App;
