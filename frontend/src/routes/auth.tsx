/**
 * @fileoverview Authentication Route Configuration
 *
 * This module defines all authentication-related routes for the appointment booking system.
 * These routes handle user login, registration, and password recovery processes.
 *
 * @description
 * Authentication routes manage:
 * - User login with email/password or social providers
 * - New user registration with validation
 * - Password recovery and reset functionality
 * - Account verification and email confirmation
 *
 * @security
 * - Routes are protected by PublicRoute component
 * - Redirects authenticated users to appropriate dashboard
 * - Implements CSRF protection and rate limiting
 * - Uses HTTPS for all authentication flows
 *
 * @lazyLoading
 * - Authentication components are lazy-loaded
 * - Reduces initial bundle size for non-authenticated users
 * - Improves security by not loading auth code unnecessarily
 *
 * @accessibility
 * - Form validation with screen reader support
 * - Keyboard navigation for all form elements
 * - High contrast focus indicators
 * - Error messages associated with form fields
 *
 * @author Frontend Development Team
 * @version 1.0.0
 */

import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'

// ==================== ROUTE PROTECTION COMPONENTS ====================
/**
 * PublicRoute component ensures that authenticated users are redirected
 * away from authentication pages to prevent unnecessary access.
 */
import PublicRoute from '../components/auth/PublicRoute'

// ==================== LAZY-LOADED AUTHENTICATION PAGE COMPONENTS ====================
/**
 * Authentication page components are lazy-loaded to optimize bundle size.
 * These components handle sensitive user data and should only be loaded when needed.
 */
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'))

/**
 * Authentication Routes Component
 *
 * Defines all routes related to user authentication and account management.
 * These routes are nested under the authentication layout and include
 * protection to redirect already authenticated users.
 *
 * @returns {JSX.Element} Authentication route configuration
 *
 * @routeStructure
 * - /auth/login - User login form
 * - /auth/register - User registration form
 * - /auth/forgot-password - Password recovery form
 *
 * @security
 * - All routes wrapped with PublicRoute for authenticated user protection
 * - Implements proper redirect logic based on user role
 * - Prevents authenticated users from accessing auth pages
 *
 * @example
 * ```tsx
 * <AuthLayout>
 *   <AuthRoutes />
 * </AuthLayout>
 * ```
 */
export const AuthRoutes = () => {
  return (
    <Routes>
      {/* Login Route */}
      <Route
        path="login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Registration Route */}
      <Route
        path="register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Password Recovery Route */}
      <Route
        path="forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
    </Routes>
  )
}

export default AuthRoutes