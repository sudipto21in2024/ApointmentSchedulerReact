/**
 * @fileoverview Public Route Configuration
 *
 * This module defines all publicly accessible routes for the appointment booking system.
 * These routes are available without authentication and include marketing pages,
 * service discovery, and general information.
 *
 * @description
 * Public routes handle:
 * - Landing page with hero section and call-to-actions
 * - Service discovery and search functionality
 * - Detailed service information pages
 * - Pricing and subscription information
 * - Contact and support pages
 *
 * @lazyLoading
 * - All page components are lazy-loaded for performance
 * - Reduces initial bundle size by deferring non-critical code
 * - Improves First Contentful Paint (FCP) and Largest Contentful Paint (LCP)
 *
 * @seo
 * - Routes are optimized for search engine indexing
 * - Meta tags and structured data are handled in individual page components
 * - Open Graph tags for social media sharing
 *
 * @accessibility
 * - All routes maintain proper heading hierarchy
 * - Keyboard navigation support
 * - Screen reader friendly content structure
 *
 * @author Frontend Development Team
 * @version 1.0.0
 */

import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'

// ==================== LAZY-LOADED PUBLIC PAGE COMPONENTS ====================
/**
 * Public page components are lazy-loaded to optimize initial bundle size.
 * Each component handles a specific public-facing functionality.
 */
const HomePage = lazy(() => import('../pages/public/HomePage'))
const ServiceDiscoveryPage = lazy(() => import('../pages/public/ServiceDiscoveryPage'))
const ServiceDetailPage = lazy(() => import('../pages/public/ServiceDetailPage'))
const PricingPage = lazy(() => import('../pages/public/PricingPage'))
const ContactUsPage = lazy(() => import('../pages/public/ContactUsPage'))

/**
 * Public Routes Component
 *
 * Defines all routes that are accessible without user authentication.
 * These routes are nested under the public layout and handle marketing,
 * service discovery, and informational content.
 *
 * @returns {JSX.Element} Public route configuration
 *
 * @routeStructure
 * - / (index) - Landing page with hero section
 * - /services - Service discovery and search
 * - /services/:id - Detailed service information
 * - /pricing - Subscription plans and pricing
 * - /contact - Contact form and company information
 *
 * @example
 * ```tsx
 * <PublicLayout>
 *   <PublicRoutes />
 * </PublicLayout>
 * ```
 */
export const PublicRoutes = () => {
  return (
    <Routes>
      {/* Landing Page Route */}
      <Route
        index
        element={<HomePage />}
      />

      {/* Service Discovery Route */}
      <Route
        path="services"
        element={<ServiceDiscoveryPage />}
      />

      {/* Service Detail Route with Dynamic Parameter */}
      <Route
        path="services/:id"
        element={<ServiceDetailPage />}
      />

      {/* Pricing Information Route */}
      <Route
        path="pricing"
        element={<PricingPage />}
      />

      {/* Contact Information Route */}
      <Route
        path="contact"
        element={<ContactUsPage />}
      />
    </Routes>
  )
}

export default PublicRoutes