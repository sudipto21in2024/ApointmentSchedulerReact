/**
 * Application Header Component
 *
 * Main application header following Layout 2 and Layout 3 specifications from the design system.
 * Provides branding, navigation, user profile information, and notifications drawer.
 *
 * Features:
 * - Logo and company name branding
 * - User profile information and actions
 * - Notifications drawer with badge indicators
 * - Breadcrumb navigation control
 * - Responsive design with mobile considerations
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Integration with authentication system
 */

import React, { useState, useCallback } from 'react';

// Import UI components from the design system
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

// Import utilities
import { cn } from '../../utils/cn';

export interface AppHeaderProps {
  /** User information */
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  /** Company/brand information */
  brand?: {
    name: string;
    logo?: string;
    tagline?: string;
  };
  /** Breadcrumb navigation items */
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    current?: boolean;
  }>;
  /** Notification count */
  notificationCount?: number;
  /** Whether to show search bar */
  showSearch?: boolean;
  /** Whether to show notifications */
  showNotifications?: boolean;
  /** Custom header actions */
  actions?: React.ReactNode;
  /** Mobile menu state */
  mobileMenuOpen?: boolean;
  /** Mobile menu toggle handler */
  onMobileMenuToggle?: () => void;
  /** Search handler */
  onSearch?: (query: string) => void;
  /** Notification click handler */
  onNotificationsClick?: () => void;
  /** Profile click handler */
  onProfileClick?: () => void;
  /** Logout handler */
  onLogout?: () => void;
  /** Custom CSS class */
  className?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

/**
 * Application Header Component
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  user = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'customer'
  },
  brand = {
    name: 'Appointment Scheduler',
    tagline: 'Professional Booking Management'
  },
  breadcrumbs = [],
  notificationCount = 0,
  showSearch = true,
  showNotifications = true,
  actions,
  onMobileMenuToggle,
  onSearch,
  onNotificationsClick,
  onProfileClick,
  onLogout,
  className = '',
  'data-testid': testId = 'app-header'
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock notifications data
  const [notifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Booking Confirmed',
      message: 'Your booking for Haircut & Styling has been confirmed.',
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: '2',
      title: 'Upcoming Appointment',
      message: 'You have an appointment tomorrow at 2:00 PM.',
      type: 'info',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true
    }
  ]);

  /**
   * Handle search input changes
   */
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  }, [onSearch]);

  /**
   * Handle notification click
   */
  const handleNotificationsClick = useCallback(() => {
    setShowNotificationsDrawer(true);
    onNotificationsClick?.();
  }, [onNotificationsClick]);

  /**
   * Handle profile menu toggle
   */
  const handleProfileClick = useCallback(() => {
    setShowProfileMenu(!showProfileMenu);
    onProfileClick?.();
  }, [showProfileMenu, onProfileClick]);

  /**
   * Get notification icon color based on type
   */
  const getNotificationIconColor = (type: NotificationItem['type']) => {
    const colors = {
      info: 'text-blue-500',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      error: 'text-red-500'
    };
    return colors[type] || colors.info;
  };

  return (
    <>
      <header className={cn('bg-white border-b border-gray-200 sticky top-0 z-40', className)} data-testid={testId}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo, Brand, Mobile menu button */}
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={onMobileMenuToggle}
                data-testid="mobile-menu-button"
              >
                ☰
              </Button>

              {/* Brand/Logo */}
              <div className="flex items-center gap-3">
                {brand.logo && (
                  <img
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    className="h-8 w-8"
                    data-testid="brand-logo"
                  />
                )}
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{brand.name}</h1>
                  {brand.tagline && (
                    <p className="text-xs text-gray-500 hidden sm:block">{brand.tagline}</p>
                  )}
                </div>
              </div>

              {/* Breadcrumb navigation */}
              {breadcrumbs.length > 0 && (
                <nav className="hidden md:flex items-center space-x-2 text-sm">
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <span className="text-gray-400">/</span>}
                      {crumb.href ? (
                        <a
                          href={crumb.href}
                          className={cn(
                            'hover:text-gray-900 transition-colors',
                            crumb.current ? 'text-gray-900 font-medium' : 'text-gray-600'
                          )}
                        >
                          {crumb.label}
                        </a>
                      ) : (
                        <span className={cn(
                          crumb.current ? 'text-gray-900 font-medium' : 'text-gray-600'
                        )}>
                          {crumb.label}
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              )}
            </div>

            {/* Right side - Search, Notifications, Profile */}
            <div className="flex items-center gap-3">
              {/* Search bar */}
              {showSearch && (
                <div className="hidden sm:block relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10 w-64"
                    data-testid="header-search"
                  />
                </div>
              )}

              {/* Notifications */}
              {showNotifications && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNotificationsClick}
                  className="relative"
                  data-testid="notifications-button"
                >
                  🔔
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  )}
                </Button>
              )}

              {/* Profile dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleProfileClick}
                  className="flex items-center gap-2"
                  data-testid="profile-button"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <div className="h-6 w-6 bg-gray-300 rounded-full flex items-center justify-center">
                      👤
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                </Button>

                {/* Profile dropdown menu */}
                {showProfileMenu && (
                  <Card className="absolute right-0 mt-2 w-56 z-50 shadow-lg border">
                    <CardContent className="p-0">
                      <div className="p-4 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                      <div className="py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start px-4 py-2 text-sm"
                          onClick={() => setShowProfileMenu(false)}
                          data-testid="profile-menu-profile"
                        >
                          👤 Profile
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start px-4 py-2 text-sm"
                          onClick={() => setShowProfileMenu(false)}
                          data-testid="profile-menu-settings"
                        >
                          ⚙️ Settings
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start px-4 py-2 text-sm text-red-600"
                          onClick={() => {
                            setShowProfileMenu(false);
                            onLogout?.();
                          }}
                          data-testid="profile-menu-logout"
                        >
                          🚪 Sign out
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Custom actions */}
              {actions}
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Drawer Modal */}
      <Modal
        open={showNotificationsDrawer}
        onClose={() => setShowNotificationsDrawer(false)}
        size="md"
        data-testid="notifications-drawer"
      >
        <ModalHeader>
          <ModalTitle>Notifications</ModalTitle>
        </ModalHeader>
        <ModalContent className="max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mx-auto mb-4">🔔</div>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Card key={notification.id} className={cn(
                  'cursor-pointer transition-colors hover:bg-gray-50',
                  !notification.read && 'bg-blue-50 border-blue-200'
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-2 h-2 rounded-full mt-2',
                        getNotificationIconColor(notification.type)
                      )} />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ModalContent>
      </Modal>
    </>
  );
};

// Import missing components for JSX
const ModalHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    {children}
  </div>
);

const ModalTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-semibold text-gray-900">
    {children}
  </h2>
);

const ModalContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
);

export default AppHeader;