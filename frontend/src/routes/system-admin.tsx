/**
 * @fileoverview System Admin Dashboard Route Configuration
 *
 * This module defines all routes accessible to system administrators in the appointment booking system.
 * System admin routes focus on global platform management, multi-tenant administration, and system-wide configuration.
 *
 * @description
 * System admin routes provide access to:
 * - Global system dashboard with platform metrics (using AdminDashboard)
 * - Tenant management across the entire platform (using UserManagementPage)
 * - Global system settings and configuration (using SystemSettingsPage)
 * - Platform-wide analytics and reporting (using AnalyticsPage)
 * - Global notification management
 * - Pricing plan management (placeholder - using UserManagementPage)
 * - System health monitoring (placeholder - using AnalyticsPage)
 *
 * @note
 * This implementation uses existing admin components as placeholders until
 * system-admin specific components are developed.
 *
 * @authorization
 * - All routes require 'system_admin' role authentication
 * - Protected by ProtectedRoute component with strict role validation
 * - Automatic redirect to login for unauthenticated users
 * - Highest level of access control in the system
 *
 * @lazyLoading
 * - System admin components are lazy-loaded for performance
 * - Reduces initial load time for system-level features
 * - Code splitting based on user role and functionality
 *
 * @globalAccess
 * - Routes provide access to all tenants and system data
 * - Audit logging for all administrative actions
 * - Secure access controls prevent unauthorized modifications
 *
 * @author Frontend Development Team
 * @version 1.0.0
 */

import { lazy } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

// ==================== ROUTE PROTECTION COMPONENTS ====================
/**
 * ProtectedRoute component ensures only authenticated system admins can access these routes.
 * It validates user roles and redirects unauthorized users appropriately.
 */
import ProtectedRoute from '../components/auth/ProtectedRoute'

// ==================== LAZY-LOADED SYSTEM ADMIN PAGE COMPONENTS ====================
/**
 * System admin-specific page components are lazy-loaded to optimize bundle size.
 * These components handle global platform management and system administration.
 * Note: Using existing admin components until system-admin specific components are implemented.
 */
const AdminDashboard = lazy(() => import('../pages/dashboards/AdminDashboard'))
const UserManagementPage = lazy(() => import('../pages/admin/UserManagementPage'))
const SystemSettingsPage = lazy(() => import('../pages/admin/SystemSettingsPage'))
const AnalyticsPage = lazy(() => import('../pages/admin/AnalyticsPage'))
const NotificationList = lazy(() => import('../components/notification/NotificationList/NotificationList'))
const NotificationPreferences = lazy(() => import('../components/notification/NotificationPreferences/NotificationPreferences'))

/**
 * System Admin Routes Component
 *
 * Defines all routes available to authenticated system administrators.
 * These routes are nested under the dashboard layout and include
 * comprehensive global platform management functionality.
 *
 * @returns {JSX.Element} System admin route configuration
 *
 * @routeStructure
 * - /system-admin/dashboard - Global system overview and platform metrics (AdminDashboard)
 * - /system-admin/tenants - Tenant management across the platform (UserManagementPage)
 * - /system-admin/settings - Global system settings and configuration (SystemSettingsPage)
 * - /system-admin/analytics - Platform-wide analytics and reporting (AnalyticsPage)
 * - /system-admin/pricing - Pricing plan management (UserManagementPage - placeholder)
 * - /system-admin/health - System health monitoring and diagnostics (AnalyticsPage - placeholder)
 * - /system-admin/notifications - Global notification management
 * - /system-admin/notifications/preferences - Notification preferences
 *
 * @roleBasedAccess
 * - Requires 'system_admin' role for all routes
 * - Automatic redirects for unauthorized access
 * - Maintains highest level of security and audit logging
 *
 * @example
 * ```tsx
 * <ProtectedRoute allowedRoles={['system_admin']}>
 *   <DashboardLayout>
 *     <SystemAdminRoutes />
 *   </DashboardLayout>
 * </ProtectedRoute>
 * ```
 */
export const SystemAdminRoutes = () => {
  return (
    <ProtectedRoute allowedRoles={['system_admin']}>
      <Routes>
        {/* Default Route - Redirect to Dashboard */}
        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />

        {/* System Admin Dashboard Route */}
        <Route
          path="dashboard"
          element={<AdminDashboard />}
        />

        {/* Tenant Management Route */}
        <Route
          path="tenants"
          element={<UserManagementPage />}
        />

        {/* Global Settings Route */}
        <Route
          path="settings"
          element={<SystemSettingsPage />}
        />

        {/* Platform Analytics Route */}
        <Route
          path="analytics"
          element={<AnalyticsPage />}
        />

        {/* Pricing Plan Management Route - Using User Management as placeholder */}
        <Route
          path="pricing"
          element={<UserManagementPage />}
        />

        {/* System Health Monitoring Route - Using Analytics as placeholder */}
        <Route
          path="health"
          element={<AnalyticsPage />}
        />

        {/* Global Notifications Route */}
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
                id: 'system-admin-preferences',
                userId: 'current-system-admin-id',
                emailEnabled: true,
                smsEnabled: true,
                pushEnabled: true,
              }}
              onPreferencesUpdate={(updatedPreferences) => {
                // Handle preferences update logic
                console.log('System admin notification preferences updated:', updatedPreferences)
              }}
            />
          }
        />
      </Routes>
    </ProtectedRoute>
  )
}

export default SystemAdminRoutes