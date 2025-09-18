import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import UserProfile from './pages/profile/UserProfile';
import StudentPoints from './pages/profile/StudentPoints';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminUserProfile from './pages/admin/AdminUserProfile';
import AdminUserPoints from './pages/admin/AdminUserPoints';
import ManageActivity from './pages/ManageActivity';
import ActivityDetail from './pages/student/ActivityDetail';
import QRScanner from './pages/QRScanner';
import QRAttendanceManagement from './pages/QRAttendanceManagement';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import MonitorDashboard from './pages/monitor/MonitorDashboard';
import ClassActivities from './pages/monitor/ClassActivities';
import ClassApprovals from './pages/monitor/ClassApprovals';
import ClassStudents from './pages/monitor/ClassStudents';
import ClassReports from './pages/monitor/ClassReports';
import ClassNotifications from './pages/monitor/ClassNotifications';
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
        React.createElement(Route, { key: 'user-profile', path: '/profile/user', element: React.createElement(RoleGuard, { allow: [], element: React.createElement(UserProfile) }) }),
        React.createElement(Route, { key: 'student-points', path: '/profile/points', element: React.createElement(RoleGuard, { allow: ['SINH_VIEN','STUDENT','LOP_TRUONG','GIANG_VIEN','ADMIN'], element: React.createElement(StudentPoints) }) }),
        React.createElement(Route, { key: 'admin', path: '/admin', element: React.createElement(RoleGuard, { allow: ['ADMIN'], element: React.createElement(AdminHome) }) }),
        React.createElement(Route, { key: 'admin-users', path: '/admin/users', element: React.createElement(RoleGuard, { allow: ['ADMIN'], element: React.createElement(UserManagement) }) }),
        React.createElement(Route, { key: 'admin-users-profile', path: '/admin/users/profile', element: React.createElement(RoleGuard, { allow: ['ADMIN'], element: React.createElement(AdminUserProfile) }) }),
        React.createElement(Route, { key: 'admin-users-points', path: '/admin/users/points', element: React.createElement(RoleGuard, { allow: ['ADMIN'], element: React.createElement(AdminUserPoints) }) }),
  React.createElement(Route, { key: 'teacher', path: '/teacher', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','ADMIN'], element: React.createElement(TeacherHome) }) }),
  React.createElement(Route, { key: 'create-activity', path: '/activities/create', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','LOP_TRUONG','ADMIN'], element: React.createElement(ManageActivity) }) }),
  React.createElement(Route, { key: 'edit-activity', path: '/activities/edit/:id', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','LOP_TRUONG','ADMIN'], element: React.createElement(ManageActivity) }) }),
  React.createElement(Route, { key: 'activity-detail', path: '/activities/:id', element: React.createElement(RoleGuard, { allow: [], element: React.createElement(ActivityDetail) }) }),
  React.createElement(Route, { key: 'qr-scanner', path: '/qr-scanner', element: React.createElement(RoleGuard, { allow: [], element: React.createElement(QRScanner) }) }),
  React.createElement(Route, { key: 'qr-management', path: '/qr-management', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','LOP_TRUONG','ADMIN'], element: React.createElement(QRAttendanceManagement) }) }),
        React.createElement(Route, { key: 'monitor', path: '/monitor', element: React.createElement(Navigate, { to: '/', replace: true }) }),
        React.createElement(Route, { key: 'class-activities', path: '/class/activities', element: React.createElement(RoleGuard, { allow: ['LOP_TRUONG','ADMIN'], element: React.createElement(ClassActivities) }) }),
        React.createElement(Route, { key: 'class-approvals', path: '/class/approvals', element: React.createElement(RoleGuard, { allow: ['LOP_TRUONG','ADMIN'], element: React.createElement(ClassApprovals) }) }),
        React.createElement(Route, { key: 'class-students', path: '/class/students', element: React.createElement(RoleGuard, { allow: ['LOP_TRUONG','ADMIN'], element: React.createElement(ClassStudents) }) }),
        React.createElement(Route, { key: 'class-reports', path: '/class/reports', element: React.createElement(RoleGuard, { allow: ['LOP_TRUONG','ADMIN'], element: React.createElement(ClassReports) }) }),
        React.createElement(Route, { key: 'class-notifications', path: '/class/notifications', element: React.createElement(RoleGuard, { allow: ['LOP_TRUONG','ADMIN'], element: React.createElement(ClassNotifications) }) }),
        React.createElement(Route, { key: 'student', path: '/student', element: React.createElement(RoleGuard, { allow: ['SINH_VIEN','STUDENT','LOP_TRUONG','GIANG_VIEN','ADMIN'], element: React.createElement(StudentHome) }) }),
        // Student routes - nested under Dashboard
        React.createElement(Route, { key: 'dashboard', path: '/*', element: React.createElement(RoleGuard, { allow: [], element: React.createElement(Dashboard) }) }),
        React.createElement(Route, { key: 'catchall', path: '*', element: React.createElement(Navigate, { to: '/', replace: true }) })
      ]
    )
  );
}

export default App;
