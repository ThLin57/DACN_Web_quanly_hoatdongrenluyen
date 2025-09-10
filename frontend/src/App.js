import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';

function App() {
  return React.createElement(
    BrowserRouter,
    null,
    React.createElement(
      'div',
      { className: 'min-h-screen bg-gray-50 text-gray-900' },
      [
        React.createElement(Header, { key: 'header' }),
        React.createElement(
          'main',
          { key: 'main', className: 'max-w-5xl mx-auto p-6' },
          React.createElement(
            Routes,
            null,
            React.createElement(Route, { path: '/', element: React.createElement(Home) })
          )
        ),
      ]
    )
  );
}

export default App;
