/**
 * Checkbox Component
 *
 * A reusable checkbox component with consistent styling and accessibility features.
 * Supports controlled and uncontrolled usage patterns with proper form integration.
 *
 * Features:
 * - Accessible design with ARIA labels and keyboard navigation
 * - Consistent styling with the design system
 * - Support for disabled state
 * - Customizable size and styling
 * - Form integration with validation states
 * - TypeScript support with proper type definitions
 */

import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Custom CSS class */
  className?: string;
  /** Label text for the checkbox */
  label?: string;
  /** Description text below the checkbox */
  description?: string;
  /** Error message to display */
  error?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * Checkbox Component - Main component for checkbox input with label and description
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  className = '',
  label,
  description,
  error,
  size = 'md',
  variant = 'primary',
  disabled = false,
  checked,
  onChange,
  'data-testid': testId = 'checkbox',
  id,
  ...props
}, ref) => {
  // Generate unique ID if not provided
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  // Size-based styling
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Variant-based styling
  const variantClasses = {
    primary: 'text-blue-600 border-gray-300 focus:ring-blue-500',
    secondary: 'text-gray-600 border-gray-300 focus:ring-gray-500',
    success: 'text-green-600 border-gray-300 focus:ring-green-500',
    warning: 'text-yellow-600 border-gray-300 focus:ring-yellow-500',
    danger: 'text-red-600 border-gray-300 focus:ring-red-500'
  };

  return (
    <div className={cn('checkbox-wrapper', className)}>
      <div className="flex items-start gap-3">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={cn(
              'rounded border-2 transition-all duration-200 cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              sizeClasses[size],
              variantClasses[variant],
              disabled && 'opacity-50 cursor-not-allowed bg-gray-100',
              error && 'border-red-500 focus:ring-red-500',
              !error && !disabled && 'hover:border-gray-400'
            )}
            data-testid={testId}
            aria-describedby={
              description || error
                ? `${checkboxId}-description`
                : undefined
            }
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          />
        </div>

        {(label || description) && (
          <div className="flex-1 min-w-0">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  'block text-sm font-medium cursor-pointer',
                  'select-none',
                  disabled && 'opacity-50 cursor-not-allowed',
                  error ? 'text-red-900' : 'text-gray-900'
                )}
                data-testid={`${testId}-label`}
              >
                {label}
              </label>
            )}

            {description && (
              <p
                id={`${checkboxId}-description`}
                className={cn(
                  'mt-1 text-sm',
                  error ? 'text-red-600' : 'text-gray-600'
                )}
                data-testid={`${testId}-description`}
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {error && (
        <p
          className="mt-2 text-sm text-red-600"
          data-testid={`${testId}-error`}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;