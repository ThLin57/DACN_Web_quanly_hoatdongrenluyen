import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StudentDashboard from './dashboard/StudentDashboard';
import AdminDashboard from './dashboard/AdminDashboard';
import TeacherDashboard from './dashboard/TeacherDashboard';
import MonitorDashboard from './dashboard/MonitorDashboard';
import ActivitiesList from './student/ActivitiesList';
import MyActivities from './student/MyActivities';
import Scores from './student/Scores';
import { Routes, Route, Navigate } from 'react-router-dom';
import { http } from '../services/http';

export default function Dashboard() {
  const [profile, setProfile] = React.useState(null);

  React.useEffect(function load(){
    let mounted = true;
    http.get('/auth/profile').then(function(res){ if(!mounted) return; setProfile(res.data?.data || null); }).catch(function(){});
    return function(){ mounted = false; };
  }, []);

  const role = (profile?.role || 'student').toLowerCase();
  const roleDashboard = role === 'admin' ? AdminDashboard : role === 'teacher' ? TeacherDashboard : role === 'monitor' ? MonitorDashboard : StudentDashboard;

  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-50' },
    [
      React.createElement(Header, { key: 'hdr' }),
      React.createElement('div', { key: 'body', className: 'flex' }, [
        React.createElement(Sidebar, { key: 'sb', role: role }),
        React.createElement('main', { key: 'main', className: 'flex-1 p-6' }, [
          React.createElement(Routes, { key: 'r' }, [
            React.createElement(Route, { key: 'root', index: true, element: React.createElement(roleDashboard) }),
            React.createElement(Route, { key: 'activities', path: 'activities', element: React.createElement(ActivitiesList) }),
            React.createElement(Route, { key: 'my', path: 'my-activities', element: React.createElement(MyActivities) }),
            React.createElement(Route, { key: 'scores', path: 'scores', element: React.createElement(Scores) }),
            React.createElement(Route, { key: 'fallback', path: '*', element: React.createElement(Navigate, { to: '/', replace: true }) })
          ])
        ])
      ])
    ]
  );
}


