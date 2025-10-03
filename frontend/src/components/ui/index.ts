/**
 * UI Components Library - Core UI Components
 *
 * This file provides centralized exports for all UI components,
 * making it easy to import components throughout the application.
 *
 * @example
 * ```tsx
 * // Import individual components
 * import { Button, Input, Card, Modal } from '@/components/ui';
 *
 * // Import component groups
 * import { Button, Card } from '@/components/ui';
 *
 * // Import all components
 * import * as UI from '@/components/ui';
 * ```
 */

// Core UI Components - Named exports
export { Button } from './Button';
export { Input } from './Input';
export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  CardImage
} from './Card';
export {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalClose
} from './Modal';
export { Select } from './Select';

// Type exports
export type { ButtonProps } from './Button';
export type { InputProps } from './Input';
export type { CardProps } from './Card';
export type { ModalProps } from './Modal';
export type { SelectProps } from './Select';

// Utility functions
export { cn } from '../../utils/cn';

// Default exports for convenience
export { default as DefaultButton } from './Button';
export { default as DefaultInput } from './Input';
export { default as DefaultCard } from './Card';
export { default as DefaultModal } from './Modal';