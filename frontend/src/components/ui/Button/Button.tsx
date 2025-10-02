import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

/**
 * Button component variants using class-variance-authority for consistent styling
 * Follows the design system specifications from DesignTokens.json
 */
const buttonVariants = cva(
  // Base styles applied to all button variants
  "inline-flex items-center justify-center rounded-md font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: [
          "bg-primary-main text-white shadow-sm",
          "hover:bg-primary-dark hover:shadow-md",
          "focus:ring-primary-main focus:ring-offset-0",
          "active:bg-primary-dark active:scale-[0.98]"
        ].join(" "),
        secondary: [
          "bg-secondary-success text-white shadow-sm",
          "hover:bg-green-600 hover:shadow-md",
          "focus:ring-secondary-success focus:ring-offset-0",
          "active:bg-green-600 active:scale-[0.98]"
        ].join(" "),
        ghost: [
          "bg-transparent text-neutral-gray700 border border-neutral-gray300",
          "hover:bg-neutral-gray100 hover:text-neutral-gray900",
          "focus:ring-neutral-gray500 focus:ring-offset-0",
          "active:bg-neutral-gray200 active:scale-[0.98]"
        ].join(" "),
        danger: [
          "bg-secondary-danger text-white shadow-sm",
          "hover:bg-red-600 hover:shadow-md",
          "focus:ring-secondary-danger focus:ring-offset-0",
          "active:bg-red-600 active:scale-[0.98]"
        ].join(" "),
        warning: [
          "bg-secondary-warning text-white shadow-sm",
          "hover:bg-yellow-600 hover:shadow-md",
          "focus:ring-secondary-warning focus:ring-offset-0",
          "active:bg-yellow-600 active:scale-[0.98]"
        ].join(" "),
        info: [
          "bg-secondary-info text-white shadow-sm",
          "hover:bg-blue-600 hover:shadow-md",
          "focus:ring-secondary-info focus:ring-offset-0",
          "active:bg-blue-600 active:scale-[0.98]"
        ].join(" "),
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

/**
 * Button component props interface extending HTML button attributes
 * and variant props from the buttonVariants configuration
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant for different visual styles */
  variant?: "primary" | "secondary" | "ghost" | "danger" | "warning" | "info";
  /** Button size for different dimensions */
  size?: "sm" | "md" | "lg" | "xl";
  /** Whether the button should take full width */
  fullWidth?: boolean;
  /** Icon to display before the button text */
  leftIcon?: React.ReactNode;
  /** Icon to display after the button text */
  rightIcon?: React.ReactNode;
  /** Loading state - shows spinner and disables interaction */
  loading?: boolean;
  /** Accessible label for loading state */
  loadingText?: string;
  /** Custom spinner component (defaults to built-in spinner) */
  spinner?: React.ReactNode;
}

/**
 * Default spinner component for loading state
 */
const DefaultSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/**
 * Button Component - Core UI component for user interactions
 *
 * Features:
 * - Multiple variants (primary, secondary, ghost, danger, warning, info)
 * - Different sizes (sm, md, lg, xl)
 * - Loading state with spinner
 * - Icon support (left and right)
 * - Full width option
 * - Full accessibility support (ARIA, keyboard navigation, screen reader)
 * - Responsive design
 * - Focus management
 * - Disabled state handling
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Button>Click me</Button>
 *
 * // With variants and sizes
 * <Button variant="secondary" size="lg">Save Changes</Button>
 *
 * // With icons
 * <Button leftIcon={<PlusIcon />} rightIcon={<ArrowRightIcon />}>
 *   Add Item
 * </Button>
 *
 * // Loading state
 * <Button loading loadingText="Saving...">
 *   Save
 * </Button>
 *
 * // Full width
 * <Button fullWidth>Submit Form</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    fullWidth,
    leftIcon,
    rightIcon,
    loading = false,
    loadingText,
    spinner,
    children,
    disabled,
    type = "button",
    ...props
  }, ref) => {
    // Determine if button should be disabled (loading state or explicitly disabled)
    const isDisabled = disabled || loading;

    // Get the appropriate spinner component
    const SpinnerComponent = spinner || <DefaultSpinner />;

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {/* Loading state content */}
        {loading && (
          <>
            {SpinnerComponent}
            {loadingText && (
              <span aria-live="polite" aria-label={loadingText}>
                {loadingText}
              </span>
            )}
          </>
        )}

        {/* Normal state content */}
        {!loading && (
          <>
            {/* Left icon */}
            {leftIcon && (
              <span
                className="mr-2 flex-shrink-0"
                aria-hidden="true"
              >
                {leftIcon}
              </span>
            )}

            {/* Button text content */}
            {children && (
              <span>{children}</span>
            )}

            {/* Right icon */}
            {rightIcon && (
              <span
                className="ml-2 flex-shrink-0"
                aria-hidden="true"
              >
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

// Set display name for better debugging experience
Button.displayName = "Button";

export default Button;