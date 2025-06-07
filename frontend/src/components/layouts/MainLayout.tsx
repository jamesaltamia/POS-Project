import { useState } from 'react';
import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopbar from './DashboardTopbar';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  const currentUserRole = user?.role;
  const isAdmin = currentUserRole === 'admin' || currentUserRole === 'administrator';
  const isManager = currentUserRole === 'manager';
  const canShowSidebar = isAdmin || isManager;
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top bar - Always at the very top */}
      <header className="h-16 bg-white shadow-sm flex items-center px-4 sticky top-0 z-30 w-full">
        <div className="w-full flex items-center">
          {canShowSidebar && (
            <button
              className="text-violet-700 mr-2"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          )}
          <div className="flex-1 flex justify-end items-center">
            <DashboardTopbar />
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Drawer and Overlay with smooth slide transition */}
        {canShowSidebar && (
          <>
            {/* Overlay */}
            <div
              className={`fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
              onClick={() => setSidebarOpen(false)}
              aria-hidden={!sidebarOpen}
            />
            {/* Sidebar Drawer */}
            <aside
              className={`fixed inset-y-0 left-0 z-50 w-64 bg-violet-700 shadow-lg transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              `}
              aria-hidden={!sidebarOpen}
            >
              <div className="flex items-center justify-between h-16 px-4 bg-violet-700">
                <span className="text-2xl font-bold text-white">MeowMart POS</span>
                <button
                  className="text-white"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close sidebar"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <DashboardSidebar role={currentUserRole || 'guest'} closeSidebar={() => setSidebarOpen(false)} />
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;