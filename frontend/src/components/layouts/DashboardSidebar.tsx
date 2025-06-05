import React from 'react';
import { NavLink } from 'react-router-dom';

interface DashboardSidebarProps {
  role: string;
}

const navConfig: Record<string, { label: string; to: string }[]> = {
  admin: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Users', to: '/users' },
    { label: 'Products', to: '/products' },
    { label: 'Transactions', to: '/transactions' },
    { label: 'Reports', to: '/reports' },
    { label: 'Settings', to: '/settings' },
  ],
  manager: [
    { label: 'Dashboard', to: '/manager' },
    { label: 'Products', to: '/products' },
    { label: 'Transactions', to: '/transactions' },
    { label: 'Reports', to: '/reports' },
  ],
  cashier: [
    { label: 'Dashboard', to: '/cashier' },
    { label: 'Transactions', to: '/transactions' },
    { label: 'Farewell Messages', to: '/farewell-messages' },
  ],
};

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ role }) => {
  const links = navConfig[role === 'administrator' ? 'admin' : role] || [];
  return (
    <aside className="w-64 bg-white border-r h-full p-6 flex flex-col">
      <div className="mb-8 text-2xl font-bold text-pink-600">MeowMart POS</div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded transition-colors ${
                    isActive ? 'bg-pink-100 text-pink-700 font-semibold' : 'text-gray-700 hover:bg-pink-50'
                  }`
                }
                end
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default DashboardSidebar; 