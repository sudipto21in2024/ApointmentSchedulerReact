import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Pages
import HomePage from './pages/public/HomePage'
import ServiceDiscoveryPage from './pages/public/ServiceDiscoveryPage'
import ServiceDetailPage from './pages/public/ServiceDetailPage'
import PricingPage from './pages/public/PricingPage'
import ContactUsPage from './pages/public/ContactUsPage'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

// Dashboard Pages
import CustomerDashboard from './pages/dashboards/CustomerDashboard'
import ProviderDashboard from './pages/dashboards/ProviderDashboard'
import AdminDashboard from './pages/dashboards/AdminDashboard'

// Feature Pages
import ProfilePage from './pages/customer/ProfilePage'
import BookingHistoryPage from './pages/customer/BookingHistoryPage'
import BookingConfirmationPage from './pages/customer/BookingConfirmationPage'

// Provider Pages
import ServiceManagementPage from './pages/provider/ServiceManagementPage'
import BookingManagementPage from './pages/provider/BookingManagementPage'
import EarningsPage from './pages/provider/EarningsPage'

// Admin Pages
import UserManagementPage from './pages/admin/UserManagementPage'
import SystemSettingsPage from './pages/admin/SystemSettingsPage'
import AnalyticsPage from './pages/admin/AnalyticsPage'

// Error Pages
import NotFoundPage from './pages/error/NotFoundPage'
import UnauthorizedPage from './pages/error/UnauthorizedPage'

// Context Providers
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'

// Utils
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
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
