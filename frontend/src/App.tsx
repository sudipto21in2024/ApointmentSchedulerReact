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
import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

// ==================== MODULAR ROUTING SYSTEM ====================
/**
 * Centralized routing configuration using modular route components.
 * This approach provides better code organization, lazy loading, and maintainability.
 */
import { AppRoutes } from './routes'  // Main routing configuration with lazy loading

// ==================== CONTEXT PROVIDERS ====================
/**
 * Global state management providers that wrap the entire application.
 * These contexts provide shared state and functionality across all components.
 */
import { AuthProvider } from './contexts/AuthContext'    // Authentication state management
import { ThemeProvider } from './contexts/ThemeContext'  // Theme and UI preferences

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
              {/* Modular Routing System with Lazy Loading */}
              <AppRoutes />

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
