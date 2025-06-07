import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';

const DashboardTopbar: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="w-full h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm z-10">
      <div className="font-bold text-lg text-pink-600">MeowMart POS</div>
      <div className="flex items-center gap-4">
        <div className="text-gray-700">
          <span className="font-semibold">{user?.name || user?.username}</span>
          <span className="ml-2 text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded capitalize">{user?.role}</span>
        </div>
        <button
          onClick={handleLogout}
          className="ml-4 px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default DashboardTopbar; 