/**
 * Authentication Components Library
 *
 * This file provides centralized exports for all authentication components,
 * making it easy to import auth components throughout the application.
 *
 * @example
 * ```tsx
 * // Import individual components
 * import { Login, Register, PasswordReset } from '@/components/auth';
 *
 * // Import route guards
 * import { ProtectedRoute, PublicRoute } from '@/components/auth';
 *
 * // Import all auth components
 * import * as Auth from '@/components/auth';
 * ```
 */

// Authentication Components
export { Login } from './Login';
export { Register } from './Register';
export { PasswordReset } from './PasswordReset';

// Route Guards
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as PublicRoute } from './PublicRoute';

// Default exports for convenience
export { default as DefaultLogin } from './Login';
export { default as DefaultRegister } from './Register';
export { default as DefaultPasswordReset } from './PasswordReset';