import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import CustomerSidebar from '../CustomerSidebar/CustomerSidebar';
import TenantAdminSidebar from '../TenantAdminSidebar/TenantAdminSidebar';
import SystemAdminSidebar from '../SystemAdminSidebar/SystemAdminSidebar';

/**
 * Sidebar Component - Main sidebar container that renders role-specific navigation
 *
 * Features:
 * - Collapsible/expandable sidebar for desktop
 * - Mobile-responsive hamburger menu
 * - Role-based navigation rendering
 * - Active route highlighting
 * - Smooth animations and transitions
 *
 * @returns {JSX.Element} The sidebar component
 */
interface SidebarProps {
  /** Whether the sidebar is collapsed (icon-only mode) */
  isCollapsed?: boolean;
  /** Callback to toggle sidebar collapse state */
  onToggleCollapse?: () => void;
  /** Whether the mobile menu is open */
  isMobileOpen?: boolean;
  /** Callback to toggle mobile menu */
  onToggleMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onToggleMobile
}) => {
  const { user } = useAuth();
  const location = useLocation();

  /**
   * Determines the user's role for rendering appropriate navigation
   * Maps user roles to sidebar components
   */
  const getSidebarContent = () => {
    if (!user) return null;

    const role = user.role; // Assuming user object has a role property

    switch (role) {
      case 'CUSTOMER':
        return <CustomerSidebar isCollapsed={isCollapsed} />;
      case 'TENANT_ADMIN':
        return <TenantAdminSidebar isCollapsed={isCollapsed} />;
      case 'SYSTEM_ADMIN':
        return <SystemAdminSidebar isCollapsed={isCollapsed} />;
      default:
        return <CustomerSidebar isCollapsed={isCollapsed} />;
    }
  };

  /**
   * Handles sidebar collapse toggle for desktop view
   */
  const handleCollapseToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  /**
   * Handles mobile menu close
   */
  const handleMobileClose = () => {
    if (onToggleMobile) {
      onToggleMobile();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-50
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={handleCollapseToggle}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={handleMobileClose}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          {getSidebarContent()}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          {!isCollapsed && (
            <div className="text-xs text-gray-500 text-center">
              © 2024 Appointment Scheduler
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;