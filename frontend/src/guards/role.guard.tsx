import React, { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RoleGuardProps {
  children: ReactNode;
  requiredRoles: string[];
}

/**
 * RoleGuard component that restricts access based on user roles.
 * Redirects users without required roles to an unauthorized page.
 * Integrates with authentication service to check user roles.
 * Handles loading states and authentication checks.
 */
const RoleGuard: React.FC<RoleGuardProps> = ({ children, requiredRoles }) => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

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

  // First check if authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check if user has required roles
  const hasRequiredRole = requiredRoles.some(role => user?.role === role);

  if (!hasRequiredRole) {
    // Redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // If authorized, render the protected content
  return <>{children}</>;
};

export default RoleGuard;