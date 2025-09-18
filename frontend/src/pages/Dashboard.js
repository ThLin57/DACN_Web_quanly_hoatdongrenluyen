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
import ManageActivity from './ManageActivity';
import QRScanner from './QRScanner';
import QRAttendanceManagement from './QRAttendanceManagement';
import { Routes, Route, Navigate } from 'react-router-dom';
import http from '../services/http';

export default function Dashboard() {
  const [profile, setProfile] = React.useState(null);

  React.useEffect(function load(){
    let mounted = true;
    http.get('/auth/profile').then(function(res){ if(!mounted) return; setProfile(res.data?.data || null); }).catch(function(){});
    return function(){ mounted = false; };
  }, []);

  const role = (profile?.role || profile?.vai_tro?.ten_vt || 'student').toLowerCase();
  
  // Debug info for troubleshooting
  console.log('Dashboard Debug:', { profile, role });

  // Determine default dashboard based on role
  const getDefaultDashboard = () => {
    if (role === 'lop_truong' || role === 'monitor') {
      return React.createElement(MonitorDashboard);
    }
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
          React.createElement(Routes, { key: 'r' }, [
            React.createElement(Route, { key: 'root', path: '/', element: getDefaultDashboard() }),
            // Student routes
            React.createElement(Route, { key: 'activities', path: '/activities', element: React.createElement(ActivitiesList) }),
            React.createElement(Route, { key: 'my', path: '/my-activities', element: React.createElement(MyActivities) }),
            React.createElement(Route, { key: 'scores', path: '/scores', element: React.createElement(Scores) }),
            React.createElement(Route, { key: 'qr-scanner', path: '/qr-scanner', element: React.createElement(QRScanner) }),
            // Monitor/Class management routes
            React.createElement(Route, { key: 'create-activity', path: '/activities/create', element: React.createElement(ManageActivity) }),
            React.createElement(Route, { key: 'qr-management', path: '/qr-management', element: React.createElement(QRAttendanceManagement) }),
            React.createElement(Route, { key: 'class-activities', path: '/class/activities', element: React.createElement(ClassActivities) }),
            React.createElement(Route, { key: 'class-approvals', path: '/class/approvals', element: React.createElement(ClassApprovals) }),
            React.createElement(Route, { key: 'class-students', path: '/class/students', element: React.createElement(ClassStudents) }),
            React.createElement(Route, { key: 'class-reports', path: '/class/reports', element: React.createElement(ClassReports) }),
            React.createElement(Route, { key: 'fallback', path: '*', element: getDefaultDashboard() })
          ])
        ])
      ])
    ]
  );
}


