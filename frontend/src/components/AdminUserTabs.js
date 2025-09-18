import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Award, Settings, Users } from 'lucide-react';

export default function AdminUserTabs() {
  const location = useLocation();
  
  const tabs = [
    {
      id: 'overview',
      label: 'Tổng quan',
      path: '/admin/users',
      icon: Users,
      description: 'Quản lý danh sách người dùng'
    },
    {
      id: 'profile',
      label: 'Thông tin cá nhân',
      path: '/admin/users/profile',
      icon: User,
      description: 'Quản lý thông tin cá nhân người dùng'
    },
    {
      id: 'points',
      label: 'Điểm chi tiết',
      path: '/admin/users/points',
      icon: Award,
      description: 'Quản lý điểm rèn luyện người dùng'
    }
  ];

  const isActive = (path) => {
    if (path === '/admin/users') {
      return location.pathname === '/admin/users';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="bg-white border-b border-gray-200 mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="-mb-px flex space-x-8" aria-label="Admin User Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  active
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon 
                  className={`-ml-0.5 mr-2 h-5 w-5 transition-colors ${
                    active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} 
                />
                <div className="flex flex-col">
                  <span>{tab.label}</span>
                  <span className="text-xs text-gray-400 font-normal">{tab.description}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}