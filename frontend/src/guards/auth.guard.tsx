import React, { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * AuthGuard component that protects routes requiring authentication.
 * Redirects unauthenticated users to the login page.
 * Integrates with authentication service to verify user login status.
 * Handles loading states during authentication verification.
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        role="status"
        aria-live="polite"
        aria-label="Loading authentication status"
      >
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // If not authenticated, redirect to login with return url
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default AuthGuard;