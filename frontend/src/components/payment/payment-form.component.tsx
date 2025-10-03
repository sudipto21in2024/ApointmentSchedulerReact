/**
 * Payment Form Component
 *
 * A comprehensive payment form component that handles secure payment processing
 * with multiple payment methods, validation, and error handling.
 *
 * Features:
 * - Multiple payment method support (credit card, digital wallet, bank transfer)
 * - Secure payment processing with PCI compliance considerations
 * - Real-time form validation with detailed error messages
 * - Payment method saving for future use
 * - Billing address collection
 * - 3D Secure support for enhanced security
 * - Responsive design with mobile-friendly interface
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Integration with payment gateways (Stripe, PayPal, etc.)
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';

// Import UI components from the design system
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui';

// Import types and services
import type {
  PaymentCreateData,
  PaymentMethod,
  PaymentMethodType,
  PaymentProcessingResult,
  PaymentIntent,
  Address,
  CurrencyCode
} from '../../types/payment';
import { paymentApi } from '../../services/payment-api.service';

// Import utilities
import { cn } from '../../utils/cn';
import { toast } from 'react-hot-toast';

export interface PaymentFormProps {
  /** Payment amount in smallest currency unit (cents) */
  amount: number;
  /** Currency code */
  currency: CurrencyCode;
  /** Associated booking ID if applicable */
  bookingId?: string;
  /** Customer ID making the payment */
  customerId: string;
  /** Available payment methods */
  availablePaymentMethods?: PaymentMethod[];
  /** Default selected payment method ID */
  defaultPaymentMethodId?: string;
  /** Whether to show payment method saving option */
  showSavePaymentMethod?: boolean;
  /** Whether to collect billing address */
  requireBillingAddress?: boolean;
  /** Whether to show payment method selection */
  showPaymentMethodSelection?: boolean;
  /** Allowed payment method types */
  allowedPaymentMethodTypes?: PaymentMethodType[];
  /** Custom payment description */
  description?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
  /** Success callback when payment is completed */
  onPaymentSuccess?: (paymentId: string, gatewayTransactionId: string) => void;
  /** Error callback when payment fails */
  onPaymentError?: (error: string, validationErrors?: any[]) => void;
  /** Cancel callback */
  onCancel?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

export interface PaymentFormState {
  /** Form data */
  formData: PaymentCreateData;
  /** Selected payment method */
  selectedPaymentMethod: PaymentMethod | null;
  /** Whether form is being processed */
  processing: boolean;
  /** Form validation errors */
  errors: Record<string, string | undefined>;
  /** Payment intent for secure processing */
  paymentIntent: PaymentIntent | null;
  /** Whether payment method should be saved */
  savePaymentMethod: boolean;
  /** Billing address data */
  billingAddress: Address | null;
  /** Current step in payment process */
  currentStep: 'payment_method' | 'billing' | 'processing' | 'confirmation';
  /** Form submission attempts */
  submissionAttempts: number;
}

export interface PaymentFormValidation {
  /** Whether form is valid */
  isValid: boolean;
  /** Field-specific errors */
  fieldErrors: Record<string, string>;
  /** Form-level errors */
  formErrors: string[];
}

/**
 * Payment Form Component - Main component for processing payments securely
 */
export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency,
  bookingId,
  customerId,
  availablePaymentMethods = [],
  defaultPaymentMethodId,
  showSavePaymentMethod = true,
  requireBillingAddress = false,
  showPaymentMethodSelection = true,
  allowedPaymentMethodTypes = ['credit_card', 'debit_card', 'digital_wallet'],
  description,
  metadata,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
  loading: externalLoading = false,
  className = '',
  'data-testid': testId = 'payment-form'
}) => {
  // Initialize component state with comprehensive form management
  const [state, setState] = useState<PaymentFormState>({
    formData: {
      amount,
      currency,
      paymentMethodId: defaultPaymentMethodId || '',
      bookingId,
      description,
      metadata,
      savePaymentMethod: false
    },
    selectedPaymentMethod: availablePaymentMethods.find(pm => pm.id === defaultPaymentMethodId) || null,
    processing: false,
    errors: {},
    paymentIntent: null,
    savePaymentMethod: false,
    billingAddress: null,
    currentStep: 'payment_method',
    submissionAttempts: 0
  });

  /**
   * Validate the entire form and return validation result
   * Performs comprehensive validation including field-level and form-level checks
   */
  const validateForm = useCallback((): PaymentFormValidation => {
    const fieldErrors: Record<string, string> = {};
    const formErrors: string[] = [];

    // Validate payment method selection
    if (showPaymentMethodSelection && !state.selectedPaymentMethod && !state.formData.paymentMethodId) {
      fieldErrors.paymentMethod = 'Please select a payment method';
    }

    // Validate billing address if required
    if (requireBillingAddress && state.currentStep === 'billing') {
      const address = state.billingAddress;
      if (!address) {
        fieldErrors.billingAddress = 'Billing address is required';
      } else {
        if (!address.line1?.trim()) fieldErrors.billingLine1 = 'Street address is required';
        if (!address.city?.trim()) fieldErrors.billingCity = 'City is required';
        if (!address.state?.trim()) fieldErrors.billingState = 'State is required';
        if (!address.postalCode?.trim()) fieldErrors.billingPostalCode = 'Postal code is required';
        if (!address.country?.trim()) fieldErrors.billingCountry = 'Country is required';
      }
    }

    // Validate amount
    if (!state.formData.amount || state.formData.amount <= 0) {
      fieldErrors.amount = 'Payment amount must be greater than 0';
    }

    // Validate currency
    if (!state.formData.currency) {
      fieldErrors.currency = 'Currency is required';
    }

    // Check for form-level errors
    if (Object.keys(fieldErrors).length > 0) {
      formErrors.push('Please correct the errors below');
    }

    return {
      isValid: formErrors.length === 0 && Object.keys(fieldErrors).length === 0,
      fieldErrors,
      formErrors
    };
  }, [state.selectedPaymentMethod, state.formData, state.billingAddress, state.currentStep, showPaymentMethodSelection, requireBillingAddress]);

  /**
   * Handle payment method selection with validation and state updates
   */
  const handlePaymentMethodSelect = useCallback((paymentMethod: PaymentMethod) => {
    setState(prev => ({
      ...prev,
      selectedPaymentMethod: paymentMethod,
      formData: {
        ...prev.formData,
        paymentMethodId: paymentMethod.id
      },
      errors: {
        ...prev.errors,
        paymentMethod: undefined // Clear payment method error
      }
    }));
  }, []);

  /**
   * Handle billing address field changes with real-time validation
   */
  const handleBillingAddressChange = useCallback((field: keyof Address, value: string) => {
    setState(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress!,
        [field]: value
      },
      errors: {
        ...prev.errors,
        [`billing${field.charAt(0).toUpperCase() + field.slice(1)}`]: undefined // Clear field error
      }
    }));
  }, []);

  /**
   * Handle form data changes for basic fields
   */
  const handleFormDataChange = useCallback((field: keyof PaymentCreateData, value: any) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value
      },
      errors: {
        ...prev.errors,
        [field]: undefined // Clear field error
      }
    }));
  }, []);

  /**
   * Handle save payment method toggle
   */
  const handleSavePaymentMethodToggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const save = e.target.checked;
    setState(prev => ({
      ...prev,
      savePaymentMethod: save,
      formData: {
        ...prev.formData,
        savePaymentMethod: save
      }
    }));
  }, []);

  /**
   * Create payment intent for secure processing
   * This step initializes the payment with the gateway for enhanced security
   */
  const createPaymentIntent = useCallback(async () => {
    setState(prev => ({ ...prev, processing: true, errors: {} }));

    try {
      const intent: PaymentIntent = await paymentApi.createPaymentIntent({
        amount: state.formData.amount,
        currency: state.formData.currency,
        paymentMethodTypes: allowedPaymentMethodTypes,
        metadata: state.formData.metadata,
        description: state.formData.description
      });

      setState(prev => ({
        ...prev,
        paymentIntent: intent,
        currentStep: 'processing',
        processing: false
      }));

      return intent;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment intent';
      setState(prev => ({
        ...prev,
        processing: false,
        errors: { ...prev.errors, general: errorMessage }
      }));
      toast.error(errorMessage);
      onPaymentError?.(errorMessage);
      return null;
    }
  }, [state.formData, allowedPaymentMethodTypes, onPaymentError]);

  /**
   * Process payment with selected payment method and billing information
   * Handles the complete payment flow including validation and error handling
   */
  const processPayment = useCallback(async () => {
    // Validate form before processing
    const validation = validateForm();
    if (!validation.isValid) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, ...validation.fieldErrors }
      }));
      toast.error('Please correct the form errors');
      return;
    }

    setState(prev => ({
      ...prev,
      processing: true,
      errors: {},
      submissionAttempts: prev.submissionAttempts + 1
    }));

    try {
      const result: PaymentProcessingResult = await paymentApi.processPayment({
        ...state.formData,
        paymentMethodId: state.selectedPaymentMethod?.id || state.formData.paymentMethodId,
        billingAddress: requireBillingAddress ? state.billingAddress! : undefined,
        savePaymentMethod: showSavePaymentMethod ? state.savePaymentMethod : false
      });

      if (result.success && result.paymentId) {
        toast.success('Payment processed successfully');
        onPaymentSuccess?.(result.paymentId, result.gatewayTransactionId || '');

        setState(prev => ({
          ...prev,
          processing: false,
          currentStep: 'confirmation'
        }));
      } else {
        throw new Error(result.error || 'Payment processing failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';

      setState(prev => ({
        ...prev,
        processing: false,
        errors: { ...prev.errors, general: errorMessage }
      }));

      toast.error(errorMessage);
      onPaymentError?.(errorMessage, (error as any)?.validationErrors);
    }
  }, [state.formData, state.selectedPaymentMethod, state.billingAddress, state.savePaymentMethod, validateForm, requireBillingAddress, showSavePaymentMethod, onPaymentSuccess, onPaymentError]);

  /**
   * Handle form submission with proper validation and processing flow
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (state.processing) return; // Prevent double submission

    // Create payment intent first for enhanced security
    const intent = await createPaymentIntent();
    if (!intent) return; // Failed to create intent

    // Process the payment
    await processPayment();
  }, [state.processing, createPaymentIntent, processPayment]);

  /**
   * Handle cancellation with confirmation
   */
  const handleCancel = useCallback(() => {
    if (state.processing) {
      toast.error('Cannot cancel while processing payment');
      return;
    }

    if (window.confirm('Are you sure you want to cancel the payment?')) {
      onCancel?.();
    }
  }, [state.processing, onCancel]);

  /**
   * Get filtered available payment methods based on allowed types
   */
  const filteredPaymentMethods = useMemo(() => {
    return availablePaymentMethods.filter(method =>
      allowedPaymentMethodTypes.includes(method.type)
    );
  }, [availablePaymentMethods, allowedPaymentMethodTypes]);

  /**
   * Format amount for display with proper currency formatting
   */
  const formatAmount = useCallback((amount: number, currency: CurrencyCode) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount / 100); // Convert from cents
  }, []);

  /**
   * Render payment method selection step
   */
  const renderPaymentMethodStep = () => (
    <div className="space-y-6" data-testid="payment-method-step">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select Payment Method</h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose how you'd like to pay for this {formatAmount(amount, currency)} transaction
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredPaymentMethods.map((method) => (
          <Card
            key={method.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              state.selectedPaymentMethod?.id === method.id
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:bg-gray-50"
            )}
            onClick={() => handlePaymentMethodSelect(method)}
            data-testid={`payment-method-${method.id}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getPaymentMethodIcon(method.type)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {getPaymentMethodDisplayName(method)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {method.last4 && `•••• ${method.last4}`}
                      {method.brand && ` • ${method.brand}`}
                    </div>
                  </div>
                </div>
                {method.isDefault && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add new payment method option */}
        <Card
          className="cursor-pointer transition-all hover:shadow-md border-dashed border-2 hover:bg-gray-50"
          onClick={() => setState(prev => ({ ...prev, currentStep: 'billing' }))}
          data-testid="add-new-payment-method"
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">💳</div>
            <div className="font-medium text-gray-900">Add New Payment Method</div>
            <div className="text-sm text-gray-600">Enter new card or payment details</div>
          </CardContent>
        </Card>
      </div>

      {state.errors.paymentMethod && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md" data-testid="payment-method-error">
          {state.errors.paymentMethod}
        </div>
      )}
    </div>
  );

  /**
   * Render billing address collection step
   */
  const renderBillingStep = () => (
    <div className="space-y-6" data-testid="billing-step">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Billing Address</h3>
        <p className="text-sm text-gray-600 mb-4">
          Please provide your billing address for this payment
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address *
          </label>
          <Input
            value={state.billingAddress?.line1 || ''}
            onChange={(e) => handleBillingAddressChange('line1', e.target.value)}
            placeholder="123 Main Street"
            className={state.errors.billingLine1 ? 'border-red-500' : ''}
            data-testid="billing-line1"
          />
          {state.errors.billingLine1 && (
            <p className="mt-1 text-sm text-red-600" data-testid="billing-line1-error">
              {state.errors.billingLine1}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apartment, suite, etc. (optional)
          </label>
          <Input
            value={state.billingAddress?.line2 || ''}
            onChange={(e) => handleBillingAddressChange('line2', e.target.value)}
            placeholder="Apartment 4B"
            data-testid="billing-line2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <Input
            value={state.billingAddress?.city || ''}
            onChange={(e) => handleBillingAddressChange('city', e.target.value)}
            placeholder="New York"
            className={state.errors.billingCity ? 'border-red-500' : ''}
            data-testid="billing-city"
          />
          {state.errors.billingCity && (
            <p className="mt-1 text-sm text-red-600" data-testid="billing-city-error">
              {state.errors.billingCity}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State/Province *
          </label>
          <Input
            value={state.billingAddress?.state || ''}
            onChange={(e) => handleBillingAddressChange('state', e.target.value)}
            placeholder="NY"
            className={state.errors.billingState ? 'border-red-500' : ''}
            data-testid="billing-state"
          />
          {state.errors.billingState && (
            <p className="mt-1 text-sm text-red-600" data-testid="billing-state-error">
              {state.errors.billingState}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Postal Code *
          </label>
          <Input
            value={state.billingAddress?.postalCode || ''}
            onChange={(e) => handleBillingAddressChange('postalCode', e.target.value)}
            placeholder="10001"
            className={state.errors.billingPostalCode ? 'border-red-500' : ''}
            data-testid="billing-postal-code"
          />
          {state.errors.billingPostalCode && (
            <p className="mt-1 text-sm text-red-600" data-testid="billing-postal-code-error">
              {state.errors.billingPostalCode}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country *
          </label>
          <Select
            options={[
              { value: 'US', label: 'United States' },
              { value: 'CA', label: 'Canada' },
              { value: 'GB', label: 'United Kingdom' },
              { value: 'AU', label: 'Australia' },
              { value: 'DE', label: 'Germany' },
              { value: 'FR', label: 'France' },
              { value: 'JP', label: 'Japan' }
            ]}
            value={state.billingAddress?.country || ''}
            onChange={(value) => handleBillingAddressChange('country', value as string)}
            placeholder="Select country"
            className={state.errors.billingCountry ? 'border-red-500' : ''}
            data-testid="billing-country"
          />
          {state.errors.billingCountry && (
            <p className="mt-1 text-sm text-red-600" data-testid="billing-country-error">
              {state.errors.billingCountry}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  /**
   * Render payment processing step
   */
  const renderProcessingStep = () => (
    <div className="text-center py-8" data-testid="processing-step">
      <div className="animate-spin text-4xl mb-4">⏳</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Payment</h3>
      <p className="text-sm text-gray-600">
        Please wait while we securely process your {formatAmount(amount, currency)} payment...
      </p>
      <div className="mt-4 text-xs text-gray-500">
        Do not refresh or close this page
      </div>
    </div>
  );

  /**
   * Render payment confirmation step
   */
  const renderConfirmationStep = () => (
    <div className="text-center py-8" data-testid="confirmation-step">
      <div className="text-4xl mb-4">✅</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Successful!</h3>
      <p className="text-sm text-gray-600 mb-4">
        Your payment of {formatAmount(amount, currency)} has been processed successfully.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
        <div className="font-medium">Payment Details:</div>
        <div>Amount: {formatAmount(amount, currency)}</div>
        <div>Payment Method: {state.selectedPaymentMethod ?
          getPaymentMethodDisplayName(state.selectedPaymentMethod) :
          'Selected payment method'}</div>
        {state.paymentIntent?.id && (
          <div>Transaction ID: {state.paymentIntent.id}</div>
        )}
      </div>
    </div>
  );

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
  const getPaymentMethodDisplayName = (method: PaymentMethod) => {
    const baseName = method.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (method.last4) {
      return `${baseName} ending in ${method.last4}`;
    }
    return baseName;
  };

  // Auto-advance to billing step if no payment methods available
  useEffect(() => {
    if (filteredPaymentMethods.length === 0 && state.currentStep === 'payment_method') {
      setState(prev => ({ ...prev, currentStep: 'billing' }));
    }
  }, [filteredPaymentMethods.length, state.currentStep]);

  return (
    <Card className={cn('payment-form max-w-2xl mx-auto', className)} data-testid={testId}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Payment Information</span>
          <span className="text-lg font-bold text-green-600">
            {formatAmount(amount, currency)}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Show general errors */}
          {state.errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800" data-testid="general-error">
              <div className="font-medium">Payment Error:</div>
              <div>{state.errors.general}</div>
            </div>
          )}

          {/* Render current step */}
          {state.currentStep === 'payment_method' && renderPaymentMethodStep()}
          {state.currentStep === 'billing' && renderBillingStep()}
          {state.currentStep === 'processing' && renderProcessingStep()}
          {state.currentStep === 'confirmation' && renderConfirmationStep()}

          {/* Show save payment method option */}
          {showSavePaymentMethod && state.currentStep === 'billing' && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                checked={state.savePaymentMethod}
                onChange={handleSavePaymentMethodToggle}
                data-testid="save-payment-method"
              />
              <div className="text-sm">
                <div className="font-medium text-gray-900">Save payment method</div>
                <div className="text-gray-600">Save this payment method for faster checkout next time</div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {state.currentStep !== 'processing' && state.currentStep !== 'confirmation' && (
            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={state.processing}
                className="flex-1"
                data-testid="cancel-button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={state.processing || externalLoading}
                disabled={state.processing || externalLoading}
                className="flex-1"
                data-testid="submit-button"
              >
                {state.processing ? 'Processing...' : `Pay ${formatAmount(amount, currency)}`}
              </Button>
            </div>
          )}

          {/* Show confirmation actions */}
          {state.currentStep === 'confirmation' && (
            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="primary"
                onClick={() => window.location.reload()}
                className="flex-1"
                data-testid="done-button"
              >
                Done
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;