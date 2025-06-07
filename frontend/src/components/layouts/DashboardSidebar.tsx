import React from 'react';
import { NavLink } from 'react-router-dom';
import { MdDashboard, MdPeople, MdInventory, MdReceipt, MdAssessment, MdSettings, MdMessage, MdHistory } from 'react-icons/md';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

interface DashboardSidebarProps {
  role: string;
  closeSidebar?: () => void;
}

const navConfig: Record<string, { label: string; to: string; icon: JSX.Element }[]> = {
  admin: [
    { label: 'Dashboard', to: '/dashboard', icon: <MdDashboard size={20} /> },
    { label: 'Users', to: '/users', icon: <MdPeople size={20} /> },
    { label: 'Products', to: '/products', icon: <MdInventory size={20} /> },
    { label: 'Stock Monitoring', to: '/stock', icon: <WarningAmberOutlinedIcon fontSize="medium" /> },
    { label: 'Inventory Logs', to: '/inventory-logs', icon: <MdHistory size={20} /> },
    { label: 'Transactions', to: '/transactions', icon: <MdReceipt size={20} /> },
    { label: 'Reports', to: '/reports', icon: <MdAssessment size={20} /> },
    { label: 'Settings', to: '/settings', icon: <MdSettings size={20} /> },
  ],
  manager: [
    { label: 'Dashboard', to: '/manager', icon: <MdDashboard size={20} /> },
    { label: 'Products', to: '/manager/products', icon: <MdInventory size={20} /> },
    { label: 'Sales & Transactions', to: '/manager/transactions', icon: <MdReceipt size={20} /> },
    { label: 'Reports', to: '/manager/reports', icon: <MdAssessment size={20} /> },
  ],
  cashier: [
    { label: 'Dashboard', to: '/cashier', icon: <MdDashboard size={20} /> },
    { label: 'Transactions', to: '/transactions', icon: <MdReceipt size={20} /> },
    { label: 'Farewell Messages', to: '/farewell-messages', icon: <MdMessage size={20} /> },
  ],
};

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ role, closeSidebar }) => {
  const links = navConfig[role === 'administrator' ? 'admin' : role] || [];
  return (
    <nav className="flex-1 mt-4 md:mt-0 p-6">
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded transition-colors text-white ${
                  isActive ? 'bg-violet-800 font-semibold' : 'hover:bg-violet-600'
                }`
              }
              end
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DashboardSidebar;