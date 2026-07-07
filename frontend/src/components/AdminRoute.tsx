import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Loading from './Loading';

const AdminRoute: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [isVerifying, setIsVerifying] = React.useState(true);

  React.useEffect(() => {
    // Basic verification simulation
    setIsVerifying(false);
  }, [user]);

  if (isVerifying) return <Loading />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
