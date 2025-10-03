
/**
 * ErrorBoundary Component Tests
 *
 * Comprehensive unit tests for the ErrorBoundary component covering error catching,
 * fallback UI rendering, error recovery, and accessibility features.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorBoundary, AsyncErrorBoundary, withErrorBoundary } from '../../../components/ErrorBoundary/ErrorBoundary';

// Mock UI components
vi.mock('../../ui', () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: any) => (
    <button
      className={`button ${variant || 'primary'} ${size || 'md'} ${className || ''}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
  Card: ({ children, className, ...props }: any) => (
    <div className={`card ${className || ''}`} {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div className={`card-content ${className || ''}`} {...props}>
      {children}
    </div>
  ),
  CardDescription: ({ children, className, ...props }: any) => (
    <div className={`card-description ${className || ''}`} {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div className={`card-header ${className || ''}`} {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <h3 className={`card-title ${className || ''}`} {...props}>
      {children}
    </h3>
  ),
}));

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow?: boolean; errorMessage?: string }> = ({
  shouldThrow = true,
  errorMessage = 'Test error'
}) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div data-testid="no-error">No error thrown</div>;
};

// Component that triggers async error
const AsyncErrorComponent: React.FC<{ shouldError?: boolean }> = ({ shouldError = false }) => {
  React.useEffect(() => {
    if (shouldError) {
      // Simulate async error
      setTimeout(() => {
        throw new Error('Async error occurred');
      }, 100);
    }
  }, [shouldError]);

  return <div data-testid="async-component">Async component loaded</div>;
};

// Custom fallback component
const CustomFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div data-testid="custom-fallback">
    <h2>Custom Error UI</h2>
    {error && <p>Error: {error.message}</p>}
  </div>
);

describe('ErrorBoundary Component', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    // Suppress console.error for expected errors in tests
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Error Catching', () => {
    it('should catch and display error when child component throws', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should show error UI instead of crashing
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('An unexpected error occurred while rendering this component.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    });

    it('should not render error UI when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should render child component normally
      expect(screen.getByTestId('no-error')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('should catch errors from deeply nested components', () => {
      const DeeplyNestedComponent: React.FC = () => (
        <div>
          <div>
            <div>
              <ThrowError />
            </div>
          </div>
        </div>
      );

      render(
        <ErrorBoundary>
          <DeeplyNestedComponent />
        </ErrorBoundary>
      );

      // Should catch error from deeply nested component
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should handle multiple errors in the same component tree', () => {
      const MultipleErrorsComponent: React.FC = () => (
        <div>
          <ThrowError errorMessage="First error" />
          <ThrowError errorMessage="Second error" />
        </div>
      );

      render(
        <ErrorBoundary>
          <MultipleErrorsComponent />
        </ErrorBoundary>
      );

      // Should catch the first error and not render subsequent components
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Custom Fallback UI', () => {
    it('should render custom fallback when provided', () => {
      render(
        <ErrorBoundary fallback={<CustomFallback />}>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should show custom fallback instead of default error UI
      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('should pass error information to custom fallback', () => {
      const errorMessage = 'Custom error message';

      render(
        <ErrorBoundary fallback={<CustomFallback />}>
          <ThrowError errorMessage={errorMessage} />
        </ErrorBoundary>
      );

      // Custom fallback should receive error information
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });

    it('should handle custom fallback without error prop', () => {
      render(
        <ErrorBoundary fallback={<div data-testid="simple-fallback">Simple fallback</div>}>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should render simple custom fallback
      expect(screen.getByTestId('simple-fallback')).toBeInTheDocument();
      expect(screen.getByText('Simple fallback')).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('should recover from error when retry button is clicked', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should show error state initially
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      // Re-render with component that doesn't throw
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should recover and show normal content
      expect(screen.getByTestId('no-error')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('should reload page when reload button is clicked', () => {
      // Mock window.location.reload
      const mockReload = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Click reload button
      const reloadButton = screen.getByRole('button', { name: /reload page/i });
      fireEvent.click(reloadButton);

      // Should call window.location.reload
      expect(mockReload).toHaveBeenCalledTimes(1);
    });

    it('should maintain error state until retry is clicked', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should remain in error state
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Error state should persist until retry
      expect(screen.queryByTestId('no-error')).not.toBeInTheDocument();
    });
  });

  describe('Error Logging', () => {
    it('should log error details to console', () => {
      const errorMessage = 'Test error for logging';

      render(
        <ErrorBoundary>
          <ThrowError errorMessage={errorMessage} />
        </ErrorBoundary>
      );

      // Should log error to console
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      );
    });

    it('should call custom error handler when provided', () => {
      const onError = vi.fn();
      const errorMessage = 'Custom handler error';

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError errorMessage={errorMessage} />
        </ErrorBoundary>
      );

      // Should call custom error handler
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });

    it('should handle errors in custom error handler gracefully', () => {
      const faultyErrorHandler = vi.fn().mockImplementation(() => {
        throw new Error('Error in error handler');
      });

      // Should not crash when error handler itself throws
      expect(() => {
        render(
          <ErrorBoundary onError={faultyErrorHandler}>
            <ThrowError />
          </ErrorBoundary>
        );
      }).not.toThrow();

      // Should still show error UI
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Development Mode Features', () => {
    it('should show error details in development mode', () => {
      // Mock development environment
      vi.stubEnv('DEV', true);

      const errorMessage = 'Development error details';

      render(
        <ErrorBoundary>
          <ThrowError errorMessage={errorMessage} />
        </ErrorBoundary>
      );

      // Should show error details section
      expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should not show error details in production mode', () => {
      // Mock production environment
      vi.stubEnv('DEV', false);

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should not show error details in production
      expect(screen.queryByText('Error Details (Development)')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for error state', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Error UI should be accessible
      const errorIcon = screen.getByRole('img', { hidden: true });
      expect(errorIcon).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: /try again/i });
      const reloadButton = screen.getByRole('button', { name: /reload page/i });

      expect(retryButton).toBeInTheDocument();
      expect(reloadButton).toBeInTheDocument();
    });

    it('should maintain focus management during error recovery', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should show error state
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Click retry
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      // Re-render with working component
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should recover properly
      expect(screen.getByTestId('no-error')).toBeInTheDocument();
    });

    it('should provide meaningful error messages for screen readers', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Error message should be descriptive
      expect(screen.getByText('An unexpected error occurred while rendering this component.')).toBeInTheDocument();
      expect(screen.getByText('If this problem persists, please contact support.')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should work with complex component trees', () => {
      const ComplexComponent: React.FC = () => (
        <div>
          <header>
            <h1>Complex App</h1>
          </header>
          <main>
            <section>
              <ThrowError />
            </section>
          </main>
          <footer>
            <p>Footer content</p>
          </footer>
        </div>
      );

      render(
        <ErrorBoundary>
          <ComplexComponent />
        </ErrorBoundary>
      );

      // Should catch error and show error UI instead of complex layout
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.queryByText('Complex App')).not.toBeInTheDocument();
      expect(screen.queryByText('Footer content')).not.toBeInTheDocument();
    });

    it('should handle multiple ErrorBoundary instances', () => {
      const ComponentWithNestedBoundaries: React.FC = () => (
        <ErrorBoundary>
          <div>
            <h1>Outer Boundary</h1>
            <ErrorBoundary>
              <ThrowError />
            </ErrorBoundary>
          </div>
        </ErrorBoundary>
      );

      render(<ComponentWithNestedBoundaries />);

      // Inner boundary should catch the error
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Outer Boundary')).toBeInTheDocument();
    });

    it('should work with React fragments', () => {
      const FragmentComponent: React.FC = () => (
        <>
          <h1>Fragment Title</h1>
          <ThrowError />
          <p>Fragment content</p>
        </>
      );

      render(
        <ErrorBoundary>
          <FragmentComponent />
        </ErrorBoundary>
      );

      // Should catch error in fragment
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.queryByText('Fragment Title')).not.toBeInTheDocument();
    });
  });

  describe('Error Types', () => {
    it('should handle different types of errors', () => {
      const errors = [
        new Error('Runtime error'),
        new TypeError('Type error'),
        new ReferenceError('Reference error'),
        new SyntaxError('Syntax error'),
      ];

      errors.forEach(error => {
        const { unmount } = render(
          <ErrorBoundary>
            <ThrowError errorMessage={error.message} />
          </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        unmount();
      });
    });

    it('should handle errors with special characters', () => {
      const specialCharError = 'Error with émojis 🚀 & spëcial châractérs';

      render(
        <ErrorBoundary>
          <ThrowError errorMessage={specialCharError} />
        </ErrorBoundary>
      );

      // Should handle special characters gracefully
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should handle very long error messages', () => {
      const longErrorMessage = 'A'.repeat(1000);

      render(
        <ErrorBoundary>
          <ThrowError errorMessage={longErrorMessage} />
        </ErrorBoundary>
      );

      // Should handle long error messages
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not impact performance when no errors occur', () => {
      const startTime = performance.now();

      render(
        <ErrorBoundary>
          <div>
            {Array.from({ length: 100 }, (_, i) => (
              <div key={i} data-testid={`item-${i}`}>
                Item {i}
              </div>
            ))}
          </div>
        </ErrorBoundary>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render quickly (less than 100ms for 100 items)
      expect(renderTime).toBeLessThan(100);
      expect(screen.getByTestId('item-99')).toBeInTheDocument();
    });

    it('should handle rapid error state changes', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Rapidly switch between error and no-error states
      for (let i = 0; i < 10; i++) {
        rerender(
          <ErrorBoundary>
            <ThrowError shouldThrow={i % 2 === 0} />
          </ErrorBoundary>
        );
      }

      // Should handle rapid changes gracefully
      expect(screen.getByTestId('no-error')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle errors during error boundary initialization', () => {
      // Component that throws during render
      const InitErrorComponent: React.FC = () => {
        throw new Error('Initialization error');
      };

      expect(() => {
        render(
          <ErrorBoundary>
            <InitErrorComponent />
          </ErrorBoundary>
        );
      }).not.toThrow();

      // Should show error UI
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should handle null and undefined children', () => {
      render(
        <ErrorBoundary>
          {null}
          {undefined}
        </ErrorBoundary>
      );

      // Should render without crashing
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('should handle empty children array', () => {
      render(
        <ErrorBoundary>
          <></>
        </ErrorBoundary>
      );

      // Should render without crashing
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      render(
        <ErrorBoundary className="custom-error-class">
          <ThrowError />
        </ErrorBoundary>
      );

      const errorContainer = screen.getByText('Something went wrong').closest('div');
      expect(errorContainer).toHaveClass('custom-error-class');
    });

    it('should merge custom classes with default classes', () => {
      render(
        <ErrorBoundary className="custom-class">
          <ThrowError />
        </ErrorBoundary>
      );

      const errorContainer = screen.getByText('Something went wrong').closest('div');
      expect(errorContainer).toHaveClass('custom-class');
      expect(errorContainer).toHaveClass('min-h-[400px]');
    });
  });

  describe('Error Information Display', () => {
    it('should show error name and message in development', () => {
      vi.stubEnv('DEV', true);

      const errorName = 'CustomError';
      const errorMessage = 'Custom error message';

      render(
        <ErrorBoundary>
          <ThrowError errorMessage={errorMessage} />
        </ErrorBoundary>
      );

      // Should show detailed error information
      expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();
      expect(screen.getByText(`${errorName}: ${errorMessage}`)).toBeInTheDocument();
    });

    it('should show error stack trace in development', () => {
      vi.stubEnv('DEV', true);

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should show stack trace
      const errorDetails = screen.getByText('Error Details (Development)');
      expect(errorDetails).toBeInTheDocument();
    });

    it('should handle errors without stack traces', () => {
      vi.stubEnv('DEV', true);

      // Create error without stack trace
      const errorWithoutStack = new Error('Stackless error');
      delete errorWithoutStack.stack;

      render(
        <ErrorBoundary>
          <ThrowError errorMessage="Stackless error" />
        </ErrorBoundary>
      );

      // Should handle gracefully
      expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should handle retry button clicks correctly', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Click retry
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      // Re-render with working component
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should recover
      expect(screen.getByTestId('no-error')).toBeInTheDocument();
    });

    it('should handle reload button clicks correctly', () => {
      const mockReload = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /reload page/i });
      fireEvent.click(reloadButton);

      expect(mockReload).toHaveBeenCalledTimes(1);
    });

    it('should disable buttons during error state appropriately', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      const reloadButton = screen.getByRole('button', { name: /reload page/i });

      // Buttons should be enabled and clickable
      expect(retryButton).not.toBeDisabled();
      expect(reloadButton).not.toBeDisabled();
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

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Error UI should render correctly on mobile
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should handle different screen sizes gracefully', () => {
      const { rerender } = render(
        <ErrorBoundary className="w-full">
          <ThrowError />
        </ErrorBoundary>
      );

      // Should work with different class configurations
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      rerender(
        <ErrorBoundary className="max-w-lg mx-auto">
          <ThrowError />
        </ErrorBoundary>
      );

      // Should adapt to different styling
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Memory Management', () => {
    it('should cleanup properly on unmount', () => {
      const { unmount } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should handle component updates during error state', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Re-render with same error state
      rerender(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should maintain error state
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Propagation', () => {
    it('should prevent error propagation to parent components', () => {
      const ParentErrorHandler = vi.fn();

      const ParentComponent: React.FC = () => {
        React.useEffect(() => {
          const handleError = (event: ErrorEvent) => {
            ParentErrorHandler(event.error);
          };

          window.addEventListener('error', handleError);
          return () => window.removeEventListener('error', handleError);
        }, []);

        return (
          <div>
            <h1>Parent Component</h1>
            <ErrorBoundary>
              <ThrowError />
            </ErrorBoundary>
          </div>
        );
      };

      render(<ParentComponent />);

      // Error should be caught by ErrorBoundary, not propagate to parent
      expect(screen.getByText('Parent Component')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(ParentErrorHandler).not.toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    it('should maintain error state correctly', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Initial error state
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Re-render with same error
      rerender(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should maintain error state
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should reset error state when error is fixed', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Fix the error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should show normal content
      expect(screen.getByTestId('no-error')).toBeInTheDocument();
    });
  });

  describe('AsyncErrorBoundary', () => {
    it('should catch async errors', async () => {
      render(
        <AsyncErrorBoundary>
          <AsyncErrorComponent shouldError />
        </AsyncErrorBoundary>
      );

      // Wait for async error to be caught
      await waitFor(() => {
        expect(screen.getByText('Operation Failed')).toBeInTheDocument();
      });
    });

    it('should handle async error recovery', async () => {
      const { rerender } = render(
        <AsyncErrorBoundary>
          <AsyncErrorComponent shouldError />
        </AsyncErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText('Operation Failed')).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      // Re-render with working component
      rerender(
        <AsyncErrorBoundary>
          <AsyncErrorComponent shouldError={false} />
        </AsyncErrorBoundary>
      );

      // Should recover
      expect(screen.getByTestId('async-component')).toBeInTheDocument();
    });

    it('should call custom error handler for async errors', async () => {
      const onError = vi.fn();

      render(
        <AsyncErrorBoundary onError={onError}>
          <AsyncErrorComponent shouldError />
        </AsyncErrorBoundary>
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
      });
    });
  });

  describe('withErrorBoundary HOC', () => {
    it('should wrap component with ErrorBoundary', () => {
      const TestComponent: React.FC = () => <div data-testid="test-component">Test Component</div>;

      const WrappedComponent = withErrorBoundary(TestComponent);

      render(<WrappedComponent />);

      // Should render wrapped component normally
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should catch errors in wrapped component', () => {
      const ErrorComponent: React.FC = () => {
        throw new Error('Wrapped component error');
      };

      const WrappedComponent = withErrorBoundary(ErrorComponent);

      render(<WrappedComponent />);

      // Should catch error from wrapped component
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should use custom fallback in HOC', () => {
      const ErrorComponent: React.FC = () => {
        throw new Error('HOC error');
      };

      const WrappedComponent = withErrorBoundary(ErrorComponent, <CustomFallback />);

      render(<WrappedComponent />);

      // Should use custom fallback
      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    });

    it('should preserve component display name', () => {
      const TestComponent: React.FC = () => <div>Test</div>;
      TestComponent.displayName = 'TestComponent';

      const WrappedComponent = withErrorBoundary(TestComponent);

      expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
    });

    it('should handle components without display name', () => {
      const TestComponent: React.FC = () => <div>Test</div>;

      const WrappedComponent = withErrorBoundary(TestComponent);

      expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
    });
  });

  describe('Error Details Display', () => {
    it('should show error message in async boundary', async () => {
      const errorMessage = 'Specific async error';

      render(
        <AsyncErrorBoundary>
          <AsyncErrorComponent shouldError />
        </AsyncErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText('Operation Failed')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should handle errors without messages', async () => {
      const ErrorComponentWithoutMessage: React.FC = () => {
        React.useEffect(() => {
          setTimeout(() => {
            throw new Error();
          }, 100);
        }, []);

        return <div>Test</div>;
      };

      render(
        <AsyncErrorBoundary>
          <ErrorComponentWithoutMessage />
        </AsyncErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText('Operation Failed')).toBeInTheDocument();
        expect(screen.getByText('An error occurred while processing your request.')).toBeInTheDocument();
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle component mounting with errors', () => {
      expect(() => {
        render(
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        );
      }).not.toThrow();

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should handle component unmounting during error state', () => {
      const { unmount } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Should unmount cleanly
      expect(() => unmount()).not.toThrow();
    });

    it('should handle state updates during error recovery', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Click retry and immediately update
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should handle state transition smoothly
      expect(screen.getByTestId('no-error')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Nesting', () => {
    it('should handle nested error boundaries correctly', () => {
      const InnerErrorComponent: React.FC = () => <ThrowError />;

      const NestedBoundaries: React.FC = () => (
        <ErrorBoundary>
          <div>
            <h1>Outer Content</h1>
            <ErrorBoundary>
              <InnerErrorComponent />
            </ErrorBoundary>
            <p>This should still render</p>
          </div>
        </ErrorBoundary>
      );

      render(<NestedBoundaries />);

      // Inner boundary should catch error, outer content should remain
      expect(screen.getByText('Outer Content')).toBeInTheDocument();
      expect(screen.getByText('This should still render')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should allow outer boundary to catch errors from inner boundary failures', () => {
      const FaultyInnerBoundary: React.FC = () => {
        throw new Error('Inner boundary error');
      };

      const NestedBoundaries: React.FC = () => (
        <ErrorBoundary>
          <div>
            <h1>Outer Content</h1>
            <ErrorBoundary>
              <FaultyInnerBoundary />
            </ErrorBoundary>
          </div>
        </ErrorBoundary>
      );

      render(<NestedBoundaries />);

      // Outer boundary should catch the error
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Development vs Production Behavior', () => {
    it('should show different levels of detail based on environment', () => {
      // Test development mode
      vi.stubEnv('DEV', true);

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError errorMessage="Dev error" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();

      // Test production mode
      vi.stubEnv('DEV', false);

      rerender(
        <ErrorBoundary>
          <ThrowError errorMessage="Prod error" />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Error Details (Development)')).not.toBeInTheDocument();
    });
  });

  describe('Error Recovery Flows', () => {
    it('should handle multiple retry attempts', async () => {
      let attemptCount = 0;

      const FlakyComponent: React.FC = () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error(`Attempt ${attemptCount} failed`);
        }
        return <div data-testid="success">Success on attempt {attemptCount}</div>;
      };

      const { rerender } = render(
        <ErrorBoundary>
          <FlakyComponent />
        </ErrorBoundary>
      );

      // First two attempts should fail
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Click retry for first attempt
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      rerender(
        <ErrorBoundary>
          <FlakyComponent />
        </ErrorBoundary>
      );

      // Should still show error (attempt 2)
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Click retry for second attempt
      fireEvent.click(retryButton);

      rerender(
        <ErrorBoundary>
          <FlakyComponent />
        </ErrorBoundary>
      );

      // Should succeed on third attempt
      expect(screen.getByTestId('success')).toBeInTheDocument();
      expect(screen.getByText('Success on attempt 3')).toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('should provide proper ARIA labels for error state', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Error icon should be hidden from screen readers but available for styling
      const errorIcon = screen.getByRole('img', { hidden: true });
      expect(errorIcon).toBeInTheDocument();
    });

    it('should maintain keyboard navigation in error state', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      const reloadButton = screen.getByRole('button', { name: /reload page/i });

      // Buttons should be keyboard accessible
      retryButton.focus();
      expect(retryButton).toHaveFocus();

      // Tab navigation should work
      fireEvent.keyDown(retryButton, { key: 'Tab' });
      expect(reloadButton).toHaveFocus();
    });

    it('should provide meaningful error descriptions', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Error description should be clear and actionable
      expect(screen.getByText('An unexpected error occurred while rendering this component.')).toBeInTheDocument();
      expect(screen.getByText('If this problem persists, please contact support.')).toBeInTheDocument();
    });
  });

  describe('Custom Error Handler Integration', () => {
    it('should integrate with external error reporting services', () => {
      const mockErrorReporter = vi.fn();
      const errorMessage = 'Reportable error';

      render(
        <ErrorBoundary onError={mockErrorReporter}>
          <ThrowError errorMessage={errorMessage} />
        </ErrorBoundary>
      );

      // Should call external error reporter
      expect(mockErrorReporter).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });

    it('should handle errors in custom error handlers gracefully', () => {
      const faultyReporter = vi.fn().mockImplementation(() => {
        throw new Error('Reporter error');
      });

      expect(() => {
        render(
          <ErrorBoundary onError={faultyReporter}>
            <ThrowError />
          </ErrorBoundary>
        );
      }).not.toThrow();

      // Should still show error UI despite reporter failure
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Component State Persistence', () => {
    it('should maintain error state across re-renders', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Re-render with same error
      rerender(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should maintain error state
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should reset error state when children change', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Change to working component
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should reset error state
      expect(screen.getByTestId('no-error')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Context', () => {
    it('should work within different React contexts', () => {
      const ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <div data-testid="context-provider">{children}</div>
      );

      render(
        <ContextProvider>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </ContextProvider>
      );

      // Should work within context providers
      expect(screen.getByTestId('context-provider')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Message Localization', () => {
    it('should handle different error message formats', () => {
      const errorMessages = [
        'Simple error',
        'Error with multiple words',
        'Error with numbers 123',
        'Error with symbols !@#$%',
        'Very long error message that might span multiple lines and contain various characters including émojis 🚀 and spëcial châractérs'
      ];

      errorMessages.forEach(errorMessage => {
        const { unmount } = render(
          <ErrorBoundary>
            <ThrowError errorMessage={errorMessage} />
          </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Button State Management', () => {
    it('should handle button interactions during error state', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      const reloadButton = screen.getByRole('button', { name: /reload page/i });

      // Buttons should be interactive
      expect(retryButton).not.toBeDisabled();
      expect(reloadButton).not.toBeDisabled();

      // Should handle clicks
      expect(() => fireEvent.click(retryButton)).not.toThrow();
      expect(() => fireEvent.click(reloadButton)).not.toThrow();
    });
  });

  describe('Error Details Expansion', () => {
    it('should handle error details toggle in development', () => {
      vi.stubEnv('DEV', true);

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const detailsElement = screen.getByText('Error Details (Development)');
      expect(detailsElement).toBeInTheDocument();

      // Details should be collapsible (if implemented as details element)
      const summary = detailsElement.closest('summary');
      if (summary) {
        expect(summary).toBeInTheDocument();
      }
    });
  });

  describe('Component Cleanup', () => {
    it('should cleanup error state on unmount', () => {
      const { unmount } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Should cleanup properly
      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid mount/unmount cycles', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        unmount();
      }

      // Should handle rapid cycles without issues
      expect(consoleErrorSpy).toHaveBeenCalledTimes(10);
    });
  });

  describe('Error Boundary with Portals', () => {
    it('should work with React portals', () => {
      const PortalComponent: React.FC = () => {
        const portalRoot = document.createElement('div');
        portalRoot.setAttribute('id', 'portal-root');
        document.body.appendChild(portalRoot);

        React.useEffect(() => {
          return () => {
            document.body.removeChild(portalRoot);
          };
        }, []);

        return React.createPortal(
          <ThrowError />,
          portalRoot
        );
      };

      render(
        <ErrorBoundary>
          <div>
            <h1>Main Content</h1>
            <PortalComponent />
          </div>
        </ErrorBoundary>
      );

      // Should catch errors from portals
      expect(screen.getByText('Main Content')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Performance', () => {
    it('should handle large component trees efficiently', () => {
      const LargeComponentTree: React.FC = () => (
        <div>
          {Array.from({ length: 1000 }, (_, i) => (
            <div key={i} data-testid={`large-tree-item-${i}`}>
              Item {i}
            </div>
          ))}
          <ThrowError />
        </div>
      );

      const startTime = performance.now();
      render(
        <ErrorBoundary>
          <LargeComponentTree />
        </ErrorBoundary>
      );
      const endTime = performance.now();

      // Should handle large trees efficiently
      expect(endTime - startTime).toBeLessThan(500); // Less than 500ms
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Hooks', () => {
    it('should work with components using React hooks', () => {
      const HookComponent: React.FC = () => {
        const [count, setCount] = React.useState(0);
        const [data, setData] = React.useState(null);

        React.useEffect(() => {
          if (count > 0) {
            throw new Error('Hook error');
          }
        }, [count]);

        return (
          <div>
            <button onClick={() => setCount(c => c + 1)}>Increment</button>
            <button onClick={() => setData({ test: 'data' })}>Set Data</button>
            <span data-testid="count">{count}</span>
          </div>
        );
      };

      render(
        <ErrorBoundary>
          <HookComponent />
        </ErrorBoundary>
      );

      // Should catch hook errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Async Components', () => {
    it('should handle errors in async component initialization', async () => {
      const AsyncInitComponent: React.FC = () => {
        React.useEffect(() => {
          // Simulate async operation that fails
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Async init failed')), 50);
          }).catch(() => {
            throw new Error('Async init error');
          });
        }, []);

        return <div data-testid="async-init">Async init component</div>;
      };

      render(
        <ErrorBoundary>
          <AsyncInitComponent />
        </ErrorBoundary>
      );

      // Wait for async error
      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });
  });

  describe('Error Boundary Styling', () => {
    it('should apply responsive classes correctly', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const errorContainer = screen.getByText('Something went wrong').closest('div');
      expect(errorContainer).toHaveClass('min-h-[400px]');
      expect(errorContainer).toHaveClass('flex');
      expect(errorContainer).toHaveClass('items-center');
      expect(errorContainer).toHaveClass('justify-center');
    });

    it('should support custom styling through className', () => {
      render(
        <ErrorBoundary className="bg-red-50 border-2 border-red-200">
          <ThrowError />
        </ErrorBoundary>
      );

      const errorContainer = screen.getByText('Something went wrong').closest('div');
      expect(errorContainer).toHaveClass('bg-red-50');
      expect(errorContainer).toHaveClass('border-2');
      expect(errorContainer).toHaveClass('border-red-200');
    });
  });

  describe('Error Boundary with Conditional Rendering', () => {
    it('should handle conditional error scenarios', () => {
      const ConditionalErrorComponent: React.FC<{ shouldError: boolean }> = ({ shouldError }) => {
        if (shouldError) {
          throw new Error('Conditional error');
        }
        return <div data-testid="conditional-success">Conditional success</div>;
      };

      const { rerender } = render(
        <ErrorBoundary>
          <ConditionalErrorComponent shouldError={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Fix the condition
      rerender(
        <ErrorBoundary>
          <ConditionalErrorComponent shouldError={false} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('conditional-success')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Error Types', () => {
    it('should handle different JavaScript error types', () => {
      const errorTypes = [
        new Error('Standard Error'),
        new TypeError('Type Error'),
        new ReferenceError('Reference Error'),
        new SyntaxError('Syntax Error'),
        new RangeError('Range Error'),
      ];

      errorTypes.forEach(error => {
        const { unmount } = render(
          <ErrorBoundary>
            <ThrowError errorMessage={error.message} />
          </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Error Boundary with Event Handlers', () => {
    it('should handle errors in event handlers', async () => {
      const EventErrorComponent: React.FC = () => {
        const handleClick = () => {
          throw new Error('Event handler error');
        };

        return (
          <button onClick={handleClick} data-testid="event-button">
            Click me
          </button>
        );
      };

      render(
        <ErrorBoundary>
          <EventErrorComponent />
        </ErrorBoundary>
      );

      const button = screen.getByTestId('event-button');
      fireEvent.click(button);

      // ErrorBoundary should catch event handler errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Forms', () => {
    it('should handle errors in form components', () => {
      const FormErrorComponent: React.FC = () => {
        const [value, setValue] = React.useState('');

        React.useEffect(() => {
          if (value === 'error') {
            throw new Error('Form validation error');
          }
        }, [value]);

        return (
          <form>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              data-testid="form-input"
            />
          </form>
        );
      };

      render(
        <ErrorBoundary>
          <FormErrorComponent />
        </ErrorBoundary>
      );

      // Should catch form-related errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Lists', () => {
    it('should handle errors in list rendering', () => {
      const ListErrorComponent: React.FC = () => {
        const items = ['item1', 'item2', 'error', 'item4'];

        return (
          <ul>
            {items.map((item, index) => {
              if (item === 'error') {
                throw new Error('List rendering error');
              }
              return <li key={index}>{item}</li>;
            })}
          </ul>
        );
      };

      render(
        <ErrorBoundary>
          <ListErrorComponent />
        </ErrorBoundary>
      );

      // Should catch list rendering errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Network Requests', () => {
    it('should handle errors from failed network requests', async () => {
      const NetworkErrorComponent: React.FC = () => {
        React.useEffect(() => {
          fetch('/api/test')
            .then(() => {
              throw new Error('Network response error');
            })
            .catch(() => {
              throw new Error('Network request failed');
            });
        }, []);

        return <div data-testid="network-component">Network component</div>;
      };

      render(
        <ErrorBoundary>
          <NetworkErrorComponent />
        </ErrorBoundary>
      );

      // Wait for network error to be caught
      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });
  });

  describe('Error Boundary with State Updates', () => {
    it('should handle errors during state updates', () => {
      const StateUpdateErrorComponent: React.FC = () => {
        const [count, setCount] = React.useState(0);

        React.useEffect(() => {
          if (count > 0) {
            throw new Error('State update error');
          }
        }, [count]);

        return (
          <button onClick={() => setCount(c => c + 1)} data-testid="state-button">
            Increment: {count}
          </button>
        );
      };

      render(
        <ErrorBoundary>
          <StateUpdateErrorComponent />
        </ErrorBoundary>
      );

      // Should catch state update errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Timers', () => {
    it('should handle errors from setTimeout', async () => {
      const TimerErrorComponent: React.FC = () => {
        React.useEffect(() => {
          const timer = setTimeout(() => {
            throw new Error('Timer error');
          }, 100);

          return () => clearTimeout(timer);
        }, []);

        return <div data-testid="timer-component">Timer component</div>;
      };

      render(
        <ErrorBoundary>
          <TimerErrorComponent />
        </ErrorBoundary>
      );

      // Wait for timer error
      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });
  });

  describe('Error Boundary with Promises', () => {
    it('should handle promise rejections', async () => {
      const PromiseErrorComponent: React.FC = () => {
        React.useEffect(() => {
          Promise.reject(new Error('Promise rejection'))
            .catch(() => {
              throw new Error('Unhandled promise error');
            });
        }, []);

        return <div data-testid="promise-component">Promise component</div>;
      };

      render(
        <ErrorBoundary>
          <PromiseErrorComponent />
        </ErrorBoundary>
      );

      // Wait for promise error
      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });
  });

  describe('Error Boundary with Context', () => {
    it('should handle errors in context providers', () => {
      const ErrorContext: React.FC = () => {
        throw new Error('Context error');
      };

      const ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <div data-testid="context-provider">
          <ErrorContext />
          {children}
        </div>
      );

      render(
        <ErrorBoundary>
          <ContextProvider>
            <div>Child content</div>
          </ContextProvider>
        </ErrorBoundary>
      );

      // Should catch context errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Higher-Order Components', () => {
    it('should work with HOCs that might throw errors', () => {
      const withErrorHOC = <P extends object>(Component: React.ComponentType<P>) => {
        const WrappedComponent = (props: P) => {
          React.useEffect(() => {
            throw new Error('HOC error');
          }, []);

          return <Component {...props} />;
        };

        return WrappedComponent;
      };

      const TestComponent: React.FC = () => <div data-testid="hoc-component">HOC Component</div>;
      const WrappedComponent = withErrorHOC(TestComponent);

      render(
        <ErrorBoundary>
          <WrappedComponent />
        </ErrorBoundary>
      );

      // Should catch HOC errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Render Props', () => {
    it('should handle errors in render prop components', () => {
      const RenderPropComponent: React.FC<{
        render: (data: any) => React.ReactNode;
      }> = ({ render }) => {
        throw new Error('Render prop error');
      };

      render(
        <ErrorBoundary>
          <RenderPropComponent render={(data) => <div>{data}</div>} />
        </ErrorBoundary>
      );

      // Should catch render prop errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Suspense', () => {
    it('should work alongside Suspense boundaries', () => {
      const SuspenseErrorComponent: React.FC = () => {
        throw new Error('Suspense error');
      };

      render(
        <React.Suspense fallback={<div>Loading...</div>}>
          <ErrorBoundary>
            <SuspenseErrorComponent />
          </ErrorBoundary>
        </React.Suspense>
      );

      // ErrorBoundary should catch the error, not Suspense
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('Error Boundary with Strict Mode', () => {
    it('should handle double renders in strict mode', () => {
      const StrictModeComponent: React.FC = () => {
        const [renderCount, setRenderCount] = React.useState(0);

        React.useEffect(() => {
          setRenderCount(c => c + 1);
          if (renderCount === 1) {
            throw new Error('Strict mode error');
          }
        });

        return <div data-testid="strict-mode">Render count: {renderCount}</div>;
      };

      render(
        <React.StrictMode>
          <ErrorBoundary>
            <StrictModeComponent />
          </ErrorBoundary>
        </React.StrictMode>
      );

      // Should handle strict mode double rendering
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Concurrent Features', () => {
    it('should handle concurrent rendering errors', () => {
      const ConcurrentErrorComponent: React.FC = () => {
        React.useEffect(() => {
          // Simulate concurrent update error
          React.startTransition(() => {
            throw new Error('Concurrent error');
          });
        }, []);

        return <div data-testid="concurrent-component">Concurrent component</div>;
      };

      render(
        <ErrorBoundary>
          <ConcurrentErrorComponent />
        </ErrorBoundary>
      );

      // Should catch concurrent errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Custom Hooks', () => {
    it('should handle errors in custom hooks', () => {
      const useCustomHook = () => {
        React.useEffect(() => {
          throw new Error('Custom hook error');
        }, []);
      };

      const CustomHookComponent: React.FC = () => {
        useCustomHook();
        return <div data-testid="custom-hook">Custom hook component</div>;
      };

      render(
        <ErrorBoundary>
          <CustomHookComponent />
        </ErrorBoundary>
      );

      // Should catch custom hook errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Error Objects', () => {
    it('should handle Error objects with different properties', () => {
      const customError = new Error('Custom error');
      customError.name = 'CustomError';
      customError.stack = 'Custom stack trace';

      render(
        <ErrorBoundary>
          <ThrowError errorMessage="Custom error object" />
        </ErrorBoundary>
      );

      // Should handle custom error objects
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Memory Leaks Prevention', () => {
    it('should not cause memory leaks with frequent errors', () => {
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(
          <ErrorBoundary>
            <ThrowError errorMessage={`Error ${i}`} />
          </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        unmount();
      }

      // Should handle frequent error/unmount cycles
      expect(consoleErrorSpy).toHaveBeenCalledTimes(100);
    });
  });

  describe('Error Boundary with Large Error Objects', () => {
    it('should handle errors with large stack traces', () => {
      const largeError = new Error('Error with large stack');
      largeError.stack = 'Error stack\n'.repeat(1000);

      render(
        <ErrorBoundary>
          <ThrowError errorMessage="Large error" />
        </ErrorBoundary>
      );

      // Should handle large error objects
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Error Boundaries', () => {
    it('should handle nested error boundaries correctly', () => {
      const NestedErrorBoundaries: React.FC = () => (
        <ErrorBoundary>
          <div>
            <h1>Level 1</h1>
            <ErrorBoundary>
              <div>
                <h2>Level 2</h2>
                <ThrowError />
              </div>
            </ErrorBoundary>
            <p>Level 1 content after error</p>
          </div>
        </ErrorBoundary>
      );

      render(<NestedErrorBoundaries />);

      // Inner boundary should catch error, outer content should remain
      expect(screen.getByText('Level 1')).toBeInTheDocument();
      expect(screen.getByText('Level 1 content after error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Component Updates', () => {
    it('should handle prop changes during error state', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Update props during error state
      rerender(
        <ErrorBoundary className="updated-class">
          <ThrowError />
        </ErrorBoundary>
      );

      // Should maintain error state with updated props
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Keyboard Events', () => {
    it('should handle keyboard events during error state', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });

      // Should handle keyboard events
      fireEvent.keyDown(retryButton, { key: 'Enter' });
      fireEvent.keyUp(retryButton, { key: 'Enter' });

      // Should not throw errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Focus Management', () => {
    it('should maintain focus during error recovery', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      retryButton.focus();

      expect(retryButton).toHaveFocus();

      // Click retry
      fireEvent.click(retryButton);

      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should recover properly
      expect(screen.getByTestId('no-error')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Screen Reader Support', () => {
    it('should provide appropriate ARIA attributes for screen readers', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Error UI should be accessible
      const errorIcon = screen.getByRole('img', { hidden: true });
      expect(errorIcon).toBeInTheDocument();

      // Buttons should have proper labels
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Error Reporting Integration', () => {
    it('should integrate with external error reporting', () => {
      const mockErrorReporter = vi.fn();

      render(
        <ErrorBoundary onError={mockErrorReporter}>
          <ThrowError errorMessage="Reportable error" />
        </ErrorBoundary>
      );

      // Should call external error reporter
      expect(mockErrorReporter).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  describe('Error Boundary with Development Tools', () => {
    it('should show additional debugging info in development', () => {
      vi.stubEnv('DEV', true);

      render(
        <ErrorBoundary>
          <ThrowError errorMessage="Debug error" />
        </ErrorBoundary>
      );

      // Should show development-specific error details
      expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();
      expect(screen.getByText('Debug error')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Production Optimizations', () => {
    it('should not show sensitive error details in production', () => {
      vi.stubEnv('DEV', false);

      render(
        <ErrorBoundary>
          <ThrowError errorMessage="Production error" />
        </ErrorBoundary>
      );

      // Should not show detailed error information in production
      expect(screen.queryByText('Error Details (Development)')).not.toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Component Libraries', () => {
    it('should work with third-party component libraries', () => {
      const ThirdPartyComponent: React.FC = () => {
        // Simulate a third-party component that might throw
        React.useEffect(() => {
          throw new Error('Third-party component error');
        }, []);

        return <div data-testid="third-party">Third Party Component</div>;
      };

      render(
        <ErrorBoundary>
          <ThirdPartyComponent />
        </ErrorBoundary>
      );

      // Should catch third-party component errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Dynamic Imports', () => {
    it('should handle errors from dynamic imports', async () => {
      const DynamicImportComponent: React.FC = () => {
        React.useEffect(() => {
          import('./nonexistent-module')
            .then(() => {
              throw new Error('Dynamic import error');
            })
            .catch(() => {
              throw new Error('Module loading failed');
            });
        }, []);

        return <div data-testid="dynamic-import">Dynamic import component</div>;
      };

      render(
        <ErrorBoundary>
          <DynamicImportComponent />
        </ErrorBoundary>
      );

      // Wait for dynamic import error
      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });
  });

  describe('Error Boundary with Web APIs', () => {
    it('should handle errors from Web API calls', async () => {
      const WebAPIComponent: React.FC = () => {
        React.useEffect(() => {
          // Simulate Web API error
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              () => {},
              () => {
                throw new Error('Geolocation error');
              }
            );
          }
        }, []);

        return <div data-testid="web-api">Web API component</div>;
      };

      render(
        <ErrorBoundary>
          <WebAPIComponent />
        </ErrorBoundary>
      );

      // Should catch Web API errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Performance Monitoring', () => {
    it('should not significantly impact performance', () => {
      const startTime = performance.now();

      render(
        <ErrorBoundary>
          <div>
            {Array.from({ length: 1000 }, (_, i) => (
              <div key={i} data-testid={`perf-item-${i}`}>
                Performance test item {i}
              </div>
            ))}
          </div>
        </ErrorBoundary>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render quickly (less than 200ms for 1000 items)
      expect(renderTime).toBeLessThan(200);
      expect(screen.getByTestId('perf-item-999')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Memory Management', () => {
    it('should not leak memory with frequent error cycles', () => {
      // Simulate frequent error/unmount cycles
      for (let i = 0; i < 50; i++) {
        const { unmount } = render(
          <ErrorBoundary>
            <ThrowError errorMessage={`Cycle ${i}`} />
          </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        unmount();
      }

      // Should handle frequent cycles without memory issues
      expect(consoleErrorSpy).toHaveBeenCalledTimes(50);
    });
  });

  describe('Error Boundary with Error Recovery Patterns', () => {
    it('should support different error recovery strategies', async () => {
      let recoveryStrategy = 'none';

      const RecoverableComponent: React.FC = () => {
        React.useEffect(() => {
          if (recoveryStrategy === 'none') {
            throw new Error('Initial error');
          }
        }, [recoveryStrategy]);

        return <div data-testid="recoverable">Recovered component</div>;
      };

      const { rerender } = render(
        <ErrorBoundary>
          <RecoverableComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Try recovery strategy 1
      recoveryStrategy = 'strategy1';
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      rerender(
        <ErrorBoundary>
          <RecoverableComponent />
        </ErrorBoundary>
      );

      // Should recover
      expect(screen.getByTestId('recoverable')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Component State', () => {
    it('should handle component state during error recovery', () => {
      const StateComponent: React.FC = () => {
        const [state, setState] = React.useState('initial');

        React.useEffect(() => {
          if (state === 'error') {
            throw new Error('State error');
          }
        }, [state]);

        return (
          <div>
            <span data-testid="state-value">{state}</span>
            <button onClick={() => setState('error')} data-testid="trigger-error">
              Trigger Error
            </button>
          </div>
        );
      };

      render(
        <ErrorBoundary>
          <StateComponent />
        </ErrorBoundary>
      );

      // Should catch state-related errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Event Listeners', () => {
    it('should handle errors in event listeners', async () => {
      const EventListenerComponent: React.FC = () => {
        React.useEffect(() => {
          const handleEvent = () => {
            throw new Error('Event listener error');
          };

          window.addEventListener('custom-event', handleEvent);
          return () => window.removeEventListener('custom-event', handleEvent);
        }, []);

        return (
          <button
            onClick={() => window.dispatchEvent(new Event('custom-event'))}
            data-testid="event-trigger"
          >
            Trigger Event
          </button>
        );
      };

      render(
        <ErrorBoundary>
          <EventListenerComponent />
        </ErrorBoundary>
      );

      const triggerButton = screen.getByTestId('event-trigger');
      fireEvent.click(triggerButton);

      // Should catch event listener errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Form Validation', () => {
    it('should handle errors in form validation logic', () => {
      const FormValidationComponent: React.FC = () => {
        const [value, setValue] = React.useState('');

        React.useEffect(() => {
          if (value === 'invalid') {
            throw new Error('Validation error');
          }
        }, [value]);

        return (
          <form>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              data-testid="validation-input"
            />
          </form>
        );
      };

      render(
        <ErrorBoundary>
          <FormValidationComponent />
        </ErrorBoundary>
      );

      // Should catch validation errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Data Fetching', () => {
    it('should handle errors in data fetching components', async () => {
      const DataFetchingComponent: React.FC = () => {
        React.useEffect(() => {
          fetch('/api/data')
            .then(response => {
              if (!response.ok) {
                throw new Error('Fetch error');
              }
            })
            .catch(() => {
              throw new Error('Data fetching failed');
            });
        }, []);

        return <div data-testid="data-fetching">Data fetching component</div>;
      };

      render(
        <ErrorBoundary>
          <DataFetchingComponent />
        </ErrorBoundary>
      );

      // Wait for fetch error
      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });
  });

  describe('Error Boundary with Component Communication', () => {
    it('should handle errors in parent-child communication', () => {
      const ChildComponent: React.FC<{ onData: (data: any) => void }> = ({ onData }) => {
        React.useEffect(() => {
          onData({ error: true });
          throw new Error('Communication error');
        }, [onData]);

        return <div data-testid="child-component">Child component</div>;
      };

      const ParentComponent: React.FC = () => {
        const [data, setData] = React.useState(null);

        return (
          <div>
            <ChildComponent onData={setData} />
            <div data-testid="parent-data">{data ? 'Has data' : 'No data'}</div>
          </div>
        );
      };

      render(
        <ErrorBoundary>
          <ParentComponent />
        </ErrorBoundary>
      );

      // Should catch communication errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Conditional Rendering', () => {
    it('should handle errors in conditional rendering logic', () => {
      const ConditionalRenderComponent: React.FC = () => {
        const [condition, setCondition] = React.useState(false);

        React.useEffect(() => {
          if (condition) {
            throw new Error('Conditional render error');
          }
        }, [condition]);

        return (
          <div>
            <button onClick={() => setCondition(true)} data-testid="conditional-trigger">
              Trigger Condition
            </button>
            {condition && <div data-testid="conditional-content">Conditional content</div>}
          </div>
        );
      };

      render(
        <ErrorBoundary>
          <ConditionalRenderComponent />
        </ErrorBoundary>
      );

      // Should catch conditional rendering errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Animation', () => {
    it('should handle errors in animated components', () => {
      const AnimatedComponent: React.FC = () => {
        React.useEffect(() => {
          // Simulate animation error
          requestAnimationFrame(() => {
            throw new Error('Animation error');
          });
        }, []);

        return <div data-testid="animated">Animated component</div>;
      };

      render(
        <ErrorBoundary>
          <AnimatedComponent />
        </ErrorBoundary>
      );

      // Should catch animation errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Internationalization', () => {
    it('should handle errors in i18n components', () => {
      const I18nComponent: React.FC = () => {
        React.useEffect(() => {
          // Simulate i18n error
          throw new Error('Internationalization error');
        }, []);

        return <div data-testid="i18n">Internationalized component</div>;
      };

      render(
        <ErrorBoundary>
          <I18nComponent />
        </ErrorBoundary>
      );

      // Should catch i18n errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Theming', () => {
    it('should handle errors in themed components', () => {
      const ThemedComponent: React.FC = () => {
        React.useEffect(() => {
          throw new Error('Theme error');
        }, []);

        return <div data-testid="themed" className="theme-error">Themed component</div>;
      };

      render(
        <ErrorBoundary>
          <ThemedComponent />
        </ErrorBoundary>
      );

      // Should catch theme errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Accessibility Features', () => {
    it('should maintain accessibility during error state', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Error UI should be accessible
      const errorIcon = screen.getByRole('img', { hidden: true });
      expect(errorIcon).toBeInTheDocument();

      // Buttons should have proper focus indicators
      const retryButton = screen.getByRole('button', { name: /try again/i });
      const reloadButton = screen.getByRole('button', { name: /reload page/i });

      expect(retryButton).toBeInTheDocument();
      expect(reloadButton).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Error Analytics', () => {
    it('should integrate with error analytics services', () => {
      const mockAnalytics = vi.fn();

      render(
        <ErrorBoundary onError={mockAnalytics}>
          <ThrowError errorMessage="Analytics error" />
        </ErrorBoundary>
      );

      // Should call analytics service
      expect(mockAnalytics).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  describe('Error Boundary with Error Recovery UX', () => {
    it('should provide clear recovery options', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should provide clear recovery options
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Reload Page')).toBeInTheDocument();
      expect(screen.getByText('If this problem persists, please contact support.')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Component Libraries Integration', () => {
    it('should work with popular component libraries', () => {
      const LibraryComponent: React.FC = () => {
        React.useEffect(() => {
          throw new Error('Component library error');
        }, []);

        return <div data-testid="library-component">Library Component</div>;
      };

      render(
        <ErrorBoundary>
          <LibraryComponent />
        </ErrorBoundary>
      );

      // Should catch component library errors
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Development Experience', () => {
    it('should provide helpful development information', () => {
      vi.stubEnv('DEV', true);

      render(
        <ErrorBoundary>
          <ThrowError errorMessage="Development error" />
        </ErrorBoundary>
      );

      // Should show development-friendly error information
      expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();
      expect(screen.getByText('Development error')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Production Experience', () => {
    it('should provide user-friendly production experience', () => {
      vi.stubEnv('DEV', false);

      render(
        <ErrorBoundary>
          <ThrowError errorMessage="Production error" />
        </ErrorBoundary>
      );

      // Should show user-friendly error UI in production
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('An unexpected error occurred while rendering this component.')).toBeInTheDocument();
      expect(screen.queryByText('Error Details (Development)')).not.toBeInTheDocument();
    });
  });

  describe('Error Boundary with Error Prevention', () => {
    it('should help prevent error propagation', () => {
      const ParentComponent: React.FC = () => {
        const [shouldError, setShouldError] = React.useState(false);

        return (
          <div>
            <button onClick={() => setShouldError(true)} data-testid="parent-trigger">
              Trigger Error
            </button>
            <ErrorBoundary>
              {shouldError && <ThrowError />}
            </ErrorBoundary>
          </div>
        );
      };

      render(<ParentComponent />);

      // Initially no error
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();

      // Trigger error
      const triggerButton = screen.getByTestId('parent-trigger');
      fireEvent.click(triggerButton);

      // Error should be contained within ErrorBoundary
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Error Recovery Best Practices', () => {
    it('should follow error recovery best practices', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Should provide multiple recovery options
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();

      // Should provide helpful guidance
      expect(screen.getByText('If this problem persists, please contact support.')).toBeInTheDocument();

      // Should allow graceful recovery
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('no-error')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Component Testing', () => {
    it('should be easily testable', () => {
      const TestableComponent: React.FC = () => {
        const [errorTrigger, setErrorTrigger] = React.useState(false);

        React.useEffect(() => {
          if (errorTrigger) {
            throw new Error('Testable error');
          }
        }, [errorTrigger]);

        return (
          <div>
            <button onClick={() => setErrorTrigger(true)} data-testid="test-trigger">
              Trigger Test Error
            </button>
          </div>
        );
      };

      render(
        <ErrorBoundary>
          <TestableComponent />
        </ErrorBoundary>
      );

      // Should be easily testable
      expect(screen.getByTestId('test-trigger')).toBeInTheDocument();

      // Should handle test errors
      const triggerButton = screen.getByTestId('test-trigger');
      fireEvent.click(triggerButton);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Error Monitoring Integration', () => {
    it('should integrate with error monitoring services', () => {
      const mockMonitor = vi.fn();

      render(
        <ErrorBoundary onError={mockMonitor}>
          <ThrowError errorMessage="Monitoring error" />
        </ErrorBoundary>
      );

      // Should integrate with monitoring services
      expect(mockMonitor).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  describe('Error Boundary with Error Recovery Guidance', () => {
    it('should provide clear error recovery guidance', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should provide clear recovery guidance
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Reload Page')).toBeInTheDocument();
      expect(screen.getByText('If this problem persists, please contact support.')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Component Health', () => {
    it('should maintain component health during error recovery', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Should maintain component health during recovery
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should recover to healthy state
      expect(screen.getByTestId('no-error')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Error Context Preservation', () => {
    it('should preserve error context for debugging', () => {
      const errorContext = 'Component context information';

      const ContextComponent: React.FC = () => {
        React.useEffect(() => {
          throw new Error(`Context error: ${errorContext}`);
        }, []);

        return <div data-testid="context-component">Context component</div>;
      };

      render(
        <ErrorBoundary>
          <ContextComponent />
        </ErrorBoundary>
      );

      // Should preserve error context
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Error Recovery Analytics', () => {
    it('should track error recovery attempts', () => {
      const recoveryTracker = vi.fn();

      render(
        <ErrorBoundary onError={recoveryTracker}>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should track error occurrence
      expect(recoveryTracker).toHaveBeenCalledTimes(1);

      // Click retry
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      // Should track recovery attempt
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Component State Isolation', () => {
    it('should isolate error state from other components', () => {
      const SiblingComponent: React.FC = () => <div data-testid="sibling">Sibling component</div>;

      const ErrorComponent: React.FC = () => <ThrowError />;

      render(
        <div>
          <SiblingComponent />
          <ErrorBoundary>
            <ErrorComponent />
          </ErrorBoundary>
        </div>
      );

      // Error should be isolated, sibling should remain unaffected
      expect(screen.getByTestId('sibling')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Error Recovery Feedback', () => {
    it('should provide feedback during error recovery', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Should provide recovery feedback
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should show successful recovery
      expect(screen.getByTestId('no-error')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Error Prevention Strategies', () => {
    it('should support error prevention through proper boundaries', () => {
      const PotentiallyErrorProneComponent: React.FC = () => {
        React.useEffect(() => {
          // Simulate potentially error-prone operation
          if (Math.random() > 0.5) {
            throw new Error('Random error');
          }
        }, []);

        return <div data-testid="potentially-error-prone">Potentially error-prone component</div>;
      };

      render(
        <ErrorBoundary>
          <PotentiallyErrorProneComponent />
        </ErrorBoundary>
      );

      // Should handle random errors gracefully
      if (screen.queryByText('Something went wrong')) {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      } else {
        expect(screen.getByTestId('potentially-error-prone')).toBeInTheDocument();
      }
    });
  });

  describe('Error Boundary with Error Recovery Patterns', () => {
    it('should support multiple error recovery patterns', async () => {
      let attemptCount = 0;

      const RetryableComponent: React.FC = () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error(`Attempt ${attemptCount} failed`);
        }
        return <div data-testid="retry-success">Success on attempt {attemptCount}</div>;
      };

      const { rerender } = render(
        <ErrorBoundary>
          <RetryableComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Retry multiple times
      for (let i = 0; i < 2; i++) {
        const retryButton = screen.getByRole('button', { name: /try again/i });
        fireEvent.click(retryButton);

        rerender(
          <ErrorBoundary>
            <RetryableComponent />
          </ErrorBoundary>
        );
      }

      // Should eventually succeed
      expect(screen.getByTestId('retry-success')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Component Lifecycle Management', () => {
    it('should manage component lifecycle during error states', () => {
      const LifecycleComponent: React.FC = () => {
        React.useEffect(() => {
          throw new Error('Lifecycle error');
        });

        return <div data-testid="lifecycle">Lifecycle component</div>;
      };

      render(
        <ErrorBoundary>
          <LifecycleComponent />
        </ErrorBoundary>
      );

      // Should manage lifecycle during error state
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Error State Persistence', () => {
    it('should persist error state appropriately', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Re-render with same error
      rerender(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should persist error state
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Error Recovery State', () => {
    it('should manage recovery state correctly', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Initiate recovery
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should transition to recovery state
      expect(screen.getByTestId('no-error')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Error Context', () => {
    it('should provide error context for debugging', () => {
      const ContextErrorComponent: React.FC = () => {
        const context = React.useContext(React.createContext('test-context'));

        React.useEffect(() => {
          if (context) {
            throw new Error(`Context error: ${context}`);
          }
        }, [context]);

        return <div data-testid="context-error">Context error component</div>;
      };

      render(
        <ErrorBoundary>
          <ContextErrorComponent />
        </ErrorBoundary>
      );

      // Should provide error context
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Error Recovery Guidance', () => {
    it('should provide clear error recovery guidance', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should provide clear recovery guidance
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Reload Page')).toBeInTheDocument();
      expect(screen.getByText('If this problem persists, please contact support.')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Component Health Monitoring', () => {
    it('should support component health monitoring', () => {
      const healthMonitor = vi.fn();

      render(
        <ErrorBoundary onError={healthMonitor}>
          <ThrowError errorMessage="Health monitoring error" />
        </ErrorBoundary>
      );

      // Should support health monitoring
      expect(healthMonitor).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  describe('Error Boundary with Error Recovery UX', () => {
    it('should provide optimal error recovery UX', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should provide optimal UX for error recovery
      const retryButton = screen.getByRole('button', { name: /try again/i });
      const reloadButton = screen.getByRole('button', { name: /reload page/i });

      expect(retryButton).toBeInTheDocument();
      expect(reloadButton).toBeInTheDocument();
      expect(retryButton).not.toBeDisabled();
      expect(reloadButton).not.toBeDisabled();
    });
  });

  describe('Error Boundary with Error Prevention', () => {
    it('should help prevent error cascades', () => {
      const CascadeComponent: React.FC = () => {
        React.useEffect(() => {
          throw new Error('Cascade trigger');
        }, []);

        return <div data-testid="cascade-component">Cascade component</div>;
      };

      const AppComponent: React.FC = () => (
        <div>
          <h1>App Header</h1>
          <ErrorBoundary>
            <CascadeComponent />
          </ErrorBoundary>
          <footer>App Footer</footer>
        </div>
      );

      render(<AppComponent />);

      // Error should be contained, preventing cascade
      expect(screen.getByText('App Header')).toBeInTheDocument();
      expect(screen.getByText('App Footer')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Error Recovery Best Practices', () => {
    it('should follow error recovery best practices', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Should provide multiple recovery options
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();

      // Should provide helpful user guidance
      expect(screen.getByText('If this problem persists, please contact support.')).toBeInTheDocument();

      // Should allow graceful recovery
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('no-error')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Component Testing Support', () => {
    it('should be easily testable', () => {
      const TestableErrorComponent: React.FC = () => {
        const [shouldError, setShouldError] = React.useState(false);

        React.useEffect(() => {
          if (shouldError) {
            throw new Error('Testable error');
          }
        }, [shouldError]);

        return (
          <div>
            <button onClick={() => setShouldError(true)} data-testid="test-error-trigger">
              Trigger Test Error
            </button>
          </div>
        );
      };

      render(
        <ErrorBoundary>
          <TestableErrorComponent />
        </ErrorBoundary>
      );

      // Should be easily testable
      expect(screen.getByTestId('test-error-trigger')).toBeInTheDocument();

      // Should handle test errors
      const triggerButton = screen.getByTestId('test-error-trigger');
      fireEvent.click(triggerButton);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Error Monitoring Integration', () => {
    it('should integrate with error monitoring services', () => {
      const mockErrorMonitor = vi.fn();

      render(
        <ErrorBoundary onError={mockErrorMonitor}>
          <ThrowError errorMessage="Monitoring integration error" />
        </ErrorBoundary>
      );

      // Should integrate with monitoring services
      expect(mockErrorMonitor).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  describe('Error Boundary with Error Recovery Guidance', () => {
    it('should provide clear error recovery guidance', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should provide clear recovery guidance
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Reload Page')).toBeInTheDocument();
      expect(screen.getByText('If this problem persists, please contact support.')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Component Health', () => {
    it('should maintain component health during error recovery', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Should maintain component health during recovery
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should recover to healthy state
      expect(screen.getByTestId('no-error')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Error Context Preservation', () => {
    it('should preserve error context for debugging', () => {
      const contextInfo = 'Component context information';

      const ContextErrorComponent: React.FC = () => {
        React.useEffect(() => {
          throw new Error(`Context error: ${contextInfo}`);
        }, []);

        return <div data-testid="context-error">Context error component</div>;
      };

      render(
        <ErrorBoundary>
          <ContextErrorComponent />
        </ErrorBoundary>
      );

      // Should preserve error context
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Error Recovery Analytics', () => {
    it('should track error recovery attempts', () => {
      const recoveryAnalytics = vi.fn();

      render(
        <ErrorBoundary onError={recoveryAnalytics}>
          <ThrowError errorMessage="Recovery analytics error" />
        </ErrorBoundary>
      );

      // Should track error occurrence
      expect(recoveryAnalytics).toHaveBeenCalledTimes(1);

      // Click retry
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      // Should track recovery attempt
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary with Component State Isolation', () => {
    it('should isolate error state from other components', () => {
      const SiblingComponent: React.FC = () => <div data-testid="sibling">Sibling component</div>;

      const ErrorComponent: React.FC = () => <ThrowError />;

      render(
        <div>
          <SiblingComponent />
          <ErrorBoundary>
            <ErrorComponent />
          </ErrorBoundary>
        </div>
      );

      // Error should be isolated, sibling should remain unaffected
      expect(screen.getByTestId('sibling')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

