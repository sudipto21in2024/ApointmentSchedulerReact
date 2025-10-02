import React, { forwardRef, useId, useState } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

/**
 * Input component variants for different visual states
 * Follows the design system specifications from DesignTokens.json
 */
const inputVariants = cva(
  // Base styles applied to all input variants
  [
    "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-all duration-200 ease-in-out",
    "placeholder:text-neutral-gray500",
    "focus:outline-none focus:ring-2 focus:ring-offset-0",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "invalid:border-secondary-danger invalid:ring-secondary-danger"
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "border-neutral-gray300 bg-white text-neutral-gray900",
          "hover:border-neutral-gray400",
          "focus:border-primary-main focus:ring-primary-main"
        ].join(" "),
        error: [
          "border-secondary-danger bg-white text-neutral-gray900",
          "focus:border-secondary-danger focus:ring-secondary-danger"
        ].join(" "),
        success: [
          "border-secondary-success bg-white text-neutral-gray900",
          "focus:border-secondary-success focus:ring-secondary-success"
        ].join(" "),
        warning: [
          "border-secondary-warning bg-white text-neutral-gray900",
          "focus:border-secondary-warning focus:ring-secondary-warning"
        ].join(" "),
      },
      size: {
        sm: "h-8 px-2 text-xs",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

/**
 * Input component props interface extending HTML input attributes
 */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input variant for different visual states */
  variant?: "default" | "error" | "success" | "warning";
  /** Input size for different dimensions */
  size?: "sm" | "md" | "lg";
  /** Label text displayed above the input */
  label?: string;
  /** Help text displayed below the input */
  helpText?: string;
  /** Error message displayed when variant is 'error' */
  errorMessage?: string;
  /** Icon to display on the left side of the input */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right side of the input */
  rightIcon?: React.ReactNode;
  /** Whether to show the password visibility toggle (only for password type) */
  showPasswordToggle?: boolean;
  /** Custom container className for additional styling */
  containerClassName?: string;
  /** Whether the input is required (adds visual indicator) */
  required?: boolean;
}

/**
 * Password visibility toggle icon component
 */
const PasswordToggleIcon = ({
  showPassword,
  onToggle
}: {
  showPassword: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    className="flex items-center justify-center p-1 text-neutral-gray500 hover:text-neutral-gray700 focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-0 rounded"
    aria-label={showPassword ? "Hide password" : "Show password"}
  >
    {showPassword ? (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
      </svg>
    ) : (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )}
  </button>
);

/**
 * Input Component - Core UI component for form inputs
 *
 * Features:
 * - Multiple variants (default, error, success, warning)
 * - Different sizes (sm, md, lg)
 * - Label and help text support
 * - Left and right icon support
 * - Password visibility toggle
 * - Full accessibility support (ARIA, keyboard navigation, screen reader)
 * - Form validation integration
 * - Responsive design
 * - Required field indicator
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Input placeholder="Enter your name" />
 *
 * // With label and help text
 * <Input
 *   label="Email Address"
 *   helpText="We'll never share your email"
 *   type="email"
 *   placeholder="Enter your email"
 * />
 *
 * // With validation error
 * <Input
 *   label="Password"
 *   variant="error"
 *   errorMessage="Password must be at least 8 characters"
 *   type="password"
 * />
 *
 * // With icons
 * <Input
 *   leftIcon={<MailIcon />}
 *   rightIcon={<CheckIcon />}
 *   placeholder="Email"
 * />
 *
 * // Password with visibility toggle
 * <Input
 *   type="password"
 *   showPasswordToggle
 *   placeholder="Enter password"
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant,
    size,
    type = "text",
    label,
    helpText,
    errorMessage,
    leftIcon,
    rightIcon,
    showPasswordToggle = false,
    containerClassName,
    required = false,
    id,
    ...props
  }, ref) => {
    // Generate unique ID for accessibility
    const generatedId = useId();
    const inputId = id || generatedId;

    // Determine the actual variant based on error state
    const actualVariant = errorMessage ? "error" : variant;

    // Password visibility toggle state
    const [showPassword, setShowPassword] = useState(false);

    // Determine the actual input type
    const inputType = showPasswordToggle
      ? (showPassword ? "text" : "password")
      : type;

    // Determine if there's an error
    const hasError = Boolean(errorMessage);

    // Determine the help text to display
    const displayHelpText = errorMessage || helpText;

    return (
      <div className={cn("w-full space-y-2", containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium",
              hasError ? "text-secondary-danger" : "text-neutral-gray700"
            )}
          >
            {label}
            {required && (
              <span className="text-secondary-danger ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Input container with relative positioning for icons */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span
                className={cn(
                  "flex-shrink-0",
                  hasError ? "text-secondary-danger" : "text-neutral-gray500"
                )}
                aria-hidden="true"
              >
                {leftIcon}
              </span>
            </div>
          )}

          {/* Input field */}
          <input
            {...props}
            ref={ref}
            id={inputId}
            type={inputType}
            className={cn(
              inputVariants({ variant: actualVariant, size }),
              leftIcon && "pl-10",
              (rightIcon || showPasswordToggle) && "pr-10",
              className
            )}
            aria-invalid={hasError}
            aria-describedby={
              displayHelpText ? `${inputId}-help` : undefined
            }
            aria-required={required}
          />

          {/* Right icon or password toggle */}
          {(rightIcon || showPasswordToggle) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {showPasswordToggle ? (
                <PasswordToggleIcon
                  showPassword={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                />
              ) : (
                <span
                  className={cn(
                    "flex-shrink-0",
                    hasError ? "text-secondary-danger" : "text-neutral-gray500"
                  )}
                  aria-hidden="true"
                >
                  {rightIcon}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Help text or error message */}
        {displayHelpText && (
          <p
            id={`${inputId}-help`}
            className={cn(
              "text-sm",
              hasError
                ? "text-secondary-danger"
                : "text-neutral-gray500"
            )}
            role={hasError ? "alert" : undefined}
            aria-live={hasError ? "polite" : undefined}
          >
            {displayHelpText}
          </p>
        )}
      </div>
    );
  }
);

// Set display name for better debugging experience
Input.displayName = "Input";

export default Input;