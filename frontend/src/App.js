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
import AdminRoles from './pages/admin/AdminRoles';
import AdminActivityTypes from './pages/admin/AdminActivityTypes';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminReports from './pages/admin/AdminReports';
import ManageActivity from './pages/ManageActivity';
import AdminActivities from './pages/admin/AdminActivities';
import AdminActivityDetail from './pages/admin/AdminActivityDetail';
import ActivityDetail from './pages/student/ActivityDetail';
import QRScanner from './pages/QRScanner';
import QRAttendanceManagement from './pages/QRAttendanceManagement';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ActivityApproval from './pages/teacher/ActivityApproval';
import ActivityTypeManagement from './pages/teacher/ActivityTypeManagement';
import StudentManagementAndReports from './pages/teacher/StudentManagementAndReports';
import MonitorDashboard from './pages/monitor/MonitorDashboard';
import ClassActivities from './pages/monitor/ClassActivities';
import ClassApprovals from './pages/monitor/ClassApprovals';
import ClassStudents from './pages/monitor/ClassStudents';
import ClassReports from './pages/monitor/ClassReports';
import ClassNotifications from './pages/monitor/ClassNotifications';
import { useAppStore } from './store/useAppStore';
import { NotificationProvider } from './contexts/NotificationContext';

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
function MonitorHome() { return React.createElement(Dashboard, null); }
function AdminHome() { return React.createElement(AdminDashboard, null); }

function HomeRouter() {
  const role = useAppStore(function(s){ return s.role; });
  const r = (role || '').toUpperCase();
  
  // Redirect to specific dashboard based on role
  if (r === 'ADMIN') return React.createElement(Navigate, { to: '/admin', replace: true });
  if (r === 'GIANG_VIEN') return React.createElement(Navigate, { to: '/teacher', replace: true });
  if (r === 'LOP_TRUONG') return React.createElement(Navigate, { to: '/monitor', replace: true });
  
  // Mặc định sinh viên - show dashboard directly
  return React.createElement(StudentHome);
}

function App() {
  return React.createElement(
    NotificationProvider,
    null,
    React.createElement(
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
          React.createElement(Route, { key: 'admin-roles', path: '/admin/roles', element: React.createElement(RoleGuard, { allow: ['ADMIN'], element: React.createElement(AdminRoles) }) }),
          React.createElement(Route, { key: 'admin-activities', path: '/admin/activities', element: React.createElement(RoleGuard, { allow: ['ADMIN'], element: React.createElement(AdminActivities) }) }),
          React.createElement(Route, { key: 'admin-activity-types', path: '/admin/activity-types', element: React.createElement(RoleGuard, { allow: ['ADMIN'], element: React.createElement(AdminActivityTypes) }) }),
          React.createElement(Route, { key: 'admin-activity-create', path: '/admin/activities/create', element: React.createElement(RoleGuard, { allow: ['ADMIN'], element: React.createElement(ManageActivity) }) }),
          React.createElement(Route, { key: 'admin-activity-edit', path: '/admin/activities/:id/edit', element: React.createElement(RoleGuard, { allow: ['ADMIN'], element: React.createElement(ManageActivity) }) }),
          React.createElement(Route, { key: 'admin-activity-detail', path: '/admin/activities/:id', element: React.createElement(RoleGuard, { allow: ['ADMIN'], element: React.createElement(AdminActivityDetail) }) }),
          React.createElement(Route, { key: 'admin-approvals', path: '/admin/approvals', element: React.createElement(RoleGuard, { allow: ['ADMIN'], element: React.createElement(AdminApprovals) }) }),
          React.createElement(Route, { key: 'admin-reports', path: '/admin/reports', element: React.createElement(RoleGuard, { allow: ['ADMIN'], element: React.createElement(AdminReports) }) }),
          React.createElement(Route, { key: 'admin-users-profile', path: '/admin/users/profile', element: React.createElement(RoleGuard, { allow: ['ADMIN'], element: React.createElement(AdminUserProfile) }) }),
          React.createElement(Route, { key: 'admin-users-points', path: '/admin/users/points', element: React.createElement(RoleGuard, { allow: ['ADMIN'], element: React.createElement(AdminUserPoints) }) }),
    React.createElement(Route, { key: 'teacher', path: '/teacher', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','ADMIN'], element: React.createElement(TeacherHome) }) }),
    React.createElement(Route, { key: 'teacher-approve', path: '/teacher/approve', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','ADMIN'], element: React.createElement(ActivityApproval) }) }),
    React.createElement(Route, { key: 'teacher-activity-types', path: '/teacher/activity-types', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','ADMIN'], element: React.createElement(ActivityTypeManagement) }) }),
    React.createElement(Route, { key: 'teacher-students', path: '/teacher/students', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','ADMIN'], element: React.createElement(StudentManagementAndReports) }) }),
    // Removed legacy teacher routes for activity types and students
    React.createElement(Route, { key: 'create-activity', path: '/activities/create', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','LOP_TRUONG','ADMIN'], element: React.createElement(ManageActivity) }) }),
    React.createElement(Route, { key: 'edit-activity', path: '/activities/edit/:id', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','LOP_TRUONG','ADMIN'], element: React.createElement(ManageActivity) }) }),
    React.createElement(Route, { key: 'activity-detail', path: '/activities/:id', element: React.createElement(RoleGuard, { allow: [], element: React.createElement(ActivityDetail) }) }),
    React.createElement(Route, { key: 'qr-scanner', path: '/qr-scanner', element: React.createElement(RoleGuard, { allow: [], element: React.createElement(QRScanner) }) }),
    React.createElement(Route, { key: 'qr-management', path: '/qr-management', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','LOP_TRUONG','ADMIN'], element: React.createElement(QRAttendanceManagement) }) }),
          React.createElement(Route, { key: 'monitor', path: '/monitor/*', element: React.createElement(RoleGuard, { allow: ['LOP_TRUONG','GIANG_VIEN','ADMIN'], element: React.createElement(Dashboard) }) }),
          React.createElement(Route, { key: 'class-activities', path: '/class/activities/*', element: React.createElement(RoleGuard, { allow: ['LOP_TRUONG','GIANG_VIEN','ADMIN'], element: React.createElement(Dashboard) }) }),
          React.createElement(Route, { key: 'class-approvals', path: '/class/approvals/*', element: React.createElement(RoleGuard, { allow: ['LOP_TRUONG','GIANG_VIEN','ADMIN'], element: React.createElement(Dashboard) }) }),
          React.createElement(Route, { key: 'class-students', path: '/class/students/*', element: React.createElement(RoleGuard, { allow: ['LOP_TRUONG','GIANG_VIEN','ADMIN'], element: React.createElement(Dashboard) }) }),
          React.createElement(Route, { key: 'class-reports', path: '/class/reports/*', element: React.createElement(RoleGuard, { allow: ['LOP_TRUONG','GIANG_VIEN','ADMIN'], element: React.createElement(Dashboard) }) }),
          React.createElement(Route, { key: 'class-notifications', path: '/class/notifications/*', element: React.createElement(RoleGuard, { allow: ['LOP_TRUONG','GIANG_VIEN','ADMIN'], element: React.createElement(Dashboard) }) }),
          React.createElement(Route, { key: 'student', path: '/student', element: React.createElement(RoleGuard, { allow: ['SINH_VIEN','STUDENT','LOP_TRUONG','GIANG_VIEN','ADMIN'], element: React.createElement(StudentHome) }) }),
          // Main router should catch all remaining paths to allow nested <Routes> inside layout components
          React.createElement(Route, { key: 'router-catchall', path: '*', element: React.createElement(RoleGuard, { allow: [], element: React.createElement(HomeRouter) }) })
        ]
      )
    )
  );
}

export default App;
