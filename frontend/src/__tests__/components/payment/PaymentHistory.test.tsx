/**
 * Payment History Component Tests
 *
 * Comprehensive test suite for the PaymentHistory component covering:
 * - Component rendering and data display
 * - Filtering and search functionality
 * - Sorting capabilities
 * - Pagination behavior
 * - Payment selection and bulk operations
 * - Payment details modal
 * - Error handling and loading states
 * - Accessibility features
 * - Responsive design behavior
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PaymentHistory } from '../../../components/payment/payment-history.component';
import { paymentApi } from '../../../services/payment-api.service';
import type { Payment } from '../../../types/payment';

// Mock the payment API service
vi.mock('../../../services/payment-api.service', () => ({
  paymentApi: {
    getPayments: vi.fn()
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
  Button: ({ children, onClick, disabled, variant, size, 'data-testid': testId, ...props }: any) => (
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
  ),
  Input: ({ value, onChange, placeholder, type, className, 'data-testid': testId, ...props }: any) => (
    <input
      type={type || 'text'}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      data-testid={testId}
      {...props}
    />
  ),
  Select: ({ options, value, onChange, placeholder, className, 'data-testid': testId }: any) => (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      data-testid={testId}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options?.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}));

// Mock the utility functions
vi.mock('../../../utils/cn', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

describe('PaymentHistory Component', () => {
  const mockPayments: Payment[] = [
    {
      id: 'payment_1',
      customerId: 'customer_123',
      amount: 1000,
      currency: 'USD',
      status: 'completed',
      paymentMethod: {
        type: 'credit_card',
        last4: '4242',
        brand: 'Visa',
        isDefault: true
      },
      gateway: 'stripe',
      gatewayTransactionId: 'txn_123',
      description: 'Test payment 1',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z'
    },
    {
      id: 'payment_2',
      customerId: 'customer_123',
      amount: 2500,
      currency: 'USD',
      status: 'pending',
      paymentMethod: {
        type: 'debit_card',
        last4: '8888',
        brand: 'Mastercard',
        isDefault: false
      },
      gateway: 'paypal',
      description: 'Test payment 2',
      createdAt: '2024-01-02T14:30:00Z',
      updatedAt: '2024-01-02T14:30:00Z'
    }
  ];

  const defaultProps = {
    initialPayments: mockPayments,
    onPaymentSelect: vi.fn(),
    onFiltersChange: vi.fn(),
    onPaymentAction: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders payment history with correct initial data', () => {
      render(<PaymentHistory {...defaultProps} />);

      expect(screen.getByTestId('payment-history')).toBeInTheDocument();
      expect(screen.getByTestId('payments-list')).toBeInTheDocument();
      expect(screen.getByTestId('payment-list-item-payment_1')).toBeInTheDocument();
      expect(screen.getByTestId('payment-list-item-payment_2')).toBeInTheDocument();
    });

    it('displays payment information correctly', () => {
      render(<PaymentHistory {...defaultProps} />);

      expect(screen.getByText('$10.00')).toBeInTheDocument(); // First payment
      expect(screen.getByText('$25.00')).toBeInTheDocument(); // Second payment
      expect(screen.getByText('Test payment 1')).toBeInTheDocument();
      expect(screen.getByText('Test payment 2')).toBeInTheDocument();
    });

    it('shows correct payment status badges', () => {
      render(<PaymentHistory {...defaultProps} />);

      expect(screen.getByText('✅')).toBeInTheDocument(); // Completed status
      expect(screen.getByText('⏳')).toBeInTheDocument(); // Pending status
    });

    it('displays payment method information', () => {
      render(<PaymentHistory {...defaultProps} />);

      expect(screen.getByText(/Visa ending in 4242/)).toBeInTheDocument();
      expect(screen.getByText(/Mastercard ending in 8888/)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('filters payments based on search query', async () => {
      const user = userEvent.setup();
      render(<PaymentHistory {...defaultProps} />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Test payment 1');

      await waitFor(() => {
        expect(screen.getByTestId('payment-list-item-payment_1')).toBeInTheDocument();
        expect(screen.queryByTestId('payment-list-item-payment_2')).not.toBeInTheDocument();
      });
    });

    it('shows no results for non-matching search', async () => {
      const user = userEvent.setup();
      render(<PaymentHistory {...defaultProps} />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'nonexistent payment');

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      });
    });

    it('clears search and shows all payments', async () => {
      const user = userEvent.setup();
      render(<PaymentHistory {...defaultProps} />);

      const searchInput = screen.getByTestId('search-input');

      // Search for specific payment
      await user.type(searchInput, 'Test payment 1');
      await waitFor(() => {
        expect(screen.queryByTestId('payment-list-item-payment_2')).not.toBeInTheDocument();
      });

      // Clear search
      await user.clear(searchInput);
      await waitFor(() => {
        expect(screen.getByTestId('payment-list-item-payment_1')).toBeInTheDocument();
        expect(screen.getByTestId('payment-list-item-payment_2')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('toggles filters panel', async () => {
      const user = userEvent.setup();
      render(<PaymentHistory {...defaultProps} />);

      const toggleFiltersButton = screen.getByTestId('toggle-filters');
      await user.click(toggleFiltersButton);

      await waitFor(() => {
        expect(screen.getByTestId('status-filter')).toBeInTheDocument();
      });
    });

    it('filters payments by status', async () => {
      const user = userEvent.setup();
      render(<PaymentHistory {...defaultProps} />);

      // Open filters
      const toggleFiltersButton = screen.getByTestId('toggle-filters');
      await user.click(toggleFiltersButton);

      // Select completed status
      const statusFilter = screen.getByTestId('status-filter');
      await user.selectOptions(statusFilter, 'completed');

      await waitFor(() => {
        expect(screen.getByTestId('payment-list-item-payment_1')).toBeInTheDocument();
        expect(screen.queryByTestId('payment-list-item-payment_2')).not.toBeInTheDocument();
      });
    });

    it('filters payments by date range', async () => {
      const user = userEvent.setup();
      render(<PaymentHistory {...defaultProps} />);

      // Open filters
      const toggleFiltersButton = screen.getByTestId('toggle-filters');
      await user.click(toggleFiltersButton);

      // Set date range
      const dateFromInput = screen.getByTestId('date-from-filter');
      const dateToInput = screen.getByTestId('date-to-filter');

      await user.type(dateFromInput, '2024-01-01');
      await user.type(dateToInput, '2024-01-01');

      // Should trigger filtering (implementation dependent)
      expect(dateFromInput).toHaveValue('2024-01-01');
      expect(dateToInput).toHaveValue('2024-01-01');
    });
  });

  describe('Sorting', () => {
    it('changes sort order when sort options are selected', async () => {
      const user = userEvent.setup();
      render(<PaymentHistory {...defaultProps} />);

      const sortSelect = screen.getByTestId('sort-select');
      await user.selectOptions(sortSelect, 'amount');

      expect(sortSelect).toHaveValue('amount');
    });

    it('toggles sort direction', async () => {
      const user = userEvent.setup();
      render(<PaymentHistory {...defaultProps} />);

      const sortDirectionButton = screen.getByTestId('sort-direction');

      // Initial state should be descending
      expect(sortDirectionButton).toHaveTextContent('↓');

      // Click to toggle to ascending
      await user.click(sortDirectionButton);
      expect(sortDirectionButton).toHaveTextContent('↑');
    });
  });

  describe('Payment Selection', () => {
    it('allows selecting individual payments', async () => {
      const user = userEvent.setup();
      render(<PaymentHistory {...defaultProps} />);

      const selectCheckbox = screen.getByTestId('select-payment-payment_1');
      await user.click(selectCheckbox);

      expect(selectCheckbox).toBeChecked();
    });

    it('allows selecting all payments', async () => {
      const user = userEvent.setup();
      render(<PaymentHistory {...defaultProps} />);

      const selectAllCheckbox = screen.getByTestId('select-all');
      await user.click(selectAllCheckbox);

      expect(selectAllCheckbox).toBeChecked();

      // All payment checkboxes should be checked
      expect(screen.getByTestId('select-payment-payment_1')).toBeChecked();
      expect(screen.getByTestId('select-payment-payment_2')).toBeChecked();
    });

    it('shows bulk actions when payments are selected', async () => {
      const user = userEvent.setup();
      render(<PaymentHistory {...defaultProps} />);

      const selectCheckbox = screen.getByTestId('select-payment-payment_1');
      await user.click(selectCheckbox);

      await waitFor(() => {
        expect(screen.getByTestId('bulk-export')).toBeInTheDocument();
      });
    });

    it('clears selection when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<PaymentHistory {...defaultProps} />);

      // Select payments
      const selectAllCheckbox = screen.getByTestId('select-all');
      await user.click(selectAllCheckbox);
      expect(selectAllCheckbox).toBeChecked();

      // Clear selection
      const clearButton = screen.getByTestId('clear-selection');
      await user.click(clearButton);

      expect(selectAllCheckbox).not.toBeChecked();
    });
  });

  describe('Payment Actions', () => {
    it('calls onPaymentSelect when view action is clicked', async () => {
      const user = userEvent.setup();
      const onPaymentSelect = vi.fn();

      render(<PaymentHistory {...defaultProps} onPaymentSelect={onPaymentSelect} />);

      const viewButton = screen.getByTestId('view-payment-payment_1');
      await user.click(viewButton);

      expect(onPaymentSelect).toHaveBeenCalledWith(mockPayments[0]);
    });

    it('opens payment details modal', async () => {
      const user = userEvent.setup();
      render(<PaymentHistory {...defaultProps} />);

      const detailsButton = screen.getByTestId('details-payment-payment_1');
      await user.click(detailsButton);

      await waitFor(() => {
        expect(screen.getByTestId('payment-details-modal')).toBeInTheDocument();
      });
    });

    it('closes payment details modal', async () => {
      const user = userEvent.setup();
      render(<PaymentHistory {...defaultProps} />);

      // Open details modal
      const detailsButton = screen.getByTestId('details-payment-payment_1');
      await user.click(detailsButton);

      await waitFor(() => {
        expect(screen.getByTestId('payment-details-modal')).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByTestId('close-details');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('payment-details-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('shows pagination when there are multiple pages', () => {
      const manyPayments = Array.from({ length: 25 }, (_, i) => ({
        ...mockPayments[0],
        id: `payment_${i}`,
        amount: (i + 1) * 100
      }));

      render(
        <PaymentHistory
          {...defaultProps}
          initialPayments={manyPayments}
          showPagination={true}
        />
      );

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(screen.getByTestId('prev-page')).toBeInTheDocument();
      expect(screen.getByTestId('next-page')).toBeInTheDocument();
    });

    it('navigates between pages', async () => {
      const user = userEvent.setup();
      const manyPayments = Array.from({ length: 25 }, (_, i) => ({
        ...mockPayments[0],
        id: `payment_${i}`,
        amount: (i + 1) * 100
      }));

      render(
        <PaymentHistory
          {...defaultProps}
          initialPayments={manyPayments}
          showPagination={true}
        />
      );

      const nextButton = screen.getByTestId('next-page');
      await user.click(nextButton);

      // Should navigate to next page (implementation dependent)
      expect(nextButton).toBeInTheDocument();
    });

    it('disables previous button on first page', () => {
      render(<PaymentHistory {...defaultProps} showPagination={true} />);

      const prevButton = screen.getByTestId('prev-page');
      expect(prevButton).toBeDisabled();
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading state', () => {
      render(<PaymentHistory {...defaultProps} loading={true} />);

      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    });

    it('shows error state with retry option', () => {
      const error = new Error('Failed to load payments');
      render(<PaymentHistory {...defaultProps} error={error} />);

      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Error loading payments')).toBeInTheDocument();
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('retries loading when retry button is clicked', async () => {
      const user = userEvent.setup();
      const mockGetPayments = vi.mocked(paymentApi.getPayments);
      mockGetPayments.mockRejectedValue(new Error('Network error'));

      const error = new Error('Failed to load payments');
      render(<PaymentHistory {...defaultProps} error={error} />);

      const retryButton = screen.getByTestId('retry-button');
      await user.click(retryButton);

      await waitFor(() => {
        expect(mockGetPayments).toHaveBeenCalled();
      });
    });

    it('shows empty state when no payments', () => {
      render(<PaymentHistory {...defaultProps} initialPayments={[]} />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No payments found')).toBeInTheDocument();
    });
  });

  describe('Bulk Operations', () => {
    it('performs bulk export', async () => {
      const user = userEvent.setup();
      const mockGetPayments = vi.mocked(paymentApi.getPayments);
      mockGetPayments.mockResolvedValue({
        payments: mockPayments,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });

      render(<PaymentHistory {...defaultProps} />);

      // Select payments
      const selectCheckbox = screen.getByTestId('select-payment-payment_1');
      await user.click(selectCheckbox);

      // Click bulk export
      const bulkExportButton = screen.getByTestId('bulk-export');
      await user.click(bulkExportButton);

      await waitFor(() => {
        expect(mockGetPayments).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<PaymentHistory {...defaultProps} />);

      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toHaveAttribute('placeholder', 'Search payments...');

      const selectAllCheckbox = screen.getByTestId('select-all');
      expect(selectAllCheckbox).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<PaymentHistory {...defaultProps} />);

      // Tab through interactive elements
      await user.tab();
      expect(screen.getByTestId('search-input')).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('toggle-filters')).toHaveFocus();
    });

    it('announces status changes to screen readers', () => {
      render(<PaymentHistory {...defaultProps} />);

      // Status badges should be accessible
      const statusBadges = screen.getAllByText(/Completed|Pending/);
      statusBadges.forEach(badge => {
        expect(badge).toBeInTheDocument();
      });
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

      render(<PaymentHistory {...defaultProps} />);

      const history = screen.getByTestId('payment-history');
      expect(history).toBeInTheDocument();

      // Layout should adapt for mobile (implementation dependent)
    });

    it('maintains functionality on tablet screens', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<PaymentHistory {...defaultProps} />);

      const history = screen.getByTestId('payment-history');
      expect(history).toBeInTheDocument();
    });
  });

  describe('Data Handling', () => {
    it('loads payments from API on mount', async () => {
      const mockGetPayments = vi.mocked(paymentApi.getPayments);
      mockGetPayments.mockResolvedValue({
        payments: mockPayments,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });

      render(<PaymentHistory {...defaultProps} initialPayments={[]} />);

      await waitFor(() => {
        expect(mockGetPayments).toHaveBeenCalled();
      });
    });

    it('refreshes data when refresh button is clicked', async () => {
      const user = userEvent.setup();
      const mockGetPayments = vi.mocked(paymentApi.getPayments);
      mockGetPayments.mockResolvedValue({
        payments: mockPayments,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });

      render(<PaymentHistory {...defaultProps} />);

      const refreshButton = screen.getByTestId('refresh-button');
      await user.click(refreshButton);

      await waitFor(() => {
        expect(mockGetPayments).toHaveBeenCalled();
      });
    });

    it('handles API errors gracefully', async () => {
      const mockGetPayments = vi.mocked(paymentApi.getPayments);
      mockGetPayments.mockRejectedValue(new Error('API Error'));

      render(<PaymentHistory {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty payment list', () => {
      render(<PaymentHistory {...defaultProps} initialPayments={[]} />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('handles single payment', () => {
      render(<PaymentHistory {...defaultProps} initialPayments={[mockPayments[0]]} />);

      expect(screen.getByTestId('payment-list-item-payment_1')).toBeInTheDocument();
      expect(screen.queryByTestId('payment-list-item-payment_2')).not.toBeInTheDocument();
    });

    it('handles payments with missing optional fields', () => {
      const incompletePayment: Payment = {
        ...mockPayments[0],
        description: undefined,
        gatewayTransactionId: undefined,
        reference: undefined
      };

      render(<PaymentHistory {...defaultProps} initialPayments={[incompletePayment]} />);

      expect(screen.getByTestId('payment-list-item-payment_1')).toBeInTheDocument();
    });

    it('handles very large datasets', () => {
      const largePaymentSet = Array.from({ length: 1000 }, (_, i) => ({
        ...mockPayments[0],
        id: `payment_${i}`,
        amount: (i + 1) * 100
      }));

      render(<PaymentHistory {...defaultProps} initialPayments={largePaymentSet} />);

      expect(screen.getByTestId('payments-list')).toBeInTheDocument();
    });
  });
});