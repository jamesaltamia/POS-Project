import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthLayout from './components/layouts/AuthLayout';
import MainLayout from './components/layouts/MainLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Users from './pages/Users';
import FarewellMessages from './pages/FarewellMessages';
import NotFound from './pages/NotFound';
import { NotificationProvider } from './context/NotificationContext';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import CashierDashboard from './pages/CashierDashboard';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>
          {/* Admin Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'administrator']} />}>
            <Route path="/dashboard" element={<AdminDashboard />} />
          </Route>
          {/* Manager Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
            <Route path="/manager" element={<ManagerDashboard />} />
          </Route>
          {/* Cashier Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={['cashier']} />}>
            <Route path="/cashier" element={<CashierDashboard />} />
          </Route>
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/users" element={<Users />} />
              <Route path="/farewell-messages" element={<FarewellMessages />} />
            </Route>
          </Route>
          {/* Fallback */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
