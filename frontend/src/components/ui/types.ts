/**
 * Comprehensive TypeScript type definitions for UI Components
 *
 * This file contains all type definitions used across the UI component library,
 * providing type safety and better developer experience.
 */

import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

/**
 * Base component props that all UI components can extend
 */
export interface BaseComponentProps {
  /** Additional CSS classes */
  className?: string;
  /** Child components */
  children?: ReactNode;
  /** Test ID for testing purposes */
  'data-testid'?: string;
}

/**
 * Button component variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning' | 'info';

/**
 * Button size types
 */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Input component variant types
 */
export type InputVariant = 'default' | 'error' | 'success' | 'warning';

/**
 * Input size types
 */
export type InputSize = 'sm' | 'md' | 'lg';

/**
 * Card component variant types
 */
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled' | 'ghost';

/**
 * Card size types
 */
export type CardSize = 'sm' | 'md' | 'lg';

/**
 * Modal size types
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Button Props Interface
 * Extends HTML button attributes with component-specific props
 */
export interface ButtonProps extends
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>,
  BaseComponentProps {
  /** Button visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Whether button should take full width */
  fullWidth?: boolean;
  /** Icon to display before button text */
  leftIcon?: ReactNode;
  /** Icon to display after button text */
  rightIcon?: ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Loading text for accessibility */
  loadingText?: string;
  /** Custom loading spinner */
  spinner?: ReactNode;
}

/**
 * Input Props Interface
 * Extends HTML input attributes with component-specific props
 */
export interface InputProps extends
  Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'size'>,
  BaseComponentProps {
  /** Input visual variant */
  variant?: InputVariant;
  /** Input size */
  size?: InputSize;
  /** Label text */
  label?: string;
  /** Help text */
  helpText?: string;
  /** Error message */
  errorMessage?: string;
  /** Left icon */
  leftIcon?: ReactNode;
  /** Right icon */
  rightIcon?: ReactNode;
  /** Show password visibility toggle */
  showPasswordToggle?: boolean;
  /** Container className */
  containerClassName?: string;
  /** Required field indicator */
  required?: boolean;
}

/**
 * Card Props Interface
 * Extends HTML div attributes with component-specific props
 */
export interface CardProps extends
  Omit<HTMLAttributes<HTMLDivElement>, 'className'>,
  BaseComponentProps {
  /** Card visual variant */
  variant?: CardVariant;
  /** Card size */
  size?: CardSize;
  /** Interactive/hover effects */
  interactive?: boolean;
  /** Container className */
  containerClassName?: string;
}

/**
 * Modal Props Interface
 * Extends HTML div attributes with component-specific props
 */
export interface ModalProps extends
  Omit<HTMLAttributes<HTMLDivElement>, 'className'>,
  BaseComponentProps {
  /** Modal open state */
  open?: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Close on overlay click */
  closeOnOverlayClick?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Prevent modal from being closed */
  preventClose?: boolean;
  /** Modal size */
  size?: ModalSize;
}

/**
 * Card sub-component props
 */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement>, BaseComponentProps {}
export interface CardContentProps extends HTMLAttributes<HTMLDivElement>, BaseComponentProps {}
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement>, BaseComponentProps {}
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement>, BaseComponentProps {}
export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement>, BaseComponentProps {}

/**
 * Modal sub-component props
 */
export interface ModalOverlayProps extends HTMLAttributes<HTMLDivElement>, BaseComponentProps {}
export interface ModalContentProps extends HTMLAttributes<HTMLDivElement>, BaseComponentProps {}
export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement>, BaseComponentProps {}
export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement>, BaseComponentProps {}
export interface ModalTitleProps extends HTMLAttributes<HTMLHeadingElement>, BaseComponentProps {}
export interface ModalDescriptionProps extends HTMLAttributes<HTMLParagraphElement>, BaseComponentProps {}
export interface ModalCloseProps extends ButtonHTMLAttributes<HTMLButtonElement>, BaseComponentProps {}

/**
 * Utility types for component composition
 */
export type ComponentWithChildren<T = Record<string, never>> = T & { children?: ReactNode };
export type ComponentWithClassName<T = Record<string, never>> = T & { className?: string };
export type ComponentWithVariants<T, V> = T & { variant?: V };
export type ComponentWithSizes<T, S> = T & { size?: S };

/**
 * Event handler types
 */
export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
export type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;
export type FocusHandler = (event: React.FocusEvent<HTMLElement>) => void;
export type KeyboardHandler = (event: React.KeyboardEvent<HTMLElement>) => void;

/**
 * Form validation types
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Theme and styling types
 */
export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
}

export interface ComponentTheme {
  colors: ThemeColors;
  spacing: Record<string, string>;
  typography: Record<string, string>;
  borderRadius: Record<string, string>;
}

/**
 * Accessibility types
 */
export interface AriaAttributes {
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  busy?: boolean;
}

export interface AccessibilityProps {
  /** ARIA attributes for screen readers */
  aria?: AriaAttributes;
  /** Role attribute for semantic meaning */
  role?: string;
  /** Tab index for keyboard navigation */
  tabIndex?: number;
  /** Skip link for keyboard users */
  skipLink?: boolean;
}

/**
 * Responsive design types
 */
export interface ResponsiveProps {
  /** Mobile-first responsive classes */
  mobile?: string;
  /** Tablet breakpoint classes */
  tablet?: string;
  /** Desktop breakpoint classes */
  desktop?: string;
  /** Wide screen breakpoint classes */
  wideScreen?: string;
}

/**
 * Animation and transition types
 */
export interface AnimationProps {
  /** Animation duration */
  duration?: 'fast' | 'normal' | 'slow' | string;
  /** Animation timing function */
  easing?: 'ease-in' | 'ease-out' | 'ease-in-out' | string;
  /** Animation delay */
  delay?: string;
  /** Disable animations */
  disableAnimation?: boolean;
}

/**
 * Export utility type helpers
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type MakeRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;