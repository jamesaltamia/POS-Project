import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

export interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: React.ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If user and token are present, check roles if specified
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the correct dashboard based on role
    if (user.role === 'admin' || user.role === 'administrator') return <Navigate to="/dashboard" replace />;
    if (user.role === 'manager') return <Navigate to="/manager" replace />;
    if (user.role === 'cashier') return <Navigate to="/cashier" replace />;
    return <Navigate to="/login" replace />;
  }

  // If we have children, render them, otherwise render an Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;