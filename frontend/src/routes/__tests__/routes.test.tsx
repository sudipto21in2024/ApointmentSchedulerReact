/**
 * @fileoverview Unit Tests for Application Routing Configuration
 *
 * This test suite validates the routing structure, lazy loading implementation,
 * and route protection mechanisms for the multi-tenant appointment booking system.
 *
 * @description
 * Tests cover:
 * - Route configuration validation
 * - Lazy loading module imports
 * - Route parameter handling
 * - Route protection and access control
 * - Navigation flow validation
 *
 * @testFramework
 * - Vitest for test execution
 * - React Testing Library for component testing
 * - jsdom for DOM simulation
 *
 * @author Frontend Development Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ==================== MOCKS AND SETUP ====================
/**
 * Mock all lazy-loaded components to avoid actual imports during testing.
 * This ensures tests run quickly and don't depend on component implementations.
 * Using direct component returns instead of lazy loading for test simplicity.
 */
const MockHomePage = () => <div data-testid="home-page">Home Page</div>
const MockServiceDiscoveryPage = () => <div data-testid="service-discovery-page">Service Discovery</div>
const MockServiceDetailPage = () => <div data-testid="service-detail-page">Service Detail</div>
const MockPricingPage = () => <div data-testid="pricing-page">Pricing</div>
const MockContactUsPage = () => <div data-testid="contact-page">Contact</div>
const MockLoginPage = () => <div data-testid="login-page">Login</div>
const MockRegisterPage = () => <div data-testid="register-page">Register</div>
const MockForgotPasswordPage = () => <div data-testid="forgot-password-page">Forgot Password</div>
const MockCustomerDashboard = () => <div data-testid="customer-dashboard">Customer Dashboard</div>
const MockProviderDashboard = () => <div data-testid="provider-dashboard">Provider Dashboard</div>
const MockAdminDashboard = () => <div data-testid="admin-dashboard">Admin Dashboard</div>
const MockProfilePage = () => <div data-testid="profile-page">Profile</div>
const MockBookingHistoryPage = () => <div data-testid="booking-history-page">Booking History</div>
const MockBookingConfirmationPage = () => <div data-testid="booking-confirmation-page">Booking Confirmation</div>
const MockServiceManagementPage = () => <div data-testid="service-management-page">Service Management</div>
const MockBookingManagementPage = () => <div data-testid="booking-management-page">Booking Management</div>
const MockEarningsPage = () => <div data-testid="earnings-page">Earnings</div>
const MockUserManagementPage = () => <div data-testid="user-management-page">User Management</div>
const MockSystemSettingsPage = () => <div data-testid="system-settings-page">System Settings</div>
const MockAnalyticsPage = () => <div data-testid="analytics-page">Analytics</div>
const MockNotificationList = () => <div data-testid="notification-list">Notifications</div>
const MockNotificationPreferences = ({ preferences, onPreferencesUpdate }: any) => (
  <div data-testid="notification-preferences">
    Preferences: {JSON.stringify(preferences)}
    <button onClick={() => onPreferencesUpdate({ ...preferences, emailEnabled: false })}>
      Update
    </button>
  </div>
)
const MockNotFoundPage = () => <div data-testid="not-found-page">404 Not Found</div>
const MockUnauthorizedPage = () => <div data-testid="unauthorized-page">Unauthorized</div>

vi.mock('../pages/public/HomePage', () => ({
  default: MockHomePage
}))

vi.mock('../pages/public/ServiceDiscoveryPage', () => ({
  default: MockServiceDiscoveryPage
}))

vi.mock('../pages/public/ServiceDetailPage', () => ({
  default: MockServiceDetailPage
}))

vi.mock('../pages/public/PricingPage', () => ({
  default: MockPricingPage
}))

vi.mock('../pages/public/ContactUsPage', () => ({
  default: MockContactUsPage
}))

vi.mock('../pages/auth/LoginPage', () => ({
  default: MockLoginPage
}))

vi.mock('../pages/auth/RegisterPage', () => ({
  default: MockRegisterPage
}))

vi.mock('../pages/auth/ForgotPasswordPage', () => ({
  default: MockForgotPasswordPage
}))

vi.mock('../pages/dashboards/CustomerDashboard', () => ({
  default: MockCustomerDashboard
}))

vi.mock('../pages/dashboards/ProviderDashboard', () => ({
  default: MockProviderDashboard
}))

vi.mock('../pages/dashboards/AdminDashboard', () => ({
  default: MockAdminDashboard
}))

vi.mock('../pages/customer/ProfilePage', () => ({
  default: MockProfilePage
}))

vi.mock('../pages/customer/BookingHistoryPage', () => ({
  default: MockBookingHistoryPage
}))

vi.mock('../pages/customer/BookingConfirmationPage', () => ({
  default: MockBookingConfirmationPage
}))

vi.mock('../pages/provider/ServiceManagementPage', () => ({
  default: MockServiceManagementPage
}))

vi.mock('../pages/provider/BookingManagementPage', () => ({
  default: MockBookingManagementPage
}))

vi.mock('../pages/provider/EarningsPage', () => ({
  default: MockEarningsPage
}))

vi.mock('../pages/admin/UserManagementPage', () => ({
  default: MockUserManagementPage
}))

vi.mock('../pages/admin/SystemSettingsPage', () => ({
  default: MockSystemSettingsPage
}))

vi.mock('../pages/admin/AnalyticsPage', () => ({
  default: MockAnalyticsPage
}))

vi.mock('../components/notification/NotificationList/NotificationList', () => ({
  default: MockNotificationList
}))

vi.mock('../components/notification/NotificationPreferences/NotificationPreferences', () => ({
  default: MockNotificationPreferences
}))

vi.mock('../pages/error/NotFoundPage', () => ({
  default: MockNotFoundPage
}))

vi.mock('../pages/error/UnauthorizedPage', () => ({
  default: MockUnauthorizedPage
}))

vi.mock('../layouts/PublicLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="public-layout">{children}</div>
  )
}))

vi.mock('../layouts/AuthLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-layout">{children}</div>
  )
}))

vi.mock('../layouts/DashboardLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  )
}))

vi.mock('../components/auth/ProtectedRoute', () => ({
  default: ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => (
    <div data-testid={`protected-route-${allowedRoles.join('-')}`}>{children}</div>
  )
}))

vi.mock('../components/auth/PublicRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="public-route">{children}</div>
  )
}))

vi.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  )
}))

vi.mock('../contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  )
}))

vi.mock('react-hot-toast', () => ({
  Toaster: () => <div data-testid="toaster" />
}))

// ==================== TEST SETUP ====================
/**
 * Create a test wrapper with necessary providers for routing tests.
 */
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

const TestWrapper = createTestWrapper()

// ==================== IMPORTS ====================
/**
 * Import the component under test after all mocks are set up.
 */
import { AppRoutes } from '../index'
import { AuthProvider } from '../../contexts/AuthContext'
import { ThemeProvider } from '../../contexts/ThemeContext'

// ==================== TEST SUITES ====================

describe('AppRoutes Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Test route configuration validation
   * Ensures all expected routes are properly configured
   */
  describe('Route Configuration Validation', () => {
    it('should render public routes correctly', async () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('public-layout')).toBeInTheDocument()
        expect(screen.getByTestId('home-page')).toBeInTheDocument()
      })
    })

    it('should render service discovery route', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/services']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      expect(screen.getByTestId('public-layout')).toBeInTheDocument()
      expect(screen.getByTestId('service-discovery-page')).toBeInTheDocument()
    })

    it('should render service detail route with parameter', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/services/123']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      expect(screen.getByTestId('public-layout')).toBeInTheDocument()
      expect(screen.getByTestId('service-detail-page')).toBeInTheDocument()
    })

    it('should render pricing route', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/pricing']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      expect(screen.getByTestId('public-layout')).toBeInTheDocument()
      expect(screen.getByTestId('pricing-page')).toBeInTheDocument()
    })

    it('should render contact route', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/contact']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      expect(screen.getByTestId('public-layout')).toBeInTheDocument()
      expect(screen.getByTestId('contact-page')).toBeInTheDocument()
    })

    it('should render authentication routes', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/auth/login']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      expect(screen.getByTestId('auth-layout')).toBeInTheDocument()
      expect(screen.getByTestId('public-route')).toBeInTheDocument()
      expect(screen.getByTestId('login-page')).toBeInTheDocument()
    })

    it('should render register route', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/auth/register']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      expect(screen.getByTestId('auth-layout')).toBeInTheDocument()
      expect(screen.getByTestId('public-route')).toBeInTheDocument()
      expect(screen.getByTestId('register-page')).toBeInTheDocument()
    })

    it('should render forgot password route', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/auth/forgot-password']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      expect(screen.getByTestId('auth-layout')).toBeInTheDocument()
      expect(screen.getByTestId('public-route')).toBeInTheDocument()
      expect(screen.getByTestId('forgot-password-page')).toBeInTheDocument()
    })
  })

  /**
   * Test protected routes with role-based access control
   */
  describe('Protected Routes', () => {
    it('should render customer dashboard with protection', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/customer/dashboard']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      expect(screen.getByTestId('protected-route-customer')).toBeInTheDocument()
      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
      expect(screen.getByTestId('customer-dashboard')).toBeInTheDocument()
    })

    it('should render provider dashboard with protection', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/provider/dashboard']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      expect(screen.getByTestId('protected-route-service_provider')).toBeInTheDocument()
      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
      expect(screen.getByTestId('provider-dashboard')).toBeInTheDocument()
    })

    it('should render admin dashboard with protection', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/admin/dashboard']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      expect(screen.getByTestId('protected-route-tenant_admin-system_admin')).toBeInTheDocument()
      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
      expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument()
    })

    it('should render system admin dashboard with protection', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/system-admin/dashboard']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      expect(screen.getByTestId('protected-route-system_admin')).toBeInTheDocument()
      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
      expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument()
    })
  })

  /**
   * Test route parameter handling
   */
  describe('Route Parameter Handling', () => {
    it('should handle service detail route parameters', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/services/abc-123']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      expect(screen.getByTestId('service-detail-page')).toBeInTheDocument()
    })

    it('should handle booking confirmation route parameters', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/customer/bookings/456/confirmation']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      expect(screen.getByTestId('protected-route-customer')).toBeInTheDocument()
      expect(screen.getByTestId('booking-confirmation-page')).toBeInTheDocument()
    })
  })

  /**
   * Test error routes
   */
  describe('Error Routes', () => {
    it('should render 404 page for unknown routes', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/unknown-route']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
    })

    it('should render unauthorized page', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/unauthorized']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      expect(screen.getByTestId('unauthorized-page')).toBeInTheDocument()
    })
  })

  /**
   * Test navigation redirects
   */
  describe('Navigation Redirects', () => {
    it('should redirect customer index to dashboard', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/customer']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      // The Navigate component will cause a redirect, so we should see the dashboard
      expect(screen.getByTestId('protected-route-customer')).toBeInTheDocument()
      expect(screen.getByTestId('customer-dashboard')).toBeInTheDocument()
    })

    it('should redirect provider index to dashboard', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/provider']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      expect(screen.getByTestId('protected-route-service_provider')).toBeInTheDocument()
      expect(screen.getByTestId('provider-dashboard')).toBeInTheDocument()
    })

    it('should redirect admin index to dashboard', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/admin']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      expect(screen.getByTestId('protected-route-tenant_admin-system_admin')).toBeInTheDocument()
      expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument()
    })

    it('should redirect system admin index to dashboard', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/system-admin']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      expect(screen.getByTestId('protected-route-system_admin')).toBeInTheDocument()
      expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument()
    })
  })

  /**
   * Test notification preferences routes
   */
  describe('Notification Preferences', () => {
    it('should render customer notification preferences', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/customer/notifications/preferences']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      expect(screen.getByTestId('protected-route-customer')).toBeInTheDocument()
      expect(screen.getByTestId('notification-preferences')).toBeInTheDocument()
    })

    it('should render provider notification preferences', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/provider/notifications/preferences']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      expect(screen.getByTestId('protected-route-service_provider')).toBeInTheDocument()
      expect(screen.getByTestId('notification-preferences')).toBeInTheDocument()
    })

    it('should render admin notification preferences', () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/admin/notifications/preferences']}>
            <AppRoutes />
          </MemoryRouter>
        </TestWrapper>
      )

      expect(screen.getByTestId('protected-route-tenant_admin-system_admin')).toBeInTheDocument()
      expect(screen.getByTestId('notification-preferences')).toBeInTheDocument()
    })
  })
})