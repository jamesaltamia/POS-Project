import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

const ProtectedRoute = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute; 