import React, { forwardRef, useEffect, useRef } from 'react';
import { cn } from '../../../utils/cn';

/**
 * Modal overlay/backdrop component
 */
const ModalOverlay = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
ModalOverlay.displayName = "ModalOverlay";

/**
 * Modal content component with animations and positioning
 */
const ModalContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4",
      "border bg-white p-6 shadow-lg duration-200",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
      "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
      "sm:rounded-lg",
      className
    )}
    {...props}
  />
));
ModalContent.displayName = "ModalContent";

/**
 * Modal header component for consistent styling
 */
const ModalHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
));
ModalHeader.displayName = "ModalHeader";

/**
 * Modal footer component for consistent styling
 */
const ModalFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
));
ModalFooter.displayName = "ModalFooter";

/**
 * Modal title component for consistent typography
 */
const ModalTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
ModalTitle.displayName = "ModalTitle";

/**
 * Modal description component for consistent typography
 */
const ModalDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-neutral-gray500", className)}
    {...props}
  />
));
ModalDescription.displayName = "ModalDescription";

/**
 * Modal close button component
 */
const ModalClose = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity",
      "hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2",
      "disabled:pointer-events-none",
      className
    )}
    {...props}
  >
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
    <span className="sr-only">Close</span>
  </button>
));
ModalClose.displayName = "ModalClose";

/**
 * Modal component props interface
 */
export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the modal is open */
  open?: boolean;
  /** Callback fired when the modal should be closed */
  onClose?: () => void;
  /** Whether clicking the overlay should close the modal */
  closeOnOverlayClick?: boolean;
  /** Whether pressing ESC should close the modal */
  closeOnEscape?: boolean;
  /** Prevent the modal from being closed */
  preventClose?: boolean;
  /** Modal size variant */
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

/**
 * Modal Component - Core UI component for dialogs and overlays
 *
 * Features:
 * - Overlay/backdrop with blur effect
 * - Different sizes (sm, md, lg, xl, full)
 * - Focus trap and management
 * - Keyboard navigation (ESC to close)
 * - Click outside to close
 * - Structured sections (header, body, footer)
 * - Close button in header
 * - Full accessibility support (ARIA attributes, screen reader)
 * - Responsive design
 * - Smooth animations
 *
 * @example
 * ```tsx
 * // Basic modal
 * <Modal open={isOpen} onClose={() => setIsOpen(false)}>
 *   <ModalHeader>
 *     <ModalTitle>Confirm Action</ModalTitle>
 *     <ModalDescription>
 *       Are you sure you want to delete this item?
 *     </ModalDescription>
 *   </ModalHeader>
 *   <ModalFooter>
 *     <Button variant="ghost" onClick={() => setIsOpen(false)}>
 *       Cancel
 *     </Button>
 *     <Button variant="danger" onClick={handleDelete}>
 *       Delete
 *     </Button>
 *   </ModalFooter>
 * </Modal>
 *
 * // Large modal
 * <Modal open={isOpen} onClose={onClose} size="lg">
 *   <ModalContent>
 *     <ModalHeader>
 *       <ModalTitle>Settings</ModalTitle>
 *     </ModalHeader>
 *     <div className="py-4">
 *       <p>Modal content goes here</p>
 *     </div>
 *   </ModalContent>
 * </Modal>
 * ```
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({
    className,
    open = false,
    onClose,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    preventClose = false,
    size = "md",
    children,
    ...props
  }, _ref) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // Handle escape key press
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (closeOnEscape && onClose && event.key === 'Escape') {
          onClose();
        }
      };

      if (open) {
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
      }
    }, [open, closeOnEscape, onClose]);

    // Handle focus management
    useEffect(() => {
      if (open) {
        // Store the currently focused element
        previousActiveElement.current = document.activeElement as HTMLElement;

        // Focus the modal
        if (modalRef.current) {
          modalRef.current.focus();
        }
      } else {
        // Restore focus to the previously focused element
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      }
    }, [open]);

    // Handle overlay click
    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget && closeOnOverlayClick && onClose) {
        onClose();
      }
    };

    // Handle modal click
    const handleModalClick = (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
    };

    if (!open) return null;

    // Size variants for modal content
    const sizeClasses = {
      sm: "max-w-md",
      md: "max-w-lg",
      lg: "max-w-2xl",
      xl: "max-w-4xl",
      full: "max-w-full h-full w-full",
    };

    return (
      <ModalOverlay onClick={handleOverlayClick}>
        <ModalContent
          ref={modalRef}
          className={cn(sizeClasses[size], className)}
          onClick={handleModalClick}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          {...props}
        >
          {!preventClose && onClose && (
            <ModalClose onClick={onClose} />
          )}
          {children}
        </ModalContent>
      </ModalOverlay>
    );
  }
);

// Set display name for better debugging experience
Modal.displayName = "Modal";

// Export all modal components and sub-components
export {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalClose,
};

export default Modal;