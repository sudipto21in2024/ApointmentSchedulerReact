/**
 * Application Sidebar Component
 *
 * Collapsible sidebar component following Layout 2 and Layout 3 specifications from the design system.
 * Provides hierarchical menu groups, mobile-friendly hamburger menu, and responsive design.
 *
 * Features:
 * - Hierarchical menu groups with nested navigation
 * - Collapsible to icons for desktop
 * - Mobile hamburger menu integration
 * - Active state management and indicators
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Responsive design with mobile considerations
 * - Integration with routing system
 */

import React, { useState, useCallback } from 'react';

// Import UI components from the design system
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

// Import utilities
import { cn } from '../../utils/cn';

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  children?: MenuItem[];
  badge?: string | number;
  disabled?: boolean;
  external?: boolean;
}

export interface MenuGroup {
  id: string;
  title: string;
  items: MenuItem[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface AppSidebarProps {
  /** Menu groups configuration */
  menuGroups: MenuGroup[];
  /** Whether sidebar is collapsed */
  collapsed?: boolean;
  /** Whether sidebar is in mobile mode */
  mobile?: boolean;
  /** Mobile menu open state */
  mobileOpen?: boolean;
  /** Current active menu item ID */
  activeItem?: string;
  /** Sidebar width when expanded */
  width?: number;
  /** Sidebar width when collapsed */
  collapsedWidth?: number;
  /** Callback when menu item is clicked */
  onMenuItemClick?: (item: MenuItem) => void;
  /** Callback when sidebar collapse state changes */
  onCollapseChange?: (collapsed: boolean) => void;
  /** Callback when mobile menu is closed */
  onMobileClose?: () => void;
  /** Custom CSS class */
  className?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * Application Sidebar Component
 */
export const AppSidebar: React.FC<AppSidebarProps> = ({
  menuGroups,
  collapsed = false,
  mobile = false,
  mobileOpen = false,
  activeItem,
  width = 280,
  collapsedWidth = 64,
  onMenuItemClick,
  onCollapseChange,
  onMobileClose,
  className = '',
  'data-testid': testId = 'app-sidebar'
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  /**
   * Handle menu item click
   */
  const handleMenuItemClick = useCallback((item: MenuItem) => {
    onMenuItemClick?.(item);

    // Close mobile menu when item is clicked
    if (mobile) {
      onMobileClose?.();
    }
  }, [onMenuItemClick, mobile, onMobileClose]);

  /**
   * Handle menu group collapse toggle
   */
  const handleGroupToggle = useCallback((groupId: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  /**
   * Render menu item
   */
  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isActive = activeItem === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const paddingLeft = level * 16 + 16; // Indent based on level

    return (
      <div key={item.id}>
        <Button
          variant={isActive ? 'primary' : 'ghost'}
          className={cn(
            'w-full justify-start h-10 mb-1',
            level > 0 && 'ml-4',
            item.disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{ paddingLeft: collapsed ? 16 : paddingLeft }}
          onClick={() => !item.disabled && handleMenuItemClick(item)}
          disabled={item.disabled}
          data-testid={`menu-item-${item.id}`}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {item.icon && (
              <span className="text-lg flex-shrink-0">{item.icon}</span>
            )}
            {!collapsed && (
              <>
                <span className="truncate flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium flex-shrink-0',
                    typeof item.badge === 'number' && item.badge > 0
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  )}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </div>
        </Button>

        {/* Render children if they exist */}
        {hasChildren && !collapsed && (
          <div className="ml-4 space-y-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  /**
   * Render menu group
   */
  const renderMenuGroup = (group: MenuGroup) => {
    const isGroupCollapsed = collapsedGroups.has(group.id);

    return (
      <Card key={group.id} className="mb-4">
        {group.title && !collapsed && (
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-700">
                {group.title}
              </CardTitle>
              {group.collapsible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleGroupToggle(group.id)}
                  data-testid={`group-toggle-${group.id}`}
                >
                  {isGroupCollapsed ? '▶' : '▼'}
                </Button>
              )}
            </div>
          </CardHeader>
        )}

        <CardContent className="pt-0">
          <div className="space-y-1">
            {group.items.map(item => renderMenuItem(item, 0))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Sidebar content
  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Sidebar header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          )}
          {!mobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCollapseChange?.(!collapsed)}
              data-testid="sidebar-collapse"
            >
              {collapsed ? '→' : '←'}
            </Button>
          )}
        </div>
      </div>

      {/* Menu groups */}
      <div className="flex-1 overflow-y-auto p-4">
        {menuGroups.map(renderMenuGroup)}
      </div>

      {/* Sidebar footer */}
      <div className="p-4 border-t border-gray-200">
        {!collapsed && (
          <div className="text-xs text-gray-500 text-center">
            <p>© 2024 Appointment Scheduler</p>
          </div>
        )}
      </div>
    </div>
  );

  // Mobile overlay
  if (mobile) {
    return (
      <>
        {/* Mobile backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onMobileClose}
            data-testid="mobile-backdrop"
          />
        )}

        {/* Mobile sidebar */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-80 bg-white transform transition-transform duration-300 ease-in-out lg:hidden',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          data-testid={testId}
        >
          {sidebarContent}
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div
      className={cn(
        'hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
        className
      )}
      style={{ width: collapsed ? collapsedWidth : width }}
      data-testid={testId}
    >
      {sidebarContent}
    </div>
  );
};

/**
 * Default menu configuration for booking management system
 */
export const defaultBookingMenuGroups: MenuGroup[] = [
  {
    id: 'main',
    title: 'Main Navigation',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: '📊',
        href: '/dashboard'
      },
      {
        id: 'bookings',
        label: 'Bookings',
        icon: '📅',
        href: '/bookings',
        children: [
          {
            id: 'bookings-list',
            label: 'All Bookings',
            icon: '📋',
            href: '/bookings'
          },
          {
            id: 'bookings-create',
            label: 'New Booking',
            icon: '➕',
            href: '/bookings/create'
          },
          {
            id: 'bookings-calendar',
            label: 'Calendar View',
            icon: '📆',
            href: '/bookings/calendar'
          }
        ]
      },
      {
        id: 'services',
        label: 'Services',
        icon: '🔧',
        href: '/services',
        children: [
          {
            id: 'services-list',
            label: 'All Services',
            icon: '📋',
            href: '/services'
          },
          {
            id: 'services-manage',
            label: 'Manage Services',
            icon: '⚙️',
            href: '/services/manage'
          }
        ]
      }
    ]
  },
  {
    id: 'management',
    title: 'Management',
    items: [
      {
        id: 'users',
        label: 'Users',
        icon: '👥',
        href: '/users'
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: '📈',
        href: '/reports'
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: '⚙️',
        href: '/settings'
      }
    ]
  }
];

export default AppSidebar;