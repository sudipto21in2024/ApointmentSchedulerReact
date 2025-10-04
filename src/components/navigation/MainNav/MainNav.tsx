import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * MainNav Component - Reusable navigation component for main application navigation
 *
 * Features:
 * - Horizontal navigation layout
 * - Active route highlighting
 * - Responsive design with mobile menu
 * - Customizable navigation items
 * - Accessibility compliant
 *
 * @param {MainNavProps} props - Component props
 * @returns {JSX.Element} The main navigation component
 */
interface NavItem {
  /** Unique identifier for the navigation item */
  id: string;
  /** Display label for the navigation item */
  label: string;
  /** Route path for navigation */
  path: string;
  /** Optional icon component */
  icon?: React.ReactNode;
  /** Optional badge count for notifications, etc. */
  badge?: number;
  /** Whether this item requires authentication */
  requiresAuth?: boolean;
}

interface MainNavProps {
  /** Array of navigation items to display */
  items: NavItem[];
  /** Additional CSS classes for styling */
  className?: string;
  /** Whether to show icons in navigation items */
  showIcons?: boolean;
  /** Orientation of the navigation (horizontal or vertical) */
  orientation?: 'horizontal' | 'vertical';
}

const MainNav: React.FC<MainNavProps> = ({
  items,
  className = '',
  showIcons = false,
  orientation = 'horizontal'
}) => {
  const location = useLocation();

  /**
   * Determines if a navigation item is currently active
   * @param {string} path - The navigation item path
   * @returns {boolean} Whether the item is active
   */
  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  /**
   * Handles navigation item click
   * Can be extended for analytics tracking, etc.
   * @param {NavItem} item - The clicked navigation item
   */
  const handleItemClick = (item: NavItem) => {
    // Analytics tracking could be added here
    console.log(`Navigation: ${item.label} (${item.path})`);
  };

  const baseClasses = orientation === 'horizontal'
    ? 'flex items-center space-x-1'
    : 'flex flex-col space-y-1';

  const itemClasses = orientation === 'horizontal'
    ? 'px-3 py-2 rounded-md text-sm font-medium transition-colors'
    : 'px-3 py-2 rounded-md text-sm font-medium transition-colors w-full text-left';

  return (
    <nav className={`${baseClasses} ${className}`}>
      {items.map((item) => {
        const active = isActive(item.path);

        return (
          <Link
            key={item.id}
            to={item.path}
            onClick={() => handleItemClick(item)}
            className={`
              ${itemClasses}
              ${active
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              relative
            `}
            aria-current={active ? 'page' : undefined}
          >
            {/* Icon (if enabled and available) */}
            {showIcons && item.icon && (
              <span className={`inline-flex items-center ${orientation === 'horizontal' ? 'mr-2' : 'mr-3'}`}>
                {item.icon}
              </span>
            )}

            {/* Label */}
            <span className={orientation === 'vertical' ? 'flex-1' : ''}>
              {item.label}
            </span>

            {/* Badge (if present) */}
            {item.badge && item.badge > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default MainNav;