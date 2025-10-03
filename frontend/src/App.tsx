/**
 * @fileoverview Main Application Component with Multi-Tenant Architecture
 *
 * This file contains the root component of the Multi-Tenant Appointment Booking System.
 * It implements a comprehensive routing structure supporting multiple user roles and
 * provides global state management through React Context and React Query.
 *
 * @description
 * The application supports four distinct user roles:
 * - Customer: Service discovery and booking
 * - Service Provider: Business management and appointment handling
 * - Tenant Admin: Tenant-specific administration
 * - System Admin: Global platform administration
 *
 * @architecture
 * - Multi-tenant architecture with role-based access control
 * - Nested routing with React Router v7
 * - Global state management with React Context
 * - Server state management with TanStack Query
 * - Real-time notifications with React Hot Toast
 *
 * @author Frontend Development Team
 * @version 1.0.0
 */

import { useEffect } from 'react'
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

// ==================== LAYOUT COMPONENTS ====================
/**
 * Layout components that define the overall structure for different sections
 * of the application. Each layout handles specific UI patterns and navigation.
 */
import PublicLayout from './layouts/PublicLayout'      // Public-facing layout with marketing header/footer
import AuthLayout from './layouts/AuthLayout'          // Authentication layout with centered forms
import DashboardLayout from './layouts/DashboardLayout' // Dashboard layout with sidebar navigation
import { NotificationList } from './components/notification/NotificationList/NotificationList' // Notification List Component
import { NotificationPreferences } from './components/notification/NotificationPreferences/NotificationPreferences' // Notification Preferences Component

// ==================== PUBLIC PAGES ====================
/**
 * Publicly accessible pages that don't require authentication.
 * These pages are for marketing, service discovery, and initial user engagement.
 */
import HomePage from './pages/public/HomePage'                    // Landing page with hero section
import ServiceDiscoveryPage from './pages/public/ServiceDiscoveryPage' // Service search and filtering
import ServiceDetailPage from './pages/public/ServiceDetailPage'   // Detailed service information
import PricingPage from './pages/public/PricingPage'               // Subscription plans and pricing
import ContactUsPage from './pages/public/ContactUsPage'           // Contact form and company information

// ==================== AUTHENTICATION PAGES ====================
/**
 * Authentication-related pages for user login, registration, and account recovery.
 * These pages handle the complete authentication flow.
 */
import LoginPage from './pages/auth/LoginPage'              // User login form
import RegisterPage from './pages/auth/RegisterPage'        // User registration form
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage' // Password recovery flow

// ==================== DASHBOARD PAGES ====================
/**
 * Role-specific dashboard pages that serve as the main hub for each user type.
 * Each dashboard provides role-appropriate functionality and navigation.
 */
import CustomerDashboard from './pages/dashboards/CustomerDashboard'    // Customer overview and quick actions
import ProviderDashboard from './pages/dashboards/ProviderDashboard'    // Service provider business metrics
import AdminDashboard from './pages/dashboards/AdminDashboard'          // Administrative control panel

// ==================== CUSTOMER FEATURE PAGES ====================
/**
 * Customer-specific functionality for profile management and appointment tracking.
 */
import ProfilePage from './pages/customer/ProfilePage'                    // Customer profile management
import BookingHistoryPage from './pages/customer/BookingHistoryPage'      // Past and upcoming appointments
import BookingConfirmationPage from './pages/customer/BookingConfirmationPage' // Booking confirmation display

// ==================== SERVICE PROVIDER PAGES ====================
/**
 * Business management pages for service providers to manage their services and appointments.
 */
import ServiceManagementPage from './pages/provider/ServiceManagementPage'    // Service creation and management
import BookingManagementPage from './pages/provider/BookingManagementPage'    // Appointment management
import EarningsPage from './pages/provider/EarningsPage'                    // Revenue and earnings tracking

// ==================== ADMINISTRATIVE PAGES ====================
/**
 * Administrative pages for platform and tenant management.
 */
import UserManagementPage from './pages/admin/UserManagementPage'      // User account management
import SystemSettingsPage from './pages/admin/SystemSettingsPage'      // System configuration
import AnalyticsPage from './pages/admin/AnalyticsPage'                // Platform analytics and reporting

// ==================== ERROR PAGES ====================
/**
 * Error handling pages for various HTTP status codes and error conditions.
 */
import NotFoundPage from './pages/error/NotFoundPage'        // 404 Not Found page
import UnauthorizedPage from './pages/error/UnauthorizedPage' // 403 Access Denied page

// ==================== CONTEXT PROVIDERS ====================
/**
 * Global state management providers that wrap the entire application.
 * These contexts provide shared state and functionality across all components.
 */
import { AuthProvider } from './contexts/AuthContext'    // Authentication state management
import { ThemeProvider } from './contexts/ThemeContext'  // Theme and UI preferences

// ==================== ROUTE PROTECTION COMPONENTS ====================
/**
 * Higher-order components that handle route protection and access control.
 * These components ensure users can only access appropriate sections based on their roles.
 */
import ProtectedRoute from './components/auth/ProtectedRoute'  // Requires authentication and role validation
import PublicRoute from './components/auth/PublicRoute'        // Redirects authenticated users to dashboard

// ==================== REACT QUERY CLIENT CONFIGURATION ====================
/**
 * Global configuration for TanStack Query (React Query) server state management.
 *
 * @description
 * Configures caching, background refetching, and error handling for all API requests.
 * The settings optimize for user experience while managing server state efficiently.
 *
 * @property {Object} defaultOptions - Default configuration for all queries
 * @property {Object} defaultOptions.queries - Query-specific settings
 * @property {number} defaultOptions.queries.staleTime - How long data stays fresh (5 minutes)
 * @property {number} defaultOptions.queries.gcTime - Cache cleanup time (10 minutes)
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
      gcTime: 1000 * 60 * 10, // 10 minutes - cache garbage collection
    },
  },
})

function App() {
  useEffect(() => {
    // Initialize app
    console.log('Appointment Booking System initialized')
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="services" element={<ServiceDiscoveryPage />} />
                  <Route path="services/:id" element={<ServiceDetailPage />} />
                  <Route path="pricing" element={<PricingPage />} />
                  <Route path="contact" element={<ContactUsPage />} />
                </Route>

                {/* Authentication Routes */}
                <Route path="/auth" element={<AuthLayout />}>
                  <Route path="login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                  <Route path="register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                  <Route path="forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
                </Route>

                {/* Customer Dashboard Routes */}
                <Route path="/customer" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<CustomerDashboard />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="bookings" element={<BookingHistoryPage />} />
                  <Route path="bookings/:id/confirmation" element={<BookingConfirmationPage />} />
                  <Route path="notifications" element={<NotificationList />} />
                  <Route
                    path="notifications/preferences"
                    element={
                      <NotificationPreferences
                        preferences={{
                          id: 'dummy',
                          userId: 'dummy',
                          emailEnabled: true,
                          smsEnabled: false,
                          pushEnabled: true,
                        }}
                        onPreferencesUpdate={() => {
                          console.log('Dummy onPreferencesUpdate called');
                        }}
                      />
                    }
                  />
                </Route>

                {/* Service Provider Dashboard Routes */}
                <Route path="/provider" element={
                  <ProtectedRoute allowedRoles={['service_provider']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<ProviderDashboard />} />
                  <Route path="services" element={<ServiceManagementPage />} />
                  <Route path="bookings" element={<BookingManagementPage />} />
                  <Route path="earnings" element={<EarningsPage />} />
                  <Route path="notifications" element={<NotificationList />} />
                  <Route
                    path="notifications/preferences"
                    element={
                      <NotificationPreferences
                        preferences={{
                          id: 'dummy',
                          userId: 'dummy',
                          emailEnabled: true,
                          smsEnabled: false,
                          pushEnabled: true,
                        }}
                        onPreferencesUpdate={() => {
                          console.log('Dummy onPreferencesUpdate called');
                        }}
                      />
                    }
                  />
                </Route>

                {/* Admin Dashboard Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={['tenant_admin', 'system_admin']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<UserManagementPage />} />
                  <Route path="settings" element={<SystemSettingsPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="notifications" element={<NotificationList />} />
                  <Route
                    path="notifications/preferences"
                    element={
                      <NotificationPreferences
                        preferences={{
                          id: 'dummy',
                          userId: 'dummy',
                          emailEnabled: true,
                          smsEnabled: false,
                          pushEnabled: true,
                        }}
                        onPreferencesUpdate={() => {
                          console.log('Dummy onPreferencesUpdate called');
                        }}
                      />
                    }
                  />
                </Route>

                {/* Error Routes */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>

              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>

      {/* React Query Devtools */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
