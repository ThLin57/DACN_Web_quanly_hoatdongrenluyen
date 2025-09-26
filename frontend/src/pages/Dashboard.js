import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import DashboardStudentImproved from './student/DashboardStudentImproved';
import ActivitiesList from './student/ActivitiesList';
import MyActivities from './student/MyActivities';
import Scores from './student/Scores';
import MonitorDashboard from './monitor/MonitorDashboard';
import ClassActivities from './monitor/ClassActivities';
import ClassApprovals from './monitor/ClassApprovals';
import ClassStudents from './monitor/ClassStudents';
import ClassReports from './monitor/ClassReports';
import ClassNotifications from './monitor/ClassNotifications';
import TeacherDashboard from './teacher/TeacherDashboard';
import ActivityApproval from './teacher/ActivityApproval';
import ManageActivity from './ManageActivity';
import QRScanner from './QRScanner';
import QRAttendanceManagement from './QRAttendanceManagement';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import http from '../services/http';

export default function Dashboard() {
  const [profile, setProfile] = React.useState(null);
  const location = useLocation();

  React.useEffect(function load(){
    let mounted = true;
    http.get('/auth/profile').then(function(res){ if(!mounted) return; setProfile(res.data?.data || null); }).catch(function(){});
    return function(){ mounted = false; };
  }, []);

  const role = (profile?.role || profile?.vai_tro?.ten_vt || 'student').toLowerCase();
  
  // Debug info for troubleshooting
  console.log('Dashboard Debug:', { profile, role });

  // Debug current path + role
  const path = location.pathname || '';
  console.log('Dashboard Route Debug:', { path, role });

  // If role is teacher, keep class management routes working under this layout
  if (role === 'giang_vien' || role === 'teacher') {
    const isClassSection = path.startsWith('/class/');
    const isMonitorSection = path.startsWith('/monitor');
    if (!isClassSection && !isMonitorSection && !path.startsWith('/activities')) {
      return React.createElement(Navigate, { to: '/teacher', replace: true });
    }
  }

  // Determine default dashboard based on role (student by default)
  const getDefaultDashboard = () => {
    if (role === 'lop_truong' || role === 'monitor') {
      return React.createElement(MonitorDashboard);
    }
    // Student default
    return React.createElement(DashboardStudentImproved);
  };

  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-50' },
    [
      React.createElement(Header, { key: 'hdr' }),
      React.createElement('div', { key: 'body', className: 'flex' }, [
        React.createElement(Sidebar, { key: 'sb', role: role }),
        React.createElement('main', { key: 'main', className: 'flex-1 p-6' }, [
          // Force render class-management pages directly to avoid nested route mismatches
          (path.startsWith('/class/activities') && React.createElement(ClassActivities)) ||
          (path.startsWith('/class/approvals') && React.createElement(ClassApprovals)) ||
          (path.startsWith('/class/students') && React.createElement(ClassStudents)) ||
          (path.startsWith('/class/reports') && React.createElement(ClassReports)) ||
          (path.startsWith('/class/notifications') && React.createElement(ClassNotifications)) ||
          (path.startsWith('/monitor') && React.createElement(MonitorDashboard)) ||
          // Otherwise use routes for student/common pages
          React.createElement(Routes, { key: 'r' }, [
            React.createElement(Route, { key: 'root', index: true, element: getDefaultDashboard() }),
            // Student routes (relative)
            React.createElement(Route, { key: 'activities', path: 'activities', element: React.createElement(ActivitiesList) }),
            React.createElement(Route, { key: 'my', path: 'my-activities', element: React.createElement(MyActivities) }),
            React.createElement(Route, { key: 'scores', path: 'scores', element: React.createElement(Scores) }),
            React.createElement(Route, { key: 'qr-scanner', path: 'qr-scanner', element: React.createElement(QRScanner) }),
            // Monitor tools under this layout when accessed via root
            React.createElement(Route, { key: 'create-activity', path: 'activities/create', element: React.createElement(ManageActivity) }),
            React.createElement(Route, { key: 'qr-management', path: 'qr-management', element: React.createElement(QRAttendanceManagement) }),
            // Teacher quick link if accessed here
            React.createElement(Route, { key: 'teacher-approve', path: 'teacher/approve', element: React.createElement(ActivityApproval) }),
            React.createElement(Route, { key: 'fallback', path: '*', element: getDefaultDashboard() })
          ])
        ])
      ])
    ]
  );
}


