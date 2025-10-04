/**
 * @fileoverview Customer Dashboard Route Configuration
 *
 * This module defines all routes accessible to customers in the appointment booking system.
 * Customer routes focus on profile management, booking history, and service discovery.
 *
 * @description
 * Customer routes provide access to:
 * - Personal dashboard with booking overview
 * - Profile management and settings
 * - Booking history and upcoming appointments
 * - Booking confirmation pages
 * - Notification preferences and settings
 *
 * @authorization
 * - All routes require 'customer' role authentication
 * - Protected by ProtectedRoute component with role validation
 * - Automatic redirect to login for unauthenticated users
 * - Role-based access control prevents unauthorized access
 *
 * @lazyLoading
 * - Dashboard components are lazy-loaded for performance
 * - Reduces initial load time for customer-specific features
 * - Code splitting based on user role and functionality
 *
 * @navigation
 * - Breadcrumb navigation for deep linking
 * - Consistent navigation patterns across customer features
 * - Mobile-responsive navigation with collapsible sidebar
 *
 * @author Frontend Development Team
 * @version 1.0.0
 */

import { lazy } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

// ==================== ROUTE PROTECTION COMPONENTS ====================
/**
 * ProtectedRoute component ensures only authenticated customers can access these routes.
 * It validates user roles and redirects unauthorized users appropriately.
 */
import ProtectedRoute from '../components/auth/ProtectedRoute'

// ==================== LAZY-LOADED CUSTOMER PAGE COMPONENTS ====================
/**
 * Customer-specific page components are lazy-loaded to optimize bundle size.
 * These components handle customer-centric functionality and data management.
 */
const CustomerDashboard = lazy(() => import('../pages/dashboards/CustomerDashboard'))
const ProfilePage = lazy(() => import('../pages/customer/ProfilePage'))
const BookingHistoryPage = lazy(() => import('../pages/customer/BookingHistoryPage'))
const BookingConfirmationPage = lazy(() => import('../pages/customer/BookingConfirmationPage'))
const NotificationList = lazy(() => import('../components/notification/NotificationList/NotificationList'))
const NotificationPreferences = lazy(() => import('../components/notification/NotificationPreferences/NotificationPreferences'))

/**
 * Customer Routes Component
 *
 * Defines all routes available to authenticated customers.
 * These routes are nested under the dashboard layout and include
 * comprehensive customer functionality for appointment management.
 *
 * @returns {JSX.Element} Customer route configuration
 *
 * @routeStructure
 * - /customer/dashboard - Customer overview and quick actions
 * - /customer/profile - Profile management and settings
 * - /customer/bookings - Booking history and management
 * - /customer/bookings/:id/confirmation - Booking confirmation details
 * - /customer/notifications - Notification list and management
 * - /customer/notifications/preferences - Notification preferences
 *
 * @roleBasedAccess
 * - Requires 'customer' role for all routes
 * - Automatic redirects for unauthorized access
 * - Maintains user session and authentication state
 *
 * @example
 * ```tsx
 * <ProtectedRoute allowedRoles={['customer']}>
 *   <DashboardLayout>
 *     <CustomerRoutes />
 *   </DashboardLayout>
 * </ProtectedRoute>
 * ```
 */
export const CustomerRoutes = () => {
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <Routes>
        {/* Default Route - Redirect to Dashboard */}
        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />

        {/* Customer Dashboard Route */}
        <Route
          path="dashboard"
          element={<CustomerDashboard />}
        />

        {/* Profile Management Route */}
        <Route
          path="profile"
          element={<ProfilePage />}
        />

        {/* Booking History Route */}
        <Route
          path="bookings"
          element={<BookingHistoryPage />}
        />

        {/* Booking Confirmation Route with Dynamic Parameter */}
        <Route
          path="bookings/:id/confirmation"
          element={<BookingConfirmationPage />}
        />

        {/* Notifications Route */}
        <Route
          path="notifications"
          element={<NotificationList />}
        />

        {/* Notification Preferences Route */}
        <Route
          path="notifications/preferences"
          element={
            <NotificationPreferences
              preferences={{
                id: 'customer-preferences',
                userId: 'current-user-id',
                emailEnabled: true,
                smsEnabled: false,
                pushEnabled: true,
              }}
              onPreferencesUpdate={(updatedPreferences) => {
                // Handle preferences update logic
                console.log('Customer notification preferences updated:', updatedPreferences)
              }}
            />
          }
        />
      </Routes>
    </ProtectedRoute>
  )
}

export default CustomerRoutes