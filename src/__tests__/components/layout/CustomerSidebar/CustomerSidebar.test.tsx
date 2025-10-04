import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import CustomerSidebar from '../../../../components/layout/CustomerSidebar/CustomerSidebar';

// Mock useLocation
const mockUseLocation = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => mockUseLocation()
  };
});

/**
 * Test suite for CustomerSidebar component
 * Tests navigation items, active states, and responsive behavior
 */
describe('CustomerSidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Navigation Items', () => {
    it('renders all customer navigation items', () => {
      mockUseLocation.mockReturnValue({ pathname: '/customer/dashboard' });

      render(
        <BrowserRouter>
          <CustomerSidebar isCollapsed={false} />
        </BrowserRouter>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Browse Services')).toBeInTheDocument();
      expect(screen.getByText('My Bookings')).toBeInTheDocument();
      expect(screen.getByText('Favorites')).toBeInTheDocument();
      expect(screen.getByText('Payments')).toBeInTheDocument();
      expect(screen.getByText('My Reviews')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders navigation links with correct paths', () => {
      mockUseLocation.mockReturnValue({ pathname: '/customer/dashboard' });

      render(
        <BrowserRouter>
          <CustomerSidebar isCollapsed={false} />
        </BrowserRouter>
      );

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveAttribute('href', '/customer/dashboard');

      const servicesLink = screen.getByText('Browse Services').closest('a');
      expect(servicesLink).toHaveAttribute('href', '/customer/services');
    });
  });

  describe('Active State', () => {
    it('highlights active navigation item', () => {
      mockUseLocation.mockReturnValue({ pathname: '/customer/bookings' });

      render(
        <BrowserRouter>
          <CustomerSidebar isCollapsed={false} />
        </BrowserRouter>
      );

      const bookingsLink = screen.getByText('My Bookings').closest('a');
      expect(bookingsLink).toHaveClass('bg-blue-50', 'text-blue-700', 'border-r-2', 'border-blue-700');
    });

    it('does not highlight inactive navigation items', () => {
      mockUseLocation.mockReturnValue({ pathname: '/customer/bookings' });

      render(
        <BrowserRouter>
          <CustomerSidebar isCollapsed={false} />
        </BrowserRouter>
      );

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).not.toHaveClass('bg-blue-50');
    });

    it('handles nested routes correctly', () => {
      mockUseLocation.mockReturnValue({ pathname: '/customer/bookings/123' });

      render(
        <BrowserRouter>
          <CustomerSidebar isCollapsed={false} />
        </BrowserRouter>
      );

      const bookingsLink = screen.getByText('My Bookings').closest('a');
      expect(bookingsLink).toHaveClass('bg-blue-50');
    });
  });

  describe('Collapsed State', () => {
    it('hides navigation labels when collapsed', () => {
      mockUseLocation.mockReturnValue({ pathname: '/customer/dashboard' });

      render(
        <BrowserRouter>
          <CustomerSidebar isCollapsed={true} />
        </BrowserRouter>
      );

      // Labels should not be visible
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Browse Services')).not.toBeInTheDocument();

      // Icons should still be present (though we can't easily test this without more complex queries)
      // The links should still exist but be styled differently
    });

    it('shows tooltips for collapsed items', () => {
      mockUseLocation.mockReturnValue({ pathname: '/customer/dashboard' });

      render(
        <BrowserRouter>
          <CustomerSidebar isCollapsed={true} />
        </BrowserRouter>
      );

      // Check that title attributes are set for tooltips
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
      // Note: Testing title attributes would require more specific selectors
    });
  });

  describe('Badge Display', () => {
    it('displays notification badge when present', () => {
      mockUseLocation.mockReturnValue({ pathname: '/customer/dashboard' });

      render(
        <BrowserRouter>
          <CustomerSidebar isCollapsed={false} />
        </BrowserRouter>
      );

      // The notifications item has a badge of 3
      const badge = screen.getByText('3');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-red-500');
    });

    it('does not display badge for items without badges', () => {
      mockUseLocation.mockReturnValue({ pathname: '/customer/dashboard' });

      render(
        <BrowserRouter>
          <CustomerSidebar isCollapsed={false} />
        </BrowserRouter>
      );

      // Dashboard should not have a badge
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      const badgeInDashboard = dashboardLink?.querySelector('.bg-red-500');
      expect(badgeInDashboard).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      mockUseLocation.mockReturnValue({ pathname: '/customer/dashboard' });

      render(
        <BrowserRouter>
          <CustomerSidebar isCollapsed={false} />
        </BrowserRouter>
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();

      const links = screen.getAllByRole('link');
      expect(links.length).toBe(9); // All navigation items
    });

    it('sets aria-current for active items', () => {
      mockUseLocation.mockReturnValue({ pathname: '/customer/bookings' });

      render(
        <BrowserRouter>
          <CustomerSidebar isCollapsed={false} />
        </BrowserRouter>
      );

      const bookingsLink = screen.getByText('My Bookings').closest('a');
      expect(bookingsLink).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Icons', () => {
    it('renders icons for all navigation items', () => {
      mockUseLocation.mockReturnValue({ pathname: '/customer/dashboard' });

      render(
        <BrowserRouter>
          <CustomerSidebar isCollapsed={false} />
        </BrowserRouter>
      );

      // Check that SVG icons are present (we can't easily test specific icons without more complex queries)
      const svgs = document.querySelectorAll('svg');
      expect(svgs.length).toBe(9); // One for each navigation item
    });
  });

  describe('Styling', () => {
    it('applies correct base classes', () => {
      mockUseLocation.mockReturnValue({ pathname: '/customer/dashboard' });

      render(
        <BrowserRouter>
          <CustomerSidebar isCollapsed={false} />
        </BrowserRouter>
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('px-3', 'py-4');
    });

    it('applies hover and focus styles', () => {
      mockUseLocation.mockReturnValue({ pathname: '/customer/dashboard' });

      render(
        <BrowserRouter>
          <CustomerSidebar isCollapsed={false} />
        </BrowserRouter>
      );

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveClass('hover:bg-gray-100', 'focus:outline-none');
    });
  });
});