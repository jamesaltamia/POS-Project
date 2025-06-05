import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Debug logging
  console.log('ProtectedRoute:', { token, user, allowedRoles });

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If user and token are present, always allow access unless allowedRoles is set and doesn't match
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the correct dashboard based on role
    if (user.role === 'admin' || user.role === 'administrator') return <Navigate to="/dashboard" replace />;
    if (user.role === 'manager') return <Navigate to="/manager" replace />;
    if (user.role === 'cashier') return <Navigate to="/cashier" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute; 