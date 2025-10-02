import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

/**
 * Card component variants for different visual styles
 * Follows the design system specifications from DesignTokens.json
 */
const cardVariants = cva(
  // Base styles applied to all card variants
  [
    "rounded-lg border transition-all duration-200 ease-in-out",
    "focus-within:ring-2 focus-within:ring-primary-main focus-within:ring-offset-2"
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-white border-neutral-gray200",
          "hover:shadow-md hover:border-neutral-gray300"
        ].join(" "),
        elevated: [
          "bg-white border-neutral-gray200 shadow-sm",
          "hover:shadow-lg hover:border-neutral-gray300"
        ].join(" "),
        outlined: [
          "bg-transparent border-2 border-neutral-gray300",
          "hover:border-neutral-gray400"
        ].join(" "),
        filled: [
          "bg-neutral-gray50 border-neutral-gray200",
          "hover:bg-neutral-gray100 hover:border-neutral-gray300"
        ].join(" "),
        ghost: [
          "bg-transparent border-transparent",
          "hover:bg-neutral-gray50"
        ].join(" "),
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      interactive: {
        true: "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      interactive: false,
    },
  }
);

/**
 * Card header component for consistent styling
 */
const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className: _className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", _className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/**
 * Card content component for consistent styling
 */
const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className: _className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("pt-0", _className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

/**
 * Card footer component for consistent styling
 */
const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

/**
 * Card title component for consistent typography
 */
const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight text-neutral-gray900", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/**
 * Card description component for consistent typography
 */
const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-neutral-gray500", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/**
 * Card image component for media content
 */
const CardImage = forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, ...props }, ref) => (
  <img
    ref={ref}
    className={cn("w-full h-48 object-cover rounded-t-lg", className)}
    {...props}
  />
));
CardImage.displayName = "CardImage";

/**
 * Card component props interface
 */
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Whether the card should be interactive (clickable) */
  interactive?: boolean;
  /** Custom container className for additional styling */
  containerClassName?: string;
}

/**
 * Card Component - Core UI component for content containers
 *
 * Features:
 * - Multiple variants (default, elevated, outlined, filled, ghost)
 * - Different sizes (sm, md, lg)
 * - Interactive/hover effects
 * - Structured sections (header, content, footer)
 * - Image/media support
 * - Typography components (title, description)
 * - Full accessibility support
 * - Responsive design
 * - Focus management
 *
 * @example
 * ```tsx
 * // Basic card
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card description goes here</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Main content of the card</p>
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 *
 * // Interactive card
 * <Card variant="elevated" interactive>
 *   <CardContent>
 *     <h3>Clickable Card</h3>
 *     <p>Click me to perform an action</p>
 *   </CardContent>
 * </Card>
 *
 * // Card with image
 * <Card>
 *   <CardImage src="/image.jpg" alt="Card image" />
 *   <CardHeader>
 *     <CardTitle>Card with Image</CardTitle>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Content below the image</p>
 *   </CardContent>
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    className: _className,
    variant,
    size,
    interactive,
    containerClassName,
    children,
    ...props
  }, _ref) => {
    return (
      <div className={cn("w-full", containerClassName)}>
        <div
          ref={_ref}
          className={cn(cardVariants({ variant, size, interactive }))}
          role={interactive ? "button" : undefined}
          tabIndex={interactive ? 0 : undefined}
          onKeyDown={(e) => {
            if (interactive && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              e.currentTarget.click();
            }
          }}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);

// Set display name for better debugging experience
Card.displayName = "Card";

// Export all card components and sub-components
export {
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  CardImage,
};

export default Card;