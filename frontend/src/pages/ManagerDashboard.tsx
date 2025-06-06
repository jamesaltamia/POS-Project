import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const ManagerDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manager Dashboard</h1>
      <p>Welcome, Manager! Here you can view sales, manage products, and more.</p>
    </div>
  );
};

export default ManagerDashboard;