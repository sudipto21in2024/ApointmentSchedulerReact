/**
 * Main Layout Component
 *
 * Layout 2: Main Application (Logged In) implementation following design system specifications.
 * Provides header, collapsible sidebar, and main content area structure.
 *
 * Layout Structure:
 * - Header: Logo, company name, user profile, notifications drawer, breadcrumb
 * - Sidebar: Hierarchical menu groups, collapsible to icons, mobile hamburger menu
 * - Main Content: Dashboards, data grids, master-details forms
 *
 * Features:
 * - Responsive design with mobile-first approach
 * - Collapsible sidebar with smooth animations
 * - Mobile hamburger menu integration
 * - Breadcrumb navigation support
 * - Notification system integration
 * - User profile management
 * - Accessibility features throughout
 */

import React, { useState, useCallback } from 'react';

// Import layout components
import { AppHeader } from './AppHeader';
import type { AppHeaderProps } from './AppHeader';
import { AppSidebar, defaultBookingMenuGroups } from './AppSidebar';
import type { AppSidebarProps } from './AppSidebar';

// Import utilities
import { cn } from '../../utils/cn';

export interface MainLayoutProps {
  /** Main content to render */
  children: React.ReactNode;
  /** Header configuration */
  header?: AppHeaderProps;
  /** Sidebar configuration */
  sidebar?: Omit<AppSidebarProps, 'mobile' | 'mobileOpen' | 'onMobileClose'>;
  /** Whether to show sidebar */
  showSidebar?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * Main Layout Component - Layout 2 Implementation
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  header,
  sidebar = {
    menuGroups: defaultBookingMenuGroups,
    collapsed: false,
    activeItem: 'dashboard'
  },
  showSidebar = true,
  className = '',
  'data-testid': testId = 'main-layout'
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(sidebar.collapsed || false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /**
   * Handle sidebar collapse toggle
   */
  const handleSidebarCollapse = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    sidebar.onCollapseChange?.(collapsed);
  }, [sidebar.onCollapseChange]);

  /**
   * Handle mobile menu toggle
   */
  const handleMobileMenuToggle = useCallback(() => {
    setMobileMenuOpen(!mobileMenuOpen);
  }, [mobileMenuOpen]);

  /**
   * Handle mobile menu close
   */
  const handleMobileMenuClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  /**
   * Handle menu item click
   */
  const handleMenuItemClick = useCallback((item: any) => {
    sidebar.onMenuItemClick?.(item);

    // Close mobile menu when item is selected
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [sidebar.onMenuItemClick, mobileMenuOpen]);

  return (
    <div className={cn('min-h-screen bg-gray-50', className)} data-testid={testId}>
      {/* Header */}
      <AppHeader
        {...header}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={handleMobileMenuToggle}
      />

      <div className="flex">
        {/* Sidebar */}
        {showSidebar && (
          <AppSidebar
            {...sidebar}
            collapsed={sidebarCollapsed}
            mobile={false}
            onCollapseChange={handleSidebarCollapse}
            onMenuItemClick={handleMenuItemClick}
          />
        )}

        {/* Main content area */}
        <main className={cn(
          'flex-1 transition-all duration-300',
          showSidebar && 'lg:ml-0',
          showSidebar && sidebarCollapsed && 'lg:ml-16',
          !showSidebar && 'ml-0'
        )}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar */}
      {showSidebar && (
        <AppSidebar
          {...sidebar}
          mobile={true}
          mobileOpen={mobileMenuOpen}
          onMobileClose={handleMobileMenuClose}
          onMenuItemClick={handleMenuItemClick}
        />
      )}
    </div>
  );
};

/**
 * Static Content Layout Component - Layout 3 Implementation
 *
 * Layout 3: Static Content (Logged In) - Header, footer, sidebar, middle content card area
 */
export interface StaticLayoutProps extends MainLayoutProps {
  /** Footer content */
  footer?: React.ReactNode;
  /** Whether to show footer */
  showFooter?: boolean;
}

export const StaticLayout: React.FC<StaticLayoutProps> = ({
  children,
  footer,
  showFooter = true,
  ...mainLayoutProps
}) => {
  return (
    <MainLayout {...mainLayoutProps}>
      {/* Content card area for static content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {children}
        </div>
      </div>

      {/* Footer */}
      {showFooter && footer && (
        <footer className="mt-auto border-t border-gray-200 bg-white">
          <div className="px-6 py-4">
            {footer}
          </div>
        </footer>
      )}
    </MainLayout>
  );
};

/**
 * Public Layout Component - Layout 1 Implementation
 *
 * Layout 1: Public-Facing (Logged Out) - Header, content card area, footer
 */
export interface PublicLayoutProps {
  /** Main content */
  children: React.ReactNode;
  /** Header content */
  header?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Custom CSS class */
  className?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  header,
  footer,
  className = '',
  'data-testid': testId = 'public-layout'
}) => {
  return (
    <div className={cn('min-h-screen bg-gray-50 flex flex-col', className)} data-testid={testId}>
      {/* Public header */}
      {header && (
        <header className="bg-white border-b border-gray-200">
          {header}
        </header>
      )}

      {/* Main content card area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {children}
          </div>
        </div>
      </main>

      {/* Public footer */}
      {footer && (
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="px-6 py-4 text-center text-sm text-gray-500">
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
};

export default MainLayout;