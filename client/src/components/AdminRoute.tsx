import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotFoundPage from '../pages/NotFoundPage';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to sign in page
  if (!isAuthenticated || !user) {
    return <Navigate to="/signin" replace />;
  }

  // If user is authenticated but not an admin, show 404 page
  if (!user.is_admin) {
    return <NotFoundPage />;
  }

  // If user is authenticated and is an admin, render the protected content
  return <>{children}</>;
};

export default AdminRoute;
