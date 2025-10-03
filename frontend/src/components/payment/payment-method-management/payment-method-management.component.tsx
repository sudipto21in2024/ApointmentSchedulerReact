/**
 * Payment Method Management Component
 *
 * Comprehensive component for managing saved payment methods including listing,
 * adding, editing, deleting, and setting default payment methods for customers
 * and tenant administrators.
 *
 * Features:
 * - List all saved payment methods with detailed information
 * - Add new payment methods with secure form handling
 * - Edit existing payment methods (billing address updates)
 * - Delete payment methods with confirmation
 * - Set default payment method
 * - Payment method validation and security
 * - Responsive design with mobile-friendly interface
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Integration with payment gateways for secure tokenization
 * - Support for multiple payment method types
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';

// Import UI components from the design system
import { Button } from '../../ui';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui';
import { Input } from '../../ui';
import { Select } from '../../ui';
import { Checkbox } from '../../ui';

// Import types and services
import type {
  PaymentMethod,
  PaymentMethodType,
  PaymentMethodCreateData,
  PaymentMethodUpdateData,
  Address
} from '../../../types/payment';
import { paymentApi } from '../../../services/payment-api.service';

// Import utilities
import { cn } from '../../../utils/cn';
import { toast } from 'react-hot-toast';

export interface PaymentMethodManagementProps {
  /** Customer ID to manage payment methods for */
  customerId?: string;
  /** Whether this is for tenant admin (shows additional options) */
  isTenantAdmin?: boolean;
  /** Whether to show add new payment method form */
  showAddForm?: boolean;
  /** Whether to allow editing payment methods */
  allowEdit?: boolean;
  /** Whether to allow deleting payment methods */
  allowDelete?: boolean;
  /** Whether to allow setting default payment method */
  allowSetDefault?: boolean;
  /** Maximum number of payment methods to display */
  maxDisplayCount?: number;
  /** Callback when payment method is selected */
  onPaymentMethodSelect?: (paymentMethod: PaymentMethod) => void;
  /** Callback when default payment method changes */
  onDefaultPaymentMethodChange?: (paymentMethod: PaymentMethod) => void;
  /** Callback when payment method is added */
  onPaymentMethodAdd?: (paymentMethod: PaymentMethod) => void;
  /** Callback when payment method is deleted */
  onPaymentMethodDelete?: (paymentMethodId: string) => void;
  /** Custom CSS class */
  className?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

export interface PaymentMethodManagementState {
  /** List of payment methods */
  paymentMethods: PaymentMethod[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Show add new payment method form */
  showAddForm: boolean;
  /** Currently editing payment method */
  editingPaymentMethod: PaymentMethod | null;
  /** Form data for new payment method */
  newPaymentMethodData: Partial<PaymentMethodCreateData>;
  /** Form data for editing payment method */
  editPaymentMethodData: Partial<PaymentMethodUpdateData>;
  /** Form validation errors */
  formErrors: Record<string, string | undefined>;
  /** Processing state for form submissions */
  processing: boolean;
  /** Selected payment methods for bulk operations */
  selectedPaymentMethods: Set<string>;
  /** Show bulk actions */
  showBulkActions: boolean;
}

/**
 * Payment Method Management Component - Main component for managing payment methods
 */
export const PaymentMethodManagement: React.FC<PaymentMethodManagementProps> = ({
  customerId,
  isTenantAdmin = false,
  showAddForm = true,
  allowEdit = true,
  allowDelete = true,
  allowSetDefault = true,
  maxDisplayCount,
  onPaymentMethodSelect,
  onDefaultPaymentMethodChange,
  onPaymentMethodAdd,
  onPaymentMethodDelete,
  className = '',
  'data-testid': testId = 'payment-method-management'
}) => {
  // Initialize component state
  const [state, setState] = useState<PaymentMethodManagementState>({
    paymentMethods: [],
    loading: false,
    error: null,
    showAddForm: showAddForm,
    editingPaymentMethod: null,
    newPaymentMethodData: {
      type: 'credit_card',
      setAsDefault: false
    },
    editPaymentMethodData: {},
    formErrors: {},
    processing: false,
    selectedPaymentMethods: new Set(),
    showBulkActions: false
  });

  /**
   * Load payment methods from API
   */
  const loadPaymentMethods = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const paymentMethods = await paymentApi.getPaymentMethods(customerId);
      setState(prev => ({
        ...prev,
        paymentMethods,
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load payment methods';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
      toast.error(errorMessage);
    }
  }, [customerId]);

  /**
   * Handle adding new payment method
   */
  const handleAddPaymentMethod = useCallback(async () => {
    // Validate form
    const errors: Record<string, string> = {};

    if (!state.newPaymentMethodData.type) {
      errors.type = 'Payment method type is required';
    }

    if (!state.newPaymentMethodData.gatewayToken) {
      errors.gatewayToken = 'Payment method token is required';
    }

    if (Object.keys(errors).length > 0) {
      setState(prev => ({ ...prev, formErrors: errors }));
      toast.error('Please correct the form errors');
      return;
    }

    setState(prev => ({ ...prev, processing: true, formErrors: {} }));

    try {
      const newPaymentMethod = await paymentApi.createPaymentMethod(
        state.newPaymentMethodData as PaymentMethodCreateData
      );

      setState(prev => ({
        ...prev,
        paymentMethods: [...prev.paymentMethods, newPaymentMethod],
        showAddForm: false,
        newPaymentMethodData: { type: 'credit_card', setAsDefault: false },
        processing: false
      }));

      toast.success('Payment method added successfully');
      onPaymentMethodAdd?.(newPaymentMethod);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add payment method';
      setState(prev => ({
        ...prev,
        processing: false,
        formErrors: { general: errorMessage }
      }));
      toast.error(errorMessage);
    }
  }, [state.newPaymentMethodData, onPaymentMethodAdd]);

  /**
   * Handle editing payment method
   */
  const handleEditPaymentMethod = useCallback(async (paymentMethod: PaymentMethod) => {
    setState(prev => ({
      ...prev,
      editingPaymentMethod: paymentMethod,
      editPaymentMethodData: {
        billingAddress: paymentMethod.billingAddress
      }
    }));
  }, []);

  /**
   * Handle updating payment method
   */
  const handleUpdatePaymentMethod = useCallback(async () => {
    if (!state.editingPaymentMethod) return;

    setState(prev => ({ ...prev, processing: true, formErrors: {} }));

    try {
      const updatedPaymentMethod = await paymentApi.updatePaymentMethod(
        state.editingPaymentMethod.id,
        state.editPaymentMethodData as PaymentMethodUpdateData
      );

      setState(prev => ({
        ...prev,
        paymentMethods: prev.paymentMethods.map(pm =>
          pm.id === updatedPaymentMethod.id ? updatedPaymentMethod : pm
        ),
        editingPaymentMethod: null,
        editPaymentMethodData: {},
        processing: false
      }));

      toast.success('Payment method updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update payment method';
      setState(prev => ({
        ...prev,
        processing: false,
        formErrors: { general: errorMessage }
      }));
      toast.error(errorMessage);
    }
  }, [state.editingPaymentMethod, state.editPaymentMethodData]);

  /**
   * Handle deleting payment method
   */
  const handleDeletePaymentMethod = useCallback(async (paymentMethodId: string) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    setState(prev => ({ ...prev, processing: true }));

    try {
      await paymentApi.deletePaymentMethod(paymentMethodId);

      setState(prev => ({
        ...prev,
        paymentMethods: prev.paymentMethods.filter(pm => pm.id !== paymentMethodId),
        processing: false
      }));

      toast.success('Payment method deleted successfully');
      onPaymentMethodDelete?.(paymentMethodId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete payment method';
      setState(prev => ({
        ...prev,
        processing: false
      }));
      toast.error(errorMessage);
    }
  }, [onPaymentMethodDelete]);

  /**
   * Handle setting default payment method
   */
  const handleSetDefaultPaymentMethod = useCallback(async (paymentMethodId: string) => {
    setState(prev => ({ ...prev, processing: true }));

    try {
      const updatedPaymentMethod = await paymentApi.setDefaultPaymentMethod(paymentMethodId);

      setState(prev => ({
        ...prev,
        paymentMethods: prev.paymentMethods.map(pm => ({
          ...pm,
          isDefault: pm.id === paymentMethodId
        })),
        processing: false
      }));

      toast.success('Default payment method updated');
      onDefaultPaymentMethodChange?.(updatedPaymentMethod);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set default payment method';
      setState(prev => ({
        ...prev,
        processing: false
      }));
      toast.error(errorMessage);
    }
  }, [onDefaultPaymentMethodChange]);

  /**
   * Handle payment method selection
   */
  const handlePaymentMethodSelect = useCallback((paymentMethod: PaymentMethod) => {
    onPaymentMethodSelect?.(paymentMethod);
  }, [onPaymentMethodSelect]);

  /**
   * Handle form input changes for new payment method
   */
  const handleNewPaymentMethodChange = useCallback((field: keyof PaymentMethodCreateData, value: any) => {
    setState(prev => ({
      ...prev,
      newPaymentMethodData: {
        ...prev.newPaymentMethodData,
        [field]: value
      },
      formErrors: {
        ...prev.formErrors,
        [field]: undefined,
        general: undefined
      }
    }));
  }, []);

  /**
   * Handle form input changes for editing payment method
   */
  const handleEditPaymentMethodChange = useCallback((field: keyof PaymentMethodUpdateData, value: any) => {
    setState(prev => ({
      ...prev,
      editPaymentMethodData: {
        ...prev.editPaymentMethodData,
        [field]: value
      },
      formErrors: {
        ...prev.formErrors,
        [field]: undefined,
        general: undefined
      }
    }));
  }, []);

  /**
   * Get payment method icon based on type
   */
  const getPaymentMethodIcon = (type: PaymentMethodType) => {
    const icons = {
      credit_card: '💳',
      debit_card: '💳',
      digital_wallet: '📱',
      bank_transfer: '🏦',
      cash: '💵',
      check: '📄'
    };
    return icons[type] || '💳';
  };

  /**
   * Get payment method display name
   */
  const getPaymentMethodDisplayName = (paymentMethod: PaymentMethod) => {
    const typeName = paymentMethod.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (paymentMethod.last4) {
      return `${typeName} ending in ${paymentMethod.last4}`;
    }
    return typeName;
  };

  /**
   * Render payment method card
   */
  const renderPaymentMethodCard = (paymentMethod: PaymentMethod) => (
    <Card
      key={paymentMethod.id}
      className={cn(
        "transition-all hover:shadow-md",
        paymentMethod.isDefault && "ring-2 ring-blue-500 bg-blue-50"
      )}
      data-testid={`payment-method-card-${paymentMethod.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {getPaymentMethodIcon(paymentMethod.type)}
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {getPaymentMethodDisplayName(paymentMethod)}
              </div>
              <div className="text-sm text-gray-600">
                {paymentMethod.brand && `${paymentMethod.brand} • `}
                Added {new Date(paymentMethod.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {paymentMethod.isDefault && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Default
            </span>
          )}
        </div>

        {paymentMethod.billingAddress && (
          <div className="text-xs text-gray-500 mb-3">
            {paymentMethod.billingAddress.city}, {paymentMethod.billingAddress.state}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePaymentMethodSelect(paymentMethod)}
            data-testid={`select-payment-method-${paymentMethod.id}`}
          >
            Select
          </Button>

          {allowSetDefault && !paymentMethod.isDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSetDefaultPaymentMethod(paymentMethod.id)}
              disabled={state.processing}
              data-testid={`set-default-${paymentMethod.id}`}
            >
              Set Default
            </Button>
          )}

          {allowEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditPaymentMethod(paymentMethod)}
              disabled={state.processing}
              data-testid={`edit-payment-method-${paymentMethod.id}`}
            >
              ✏️
            </Button>
          )}

          {allowDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeletePaymentMethod(paymentMethod.id)}
              disabled={state.processing}
              data-testid={`delete-payment-method-${paymentMethod.id}`}
            >
              🗑️
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  /**
   * Render add new payment method form
   */
  const renderAddPaymentMethodForm = () => (
    <Card className="mb-6" data-testid="add-payment-method-form">
      <CardHeader>
        <CardTitle>Add New Payment Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method Type
            </label>
            <Select
              options={[
                { value: 'credit_card', label: 'Credit Card' },
                { value: 'debit_card', label: 'Debit Card' },
                { value: 'digital_wallet', label: 'Digital Wallet' },
                { value: 'bank_transfer', label: 'Bank Transfer' }
              ]}
              value={state.newPaymentMethodData.type || ''}
              onChange={(value) => handleNewPaymentMethodChange('type', value as PaymentMethodType)}
              placeholder="Select payment method type"
              data-testid="payment-method-type-select"
            />
            {state.formErrors.type && (
              <p className="mt-1 text-sm text-red-600" data-testid="type-error">
                {state.formErrors.type}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gateway Token
            </label>
            <Input
              value={state.newPaymentMethodData.gatewayToken || ''}
              onChange={(e) => handleNewPaymentMethodChange('gatewayToken', e.target.value)}
              placeholder="Payment gateway token"
              data-testid="gateway-token-input"
            />
            {state.formErrors.gatewayToken && (
              <p className="mt-1 text-sm text-red-600" data-testid="gateway-token-error">
                {state.formErrors.gatewayToken}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cardholder Name (optional)
          </label>
          <Input
            value={state.newPaymentMethodData.cardholderName || ''}
            onChange={(e) => handleNewPaymentMethodChange('cardholderName', e.target.value)}
            placeholder="John Doe"
            data-testid="cardholder-name-input"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address
            </label>
            <Input
              value={state.newPaymentMethodData.billingAddress?.line1 || ''}
              onChange={(e) => handleNewPaymentMethodChange('billingAddress', {
                ...state.newPaymentMethodData.billingAddress,
                line1: e.target.value
              })}
              placeholder="123 Main Street"
              data-testid="billing-line1-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <Input
              value={state.newPaymentMethodData.billingAddress?.city || ''}
              onChange={(e) => handleNewPaymentMethodChange('billingAddress', {
                ...state.newPaymentMethodData.billingAddress,
                city: e.target.value
              })}
              placeholder="New York"
              data-testid="billing-city-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <Input
              value={state.newPaymentMethodData.billingAddress?.state || ''}
              onChange={(e) => handleNewPaymentMethodChange('billingAddress', {
                ...state.newPaymentMethodData.billingAddress,
                state: e.target.value
              })}
              placeholder="NY"
              data-testid="billing-state-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code
            </label>
            <Input
              value={state.newPaymentMethodData.billingAddress?.postalCode || ''}
              onChange={(e) => handleNewPaymentMethodChange('billingAddress', {
                ...state.newPaymentMethodData.billingAddress,
                postalCode: e.target.value
              })}
              placeholder="10001"
              data-testid="billing-postal-code-input"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            checked={state.newPaymentMethodData.setAsDefault || false}
            onChange={(e) => handleNewPaymentMethodChange('setAsDefault', e.target.checked)}
            label="Set as default payment method"
            data-testid="set-default-checkbox"
          />
        </div>

        {state.formErrors.general && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md" data-testid="general-error">
            {state.formErrors.general}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={handleAddPaymentMethod}
            loading={state.processing}
            disabled={state.processing}
            data-testid="add-payment-method-button"
          >
            Add Payment Method
          </Button>
          <Button
            variant="secondary"
            onClick={() => setState(prev => ({ ...prev, showAddForm: false }))}
            disabled={state.processing}
            data-testid="cancel-add-button"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  /**
   * Render edit payment method form
   */
  const renderEditPaymentMethodForm = () => {
    if (!state.editingPaymentMethod) return null;

    return (
      <Card className="mb-6" data-testid="edit-payment-method-form">
        <CardHeader>
          <CardTitle>Edit Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <Input
                value={state.editPaymentMethodData.billingAddress?.line1 || ''}
                onChange={(e) => handleEditPaymentMethodChange('billingAddress', {
                  ...state.editPaymentMethodData.billingAddress,
                  line1: e.target.value
                })}
                placeholder="123 Main Street"
                data-testid="edit-billing-line1-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <Input
                value={state.editPaymentMethodData.billingAddress?.city || ''}
                onChange={(e) => handleEditPaymentMethodChange('billingAddress', {
                  ...state.editPaymentMethodData.billingAddress,
                  city: e.target.value
                })}
                placeholder="New York"
                data-testid="edit-billing-city-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <Input
                value={state.editPaymentMethodData.billingAddress?.state || ''}
                onChange={(e) => handleEditPaymentMethodChange('billingAddress', {
                  ...state.editPaymentMethodData.billingAddress,
                  state: e.target.value
                })}
                placeholder="NY"
                data-testid="edit-billing-state-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <Input
                value={state.editPaymentMethodData.billingAddress?.postalCode || ''}
                onChange={(e) => handleEditPaymentMethodChange('billingAddress', {
                  ...state.editPaymentMethodData.billingAddress,
                  postalCode: e.target.value
                })}
                placeholder="10001"
                data-testid="edit-billing-postal-code-input"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleUpdatePaymentMethod}
              loading={state.processing}
              disabled={state.processing}
              data-testid="update-payment-method-button"
            >
              Update Payment Method
            </Button>
            <Button
              variant="secondary"
              onClick={() => setState(prev => ({
                ...prev,
                editingPaymentMethod: null,
                editPaymentMethodData: {}
              }))}
              disabled={state.processing}
              data-testid="cancel-edit-button"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * Render loading state
   */
  const renderLoadingState = () => (
    <div className="space-y-4" data-testid="loading-state">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  /**
   * Render error state
   */
  const renderErrorState = () => (
    <Card className="text-center py-8 border-red-200 bg-red-50" data-testid="error-state">
      <CardContent>
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-red-900 mb-2">Error loading payment methods</h3>
        <p className="text-red-700 mb-4">{state.error}</p>
        <Button
          variant="primary"
          onClick={loadPaymentMethods}
          data-testid="retry-button"
        >
          Try again
        </Button>
      </CardContent>
    </Card>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <Card className="text-center py-12" data-testid="empty-state">
      <CardContent>
        <div className="text-6xl mb-4">💳</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods found</h3>
        <p className="text-gray-500 mb-4">
          Add a payment method to get started with quick and secure payments
        </p>
        {showAddForm && (
          <Button
            variant="primary"
            onClick={() => setState(prev => ({ ...prev, showAddForm: true }))}
            data-testid="show-add-form-button"
          >
            Add Payment Method
          </Button>
        )}
      </CardContent>
    </Card>
  );

  // Load payment methods on mount
  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  // Get display payment methods (limited by maxDisplayCount if specified)
  const displayPaymentMethods = useMemo(() => {
    if (!maxDisplayCount) return state.paymentMethods;
    return state.paymentMethods.slice(0, maxDisplayCount);
  }, [state.paymentMethods, maxDisplayCount]);

  return (
    <div className={cn('payment-method-management', className)} data-testid={testId}>
      {/* Header with add button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
          <p className="text-sm text-gray-600">
            Manage your saved payment methods for quick and secure checkout
          </p>
        </div>
        {showAddForm && !state.showAddForm && (
          <Button
            variant="primary"
            onClick={() => setState(prev => ({ ...prev, showAddForm: true }))}
            data-testid="add-payment-method-header-button"
          >
            + Add Payment Method
          </Button>
        )}
      </div>

      {/* Show add form if requested */}
      {state.showAddForm && renderAddPaymentMethodForm()}

      {/* Show edit form if editing */}
      {renderEditPaymentMethodForm()}

      {/* Show error state */}
      {state.error && renderErrorState()}

      {/* Show loading state */}
      {state.loading && renderLoadingState()}

      {/* Show payment methods */}
      {!state.loading && !state.error && state.paymentMethods.length === 0 && renderEmptyState()}

      {!state.loading && !state.error && state.paymentMethods.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="payment-methods-grid">
          {displayPaymentMethods.map(renderPaymentMethodCard)}
        </div>
      )}

      {/* Show "View More" button if there are more payment methods */}
      {!state.loading && !state.error && maxDisplayCount && state.paymentMethods.length > maxDisplayCount && (
        <div className="text-center mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              // Handle view more logic - could show all or open a modal
              toast('View all payment methods functionality coming soon');
            }}
            data-testid="view-more-button"
          >
            View All Payment Methods
          </Button>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodManagement;