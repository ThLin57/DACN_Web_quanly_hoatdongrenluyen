import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

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
        React.createElement(Route, { key: 'profile', path: '/profile', element: React.createElement(Profile) }),
        React.createElement(Route, { key: 'dashboard', path: '/*', element: React.createElement(Dashboard) }),
        React.createElement(Route, { key: 'catchall', path: '*', element: React.createElement(Navigate, { to: '/', replace: true }) })
      ]
    )
  );
}

export default App;
