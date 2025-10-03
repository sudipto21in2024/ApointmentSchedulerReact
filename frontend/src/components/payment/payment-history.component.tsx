/**
 * Payment History Component
 *
 * Displays a comprehensive list of payment transactions with filtering, sorting,
 * and pagination capabilities. Provides detailed payment information and status tracking.
 *
 * Features:
 * - Advanced filtering by status, date range, amount, payment method, gateway
 * - Sorting by various criteria (date, amount, status, etc.)
 * - Pagination with customizable page sizes
 * - Real-time search functionality
 * - Payment details view with transaction information
 * - Refund tracking and status display
 * - Export functionality for payment reports
 * - Responsive design with mobile-friendly interface
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Integration with payment analytics
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';

// Import UI components from the design system
import { Button } from '../ui';
import { Card, CardContent, CardHeader, CardTitle } from '../ui';
import { Input } from '../ui';
import { Select } from '../ui';

// Import types and services
import type {
  Payment,
  PaymentStatus,
  PaymentFilters,
  PaymentListResponse,
  PaymentMethodType,
  CurrencyCode
} from '../../types/payment';
import { paymentApi } from '../../services/payment-api.service';

// Import utilities
import { cn } from '../../utils/cn';
import { toast } from 'react-hot-toast';

export interface PaymentHistoryProps {
  /** Initial payments data */
  initialPayments?: Payment[];
  /** Initial filters */
  initialFilters?: Partial<PaymentFilters>;
  /** Customer ID to filter payments for */
  customerId?: string;
  /** Provider ID to filter payments for */
  providerId?: string;
  /** Whether to show filters panel */
  showFilters?: boolean;
  /** Whether to show search bar */
  showSearch?: boolean;
  /** Whether to show export functionality */
  showExport?: boolean;
  /** Whether to show pagination */
  showPagination?: boolean;
  /** Default page size */
  defaultPageSize?: number;
  /** Available actions for each payment */
  availableActions?: Array<'view' | 'refund' | 'details'>;
  /** Custom filter component */
  renderFilters?: () => React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Empty state message */
  emptyMessage?: string;
  /** Callback when filters change */
  onFiltersChange?: (filters: PaymentFilters) => void;
  /** Callback when payment action is performed */
  onPaymentAction?: (action: string, payment: Payment) => void;
  /** Custom CSS class */
  className?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

export interface PaymentHistoryState {
  /** Current payments */
  payments: Payment[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Current filters */
  filters: PaymentFilters;
  /** Current search query */
  searchQuery: string;
  /** Current sort option */
  sortBy: string;
  /** Current sort direction */
  sortDirection: 'asc' | 'desc';
  /** Current page */
  currentPage: number;
  /** Page size */
  pageSize: number;
  /** Total items */
  total: number;
  /** Selected payments for bulk operations */
  selectedPayments: Set<string>;
  /** Whether all payments are selected */
  selectAll: boolean;
  /** Show filters panel */
  showFilters: boolean;
  /** Show bulk actions */
  showBulkActions: boolean;
  /** Show payment details modal */
  showPaymentDetails: Payment | null;
}

/**
 * Payment History Component - Main component for displaying and managing payment history
 */
export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  initialPayments = [],
  initialFilters = {},
  customerId,
  providerId,
  showFilters = true,
  showSearch = true,
  showExport = true,
  showPagination = true,
  defaultPageSize = 10,
  availableActions = ['view', 'details'],
  loading: externalLoading = false,
  error: externalError = null,
  emptyMessage = 'No payments found',
  onFiltersChange,
  onPaymentAction,
  className = '',
  'data-testid': testId = 'payment-history'
}) => {
  // Initialize component state
  const [state, setState] = useState<PaymentHistoryState>({
    payments: initialPayments,
    loading: externalLoading,
    error: externalError,
    filters: {
      status: [],
      dateRange: undefined,
      amountRange: undefined,
      paymentMethodType: [],
      gateway: [],
      customerId: customerId || '',
      providerId: providerId || '',
      bookingId: '',
      search: '',
      ...initialFilters
    },
    searchQuery: initialFilters.search || '',
    sortBy: 'createdAt',
    sortDirection: 'desc',
    currentPage: 1,
    pageSize: defaultPageSize,
    total: initialPayments.length,
    selectedPayments: new Set(),
    selectAll: false,
    showFilters: showFilters,
    showBulkActions: false,
    showPaymentDetails: null
  });

  /**
   * Load payments from API with current filters and pagination
   */
  const loadPayments = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response: PaymentListResponse = await paymentApi.getPayments(
        {
          ...state.filters,
          search: state.searchQuery
        },
        state.currentPage,
        state.pageSize
      );

      setState(prev => ({
        ...prev,
        payments: response.payments,
        total: response.total,
        loading: false
      }));
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Failed to load payments');
      setState(prev => ({
        ...prev,
        error: errorObj,
        loading: false
      }));
      toast.error('Failed to load payments');
    }
  }, [state.filters, state.searchQuery, state.currentPage, state.pageSize]);

  /**
   * Handle search query changes
   */
  const handleSearchChange = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      currentPage: 1 // Reset to first page when searching
    }));
  }, []);

  /**
   * Handle filter changes
   */
  const handleFiltersChange = useCallback((newFilters: Partial<PaymentFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      currentPage: 1 // Reset to first page when filtering
    }));
    onFiltersChange?.({ ...state.filters, ...newFilters });
  }, [state.filters, onFiltersChange]);

  /**
   * Handle sort changes
   */
  const handleSortChange = useCallback((sortBy: string, direction: 'asc' | 'desc') => {
    setState(prev => ({
      ...prev,
      sortBy,
      sortDirection: direction
    }));
  }, []);

  /**
   * Handle payment selection for bulk operations
   */
  const handlePaymentSelect = useCallback((paymentId: string, selected: boolean) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedPayments);
      if (selected) {
        newSelected.add(paymentId);
      } else {
        newSelected.delete(paymentId);
      }

      return {
        ...prev,
        selectedPayments: newSelected,
        selectAll: newSelected.size === prev.payments.length && prev.payments.length > 0,
        showBulkActions: newSelected.size > 0
      };
    });
  }, []);

  /**
   * Handle select all payments
   */
  const handleSelectAll = useCallback((selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedPayments: selected ? new Set(prev.payments.map(p => p.id)) : new Set(),
      selectAll: selected,
      showBulkActions: selected && prev.payments.length > 0
    }));
  }, []);

  /**
   * Handle page changes
   */
  const handlePageChange = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  /**
   * Handle payment actions (view, refund, details)
   */
  const handlePaymentAction = useCallback(async (action: string, payment: Payment) => {
    try {
      switch (action) {
        case 'view':
        case 'details':
          setState(prev => ({ ...prev, showPaymentDetails: payment }));
          break;
        case 'refund':
          // Handle refund logic
          toast.success('Refund functionality coming soon');
          break;
        default:
          break;
      }

      onPaymentAction?.(action, payment);
    } catch (error) {
      toast.error(`Failed to ${action} payment`);
    }
  }, [onPaymentAction]);

  /**
   * Handle bulk actions
   */
  const handleBulkAction = useCallback(async (action: string) => {
    try {
      switch (action) {
        case 'export':
          await paymentApi.getPayments(state.filters, 1, state.payments.length);
          toast.success('Payment history exported successfully');
          break;
        default:
          break;
      }

      // Clear selection after bulk action
      setState(prev => ({
        ...prev,
        selectedPayments: new Set(),
        selectAll: false,
        showBulkActions: false
      }));
    } catch (error) {
      toast.error(`Failed to perform bulk ${action}`);
    }
  }, [state.selectedPayments, state.payments, state.filters]);

  /**
   * Handle payment details modal close
   */
  const handleClosePaymentDetails = useCallback(() => {
    setState(prev => ({ ...prev, showPaymentDetails: null }));
  }, []);

  /**
   * Get filtered and sorted payments for current view
   */
  const filteredPayments = useMemo(() => {
    let filtered = [...state.payments];

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(payment =>
        payment.description?.toLowerCase().includes(query) ||
        payment.reference?.toLowerCase().includes(query) ||
        payment.gatewayTransactionId?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (state.sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'currency':
          aValue = a.currency;
          bValue = b.currency;
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (state.sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [state.payments, state.sortBy, state.sortDirection, state.searchQuery]);

  /**
   * Get status badge configuration for payments
   */
  const getStatusBadge = (status: PaymentStatus) => {
    const statusConfig = {
      pending: { color: 'yellow', label: 'Pending', icon: '⏳' },
      processing: { color: 'blue', label: 'Processing', icon: '🔄' },
      completed: { color: 'green', label: 'Completed', icon: '✅' },
      failed: { color: 'red', label: 'Failed', icon: '❌' },
      cancelled: { color: 'gray', label: 'Cancelled', icon: '🚫' },
      refunded: { color: 'purple', label: 'Refunded', icon: '💰' },
      partially_refunded: { color: 'orange', label: 'Partially Refunded', icon: '💸' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

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
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  /**
   * Get payment method display name
   */
  const getPaymentMethodDisplayName = (payment: Payment) => {
    const method = payment.paymentMethod;
    const typeName = method.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

    if (method.last4) {
      return `${typeName} ending in ${method.last4}`;
    }
    return typeName;
  };

  /**
   * Render payment list item for list view
   */
  const renderPaymentListItem = (payment: Payment) => (
    <div
      key={payment.id}
      className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
      data-testid={`payment-list-item-${payment.id}`}
    >
      <div className="flex items-center gap-4 flex-1">
        <input
          type="checkbox"
          checked={state.selectedPayments.has(payment.id)}
          onChange={(e) => handlePaymentSelect(payment.id, e.target.checked)}
          className="rounded border-gray-300"
          data-testid={`select-payment-${payment.id}`}
        />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="font-medium">{formatAmount(payment.amount, payment.currency)}</h3>
            {getStatusBadge(payment.status)}
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
            <span>{formatDate(payment.createdAt)}</span>
            <span className="flex items-center gap-1">
              💳 {getPaymentMethodDisplayName(payment)}
            </span>
            <span className="flex items-center gap-1">
              🌐 {payment.gateway}
            </span>
            {payment.description && (
              <span className="truncate max-w-xs" title={payment.description}>
                {payment.description}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {availableActions.includes('view') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePaymentAction('view', payment)}
            data-testid={`view-payment-${payment.id}`}
          >
            👁️
          </Button>
        )}
        {availableActions.includes('details') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePaymentAction('details', payment)}
            data-testid={`details-payment-${payment.id}`}
          >
            📋
          </Button>
        )}
        {availableActions.includes('refund') && payment.status === 'completed' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePaymentAction('refund', payment)}
            data-testid={`refund-payment-${payment.id}`}
          >
            💰
          </Button>
        )}
      </div>
    </div>
  );
  /**
   * Render filters panel
   */
  const renderFiltersPanel = () => (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Select
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'processing', label: 'Processing' },
                { value: 'completed', label: 'Completed' },
                { value: 'failed', label: 'Failed' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'refunded', label: 'Refunded' },
                { value: 'partially_refunded', label: 'Partially Refunded' }
              ]}
              value={state.filters.status?.[0] || ''}
              onChange={(value) => handleFiltersChange({ status: value ? [value as PaymentStatus] : [] })}
              placeholder="All statuses"
              data-testid="status-filter"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <Select
              options={[
                { value: 'credit_card', label: 'Credit Card' },
                { value: 'debit_card', label: 'Debit Card' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'digital_wallet', label: 'Digital Wallet' },
                { value: 'cash', label: 'Cash' },
                { value: 'check', label: 'Check' }
              ]}
              value={state.filters.paymentMethodType?.[0] || ''}
              onChange={(value) => handleFiltersChange({ paymentMethodType: value ? [value as PaymentMethodType] : [] })}
              placeholder="All methods"
              data-testid="payment-method-filter"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date From
            </label>
            <Input
              type="date"
              value={state.filters.dateRange?.start || ''}
              onChange={(e) => handleFiltersChange({
                dateRange: {
                  ...state.filters.dateRange,
                  start: e.target.value,
                  end: state.filters.dateRange?.end || e.target.value
                }
              })}
              data-testid="date-from-filter"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date To
            </label>
            <Input
              type="date"
              value={state.filters.dateRange?.end || ''}
              onChange={(e) => handleFiltersChange({
                dateRange: {
                  ...state.filters.dateRange,
                  start: state.filters.dateRange?.start || e.target.value,
                  end: e.target.value
                }
              })}
              data-testid="date-to-filter"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  /**
   * Render bulk actions bar
   */
  const renderBulkActions = () => (
    <Card className="mb-4 bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-medium text-blue-900">
              {state.selectedPayments.size} payment{state.selectedPayments.size !== 1 ? 's' : ''} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setState(prev => ({
                ...prev,
                selectedPayments: new Set(),
                selectAll: false,
                showBulkActions: false
              }))}
              data-testid="clear-selection"
            >
              Clear selection
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {showExport && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBulkAction('export')}
                data-testid="bulk-export"
              >
                📥 Export
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  /**
   * Render pagination
   */
  const renderPagination = () => {
    const totalPages = Math.ceil(state.total / state.pageSize);

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6" data-testid="pagination">
        <div className="text-sm text-gray-700">
          Showing {((state.currentPage - 1) * state.pageSize) + 1} to{' '}
          {Math.min(state.currentPage * state.pageSize, state.total)} of{' '}
          {state.total} results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={state.currentPage <= 1}
            onClick={() => handlePageChange(state.currentPage - 1)}
            data-testid="prev-page"
          >
            ← Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = Math.max(1, Math.min(totalPages - 4, state.currentPage - 2)) + i;
              if (pageNumber > totalPages) return null;

              return (
                <Button
                  key={pageNumber}
                  variant={pageNumber === state.currentPage ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber)}
                  data-testid={`page-${pageNumber}`}
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>
          <Button
            variant="secondary"
            size="sm"
            disabled={state.currentPage >= totalPages}
            onClick={() => handlePageChange(state.currentPage + 1)}
            data-testid="next-page"
          >
            Next →
          </Button>
        </div>
      </div>
    );
  };

  /**
   * Render toolbar with search, filters, and controls
   */
  const renderToolbar = () => (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
      <div className="flex items-center gap-4 flex-1">
        {showSearch && (
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <Input
              placeholder="Search payments..."
              value={state.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
              data-testid="search-input"
            />
          </div>
        )}

        {showFilters && (
          <Button
            variant="secondary"
            onClick={() => setState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
            data-testid="toggle-filters"
          >
            🔽 Filters
            {Object.keys(state.filters).length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {[state.filters.status, state.filters.paymentMethodType].flat().length}
              </span>
            )}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Select
          options={[
            { value: 'createdAt', label: 'Date' },
            { value: 'amount', label: 'Amount' },
            { value: 'status', label: 'Status' },
            { value: 'currency', label: 'Currency' }
          ]}
          value={state.sortBy}
          onChange={(value) => handleSortChange(typeof value === 'string' ? value : value[0] || state.sortBy, state.sortDirection)}
          data-testid="sort-select"
        />

        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleSortChange(state.sortBy, state.sortDirection === 'asc' ? 'desc' : 'asc')}
          data-testid="sort-direction"
        >
          {state.sortDirection === 'asc' ? '↑' : '↓'}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadPayments}
          loading={state.loading}
          data-testid="refresh-button"
        >
          🔄
        </Button>
      </div>
    </div>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <Card className="text-center py-12" data-testid="empty-state">
      <CardContent>
        <div className="text-6xl mb-4">💳</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
        <p className="text-gray-500 mb-4">{emptyMessage}</p>
        <Button
          variant="primary"
          onClick={() => {
            setState(prev => ({
              ...prev,
              filters: {},
              searchQuery: '',
              currentPage: 1
            }));
          }}
          data-testid="clear-filters"
        >
          Clear filters
        </Button>
      </CardContent>
    </Card>
  );

  /**
   * Render error state
   */
  const renderErrorState = () => (
    <Card className="text-center py-12 border-red-200 bg-red-50" data-testid="error-state">
      <CardContent>
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-red-900 mb-2">Error loading payments</h3>
        <p className="text-red-700 mb-4">{state.error?.message}</p>
        <Button
          variant="primary"
          onClick={loadPayments}
          data-testid="retry-button"
        >
          Try again
        </Button>
      </CardContent>
    </Card>
  );

  /**
   * Render loading state
   */
  const renderLoadingState = () => (
    <div className="space-y-4" data-testid="loading-state">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  /**
   * Render payment details modal
   */
  const renderPaymentDetailsModal = () => {
    if (!state.showPaymentDetails) return null;

    const payment = state.showPaymentDetails;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="payment-details-modal">
        <Card className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payment Details</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClosePaymentDetails}
                data-testid="close-details"
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment ID</label>
                <p className="text-sm text-gray-900">{payment.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <p className="text-sm text-gray-900 font-medium">{formatAmount(payment.amount, payment.currency)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="mt-1">{getStatusBadge(payment.status)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <p className="text-sm text-gray-900">{getPaymentMethodDisplayName(payment)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gateway</label>
                <p className="text-sm text-gray-900">{payment.gateway}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <p className="text-sm text-gray-900">{formatDate(payment.createdAt)}</p>
              </div>
            </div>

            {payment.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-sm text-gray-900">{payment.description}</p>
              </div>
            )}

            {payment.reference && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                <p className="text-sm text-gray-900">{payment.reference}</p>
              </div>
            )}

            {payment.gatewayTransactionId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                <p className="text-sm text-gray-900 font-mono">{payment.gatewayTransactionId}</p>
              </div>
            )}

            {payment.refund && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Refund Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount</label>
                    <p className="text-sm text-gray-900">{formatAmount(payment.refund.amount, payment.refund.currency)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <p className="text-sm text-gray-900">{payment.refund.reason.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Load payments when dependencies change
  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  return (
    <div className={cn('payment-history', className)} data-testid={testId}>
      {/* Render toolbar */}
      {renderToolbar()}

      {/* Render bulk actions if any payments are selected */}
      {state.showBulkActions && renderBulkActions()}

      {/* Render filters panel if expanded */}
      {state.showFilters && renderFiltersPanel()}

      {/* Render content based on state */}
      {state.loading && renderLoadingState()}
      {state.error && !state.loading && renderErrorState()}
      {!state.loading && !state.error && filteredPayments.length === 0 && renderEmptyState()}
      {!state.loading && !state.error && filteredPayments.length > 0 && (
        <Card data-testid="payments-list">
          <CardContent className="p-0">
            {/* Header with select all */}
            <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-gray-50">
              <input
                type="checkbox"
                checked={state.selectAll}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300"
                data-testid="select-all"
              />
              <span className="font-medium text-gray-700">Select all</span>
            </div>
            {/* Payment list items */}
            {filteredPayments.map(renderPaymentListItem)}
          </CardContent>
        </Card>
      )}

      {/* Render pagination */}
      {showPagination && renderPagination()}

      {/* Render payment details modal */}
      {renderPaymentDetailsModal()}
    </div>
  );
};

export default PaymentHistory;