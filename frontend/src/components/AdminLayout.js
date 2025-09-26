import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAppStore } from '../store/useAppStore';

export default function AdminLayout(props){
  const { children, active } = props;
  const { user } = useAppStore();
  const role = user?.vai_tro || user?.role || '';
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar role={'ADMIN'} />
        <main className="flex-1 p-6" data-admin-active={active}>
          {children}
        </main>
      </div>
    </div>
  );
}


