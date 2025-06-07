import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import CashierDashboard from './pages/CashierDashboard';
import Users from './pages/Users';
import ProductManagement from './pages/ProductManagement';
import StockMonitoring from './pages/StockMonitoring';
import InventoryLogs from './pages/InventoryLogs';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ManagerProducts from './pages/ManagerProducts';
import ManagerTransactions from './pages/ManagerTransactions';
import ManagerReports from './pages/ManagerReports';
import FarewellMessages from './pages/FarewellMessages';
import { NotificationProvider } from './context/NotificationContext';
import MainLayout from './components/layouts/MainLayout';

// Define the type for the children prop
interface ProtectedRouteProps {
  children: ReactNode;
}

// Simple wrapper to handle authentication
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Check if user is authenticated in Redux store first
    if (token) {
      setIsAuthenticated(true);
      return;
    }
    
    // Fallback to localStorage check
    const storedToken = localStorage.getItem('token');
    setIsAuthenticated(!!storedToken);
  }, [token, location]);

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected content with MainLayout
  return <MainLayout>{children}</MainLayout>;
};

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={
            localStorage.getItem('token') ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          } />
          
          {/* Admin Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute>
              <ProductManagement />
            </ProtectedRoute>
          } />
          <Route path="/stock" element={
            <ProtectedRoute>
              <StockMonitoring />
            </ProtectedRoute>
          } />
          <Route path="/inventory-logs" element={
            <ProtectedRoute>
              <InventoryLogs />
            </ProtectedRoute>
          } />
          <Route path="/transactions" element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          
          {/* Manager Routes */}
          <Route path="/manager" element={
            <ProtectedRoute>
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/manager/products" element={
            <ProtectedRoute>
              <ManagerProducts />
            </ProtectedRoute>
          } />
          <Route path="/manager/transactions" element={
            <ProtectedRoute>
              <ManagerTransactions />
            </ProtectedRoute>
          } />
          <Route path="/manager/reports" element={
            <ProtectedRoute>
              <ManagerReports />
            </ProtectedRoute>
          } />
          
          {/* Cashier Routes */}
          <Route path="/cashier" element={
            <ProtectedRoute>
              <CashierDashboard />
            </ProtectedRoute>
          } />
          <Route path="/cashier/transactions" element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          } />
          <Route path="/farewell-messages" element={
            <ProtectedRoute>
              <FarewellMessages />
            </ProtectedRoute>
          } />
          
          {/* Redirect root to appropriate dashboard based on role */}
          <Route path="/" element={
            <ProtectedRoute>
              <RootRedirector />
            </ProtectedRoute>
          } />
          
          {/* Root redirect */}
          <Route 
            path="/" 
            element={
              localStorage.getItem('token') ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={
            localStorage.getItem('token') ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

// Component to handle root URL redirection
const RootRedirector = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.role?.toLowerCase() || 'cashier';
  
  if (role === 'admin' || role === 'administrator') {
    return <Navigate to="/dashboard" replace />;
  } else if (role === 'manager') {
    return <Navigate to="/manager" replace />;
  } else {
    return <Navigate to="/cashier" replace />;
  }
};

export default App;
