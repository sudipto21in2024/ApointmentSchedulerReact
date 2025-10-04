/**
 * @fileoverview Tenant Admin Dashboard Route Configuration
 *
 * This module defines all routes accessible to tenant administrators in the appointment booking system.
 * Admin routes focus on tenant-level management, user administration, and system configuration.
 *
 * @description
 * Tenant admin routes provide access to:
 * - Administrative dashboard with tenant metrics
 * - User management within the tenant
 * - System settings and configuration
 * - Analytics and reporting for the tenant
 * - Notification preferences and settings
 *
 * @authorization
 * - All routes require 'tenant_admin' or 'system_admin' role authentication
 * - Protected by ProtectedRoute component with role validation
 * - Automatic redirect to login for unauthenticated users
 * - Multi-tenant isolation ensures tenant-specific access
 *
 * @lazyLoading
 * - Admin-specific components are lazy-loaded for performance
 * - Reduces initial load time for administrative features
 * - Code splitting based on user role and functionality
 *
 * @tenantIsolation
 * - All routes respect tenant boundaries
 * - Data filtering ensures tenant-specific information only
 * - Audit logging for administrative actions
 *
 * @author Frontend Development Team
 * @version 1.0.0
 */

import { lazy } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

// ==================== ROUTE PROTECTION COMPONENTS ====================
/**
 * ProtectedRoute component ensures only authenticated admins can access these routes.
 * It validates user roles and redirects unauthorized users appropriately.
 */
import ProtectedRoute from '../components/auth/ProtectedRoute'

// ==================== LAZY-LOADED ADMIN PAGE COMPONENTS ====================
/**
 * Admin-specific page components are lazy-loaded to optimize bundle size.
 * These components handle administrative functionality and tenant management.
 */
const AdminDashboard = lazy(() => import('../pages/dashboards/AdminDashboard'))
const UserManagementPage = lazy(() => import('../pages/admin/UserManagementPage'))
const SystemSettingsPage = lazy(() => import('../pages/admin/SystemSettingsPage'))
const AnalyticsPage = lazy(() => import('../pages/admin/AnalyticsPage'))
const NotificationList = lazy(() => import('../components/notification/NotificationList/NotificationList'))
const NotificationPreferences = lazy(() => import('../components/notification/NotificationPreferences/NotificationPreferences'))

/**
 * Tenant Admin Routes Component
 *
 * Defines all routes available to authenticated tenant administrators.
 * These routes are nested under the dashboard layout and include
 * comprehensive tenant management and administrative functionality.
 *
 * @returns {JSX.Element} Tenant admin route configuration
 *
 * @routeStructure
 * - /admin/dashboard - Administrative overview and tenant metrics
 * - /admin/users - User management within the tenant
 * - /admin/settings - System configuration and tenant settings
 * - /admin/analytics - Analytics and reporting for the tenant
 * - /admin/notifications - Notification list and management
 * - /admin/notifications/preferences - Notification preferences
 *
 * @roleBasedAccess
 * - Requires 'tenant_admin' or 'system_admin' role for all routes
 * - Automatic redirects for unauthorized access
 * - Maintains tenant-specific data isolation
 *
 * @example
 * ```tsx
 * <ProtectedRoute allowedRoles={['tenant_admin', 'system_admin']}>
 *   <DashboardLayout>
 *     <AdminRoutes />
 *   </DashboardLayout>
 * </ProtectedRoute>
 * ```
 */
export const AdminRoutes = () => {
  return (
    <ProtectedRoute allowedRoles={['tenant_admin', 'system_admin']}>
      <Routes>
        {/* Default Route - Redirect to Dashboard */}
        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />

        {/* Admin Dashboard Route */}
        <Route
          path="dashboard"
          element={<AdminDashboard />}
        />

        {/* User Management Route */}
        <Route
          path="users"
          element={<UserManagementPage />}
        />

        {/* System Settings Route */}
        <Route
          path="settings"
          element={<SystemSettingsPage />}
        />

        {/* Analytics Route */}
        <Route
          path="analytics"
          element={<AnalyticsPage />}
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
                id: 'admin-preferences',
                userId: 'current-admin-id',
                emailEnabled: true,
                smsEnabled: true,
                pushEnabled: false,
              }}
              onPreferencesUpdate={(updatedPreferences) => {
                // Handle preferences update logic
                console.log('Admin notification preferences updated:', updatedPreferences)
              }}
            />
          }
        />
      </Routes>
    </ProtectedRoute>
  )
}

export default AdminRoutes