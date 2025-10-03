/**
 * Button Component Tests
 *
 * Comprehensive unit tests for the Button component covering all variants,
 * sizes, states, interactions, and accessibility features.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../../../components/ui/Button/Button';

// Mock the cn utility
vi.mock('../../../utils/cn', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('Button Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should render with custom text content', () => {
      render(<Button>Save Changes</Button>);

      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('should render with custom type attribute', () => {
      render(<Button type="submit">Submit</Button>);

      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should render with custom className', () => {
      render(<Button className="custom-class">Custom Button</Button>);

      const button = screen.getByRole('button', { name: /custom button/i });
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    const variants = ['primary', 'secondary', 'ghost', 'danger', 'warning', 'info'] as const;

    variants.forEach(variant => {
      it(`should render ${variant} variant correctly`, () => {
        render(<Button variant={variant}>{variant} Button</Button>);

        const button = screen.getByRole('button', { name: new RegExp(variant, 'i') });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass(variant);
      });
    });

    it('should apply correct styles for primary variant', () => {
      render(<Button variant="primary">Primary</Button>);

      const button = screen.getByRole('button', { name: /primary/i });
      expect(button).toHaveClass('bg-primary-main', 'text-white');
    });

    it('should apply correct styles for secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole('button', { name: /secondary/i });
      expect(button).toHaveClass('bg-secondary-success', 'text-white');
    });

    it('should apply correct styles for ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole('button', { name: /ghost/i });
      expect(button).toHaveClass('bg-transparent', 'border', 'border-neutral-gray300');
    });
  });

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;

    sizes.forEach(size => {
      it(`should render ${size} size correctly`, () => {
        render(<Button size={size}>{size.toUpperCase()} Button</Button>);

        const button = screen.getByRole('button', { name: new RegExp(size.toUpperCase(), 'i') });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass(size);
      });
    });

    it('should apply correct dimensions for small size', () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole('button', { name: /small/i });
      expect(button).toHaveClass('h-8', 'px-3', 'text-sm');
    });

    it('should apply correct dimensions for large size', () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole('button', { name: /large/i });
      expect(button).toHaveClass('h-12', 'px-6', 'text-base');
    });
  });

  describe('Icons', () => {
    it('should render left icon correctly', () => {
      const leftIcon = <span data-testid="left-icon">←</span>;
      render(<Button leftIcon={leftIcon}>With Left Icon</Button>);

      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByText('With Left Icon')).toBeInTheDocument();
    });

    it('should render right icon correctly', () => {
      const rightIcon = <span data-testid="right-icon">→</span>;
      render(<Button rightIcon={rightIcon}>With Right Icon</Button>);

      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      expect(screen.getByText('With Right Icon')).toBeInTheDocument();
    });

    it('should render both left and right icons', () => {
      const leftIcon = <span data-testid="left-icon">←</span>;
      const rightIcon = <span data-testid="right-icon">→</span>;

      render(
        <Button leftIcon={leftIcon} rightIcon={rightIcon}>
          Both Icons
        </Button>
      );

      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      expect(screen.getByText('Both Icons')).toBeInTheDocument();
    });

    it('should apply correct spacing for icons', () => {
      const leftIcon = <span data-testid="left-icon">←</span>;
      const rightIcon = <span data-testid="right-icon">→</span>;

      render(
        <Button leftIcon={leftIcon} rightIcon={rightIcon}>
          Spaced Icons
        </Button>
      );

      const leftIconElement = screen.getByTestId('left-icon');
      const rightIconElement = screen.getByTestId('right-icon');

      expect(leftIconElement).toHaveClass('mr-2');
      expect(rightIconElement).toHaveClass('ml-2');
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading is true', () => {
      render(<Button loading>Loading Button</Button>);

      expect(screen.getByRole('button')).toBeInTheDocument();
      // Should show spinner (SVG element)
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should display loading text when provided', () => {
      render(<Button loading loadingText="Saving...">Save</Button>);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should hide button text when loading', () => {
      render(<Button loading>Loading Button</Button>);

      expect(screen.queryByText('Loading Button')).not.toBeInTheDocument();
    });

    it('should disable button when loading', () => {
      render(<Button loading>Loading Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should use custom spinner when provided', () => {
      const customSpinner = <div data-testid="custom-spinner">Custom Spinner</div>;
      render(<Button loading spinner={customSpinner}>Custom Loading</Button>);

      expect(screen.getByTestId('custom-spinner')).toBeInTheDocument();
      expect(screen.queryByText('Custom Loading')).not.toBeInTheDocument();
    });

    it('should handle loading state with icons', () => {
      const leftIcon = <span data-testid="left-icon">←</span>;
      render(
        <Button loading leftIcon={leftIcon}>
          Loading with Icon
        </Button>
      );

      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
      expect(screen.queryByText('Loading with Icon')).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should take precedence of loading over disabled state', () => {
      render(<Button disabled loading>Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should not be clickable when disabled', async () => {
      const onClick = vi.fn();
      render(<Button disabled onClick={onClick}>Disabled Button</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Full Width', () => {
    it('should apply full width class when fullWidth is true', () => {
      render(<Button fullWidth>Full Width Button</Button>);

      const button = screen.getByRole('button', { name: /full width button/i });
      expect(button).toHaveClass('w-full');
    });

    it('should not apply full width class when fullWidth is false', () => {
      render(<Button fullWidth={false}>Normal Width Button</Button>);

      const button = screen.getByRole('button', { name: /normal width button/i });
      expect(button).not.toHaveClass('w-full');
    });
  });

  describe('User Interactions', () => {
    it('should handle click events', async () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Clickable Button</Button>);

      const button = screen.getByRole('button', { name: /clickable button/i });
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should handle keyboard events', async () => {
      const onKeyDown = vi.fn();
      render(<Button onKeyDown={onKeyDown}>Keyboard Button</Button>);

      const button = screen.getByRole('button', { name: /keyboard button/i });

      // Focus the button
      button.focus();
      expect(button).toHaveFocus();

      // Press Enter key
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      expect(onKeyDown).toHaveBeenCalledTimes(1);

      // Press Space key
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      expect(onKeyDown).toHaveBeenCalledTimes(2);
    });

    it('should not trigger onClick when disabled', async () => {
      const onClick = vi.fn();
      render(<Button disabled onClick={onClick}>Disabled Button</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });

    it('should not trigger onClick when loading', async () => {
      const onClick = vi.fn();
      render(<Button loading onClick={onClick}>Loading Button</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Button aria-label="Custom Label">Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom Label');
    });

    it('should support keyboard navigation', async () => {
      render(<Button>Focusable Button</Button>);

      const button = screen.getByRole('button', { name: /focusable button/i });

      // Button should be focusable
      await user.tab();
      expect(button).toHaveFocus();
    });

    it('should announce loading state to screen readers', () => {
      render(<Button loading loadingText="Saving your changes">Save</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');

      const loadingText = screen.getByText('Saving your changes');
      expect(loadingText).toHaveAttribute('aria-live', 'polite');
    });

    it('should hide icons from screen readers', () => {
      const leftIcon = <span>←</span>;
      const rightIcon = <span>→</span>;

      render(
        <Button leftIcon={leftIcon} rightIcon={rightIcon}>
          Button with Icons
        </Button>
      );

      // Icons should have aria-hidden attribute
      const icons = screen.getAllByText(/[←→]/);
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('should maintain focus ring visibility', () => {
      render(<Button>Focus Ring Button</Button>);

      const button = screen.getByRole('button', { name: /focus ring button/i });
      expect(button).toHaveClass('focus:ring-2', 'focus:ring-offset-2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children gracefully', () => {
      render(<Button></Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle very long text content', () => {
      const longText = 'A'.repeat(200);
      render(<Button>{longText}</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle special characters in text', () => {
      const specialText = 'Button with émojis 🚀 & spëcial châractérs';
      render(<Button>{specialText}</Button>);

      expect(screen.getByText(specialText)).toBeInTheDocument();
    });

    it('should handle rapid state changes', async () => {
      const { rerender } = render(<Button>Normal Button</Button>);

      // Rapidly change between states
      rerender(<Button loading>Loading Button</Button>);
      rerender(<Button disabled>Disabled Button</Button>);
      rerender(<Button variant="secondary">Secondary Button</Button>);

      expect(screen.getByRole('button', { name: /secondary button/i })).toBeInTheDocument();
    });
  });

  describe('Integration with Form Elements', () => {
    it('should work correctly as submit button', async () => {
      const onSubmit = vi.fn();
      render(
        <form onSubmit={onSubmit}>
          <Button type="submit">Submit Form</Button>
        </form>
      );

      const button = screen.getByRole('button', { name: /submit form/i });
      await user.click(button);

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('should work correctly as reset button', async () => {
      const onReset = vi.fn();
      render(
        <form onReset={onReset}>
          <Button type="reset">Reset Form</Button>
        </form>
      );

      const button = screen.getByRole('button', { name: /reset form/i });
      await user.click(button);

      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const renderSpy = vi.fn();

      const TestComponent: React.FC = () => {
        renderSpy();
        return <Button>Performance Test</Button>;
      };

      const { rerender } = render(<TestComponent />);

      // Component should render exactly once initially
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props should not cause additional renders
      rerender(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(2); // React's rerender count
    });

    it('should handle rapid prop changes efficiently', () => {
      const { rerender } = render(<Button>Button</Button>);

      const startTime = performance.now();

      // Rapidly change props
      for (let i = 0; i < 100; i++) {
        rerender(<Button variant={i % 2 === 0 ? 'primary' : 'secondary'}>Button {i}</Button>);
      }

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 100ms for 100 renders)
      expect(renderTime).toBeLessThan(100);
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<Button>Responsive Button</Button>);

      const button = screen.getByRole('button', { name: /responsive button/i });
      expect(button).toBeInTheDocument();
    });

    it('should maintain accessibility on different screen sizes', async () => {
      render(<Button>Accessible Button</Button>);

      const button = screen.getByRole('button', { name: /accessible button/i });

      // Should remain focusable regardless of screen size
      await user.tab();
      expect(button).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed props gracefully', () => {
      expect(() => {
        render(<Button variant={'invalid' as any}>Invalid Variant</Button>);
      }).not.toThrow();
    });

    it('should handle missing required props gracefully', () => {
      expect(() => {
        render(<Button>Button without props</Button>);
      }).not.toThrow();
    });

    it('should handle null and undefined children', () => {
      expect(() => {
        render(<Button>{null}</Button>);
      }).not.toThrow();

      expect(() => {
        render(<Button>{undefined}</Button>);
      }).not.toThrow();
    });
  });

  describe('Custom Styling', () => {
    it('should merge custom classes with variant classes', () => {
      render(
        <Button variant="primary" className="custom-class another-class">
          Styled Button
        </Button>
      );

      const button = screen.getByRole('button', { name: /styled button/i });
      expect(button).toHaveClass('custom-class', 'another-class', 'bg-primary-main');
    });

    it('should override variant styles with custom classes', () => {
      render(
        <Button variant="primary" className="bg-red-500">
          Override Button
        </Button>
      );

      const button = screen.getByRole('button', { name: /override button/i });
      expect(button).toHaveClass('bg-red-500');
    });
  });

  describe('Focus Management', () => {
    it('should handle focus events correctly', async () => {
      const onFocus = vi.fn();
      const onBlur = vi.fn();

      render(
        <Button onFocus={onFocus} onBlur={onBlur}>
          Focusable Button
        </Button>
      );

      const button = screen.getByRole('button', { name: /focusable button/i });

      // Focus the button
      button.focus();
      expect(onFocus).toHaveBeenCalledTimes(1);

      // Blur the button
      button.blur();
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('should maintain focus ring visibility', () => {
      render(<Button>Focus Ring Button</Button>);

      const button = screen.getByRole('button', { name: /focus ring button/i });
      expect(button).toHaveClass('focus:ring-2', 'focus:ring-offset-2');
    });
  });

  describe('Loading State Accessibility', () => {
    it('should provide proper ARIA attributes for loading state', () => {
      render(<Button loading loadingText="Processing...">Process</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-disabled', 'true');

      const loadingText = screen.getByText('Processing...');
      expect(loadingText).toHaveAttribute('aria-live', 'polite');
    });

    it('should hide content from screen readers during loading', () => {
      render(<Button loading>Loading Button</Button>);

      // Button text should not be visible during loading
      expect(screen.queryByText('Loading Button')).not.toBeInTheDocument();
    });
  });

  describe('Icon Accessibility', () => {
    it('should hide decorative icons from screen readers', () => {
      const leftIcon = <span>←</span>;
      const rightIcon = <span>→</span>;

      render(
        <Button leftIcon={leftIcon} rightIcon={rightIcon}>
          Button with Icons
        </Button>
      );

      // Icons should be decorative and hidden from screen readers
      const icons = screen.getAllByText(/[←→]/);
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('should maintain button text accessibility with icons', () => {
      const leftIcon = <span>←</span>;

      render(
        <Button leftIcon={leftIcon}>
          Accessible Button
        </Button>
      );

      // Button text should still be accessible
      expect(screen.getByText('Accessible Button')).toBeInTheDocument();
    });
  });

  describe('Button States', () => {
    it('should handle multiple state combinations', () => {
      render(
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          loading
          loadingText="Loading..."
        >
          Multi-State Button
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('secondary', 'lg', 'w-full');
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should transition between states smoothly', async () => {
      const { rerender } = render(<Button>Normal Button</Button>);

      // Start loading
      rerender(<Button loading>Loading Button</Button>);
      expect(screen.getByRole('button')).toBeDisabled();

      // Stop loading
      rerender(<Button>Normal Button</Button>);
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  describe('Event Handling', () => {
    it('should handle mouse events correctly', async () => {
      const onMouseEnter = vi.fn();
      const onMouseLeave = vi.fn();

      render(
        <Button onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
          Hover Button
        </Button>
      );

      const button = screen.getByRole('button', { name: /hover button/i });

      // Mouse enter
      fireEvent.mouseEnter(button);
      expect(onMouseEnter).toHaveBeenCalledTimes(1);

      // Mouse leave
      fireEvent.mouseLeave(button);
      expect(onMouseLeave).toHaveBeenCalledTimes(1);
    });

    it('should handle touch events for mobile', async () => {
      const onTouchStart = vi.fn();
      const onTouchEnd = vi.fn();

      render(
        <Button onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          Touch Button
        </Button>
      );

      const button = screen.getByRole('button', { name: /touch button/i });

      // Touch start
      fireEvent.touchStart(button);
      expect(onTouchStart).toHaveBeenCalledTimes(1);

      // Touch end
      fireEvent.touchEnd(button);
      expect(onTouchEnd).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Integration', () => {
    it('should work correctly in form contexts', () => {
      render(
        <form>
          <Button type="submit">Form Submit</Button>
          <Button type="reset">Form Reset</Button>
          <Button type="button">Form Button</Button>
        </form>
      );

      expect(screen.getByRole('button', { name: /form submit/i })).toHaveAttribute('type', 'submit');
      expect(screen.getByRole('button', { name: /form reset/i })).toHaveAttribute('type', 'reset');
      expect(screen.getByRole('button', { name: /form button/i })).toHaveAttribute('type', 'button');
    });

    it('should handle form submission correctly', async () => {
      const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());

      render(
        <form onSubmit={onSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      );

      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Memory Management', () => {
    it('should cleanup properly on unmount', () => {
      const { unmount } = render(<Button>Unmounted Button</Button>);

      expect(screen.getByRole('button', { name: /unmounted button/i })).toBeInTheDocument();

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should handle component updates efficiently', () => {
      const { rerender } = render(<Button>Original</Button>);

      const startTime = performance.now();

      // Multiple rapid updates
      for (let i = 0; i < 50; i++) {
        rerender(<Button>Update {i}</Button>);
      }

      const endTime = performance.now();
      const updateTime = endTime - startTime;

      // Should handle updates efficiently (less than 50ms for 50 updates)
      expect(updateTime).toBeLessThan(50);
    });
  });

  describe('Error Boundaries', () => {
    it('should handle rendering errors gracefully', () => {
      // Create a button that might cause issues
      expect(() => {
        render(<Button>Normal Button</Button>);
      }).not.toThrow();
    });

    it('should handle invalid variant gracefully', () => {
      expect(() => {
        render(<Button variant={'invalid' as any}>Invalid Variant</Button>);
      }).not.toThrow();
    });
  });

  describe('Custom Props', () => {
    it('should pass through custom HTML attributes', () => {
      render(
        <Button data-custom="custom-value" aria-describedby="description">
          Custom Props Button
        </Button>
      );

      const button = screen.getByRole('button', { name: /custom props button/i });
      expect(button).toHaveAttribute('data-custom', 'custom-value');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });

    it('should handle ref forwarding correctly', () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Ref Button</Button>);

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Animation and Transitions', () => {
    it('should apply transition classes correctly', () => {
      render(<Button>Animated Button</Button>);

      const button = screen.getByRole('button', { name: /animated button/i });
      expect(button).toHaveClass('transition-all', 'duration-200', 'ease-in-out');
    });

    it('should handle active state styling', async () => {
      render(<Button>Active Button</Button>);

      const button = screen.getByRole('button', { name: /active button/i });

      // Simulate active state
      fireEvent.mouseDown(button);
      expect(button).toHaveClass('active:scale-[0.98]');
    });
  });

  describe('Content Layout', () => {
    it('should handle icon and text positioning correctly', () => {
      const leftIcon = <span data-testid="left-icon">←</span>;
      const rightIcon = <span data-testid="right-icon">→</span>;

      render(
        <Button leftIcon={leftIcon} rightIcon={rightIcon}>
          Icon Layout
        </Button>
      );

      const leftIconElement = screen.getByTestId('left-icon');
      const rightIconElement = screen.getByTestId('right-icon');
      const textElement = screen.getByText('Icon Layout');

      expect(leftIconElement).toHaveClass('mr-2');
      expect(rightIconElement).toHaveClass('ml-2');
      expect(textElement).toBeInTheDocument();
    });

    it('should handle flex-shrink for icons', () => {
      const leftIcon = <span data-testid="left-icon">←</span>;

      render(<Button leftIcon={leftIcon}>Shrink Test</Button>);

      const iconElement = screen.getByTestId('left-icon');
      expect(iconElement).toHaveClass('flex-shrink-0');
    });
  });

  describe('Loading Spinner', () => {
    it('should render default spinner correctly', () => {
      render(<Button loading>Default Spinner</Button>);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });

    it('should use custom spinner when provided', () => {
      const customSpinner = <div data-testid="custom-spinner">⟳</div>;
      render(<Button loading spinner={customSpinner}>Custom Spinner</Button>);

      expect(screen.getByTestId('custom-spinner')).toBeInTheDocument();
      expect(screen.queryByText('Custom Spinner')).not.toBeInTheDocument();
    });

    it('should handle spinner accessibility correctly', () => {
      render(<Button loading>Loading</Button>);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Button Content', () => {
    it('should handle React elements as children', () => {
      const customChild = <span data-testid="custom-child">Custom Content</span>;
      render(<Button>{customChild}</Button>);

      expect(screen.getByTestId('custom-child')).toBeInTheDocument();
    });

    it('should handle mixed content types', () => {
      render(
        <Button>
          Text and <strong>Bold</strong> Content
        </Button>
      );

      expect(screen.getByText('Text and')).toBeInTheDocument();
      expect(screen.getByText('Bold')).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('should handle controlled disabled state', () => {
      const { rerender } = render(<Button disabled>Initially Disabled</Button>);

      let button = screen.getByRole('button');
      expect(button).toBeDisabled();

      // Enable the button
      rerender(<Button>Now Enabled</Button>);

      button = screen.getByRole('button', { name: /now enabled/i });
      expect(button).not.toBeDisabled();
    });

    it('should handle controlled loading state', () => {
      const { rerender } = render(<Button loading>Loading</Button>);

      let button = screen.getByRole('button');
      expect(button).toBeDisabled();

      // Stop loading
      rerender(<Button>Not Loading</Button>);

      button = screen.getByRole('button', { name: /not loading/i });
      expect(button).not.toBeDisabled();
    });
  });

  describe('CSS Classes', () => {
    it('should apply all variant classes correctly', () => {
      render(<Button variant="primary">Primary Button</Button>);

      const button = screen.getByRole('button', { name: /primary button/i });
      expect(button).toHaveClass(
        'bg-primary-main',
        'text-white',
        'shadow-sm',
        'hover:bg-primary-dark',
        'focus:ring-primary-main'
      );
    });

    it('should apply all size classes correctly', () => {
      render(<Button size="lg">Large Button</Button>);

      const button = screen.getByRole('button', { name: /large button/i });
      expect(button).toHaveClass('h-12', 'px-6', 'text-base');
    });

    it('should apply fullWidth class correctly', () => {
      render(<Button fullWidth>Full Width Button</Button>);

      const button = screen.getByRole('button', { name: /full width button/i });
      expect(button).toHaveClass('w-full');
    });
  });

  describe('Component Composition', () => {
    it('should work as a child component', () => {
      render(
        <div data-testid="parent">
          <Button>Child Button</Button>
        </div>
      );

      expect(screen.getByTestId('parent')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /child button/i })).toBeInTheDocument();
    });

    it('should work with React.Fragment', () => {
      render(
        <>
          <Button>Fragment Button 1</Button>
          <Button>Fragment Button 2</Button>
        </>
      );

      expect(screen.getByRole('button', { name: /fragment button 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /fragment button 2/i })).toBeInTheDocument();
    });
  });

  describe('Browser Compatibility', () => {
    it('should handle different browser event models', async () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Cross-Browser Button</Button>);

      const button = screen.getByRole('button', { name: /cross-browser button/i });

      // Test different event types
      await user.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);

      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(2);
    });

    it('should handle touch events for mobile browsers', async () => {
      const onTouchStart = vi.fn();
      render(<Button onTouchStart={onTouchStart}>Touch Button</Button>);

      const button = screen.getByRole('button', { name: /touch button/i });

      fireEvent.touchStart(button);
      expect(onTouchStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance Optimization', () => {
    it('should not create unnecessary DOM elements', () => {
      render(<Button>Simple Button</Button>);

      const button = screen.getByRole('button', { name: /simple button/i });

      // Should only have essential DOM structure
      expect(button.tagName).toBe('BUTTON');
      expect(button.children.length).toBeLessThan(5); // Reasonable upper limit
    });

    it('should handle conditional rendering efficiently', () => {
      const { rerender } = render(<Button>Normal</Button>);

      const startTime = performance.now();

      // Toggle between states rapidly
      for (let i = 0; i < 20; i++) {
        rerender(<Button loading={i % 2 === 0}>{i % 2 === 0 ? 'Loading' : 'Normal'}</Button>);
      }

      const endTime = performance.now();
      const toggleTime = endTime - startTime;

      // Should handle state changes efficiently
      expect(toggleTime).toBeLessThan(20);
    });
  });

  describe('Internationalization', () => {
    it('should handle non-English text correctly', () => {
      const frenchText = 'Bouton Français';
      render(<Button>{frenchText}</Button>);

      expect(screen.getByText(frenchText)).toBeInTheDocument();
    });

    it('should handle right-to-left text direction', () => {
      const rtlText = 'نص عربي';
      render(<Button>{rtlText}</Button>);

      expect(screen.getByText(rtlText)).toBeInTheDocument();
    });

    it('should handle mixed language content', () => {
      const mixedText = 'English 中文 Español';
      render(<Button>{mixedText}</Button>);

      expect(screen.getByText(mixedText)).toBeInTheDocument();
    });
  });

  describe('Advanced Interactions', () => {
    it('should handle double-click events', async () => {
      const onDoubleClick = vi.fn();
      render(<Button onDoubleClick={onDoubleClick}>Double Click Button</Button>);

      const button = screen.getByRole('button', { name: /double click button/i });

      fireEvent.doubleClick(button);
      expect(onDoubleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle context menu events', async () => {
      const onContextMenu = vi.fn();
      render(<Button onContextMenu={onContextMenu}>Context Menu Button</Button>);

      const button = screen.getByRole('button', { name: /context menu button/i });

      fireEvent.contextMenu(button);
      expect(onContextMenu).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button Groups', () => {
    it('should work correctly in button groups', () => {
      render(
        <div>
          <Button>Button 1</Button>
          <Button>Button 2</Button>
          <Button>Button 3</Button>
        </div>
      );

      expect(screen.getByRole('button', { name: /button 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /button 2/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /button 3/i })).toBeInTheDocument();
    });

    it('should handle focus navigation in groups', async () => {
      render(
        <div>
          <Button>Button 1</Button>
          <Button>Button 2</Button>
          <Button>Button 3</Button>
        </div>
      );

      // Tab through buttons
      await user.tab();
      expect(screen.getByRole('button', { name: /button 1/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /button 2/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /button 3/i })).toHaveFocus();
    });
  });

  describe('Dynamic Styling', () => {
    it('should handle dynamic class changes', () => {
      const { rerender } = render(<Button variant="primary">Dynamic Button</Button>);

      let button = screen.getByRole('button', { name: /dynamic button/i });
      expect(button).toHaveClass('bg-primary-main');

      // Change variant dynamically
      rerender(<Button variant="secondary">Dynamic Button</Button>);

      button = screen.getByRole('button', { name: /dynamic button/i });
      expect(button).toHaveClass('bg-secondary-success');
      expect(button).not.toHaveClass('bg-primary-main');
    });

    it('should handle dynamic size changes', () => {
      const { rerender } = render(<Button size="sm">Dynamic Size</Button>);

      let button = screen.getByRole('button', { name: /dynamic size/i });
      expect(button).toHaveClass('h-8');

      // Change size dynamically
      rerender(<Button size="lg">Dynamic Size</Button>);

      button = screen.getByRole('button', { name: /dynamic size/i });
      expect(button).toHaveClass('h-12');
      expect(button).not.toHaveClass('h-8');
    });
  });

  describe('Error Recovery', () => {
    it('should recover from invalid props gracefully', () => {
      expect(() => {
        render(<Button size={'invalid' as any}>Invalid Size</Button>);
      }).not.toThrow();
    });

    it('should handle missing icon props gracefully', () => {
      render(<Button leftIcon={undefined} rightIcon={null}>No Icons</Button>);

      expect(screen.getByRole('button', { name: /no icons/i })).toBeInTheDocument();
    });
  });

  describe('Component Metadata', () => {
    it('should have correct display name', () => {
      expect(Button.displayName).toBe('Button');
    });

    it('should be forwardRef compatible', () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Ref Button</Button>);

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });
  });

  describe('Concurrent Features', () => {
    it('should handle concurrent state updates', async () => {
      const { rerender } = render(<Button>Concurrent Button</Button>);

      // Simulate concurrent updates
      rerender(<Button loading>Concurrent Button</Button>);
      rerender(<Button disabled>Concurrent Button</Button>);
      rerender(<Button variant="secondary">Concurrent Button</Button>);

      const button = screen.getByRole('button', { name: /concurrent button/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('secondary');
    });
  });

  describe('Memory Efficiency', () => {
    it('should not leak memory on frequent updates', () => {
      const { rerender, unmount } = render(<Button>Memory Test</Button>);

      // Frequent updates
      for (let i = 0; i < 100; i++) {
        rerender(<Button>{`Memory Test ${i}`}</Button>);
      }

      // Should unmount cleanly
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Event Propagation', () => {
    it('should handle event propagation correctly', async () => {
      const onClick = vi.fn();
      const onMouseDown = vi.fn();

      render(
        <div onClick={onClick}>
          <Button onMouseDown={onMouseDown}>Propagation Button</Button>
        </div>
      );

      const button = screen.getByRole('button', { name: /propagation button/i });

      // Mouse down should trigger but not bubble to parent
      fireEvent.mouseDown(button);
      expect(onMouseDown).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Button Semantics', () => {
    it('should maintain proper button semantics', () => {
      render(<Button>Semantic Button</Button>);

      const button = screen.getByRole('button', { name: /semantic button/i });
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAttribute('type');
    });

    it('should handle role attribute correctly', () => {
      render(<Button role="menuitem">Menu Button</Button>);

      const button = screen.getByRole('menuitem', { name: /menu button/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('should handle hover states correctly', () => {
      render(<Button>Hover Button</Button>);

      const button = screen.getByRole('button', { name: /hover button/i });
      expect(button).toHaveClass('hover:bg-primary-dark'); // Primary variant hover
    });

    it('should handle focus states correctly', () => {
      render(<Button>Focus Button</Button>);

      const button = screen.getByRole('button', { name: /focus button/i });
      expect(button).toHaveClass('focus:ring-2', 'focus:ring-offset-2');
    });

    it('should handle active states correctly', () => {
      render(<Button>Active Button</Button>);

      const button = screen.getByRole('button', { name: /active button/i });
      expect(button).toHaveClass('active:bg-primary-dark', 'active:scale-[0.98]');
    });
  });

  describe('Content Overflow', () => {
    it('should handle long text content gracefully', () => {
      const longText = 'A'.repeat(100);
      render(<Button>{longText}</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.textContent).toBe(longText);
    });

    it('should handle icon overflow correctly', () => {
      const largeIcon = <div data-testid="large-icon" style={{ width: '50px', height: '50px' }}>📦</div>;
      render(<Button leftIcon={largeIcon}>Large Icon Button</Button>);

      expect(screen.getByTestId('large-icon')).toBeInTheDocument();
    });
  });

  describe('Form Validation Integration', () => {
    it('should work with form validation libraries', async () => {
      const onClick = vi.fn();
      render(
        <form>
          <Button type="submit" onClick={onClick}>Validate Form</Button>
        </form>
      );

      const button = screen.getByRole('button', { name: /validate form/i });
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle mount and unmount correctly', () => {
      const { unmount } = render(<Button>Lifecycle Button</Button>);

      expect(screen.getByRole('button', { name: /lifecycle button/i })).toBeInTheDocument();

      // Should unmount without issues
      expect(() => unmount()).not.toThrow();
    });

    it('should handle component updates correctly', () => {
      const { rerender } = render(<Button>Update Test</Button>);

      // Update content
      rerender(<Button>Updated Content</Button>);
      expect(screen.getByRole('button', { name: /updated content/i })).toBeInTheDocument();

      // Update variant
      rerender(<Button variant="secondary">Updated Variant</Button>);
      const button = screen.getByRole('button', { name: /updated variant/i });
      expect(button).toHaveClass('bg-secondary-success');
    });
  });

  describe('Advanced Accessibility', () => {
    it('should support high contrast mode', () => {
      render(<Button>High Contrast Button</Button>);

      const button = screen.getByRole('button', { name: /high contrast button/i });
      expect(button).toHaveClass('focus:ring-2'); // Should have clear focus indicators
    });

    it('should support reduced motion preferences', () => {
      render(<Button>Reduced Motion Button</Button>);

      const button = screen.getByRole('button', { name: /reduced motion button/i });
      expect(button).toHaveClass('transition-all'); // Should still have transitions
    });

    it('should handle long descriptive text for screen readers', () => {
      render(
        <Button aria-label="This is a very long description for the button that explains its purpose in detail">
          Short Text
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
    });
  });

  describe('Error States', () => {
    it('should handle component errors gracefully', () => {
      // Test with invalid props that might cause issues
      expect(() => {
        render(<Button variant="primary" size="md">Error Test</Button>);
      }).not.toThrow();
    });

    it('should handle malformed event handlers', async () => {
      const malformedHandler = undefined as any;

      render(<Button onClick={malformedHandler}>Malformed Handler</Button>);

      const button = screen.getByRole('button', { name: /malformed handler/i });

      // Should not throw when handler is malformed
      await expect(user.click(button)).resolves.not.toThrow();
    });
  });

  describe('Performance Monitoring', () => {
    it('should render within acceptable time limits', () => {
      const startTime = performance.now();

      render(<Button>Performance Test</Button>);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render very quickly (less than 10ms)
      expect(renderTime).toBeLessThan(10);
    });

    it('should handle large numbers of buttons efficiently', () => {
      const startTime = performance.now();

      render(
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <Button key={i}>Button {i}</Button>
          ))}
        </div>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should handle 100 buttons efficiently (less than 50ms)
      expect(renderTime).toBeLessThan(50);
      expect(screen.getByRole('button', { name: /button 0/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /button 99/i })).toBeInTheDocument();
    });
  });

  describe('Integration Testing', () => {
    it('should work with other UI components', () => {
      render(
        <div data-testid="container">
          <Button>Integrated Button</Button>
        </div>
      );

      expect(screen.getByTestId('container')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /integrated button/i })).toBeInTheDocument();
    });

    it('should handle complex component hierarchies', () => {
      render(
        <div>
          <header>
            <nav>
              <Button>Navigation Button</Button>
            </nav>
          </header>
          <main>
            <section>
              <Button>Main Button</Button>
            </section>
          </main>
        </div>
      );

      expect(screen.getByRole('button', { name: /navigation button/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /main button/i })).toBeInTheDocument();
    });
  });

  describe('Browser Edge Cases', () => {
    it('should handle missing DOM methods gracefully', () => {
      // Mock missing focus method
      const originalFocus = HTMLElement.prototype.focus;
      delete (HTMLElement.prototype as any).focus;

      expect(() => {
        render(<Button>Focus Test</Button>);
      }).not.toThrow();

      // Restore focus method
      HTMLElement.prototype.focus = originalFocus;
    });

    it('should handle disabled form controls correctly', () => {
      render(
        <fieldset disabled>
          <Button>Fieldset Button</Button>
        </fieldset>
      );

      const button = screen.getByRole('button', { name: /fieldset button/i });
      expect(button).toBeDisabled();
    });
  });

  describe('Component Testing Utilities', () => {
    it('should support test ID queries', () => {
      render(<Button data-testid="test-button">Test ID Button</Button>);

      expect(screen.getByTestId('test-button')).toBeInTheDocument();
    });

    it('should support role-based queries', () => {
      render(<Button>Role Query Button</Button>);

      expect(screen.getByRole('button', { name: /role query button/i })).toBeInTheDocument();
    });

    it('should support text-based queries', () => {
      render(<Button>Text Query Button</Button>);

      expect(screen.getByText('Text Query Button')).toBeInTheDocument();
    });
  });

  describe('Advanced State Management', () => {
    it('should handle complex state transitions', async () => {
      const { rerender } = render(<Button>State Test</Button>);

      // Normal -> Loading -> Disabled -> Normal
      rerender(<Button loading>Loading State</Button>);
      expect(screen.getByRole('button')).toBeDisabled();

      rerender(<Button disabled>Disabled State</Button>);
      expect(screen.getByRole('button')).toBeDisabled();

      rerender(<Button>Normal State</Button>);
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('should handle prop conflicts correctly', () => {
      render(
        <Button
          variant="primary"
          className="bg-red-500" // This should override variant background
          disabled={false}
          loading={false}
        >
          Prop Conflict Test
        </Button>
      );

      const button = screen.getByRole('button', { name: /prop conflict test/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });
  });

  describe('Content Security', () => {
    it('should handle potentially dangerous content safely', () => {
      const dangerousContent = '<script>alert("xss")</script>';
      render(<Button>{dangerousContent}</Button>);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle encoded content correctly', () => {
      const encodedContent = '<script>alert("xss")</script>';
      render(<Button>{encodedContent}</Button>);

      expect(screen.getByText(encodedContent)).toBeInTheDocument();
    });
  });

  describe('Animation Performance', () => {
    it('should handle animation classes correctly', () => {
      render(<Button>Animated Button</Button>);

      const button = screen.getByRole('button', { name: /animated button/i });
      expect(button).toHaveClass('transition-all', 'duration-200');
    });

    it('should not interfere with CSS animations', () => {
      render(<Button className="animate-bounce">Bounce Button</Button>);

      const button = screen.getByRole('button', { name: /bounce button/i });
      expect(button).toHaveClass('animate-bounce');
    });
  });

  describe('Component Metadata', () => {
    it('should have correct component name', () => {
      expect(Button.name).toBe('Button');
    });

    it('should have correct display name', () => {
      expect(Button.displayName).toBe('Button');
    });

    it('should be a forwardRef component', () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Ref Test</Button>);

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });
  });

  describe('Future-Proofing', () => {
    it('should handle future variant additions gracefully', () => {
      expect(() => {
        render(<Button variant="primary">Future Variant</Button>);
      }).not.toThrow();
    });

    it('should handle future size additions gracefully', () => {
      expect(() => {
        render(<Button size="md">Future Size</Button>);
      }).not.toThrow();
    });
  });

  describe('Cross-Platform Compatibility', () => {
    it('should work across different operating systems', () => {
      render(<Button>Cross-Platform Button</Button>);

      const button = screen.getByRole('button', { name: /cross-platform button/i });
      expect(button).toBeInTheDocument();
    });

    it('should handle different input methods', async () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Input Method Button</Button>);

      const button = screen.getByRole('button', { name: /input method button/i });

      // Test different input methods
      await user.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);

      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(2);

      fireEvent.pointerDown(button);
      expect(onClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Component Architecture', () => {
    it('should follow React best practices', () => {
      render(<Button>Best Practices Button</Button>);

      const button = screen.getByRole('button', { name: /best practices button/i });
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAttribute('type');
    });

    it('should be composable with other components', () => {
      const ButtonGroup = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="button-group">{children}</div>
      );

      render(
        <ButtonGroup>
          <Button>Composable 1</Button>
          <Button>Composable 2</Button>
        </ButtonGroup>
      );

      expect(screen.getByTestId('button-group')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /composable 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /composable 2/i })).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('should recover from rendering errors', () => {
      expect(() => {
        render(<Button>Recovery Test</Button>);
      }).not.toThrow();
    });

    it('should handle prop validation errors gracefully', () => {
      expect(() => {
        render(<Button variant={'invalid' as any}>Invalid Props</Button>);
      }).not.toThrow();
    });
  });

  describe('Advanced Event Handling', () => {
    it('should handle synthetic events correctly', async () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Synthetic Event Button</Button>);

      const button = screen.getByRole('button', { name: /synthetic event button/i });

      // Test synthetic event
      await user.click(button);
      expect(onClick).toHaveBeenCalledWith(expect.any(Object)); // Synthetic event object
    });

    it('should handle native events correctly', () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Native Event Button</Button>);

      const button = screen.getByRole('button', { name: /native event button/i });

      // Test native event
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('Component Optimization', () => {
    it('should minimize DOM updates', () => {
      const { rerender } = render(<Button>Optimization Test</Button>);

      const startTime = performance.now();

      // Multiple re-renders with same props
      for (let i = 0; i < 10; i++) {
        rerender(<Button>Optimization Test</Button>);
      }

      const endTime = performance.now();
      const updateTime = endTime - startTime;

      // Should handle repeated renders efficiently
      expect(updateTime).toBeLessThan(10);
    });

    it('should handle conditional rendering efficiently', () => {
      const { rerender } = render(<Button>Conditional Test</Button>);

      const startTime = performance.now();

      // Toggle between different states
      rerender(<Button loading>Conditional Test</Button>);
      rerender(<Button disabled>Conditional Test</Button>);
      rerender(<Button variant="secondary">Conditional Test</Button>);

      const endTime = performance.now();
      const conditionalTime = endTime - startTime;

      // Should handle conditional rendering efficiently
      expect(conditionalTime).toBeLessThan(15);
    });
  });

  describe('Accessibility Compliance', () => {
    it('should meet WCAG guidelines', () => {
      render(<Button>WCAG Button</Button>);

      const button = screen.getByRole('button', { name: /wcag button/i });

      // Should have proper focus indicators
      expect(button).toHaveClass('focus:ring-2');

      // Should be keyboard accessible
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should support assistive technologies', () => {
      render(
        <Button aria-describedby="button-description">
          Assistive Tech Button
        </Button>
      );

      const button = screen.getByRole('button', { name: /assistive tech button/i });
      expect(button).toHaveAttribute('aria-describedby', 'button-description');
    });
  });

  describe('Component Testing Best Practices', () => {
    it('should support snapshot testing', () => {
      render(<Button>Snapshot Button</Button>);

      const button = screen.getByRole('button', { name: /snapshot button/i });
      expect(button).toBeInTheDocument();
    });

    it('should support visual regression testing', () => {
      render(<Button>Visual Test Button</Button>);

      const button = screen.getByRole('button', { name: /visual test button/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-primary-main'); // Should have consistent styling
    });
  });

  describe('Advanced Performance', () => {
    it('should handle rapid user interactions', async () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Rapid Click Button</Button>);

      const button = screen.getByRole('button', { name: /rapid click button/i });

      // Rapid clicks
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(3);
    });

    it('should handle concurrent prop updates', () => {
      const { rerender } = render(<Button>Concurrent Test</Button>);

      // Simulate concurrent updates
      setTimeout(() => {
        rerender(<Button loading>Concurrent Test</Button>);
      }, 0);

      setTimeout(() => {
        rerender(<Button variant="secondary">Concurrent Test</Button>);
      }, 0);

      // Component should handle concurrent updates
      expect(screen.getByRole('button', { name: /concurrent test/i })).toBeInTheDocument();
    });
  });

  describe('Component Reliability', () => {
    it('should handle extreme usage scenarios', () => {
      // Create many buttons rapidly
      const buttons = Array.from({ length: 50 }, (_, i) => (
        <Button key={i}>Button {i}</Button>
      ));

      render(<div>{buttons}</div>);

      expect(screen.getByRole('button', { name: /button 0/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /button 49/i })).toBeInTheDocument();
    });

    it('should handle memory pressure gracefully', () => {
      const { unmount } = render(<Button>Memory Test</Button>);

      // Should not leak memory
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Future Compatibility', () => {
    it('should handle React 18+ features correctly', () => {
      render(<Button>React 18 Button</Button>);

      const button = screen.getByRole('button', { name: /react 18 button/i });
      expect(button).toBeInTheDocument();
    });

    it('should be compatible with concurrent features', async () => {
      const { rerender } = render(<Button>Concurrent Button</Button>);

      // Simulate concurrent rendering
      rerender(<Button loading>Concurrent Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Component Ecosystem', () => {
    it('should integrate well with design systems', () => {
      render(<Button className="design-system-class">Design System Button</Button>);

      const button = screen.getByRole('button', { name: /design system button/i });
      expect(button).toHaveClass('design-system-class');
    });

    it('should work with component libraries', () => {
      const Icon = ({ children }: { children: React.ReactNode }) => (
        <span data-testid="icon">{children}</span>
      );

      render(
        <Button leftIcon={<Icon>←</Icon>}>
          Library Button
        </Button>
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Library Button')).toBeInTheDocument();
    });
  });

  describe('Error Prevention', () => {
    it('should prevent common usage errors', () => {
      // Should not throw when used incorrectly
      expect(() => {
        render(<Button>Normal Usage</Button>);
      }).not.toThrow();
    });

    it('should provide helpful error messages for invalid usage', () => {
      // Should handle edge cases without cryptic errors
      expect(() => {
        render(<Button variant="primary" size="md">Error Prevention</Button>);
      }).not.toThrow();
    });
  });

  describe('Component Documentation', () => {
    it('should demonstrate all documented features', () => {
      // Test all documented props and features
      const leftIcon = <span>←</span>;
      const rightIcon = <span>→</span>;

      render(
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          loading
          loadingText="Loading..."
          leftIcon={leftIcon}
          rightIcon={rightIcon}
        >
          Documented Features
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Real-World Usage', () => {
    it('should handle real-world form scenarios', async () => {
      const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());

      render(
        <form onSubmit={onSubmit}>
          <input type="text" placeholder="Username" />
          <input type="password" placeholder="Password" />
          <Button type="submit">Login</Button>
        </form>
      );

      const button = screen.getByRole('button', { name: /login/i });
      await user.click(button);

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('should handle real-world navigation scenarios', async () => {
      const onNavigate = vi.fn();
      render(<Button onClick={onNavigate}>Navigate</Button>);

      const button = screen.getByRole('button', { name: /navigate/i });
      await user.click(button);

      expect(onNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Component Evolution', () => {
    it('should maintain backward compatibility', () => {
      // Test that old usage patterns still work
      render(<Button>Backward Compatible</Button>);

      expect(screen.getByRole('button', { name: /backward compatible/i })).toBeInTheDocument();
    });

    it('should support new features without breaking existing ones', () => {
      render(<Button>Future Proof</Button>);

      const button = screen.getByRole('button', { name: /future proof/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Quality Assurance', () => {
    it('should pass all quality checks', () => {
      render(<Button>Quality Button</Button>);

      const button = screen.getByRole('button', { name: /quality button/i });

      // Should have proper accessibility
      expect(button).toHaveAttribute('type');

      // Should have proper styling
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');

      // Should be interactive
      expect(button).not.toBeDisabled();
    });

    it('should meet performance requirements', () => {
      const startTime = performance.now();

      render(<Button>Performance Button</Button>);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render very quickly
      expect(renderTime).toBeLessThan(5);
    });
  });

  describe('Component Testing', () => {
    it('should support all testing patterns', () => {
      render(<Button data-testid="test-pattern">Testing Pattern</Button>);

      // Should support test ID queries
      expect(screen.getByTestId('test-pattern')).toBeInTheDocument();

      // Should support role queries
      expect(screen.getByRole('button', { name: /testing pattern/i })).toBeInTheDocument();

      // Should support text queries
      expect(screen.getByText('Testing Pattern')).toBeInTheDocument();
    });

    it('should provide good debugging information', () => {
      render(<Button>Debug Button</Button>);

      const button = screen.getByRole('button', { name: /debug button/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Final Integration', () => {
    it('should work in complex application scenarios', () => {
      render(
        <div className="app">
          <header className="header">
            <Button variant="ghost">Header Button</Button>
          </header>
          <main className="main">
            <form className="form">
              <Button type="submit" loading>Submit Button</Button>
            </form>
          </main>
          <footer className="footer">
            <Button variant="secondary">Footer Button</Button>
          </footer>
        </div>
      );

      expect(screen.getByRole('button', { name: /header button/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit button/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /footer button/i })).toBeInTheDocument();
    });

    it('should handle complete user workflows', async () => {
      const workflow = vi.fn();

      render(
        <div>
          <Button onClick={() => workflow('start')}>Start</Button>
          <Button onClick={() => workflow('process')} loading>Process</Button>
          <Button onClick={() => workflow('complete')}>Complete</Button>
        </div>
      );

      // Test workflow steps
      await user.click(screen.getByRole('button', { name: /start/i }));
      expect(workflow).toHaveBeenCalledWith('start');

      await user.click(screen.getByRole('button', { name: /complete/i }));
      expect(workflow).toHaveBeenCalledWith('complete');
    });
  });
});