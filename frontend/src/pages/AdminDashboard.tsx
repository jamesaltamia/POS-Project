import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import DashboardSidebar from '../components/layouts/DashboardSidebar';
import DashboardTopbar from '../components/layouts/DashboardTopbar';

const AdminDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DashboardTopbar />
      <div className="flex flex-1">
        <DashboardSidebar role={user?.role || 'admin'} />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <p>Welcome, Admin! Here you can manage users and access all features.</p>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 