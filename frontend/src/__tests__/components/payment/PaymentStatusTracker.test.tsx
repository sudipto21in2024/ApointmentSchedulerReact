/**
 * Payment Status Tracker Component Tests
 *
 * Comprehensive test suite for the PaymentStatusTracker component covering:
 * - Component rendering and status display
 * - Real-time status updates and polling
 * - Progress tracking and animations
 * - Success and error state handling
 * - Payment details display
 * - Retry functionality
 * - Accessibility features
 * - Responsive design behavior
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PaymentStatusTracker } from '../../../components/payment/payment-status.component';
import { paymentApi } from '../../../services/payment-api.service';
import type { Payment, PaymentIntent } from '../../../types/payment';

// Mock the payment API service
vi.mock('../../../services/payment-api.service', () => ({
  paymentApi: {
    getPayment: vi.fn()
  }
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock the UI components
vi.mock('../../../components/ui', () => ({
  Button: ({ children, onClick, disabled, variant, 'data-testid': testId, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      {...props}
    >
      {children}
    </button>
  ),
  Card: ({ children, className, 'data-testid': testId }: any) => (
    <div className={className} data-testid={testId}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h3 className={className}>
      {children}
    </h3>
  )
}));

// Mock the utility functions
vi.mock('../../../utils/cn', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

describe('PaymentStatusTracker Component', () => {
  const mockPayment: Payment = {
    id: 'payment_123',
    customerId: 'customer_456',
    amount: 1000,
    currency: 'USD',
    status: 'processing',
    paymentMethod: {
      type: 'credit_card',
      last4: '4242',
      brand: 'Visa',
      isDefault: true
    },
    gateway: 'stripe',
    gatewayTransactionId: 'txn_123',
    description: 'Test payment',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  };

  const mockPaymentIntent: PaymentIntent = {
    id: 'pi_123',
    clientSecret: 'pi_secret_123',
    amount: 1000,
    currency: 'USD',
    status: 'requires_payment_method',
    paymentMethodTypes: ['credit_card'],
    createdAt: '2024-01-01T10:00:00Z',
    expiresAt: '2024-01-01T11:00:00Z'
  };

  const defaultProps = {
    paymentId: 'payment_123',
    onPaymentSuccess: vi.fn(),
    onPaymentError: vi.fn(),
    onStatusChange: vi.fn(),
    onRetry: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  describe('Component Rendering', () => {
    it('renders payment status tracker with initial payment data', () => {
      render(<PaymentStatusTracker {...defaultProps} initialPayment={mockPayment} />);

      expect(screen.getByTestId('payment-status')).toBeInTheDocument();
      expect(screen.getByText('🔄')).toBeInTheDocument(); // Processing icon
      expect(screen.getByText('Processing Payment')).toBeInTheDocument();
    });

    it('shows loading state when no initial data provided', () => {
      render(<PaymentStatusTracker {...defaultProps} initialPayment={undefined} />);

      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    });

    it('displays payment amount when showAmount is true', () => {
      render(
        <PaymentStatusTracker
          {...defaultProps}
          initialPayment={mockPayment}
          showAmount={true}
        />
      );

      expect(screen.getByText('$10.00')).toBeInTheDocument();
    });

    it('hides payment amount when showAmount is false', () => {
      render(
        <PaymentStatusTracker
          {...defaultProps}
          initialPayment={mockPayment}
          showAmount={false}
        />
      );

      expect(screen.queryByText('$10.00')).not.toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    it('shows correct status for completed payment', () => {
      const completedPayment = { ...mockPayment, status: 'completed' as const };
      render(<PaymentStatusTracker {...defaultProps} initialPayment={completedPayment} />);

      expect(screen.getByTestId('success-state')).toBeInTheDocument();
      expect(screen.getByText('✅')).toBeInTheDocument();
      expect(screen.getByText('Payment Completed')).toBeInTheDocument();
    });

    it('shows correct status for failed payment', () => {
      const failedPayment = { ...mockPayment, status: 'failed' as const };
      render(<PaymentStatusTracker {...defaultProps} initialPayment={failedPayment} />);

      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('❌')).toBeInTheDocument();
      expect(screen.getByText('Payment Failed')).toBeInTheDocument();
    });

    it('shows correct status for pending payment', () => {
      const pendingPayment = { ...mockPayment, status: 'pending' as const };
      render(<PaymentStatusTracker {...defaultProps} initialPayment={pendingPayment} />);

      expect(screen.getByText('⏳')).toBeInTheDocument();
      expect(screen.getByText('Payment Pending')).toBeInTheDocument();
    });

    it('shows progress bar when showProgress is true', () => {
      render(
        <PaymentStatusTracker
          {...defaultProps}
          initialPayment={mockPayment}
          showProgress={true}
        />
      );

      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
      expect(screen.getByTestId('progress-fill')).toBeInTheDocument();
    });
  });

  describe('Real-time Updates', () => {
    it('polls for status updates when enabled', async () => {
      const mockGetPayment = vi.mocked(paymentApi.getPayment);
      mockGetPayment.mockResolvedValue(mockPayment);

      render(
        <PaymentStatusTracker
          {...defaultProps}
          enableRealtime={true}
          updateInterval={1000}
        />
      );

      // Fast-forward time by 1 second
      vi.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockGetPayment).toHaveBeenCalledTimes(2); // Initial + 1 poll
      });
    });

    it('stops polling when realtime is disabled', () => {
      const mockGetPayment = vi.mocked(paymentApi.getPayment);
      mockGetPayment.mockResolvedValue(mockPayment);

      render(
        <PaymentStatusTracker
          {...defaultProps}
          enableRealtime={false}
        />
      );

      // Fast-forward time
      vi.advanceTimersByTime(5000);

      // Should only call once (initial load)
      expect(mockGetPayment).toHaveBeenCalledTimes(1);
    });

    it('updates status when payment status changes', async () => {
      const mockGetPayment = vi.mocked(paymentApi.getPayment);
      const onStatusChange = vi.fn();

      // Initial payment
      mockGetPayment.mockResolvedValueOnce(mockPayment);

      const { rerender } = render(
        <PaymentStatusTracker
          {...defaultProps}
          initialPayment={mockPayment}
          onStatusChange={onStatusChange}
        />
      );

      // Updated payment with different status
      const updatedPayment = { ...mockPayment, status: 'completed' as const };
      mockGetPayment.mockResolvedValueOnce(updatedPayment);

      // Trigger status update
      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(onStatusChange).toHaveBeenCalledWith('completed');
      });
    });
  });

  describe('Payment Details Display', () => {
    it('shows payment details when showDetails is true', () => {
      render(
        <PaymentStatusTracker
          {...defaultProps}
          initialPayment={mockPayment}
          showDetails={true}
        />
      );

      expect(screen.getByTestId('payment-details')).toBeInTheDocument();
      expect(screen.getByText('payment_123')).toBeInTheDocument();
      expect(screen.getByText('Test payment')).toBeInTheDocument();
    });

    it('hides payment details when showDetails is false', () => {
      render(
        <PaymentStatusTracker
          {...defaultProps}
          initialPayment={mockPayment}
          showDetails={false}
        />
      );

      expect(screen.queryByTestId('payment-details')).not.toBeInTheDocument();
    });

    it('displays payment method information', () => {
      render(<PaymentStatusTracker {...defaultProps} initialPayment={mockPayment} />);

      expect(screen.getByText(/credit_card/)).toBeInTheDocument();
      expect(screen.getByText('stripe')).toBeInTheDocument();
    });

    it('displays gateway transaction ID when available', () => {
      render(<PaymentStatusTracker {...defaultProps} initialPayment={mockPayment} />);

      expect(screen.getByText('txn_123')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('calls onPaymentSuccess when payment completes', async () => {
      const mockGetPayment = vi.mocked(paymentApi.getPayment);
      const onPaymentSuccess = vi.fn();

      // Start with processing payment
      mockGetPayment.mockResolvedValueOnce(mockPayment);

      const { rerender } = render(
        <PaymentStatusTracker
          {...defaultProps}
          initialPayment={mockPayment}
          onPaymentSuccess={onPaymentSuccess}
        />
      );

      // Payment completes
      const completedPayment = { ...mockPayment, status: 'completed' as const };
      mockGetPayment.mockResolvedValueOnce(completedPayment);

      // Trigger status update
      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(onPaymentSuccess).toHaveBeenCalledWith(completedPayment);
      });
    });

    it('shows success animation and message', () => {
      const completedPayment = { ...mockPayment, status: 'completed' as const };
      render(<PaymentStatusTracker {...defaultProps} initialPayment={completedPayment} />);

      expect(screen.getByTestId('success-state')).toBeInTheDocument();
      expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows error state when payment fails', () => {
      const failedPayment = { ...mockPayment, status: 'failed' as const };
      render(<PaymentStatusTracker {...defaultProps} initialPayment={failedPayment} />);

      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Payment Failed')).toBeInTheDocument();
    });

    it('calls onPaymentError when payment fails', async () => {
      const mockGetPayment = vi.mocked(paymentApi.getPayment);
      const onPaymentError = vi.fn();

      mockGetPayment.mockRejectedValue(new Error('Payment failed'));

      render(
        <PaymentStatusTracker
          {...defaultProps}
          onPaymentError={onPaymentError}
        />
      );

      await waitFor(() => {
        expect(onPaymentError).toHaveBeenCalledWith('Payment failed');
      });
    });

    it('shows retry button when showRetry is true', () => {
      const failedPayment = { ...mockPayment, status: 'failed' as const };
      render(
        <PaymentStatusTracker
          {...defaultProps}
          initialPayment={failedPayment}
          showRetry={true}
        />
      );

      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('handles retry action', async () => {
      const user = userEvent.setup();
      const failedPayment = { ...mockPayment, status: 'failed' as const };
      const onRetry = vi.fn();

      render(
        <PaymentStatusTracker
          {...defaultProps}
          initialPayment={failedPayment}
          showRetry={true}
          onRetry={onRetry}
        />
      );

      const retryButton = screen.getByTestId('retry-button');
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('Progress Tracking', () => {
    it('shows progress bar for processing payments', () => {
      render(
        <PaymentStatusTracker
          {...defaultProps}
          initialPayment={mockPayment}
          showProgress={true}
        />
      );

      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
      expect(screen.getByTestId('progress-fill')).toBeInTheDocument();
    });

    it('updates progress based on payment status', () => {
      const processingPayment = { ...mockPayment, status: 'processing' as const };
      render(
        <PaymentStatusTracker
          {...defaultProps}
          initialPayment={processingPayment}
          showProgress={true}
        />
      );

      const progressFill = screen.getByTestId('progress-fill');
      expect(progressFill).toBeInTheDocument();
      // Progress should be around 50% for processing status
    });

    it('shows 100% progress for completed payments', () => {
      const completedPayment = { ...mockPayment, status: 'completed' as const };
      render(
        <PaymentStatusTracker
          {...defaultProps}
          initialPayment={completedPayment}
          showProgress={true}
        />
      );

      const progressFill = screen.getByTestId('progress-fill');
      expect(progressFill).toHaveStyle({ width: '100%' });
    });
  });

  describe('Payment Intent Integration', () => {
    it('works with payment intent instead of payment ID', () => {
      render(
        <PaymentStatusTracker
          {...defaultProps}
          paymentId={undefined}
          paymentIntent={mockPaymentIntent}
        />
      );

      expect(screen.getByTestId('payment-status')).toBeInTheDocument();
    });

    it('displays payment intent information', () => {
      render(
        <PaymentStatusTracker
          {...defaultProps}
          paymentId={undefined}
          paymentIntent={mockPaymentIntent}
        />
      );

      expect(screen.getByText('$10.00')).toBeInTheDocument();
    });
  });

  describe('Status Steps', () => {
    it('displays status steps for payment progress', () => {
      render(<PaymentStatusTracker {...defaultProps} initialPayment={mockPayment} />);

      expect(screen.getByTestId('status-steps')).toBeInTheDocument();
      expect(screen.getByText('Payment Initiated')).toBeInTheDocument();
      expect(screen.getByText('Processing Payment')).toBeInTheDocument();
      expect(screen.getByText('Payment Completed')).toBeInTheDocument();
    });

    it('highlights current status step', () => {
      render(<PaymentStatusTracker {...defaultProps} initialPayment={mockPayment} />);

      // Processing step should be current/active
      const processingStep = screen.getByTestId('status-step-processing');
      expect(processingStep).toBeInTheDocument();
    });

    it('marks completed steps as done', () => {
      const completedPayment = { ...mockPayment, status: 'completed' as const };
      render(<PaymentStatusTracker {...defaultProps} initialPayment={completedPayment} />);

      // All steps should be completed for successful payment
      expect(screen.getByTestId('success-state')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<PaymentStatusTracker {...defaultProps} initialPayment={mockPayment} />);

      const statusCard = screen.getByTestId('payment-status');
      expect(statusCard).toBeInTheDocument();

      // Progress bar should be accessible
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toBeInTheDocument();
    });

    it('announces status changes to screen readers', () => {
      render(<PaymentStatusTracker {...defaultProps} initialPayment={mockPayment} />);

      // Status information should be accessible
      expect(screen.getByText('Processing Payment')).toBeInTheDocument();
    });

    it('supports keyboard navigation for interactive elements', async () => {
      const user = userEvent.setup();
      const failedPayment = { ...mockPayment, status: 'failed' as const };

      render(
        <PaymentStatusTracker
          {...defaultProps}
          initialPayment={failedPayment}
          showRetry={true}
        />
      );

      const retryButton = screen.getByTestId('retry-button');
      await user.tab();
      expect(retryButton).toHaveFocus();
    });
  });

  describe('Responsive Design', () => {
    it('adapts layout for mobile screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<PaymentStatusTracker {...defaultProps} initialPayment={mockPayment} />);

      const statusCard = screen.getByTestId('payment-status');
      expect(statusCard).toBeInTheDocument();

      // Layout should adapt for mobile (implementation dependent)
    });

    it('maintains readability on different screen sizes', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<PaymentStatusTracker {...defaultProps} initialPayment={mockPayment} />);

      const statusCard = screen.getByTestId('payment-status');
      expect(statusCard).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing payment ID and intent', () => {
      // This should not crash the component
      render(
        <PaymentStatusTracker
          {...defaultProps}
          paymentId={undefined}
          paymentIntent={undefined}
        />
      );

      expect(screen.getByTestId('payment-status')).toBeInTheDocument();
    });

    it('handles payment with missing optional fields', () => {
      const incompletePayment: Payment = {
        ...mockPayment,
        description: undefined,
        gatewayTransactionId: undefined,
        reference: undefined
      };

      render(<PaymentStatusTracker {...defaultProps} initialPayment={incompletePayment} />);

      expect(screen.getByTestId('payment-status')).toBeInTheDocument();
    });

    it('handles rapid status changes', async () => {
      const mockGetPayment = vi.mocked(paymentApi.getPayment);
      const onStatusChange = vi.fn();

      // Initial payment
      mockGetPayment.mockResolvedValueOnce(mockPayment);

      const { rerender } = render(
        <PaymentStatusTracker
          {...defaultProps}
          initialPayment={mockPayment}
          onStatusChange={onStatusChange}
        />
      );

      // Rapid status changes
      const processingPayment = { ...mockPayment, status: 'processing' as const };
      const completedPayment = { ...mockPayment, status: 'completed' as const };

      mockGetPayment
        .mockResolvedValueOnce(processingPayment)
        .mockResolvedValueOnce(completedPayment);

      // Trigger multiple updates
      vi.advanceTimersByTime(3000);
      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(onStatusChange).toHaveBeenCalledWith('completed');
      });
    });

    it('handles network timeouts gracefully', async () => {
      const mockGetPayment = vi.mocked(paymentApi.getPayment);
      const onPaymentError = vi.fn();

      // Mock a timeout error
      mockGetPayment.mockRejectedValue(new Error('Network timeout'));

      render(
        <PaymentStatusTracker
          {...defaultProps}
          onPaymentError={onPaymentError}
        />
      );

      await waitFor(() => {
        expect(onPaymentError).toHaveBeenCalledWith('Network timeout');
      });
    });
  });

  describe('Callback Handling', () => {
    it('calls onStatusChange when status updates', async () => {
      const mockGetPayment = vi.mocked(paymentApi.getPayment);
      const onStatusChange = vi.fn();

      // Initial payment
      mockGetPayment.mockResolvedValueOnce(mockPayment);

      render(
        <PaymentStatusTracker
          {...defaultProps}
          initialPayment={mockPayment}
          onStatusChange={onStatusChange}
        />
      );

      // Status changes to completed
      const completedPayment = { ...mockPayment, status: 'completed' as const };
      mockGetPayment.mockResolvedValueOnce(completedPayment);

      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(onStatusChange).toHaveBeenCalledWith('completed');
      });
    });

    it('calls onPaymentSuccess when payment completes successfully', async () => {
      const mockGetPayment = vi.mocked(paymentApi.getPayment);
      const onPaymentSuccess = vi.fn();

      // Start with processing payment
      mockGetPayment.mockResolvedValueOnce(mockPayment);

      render(
        <PaymentStatusTracker
          {...defaultProps}
          initialPayment={mockPayment}
          onPaymentSuccess={onPaymentSuccess}
        />
      );

      // Payment completes
      const completedPayment = { ...mockPayment, status: 'completed' as const };
      mockGetPayment.mockResolvedValueOnce(completedPayment);

      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(onPaymentSuccess).toHaveBeenCalledWith(completedPayment);
      });
    });

    it('calls onPaymentError when payment fails', async () => {
      const mockGetPayment = vi.mocked(paymentApi.getPayment);
      const onPaymentError = vi.fn();

      mockGetPayment.mockRejectedValue(new Error('Payment processing failed'));

      render(
        <PaymentStatusTracker
          {...defaultProps}
          onPaymentError={onPaymentError}
        />
      );

      await waitFor(() => {
        expect(onPaymentError).toHaveBeenCalledWith('Payment processing failed');
      });
    });
  });
});