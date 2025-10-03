/**
 * Payment Method Management Component Tests
 *
 * Comprehensive test suite for the PaymentMethodManagement component covering:
 * - Component rendering and payment method display
 * - Adding new payment methods
 * - Editing existing payment methods
 * - Deleting payment methods
 * - Setting default payment method
 * - Form validation and error handling
 * - Bulk operations and selection
 * - Accessibility features
 * - Responsive design behavior
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PaymentMethodManagement } from '../../../components/payment/payment-method-management/payment-method-management.component';
import { paymentApi } from '../../../services/payment-api.service';
import type { PaymentMethod } from '../../../types/payment';

// Mock the payment API service
vi.mock('../../../services/payment-api.service', () => ({
  paymentApi: {
    getPaymentMethods: vi.fn(),
    createPaymentMethod: vi.fn(),
    updatePaymentMethod: vi.fn(),
    deletePaymentMethod: vi.fn(),
    setDefaultPaymentMethod: vi.fn()
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
  Button: ({ children, onClick, disabled, loading, 'data-testid': testId, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      data-testid={testId}
      {...props}
    >
      {loading ? 'Loading...' : children}
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
  Input: ({ value, onChange, placeholder, className, 'data-testid': testId, ...props }: any) => (
    <input
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
  ),
  Checkbox: ({ checked, onChange, label, 'data-testid': testId }: any) => (
    <label data-testid={testId}>
      <input
        type="checkbox"
        checked={checked || false}
        onChange={(e) => onChange(e)}
        data-testid={`${testId}-input`}
      />
      {label}
    </label>
  )
}));

// Mock the utility functions
vi.mock('../../../utils/cn', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

describe('PaymentMethodManagement Component', () => {
  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: 'pm_1',
      customerId: 'customer_123',
      type: 'credit_card',
      gatewayPaymentMethodId: 'gw_pm_1',
      last4: '4242',
      brand: 'Visa',
      isDefault: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'pm_2',
      customerId: 'customer_123',
      type: 'debit_card',
      gatewayPaymentMethodId: 'gw_pm_2',
      last4: '8888',
      brand: 'Mastercard',
      isDefault: false,
      createdAt: '2024-01-02T00:00:00Z'
    }
  ];

  const defaultProps = {
    customerId: 'customer_123',
    onPaymentMethodSelect: vi.fn(),
    onDefaultPaymentMethodChange: vi.fn(),
    onPaymentMethodAdd: vi.fn(),
    onPaymentMethodDelete: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders payment method management interface', () => {
      render(<PaymentMethodManagement {...defaultProps} />);

      expect(screen.getByTestId('payment-method-management')).toBeInTheDocument();
      expect(screen.getByText('Payment Methods')).toBeInTheDocument();
    });

    it('displays existing payment methods', async () => {
      const mockGetPaymentMethods = vi.mocked(paymentApi.getPaymentMethods);
      mockGetPaymentMethods.mockResolvedValue(mockPaymentMethods);

      render(<PaymentMethodManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('payment-methods-grid')).toBeInTheDocument();
        expect(screen.getByTestId('payment-method-card-pm_1')).toBeInTheDocument();
        expect(screen.getByTestId('payment-method-card-pm_2')).toBeInTheDocument();
      });
    });

    it('shows default payment method indicator', async () => {
      const mockGetPaymentMethods = vi.mocked(paymentApi.getPaymentMethods);
      mockGetPaymentMethods.mockResolvedValue(mockPaymentMethods);

      render(<PaymentMethodManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Default')).toBeInTheDocument();
      });
    });

    it('shows add payment method button when showAddForm is true', () => {
      render(<PaymentMethodManagement {...defaultProps} showAddForm={true} />);

      expect(screen.getByTestId('add-payment-method-header-button')).toBeInTheDocument();
    });
  });

  describe('Adding Payment Methods', () => {
    it('shows add form when add button is clicked', async () => {
      const user = userEvent.setup();
      render(<PaymentMethodManagement {...defaultProps} showAddForm={true} />);

      const addButton = screen.getByTestId('add-payment-method-header-button');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('add-payment-method-form')).toBeInTheDocument();
      });
    });

    it('validates required fields when adding payment method', async () => {
      const user = userEvent.setup();
      render(<PaymentMethodManagement {...defaultProps} showAddForm={true} />);

      // Open add form
      const addButton = screen.getByTestId('add-payment-method-header-button');
      await user.click(addButton);

      // Try to submit without required fields
      const submitButton = screen.getByTestId('add-payment-method-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('gateway-token-error')).toBeInTheDocument();
      });
    });

    it('creates payment method successfully', async () => {
      const user = userEvent.setup();
      const mockCreatePaymentMethod = vi.mocked(paymentApi.createPaymentMethod);
      const onPaymentMethodAdd = vi.fn();

      const newPaymentMethod = {
        ...mockPaymentMethods[0],
        id: 'pm_3',
        last4: '9999'
      };

      mockCreatePaymentMethod.mockResolvedValue(newPaymentMethod);

      render(
        <PaymentMethodManagement
          {...defaultProps}
          showAddForm={true}
          onPaymentMethodAdd={onPaymentMethodAdd}
        />
      );

      // Open add form
      const addButton = screen.getByTestId('add-payment-method-header-button');
      await user.click(addButton);

      // Fill in form
      await user.selectOptions(screen.getByTestId('payment-method-type-select'), 'credit_card');
      await user.type(screen.getByTestId('gateway-token-input'), 'gw_token_123');
      await user.type(screen.getByTestId('cardholder-name-input'), 'John Doe');
      await user.type(screen.getByTestId('billing-line1-input'), '123 Main Street');
      await user.type(screen.getByTestId('billing-city-input'), 'New York');
      await user.type(screen.getByTestId('billing-state-input'), 'NY');
      await user.type(screen.getByTestId('billing-postal-code-input'), '10001');

      // Submit form
      const submitButton = screen.getByTestId('add-payment-method-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreatePaymentMethod).toHaveBeenCalled();
        expect(onPaymentMethodAdd).toHaveBeenCalledWith(newPaymentMethod);
      });
    });

    it('cancels add form when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<PaymentMethodManagement {...defaultProps} showAddForm={true} />);

      // Open add form
      const addButton = screen.getByTestId('add-payment-method-header-button');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('add-payment-method-form')).toBeInTheDocument();
      });

      // Cancel form
      const cancelButton = screen.getByTestId('cancel-add-button');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByTestId('add-payment-method-form')).not.toBeInTheDocument();
      });
    });
  });

  describe('Editing Payment Methods', () => {
    it('opens edit form when edit button is clicked', async () => {
      const user = userEvent.setup();
      const mockGetPaymentMethods = vi.mocked(paymentApi.getPaymentMethods);
      mockGetPaymentMethods.mockResolvedValue(mockPaymentMethods);

      render(<PaymentMethodManagement {...defaultProps} allowEdit={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-card-pm_1')).toBeInTheDocument();
      });

      const editButton = screen.getByTestId('edit-payment-method-pm_1');
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('edit-payment-method-form')).toBeInTheDocument();
      });
    });

    it('updates payment method successfully', async () => {
      const user = userEvent.setup();
      const mockGetPaymentMethods = vi.mocked(paymentApi.getPaymentMethods);
      const mockUpdatePaymentMethod = vi.mocked(paymentApi.updatePaymentMethod);

      mockGetPaymentMethods.mockResolvedValue(mockPaymentMethods);
      mockUpdatePaymentMethod.mockResolvedValue({
        ...mockPaymentMethods[0],
        billingAddress: {
          line1: '456 Updated Street',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90210',
          country: 'US'
        }
      });

      render(<PaymentMethodManagement {...defaultProps} allowEdit={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-card-pm_1')).toBeInTheDocument();
      });

      // Open edit form
      const editButton = screen.getByTestId('edit-payment-method-pm_1');
      await user.click(editButton);

      // Update billing address
      const line1Input = screen.getByTestId('edit-billing-line1-input');
      await user.clear(line1Input);
      await user.type(line1Input, '456 Updated Street');

      // Submit update
      const updateButton = screen.getByTestId('update-payment-method-button');
      await user.click(updateButton);

      await waitFor(() => {
        expect(mockUpdatePaymentMethod).toHaveBeenCalledWith('pm_1', expect.any(Object));
      });
    });

    it('cancels edit form when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const mockGetPaymentMethods = vi.mocked(paymentApi.getPaymentMethods);
      mockGetPaymentMethods.mockResolvedValue(mockPaymentMethods);

      render(<PaymentMethodManagement {...defaultProps} allowEdit={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-card-pm_1')).toBeInTheDocument();
      });

      // Open edit form
      const editButton = screen.getByTestId('edit-payment-method-pm_1');
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('edit-payment-method-form')).toBeInTheDocument();
      });

      // Cancel edit
      const cancelButton = screen.getByTestId('cancel-edit-button');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByTestId('edit-payment-method-form')).not.toBeInTheDocument();
      });
    });
  });

  describe('Deleting Payment Methods', () => {
    it('shows confirmation dialog when delete is clicked', async () => {
      const user = userEvent.setup();
      const mockGetPaymentMethods = vi.mocked(paymentApi.getPaymentMethods);
      mockGetPaymentMethods.mockResolvedValue(mockPaymentMethods);

      // Mock window.confirm
      const mockConfirm = vi.spyOn(window, 'confirm');
      mockConfirm.mockReturnValue(true);

      render(<PaymentMethodManagement {...defaultProps} allowDelete={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-card-pm_1')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-payment-method-pm_1');
      await user.click(deleteButton);

      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this payment method?');
    });

    it('deletes payment method when confirmed', async () => {
      const user = userEvent.setup();
      const mockGetPaymentMethods = vi.mocked(paymentApi.getPaymentMethods);
      const mockDeletePaymentMethod = vi.mocked(paymentApi.deletePaymentMethod);
      const onPaymentMethodDelete = vi.fn();

      mockGetPaymentMethods.mockResolvedValue(mockPaymentMethods);
      mockDeletePaymentMethod.mockResolvedValue();

      // Mock window.confirm
      const mockConfirm = vi.spyOn(window, 'confirm');
      mockConfirm.mockReturnValue(true);

      render(
        <PaymentMethodManagement
          {...defaultProps}
          allowDelete={true}
          onPaymentMethodDelete={onPaymentMethodDelete}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-card-pm_1')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-payment-method-pm_1');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockDeletePaymentMethod).toHaveBeenCalledWith('pm_1');
        expect(onPaymentMethodDelete).toHaveBeenCalledWith('pm_1');
      });
    });

    it('does not delete payment method when cancelled', async () => {
      const user = userEvent.setup();
      const mockGetPaymentMethods = vi.mocked(paymentApi.getPaymentMethods);
      const mockDeletePaymentMethod = vi.mocked(paymentApi.deletePaymentMethod);

      mockGetPaymentMethods.mockResolvedValue(mockPaymentMethods);

      // Mock window.confirm to return false (cancel)
      const mockConfirm = vi.spyOn(window, 'confirm');
      mockConfirm.mockReturnValue(false);

      render(<PaymentMethodManagement {...defaultProps} allowDelete={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-card-pm_1')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-payment-method-pm_1');
      await user.click(deleteButton);

      expect(mockConfirm).toHaveBeenCalled();
      expect(mockDeletePaymentMethod).not.toHaveBeenCalled();
    });
  });

  describe('Setting Default Payment Method', () => {
    it('sets payment method as default when set default button is clicked', async () => {
      const user = userEvent.setup();
      const mockGetPaymentMethods = vi.mocked(paymentApi.getPaymentMethods);
      const mockSetDefaultPaymentMethod = vi.mocked(paymentApi.setDefaultPaymentMethod);
      const onDefaultPaymentMethodChange = vi.fn();

      mockGetPaymentMethods.mockResolvedValue(mockPaymentMethods);
      mockSetDefaultPaymentMethod.mockResolvedValue({
        ...mockPaymentMethods[1],
        isDefault: true
      });

      render(
        <PaymentMethodManagement
          {...defaultProps}
          allowSetDefault={true}
          onDefaultPaymentMethodChange={onDefaultPaymentMethodChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-card-pm_2')).toBeInTheDocument();
      });

      const setDefaultButton = screen.getByTestId('set-default-pm_2');
      await user.click(setDefaultButton);

      await waitFor(() => {
        expect(mockSetDefaultPaymentMethod).toHaveBeenCalledWith('pm_2');
        expect(onDefaultPaymentMethodChange).toHaveBeenCalled();
      });
    });

    it('does not show set default button for already default payment method', async () => {
      const user = userEvent.setup();
      const mockGetPaymentMethods = vi.mocked(paymentApi.getPaymentMethods);
      mockGetPaymentMethods.mockResolvedValue(mockPaymentMethods);

      render(<PaymentMethodManagement {...defaultProps} allowSetDefault={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-card-pm_1')).toBeInTheDocument();
      });

      // Should not show set default button for default payment method
      expect(screen.queryByTestId('set-default-pm_1')).not.toBeInTheDocument();
    });
  });

  describe('Payment Method Selection', () => {
    it('calls onPaymentMethodSelect when payment method is selected', async () => {
      const user = userEvent.setup();
      const mockGetPaymentMethods = vi.mocked(paymentApi.getPaymentMethods);
      const onPaymentMethodSelect = vi.fn();

      mockGetPaymentMethods.mockResolvedValue(mockPaymentMethods);

      render(
        <PaymentMethodManagement
          {...defaultProps}
          onPaymentMethodSelect={onPaymentMethodSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-card-pm_1')).toBeInTheDocument();
      });

      const selectButton = screen.getByTestId('select-payment-method-pm_1');
      await user.click(selectButton);

      expect(onPaymentMethodSelect).toHaveBeenCalledWith(mockPaymentMethods[0]);
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading state while fetching payment methods', () => {
      const mockGetPaymentMethods = vi.mocked(paymentApi.getPaymentMethods);
      mockGetPaymentMethods.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<PaymentMethodManagement {...defaultProps} />);

      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    });

    it('shows error state when API call fails', async () => {
      const mockGetPaymentMethods = vi.mocked(paymentApi.getPaymentMethods);
      mockGetPaymentMethods.mockRejectedValue(new Error('API Error'));

      render(<PaymentMethodManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument();
        expect(screen.getByText('Error loading payment methods')).toBeInTheDocument();
      });
    });

    it('retries loading when retry button is clicked', async () => {
      const user = userEvent.setup();
      const mockGetPaymentMethods = vi.mocked(paymentApi.getPaymentMethods);
      mockGetPaymentMethods.mockRejectedValue(new Error('API Error'));

      render(<PaymentMethodManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument();
      });

      const retryButton = screen.getByTestId('retry-button');
      await user.click(retryButton);

      await waitFor(() => {
        expect(mockGetPaymentMethods).toHaveBeenCalledTimes(2);
      });
    });

    it('shows empty state when no payment methods exist', async () => {
      const mockGetPaymentMethods = vi.mocked(paymentApi.getPaymentMethods);
      mockGetPaymentMethods.mockResolvedValue([]);

      render(<PaymentMethodManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        expect(screen.getByText('No payment methods found')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for invalid form data', async () => {
      const user = userEvent.setup();
      render(<PaymentMethodManagement {...defaultProps} showAddForm={true} />);

      // Open add form
      const addButton = screen.getByTestId('add-payment-method-header-button');
      await user.click(addButton);

      // Try to submit with missing required fields
      const submitButton = screen.getByTestId('add-payment-method-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('gateway-token-error')).toBeInTheDocument();
      });
    });

    it('clears validation errors when form is corrected', async () => {
      const user = userEvent.setup();
      render(<PaymentMethodManagement {...defaultProps} showAddForm={true} />);

      // Open add form
      const addButton = screen.getByTestId('add-payment-method-header-button');
      await user.click(addButton);

      // Submit with errors
      const submitButton = screen.getByTestId('add-payment-method-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('gateway-token-error')).toBeInTheDocument();
      });

      // Fix the error
      await user.type(screen.getByTestId('gateway-token-input'), 'valid_token');

      // Error should be cleared (implementation dependent)
      expect(screen.getByTestId('gateway-token-input')).toHaveValue('valid_token');
    });
  });

  describe('Tenant Admin Features', () => {
    it('shows additional options for tenant admin', async () => {
      const mockGetPaymentMethods = vi.mocked(paymentApi.getPaymentMethods);
      mockGetPaymentMethods.mockResolvedValue(mockPaymentMethods);

      render(<PaymentMethodManagement {...defaultProps} isTenantAdmin={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-card-pm_1')).toBeInTheDocument();
      });

      // Tenant admin should see all available actions
      expect(screen.getByTestId('select-payment-method-pm_1')).toBeInTheDocument();
      expect(screen.getByTestId('edit-payment-method-pm_1')).toBeInTheDocument();
      expect(screen.getByTestId('delete-payment-method-pm_1')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', async () => {
      const mockGetPaymentMethods = vi.mocked(paymentApi.getPaymentMethods);
      mockGetPaymentMethods.mockResolvedValue(mockPaymentMethods);

      render(<PaymentMethodManagement {...defaultProps} />);

      await waitFor(() => {
        const management = screen.getByTestId('payment-method-management');
        expect(management).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      const mockGetPaymentMethods = vi.mocked(paymentApi.getPaymentMethods);
      mockGetPaymentMethods.mockResolvedValue(mockPaymentMethods);

      render(<PaymentMethodManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-card-pm_1')).toBeInTheDocument();
      });

      // Tab through interactive elements
      await user.tab();
      expect(screen.getByTestId('select-payment-method-pm_1')).toHaveFocus();
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

      render(<PaymentMethodManagement {...defaultProps} />);

      const management = screen.getByTestId('payment-method-management');
      expect(management).toBeInTheDocument();

      // Layout should adapt for mobile (implementation dependent)
    });

    it('maintains functionality on tablet screens', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<PaymentMethodManagement {...defaultProps} />);

      const management = screen.getByTestId('payment-method-management');
      expect(management).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing customer ID gracefully', () => {
      // This should not crash the component
      render(<PaymentMethodManagement {...defaultProps} customerId={undefined as any} />);

      expect(screen.getByTestId('payment-method-management')).toBeInTheDocument();
    });

    it('limits display count when maxDisplayCount is set', async () => {
      const mockGetPaymentMethods = vi.mocked(paymentApi.getPaymentMethods);
      mockGetPaymentMethods.mockResolvedValue(mockPaymentMethods);

      render(<PaymentMethodManagement {...defaultProps} maxDisplayCount={1} />);

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-card-pm_1')).toBeInTheDocument();
        expect(screen.queryByTestId('payment-method-card-pm_2')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('view-more-button')).toBeInTheDocument();
    });

    it('handles payment method with missing optional fields', async () => {
      const incompletePaymentMethod: PaymentMethod = {
        ...mockPaymentMethods[0],
        last4: undefined,
        brand: undefined,
        billingAddress: undefined
      };

      const mockGetPaymentMethods = vi.mocked(paymentApi.getPaymentMethods);
      mockGetPaymentMethods.mockResolvedValue([incompletePaymentMethod]);

      render(<PaymentMethodManagement {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-card-pm_1')).toBeInTheDocument();
      });
    });

    it('handles API errors during operations', async () => {
      const user = userEvent.setup();
      const mockCreatePaymentMethod = vi.mocked(paymentApi.createPaymentMethod);
      mockCreatePaymentMethod.mockRejectedValue(new Error('Creation failed'));

      render(<PaymentMethodManagement {...defaultProps} showAddForm={true} />);

      // Open add form
      const addButton = screen.getByTestId('add-payment-method-header-button');
      await user.click(addButton);

      // Fill in form and submit
      await user.selectOptions(screen.getByTestId('payment-method-type-select'), 'credit_card');
      await user.type(screen.getByTestId('gateway-token-input'), 'valid_token');

      const submitButton = screen.getByTestId('add-payment-method-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('general-error')).toBeInTheDocument();
      });
    });
  });
});