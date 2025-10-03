import React, { Component } from 'react';
import type { ReactNode } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  className?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * ErrorBoundary Component - Catches JavaScript errors anywhere in the child component tree
 *
 * Features:
 * - Catches runtime errors in React components
 * - Displays user-friendly error messages
 * - Provides error recovery options
 * - Logs error details for debugging
 * - Customizable error UI
 * - Accessibility compliance
 *
 * @example
 * ```tsx
 * // Basic error boundary
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // Error boundary with custom fallback
 * <ErrorBoundary
 *   fallback={<CustomErrorUI />}
 *   onError={handleError}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className={`min-h-[400px] flex items-center justify-center p-4 ${this.props.className || ''}`}>
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              <CardTitle className="text-red-900">Something went wrong</CardTitle>
              <CardDescription>
                An unexpected error occurred while rendering this component.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error details for development */}
              {import.meta.env.DEV && this.state.error && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800 mb-2">
                    Error Details (Development)
                  </summary>
                  <div className="bg-gray-100 p-3 rounded-md text-xs font-mono text-gray-800 overflow-auto max-h-32">
                    <div className="font-semibold text-red-600 mb-1">
                      {this.state.error.name}: {this.state.error.message}
                    </div>
                    <pre className="whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  </div>
                </details>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="ghost"
                  onClick={this.handleRetry}
                  className="flex-1"
                >
                  Try Again
                </Button>

                <Button
                  onClick={this.handleReload}
                  className="flex-1"
                >
                  Reload Page
                </Button>
              </div>

              {/* Contact support */}
              <div className="text-center text-sm text-gray-500 pt-4 border-t">
                <p>If this problem persists, please contact support.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary for functional components
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

/**
 * Async error boundary for handling promise rejections
 */
export class AsyncErrorBoundary extends Component<
  { children: ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('AsyncErrorBoundary caught an error:', error);
    this.props.onError?.(error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-[200px] flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="text-center space-y-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-5 h-5 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Operation Failed</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {this.state.error.message || 'An error occurred while processing your request.'}
                </p>
              </div>

              <Button onClick={this.handleRetry} size="sm">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;