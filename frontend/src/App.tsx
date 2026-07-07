import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { useAuthStore } from './store/authStore';

const App: React.FC = () => {
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    // If we have an access token but no user, fetch the user data on startup
    if (accessToken) {
      fetchCurrentUser();
    }
  }, [accessToken, fetchCurrentUser]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
