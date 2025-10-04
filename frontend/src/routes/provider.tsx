/**
 * @fileoverview Service Provider Dashboard Route Configuration
 *
 * This module defines all routes accessible to service providers in the appointment booking system.
 * Provider routes focus on business management, service offerings, and appointment handling.
 *
 * @description
 * Service provider routes provide access to:
 * - Business dashboard with key metrics and performance
 * - Service management and configuration
 * - Appointment booking and management
 * - Earnings tracking and financial reports
 * - Notification preferences and settings
 *
 * @authorization
 * - All routes require 'service_provider' role authentication
 * - Protected by ProtectedRoute component with role validation
 * - Automatic redirect to login for unauthenticated users
 * - Role-based access control prevents unauthorized access
 *
 * @lazyLoading
 * - Provider-specific components are lazy-loaded for performance
 * - Reduces initial load time for provider-specific features
 * - Code splitting based on user role and functionality
 *
 * @businessLogic
 * - Routes support multi-tenant architecture
 * - Provider isolation ensures data security
 * - Earnings and booking data filtered by provider context
 *
 * @author Frontend Development Team
 * @version 1.0.0
 */

import { lazy } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

// ==================== ROUTE PROTECTION COMPONENTS ====================
/**
 * ProtectedRoute component ensures only authenticated service providers can access these routes.
 * It validates user roles and redirects unauthorized users appropriately.
 */
import ProtectedRoute from '../components/auth/ProtectedRoute'

// ==================== LAZY-LOADED PROVIDER PAGE COMPONENTS ====================
/**
 * Provider-specific page components are lazy-loaded to optimize bundle size.
 * These components handle provider-centric business logic and data management.
 */
const ProviderDashboard = lazy(() => import('../pages/dashboards/ProviderDashboard'))
const ServiceManagementPage = lazy(() => import('../pages/provider/ServiceManagementPage'))
const BookingManagementPage = lazy(() => import('../pages/provider/BookingManagementPage'))
const EarningsPage = lazy(() => import('../pages/provider/EarningsPage'))
const NotificationList = lazy(() => import('../components/notification/NotificationList/NotificationList'))
const NotificationPreferences = lazy(() => import('../components/notification/NotificationPreferences/NotificationPreferences'))

/**
 * Service Provider Routes Component
 *
 * Defines all routes available to authenticated service providers.
 * These routes are nested under the dashboard layout and include
 * comprehensive business management functionality.
 *
 * @returns {JSX.Element} Service provider route configuration
 *
 * @routeStructure
 * - /provider/dashboard - Business overview and key metrics
 * - /provider/services - Service creation and management
 * - /provider/bookings - Appointment management and scheduling
 * - /provider/earnings - Revenue tracking and financial reports
 * - /provider/notifications - Notification list and management
 * - /provider/notifications/preferences - Notification preferences
 *
 * @roleBasedAccess
 * - Requires 'service_provider' role for all routes
 * - Automatic redirects for unauthorized access
 * - Maintains provider-specific data isolation
 *
 * @example
 * ```tsx
 * <ProtectedRoute allowedRoles={['service_provider']}>
 *   <DashboardLayout>
 *     <ProviderRoutes />
 *   </DashboardLayout>
 * </ProtectedRoute>
 * ```
 */
export const ProviderRoutes = () => {
  return (
    <ProtectedRoute allowedRoles={['service_provider']}>
      <Routes>
        {/* Default Route - Redirect to Dashboard */}
        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />

        {/* Provider Dashboard Route */}
        <Route
          path="dashboard"
          element={<ProviderDashboard />}
        />

        {/* Service Management Route */}
        <Route
          path="services"
          element={<ServiceManagementPage />}
        />

        {/* Booking Management Route */}
        <Route
          path="bookings"
          element={<BookingManagementPage />}
        />

        {/* Earnings Tracking Route */}
        <Route
          path="earnings"
          element={<EarningsPage />}
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
                id: 'provider-preferences',
                userId: 'current-provider-id',
                emailEnabled: true,
                smsEnabled: true,
                pushEnabled: true,
              }}
              onPreferencesUpdate={(updatedPreferences) => {
                // Handle preferences update logic
                console.log('Provider notification preferences updated:', updatedPreferences)
              }}
            />
          }
        />
      </Routes>
    </ProtectedRoute>
  )
}

export default ProviderRoutes