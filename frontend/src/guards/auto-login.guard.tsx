import React, { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AutoLoginGuardProps {
  children: ReactNode;
}

/**
 * AutoLoginGuard component that redirects authenticated users away from login/register pages.
 * Automatically navigates logged-in users to their appropriate dashboard based on role.
 * Prevents authenticated users from accessing public authentication routes.
 * Handles loading states during authentication verification.
 */
const AutoLoginGuard: React.FC<AutoLoginGuardProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuth();

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

  // If authenticated, redirect to appropriate dashboard based on role
  if (isAuthenticated && user) {
    // Determine redirect path based on user role
    let redirectPath = '/customer/dashboard'; // Default

    switch (user.role) {
      case 'tenant_admin':
      case 'system_admin':
        redirectPath = '/admin/dashboard';
        break;
      case 'service_provider':
        redirectPath = '/provider/dashboard';
        break;
      case 'customer':
        redirectPath = '/customer/dashboard';
        break;
      default:
        redirectPath = '/customer/dashboard';
    }

    // If there's a return path from location state, use it
    const from = location.state?.from?.pathname;
    if (from && from !== '/auth/login' && from !== '/auth/register') {
      redirectPath = from;
    }

    return <Navigate to={redirectPath} replace />;
  }

  // If not authenticated, allow access to login/register pages
  return <>{children}</>;
};

export default AutoLoginGuard;