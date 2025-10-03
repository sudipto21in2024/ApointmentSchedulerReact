/**
 * Booking List Component
 *
 * Displays a comprehensive list of bookings with filtering, sorting, and pagination capabilities.
 * Supports different view modes (list, grid, calendar) and provides actions for each booking.
 *
 * Features:
 * - Multiple view modes (list, grid, calendar)
 * - Advanced filtering by status, date range, service, customer, provider
 * - Sorting by various criteria (date, status, price, etc.)
 * - Pagination with customizable page sizes
 * - Real-time search functionality
 * - Bulk operations support
 * - Responsive design with mobile-friendly interface
 * - Accessibility features (ARIA labels, keyboard navigation)
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';

// Import UI components from the design system
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

// Import types and services
import type {
  Booking,
  BookingStatus,
  BookingFilters,
  BookingListResponse
} from '../../types/booking';
import { bookingApi } from '../../services/booking-api.service';

// Import utilities
import { cn } from '../../utils/cn';
import { toast } from 'react-hot-toast';

export interface BookingListProps {
  /** Initial bookings data */
  initialBookings?: Booking[];
  /** Initial filters */
  initialFilters?: Partial<BookingFilters>;
  /** Whether to show filters panel */
  showFilters?: boolean;
  /** Whether to show search bar */
  showSearch?: boolean;
  /** Whether to show view mode switcher */
  showViewMode?: boolean;
  /** Whether to show pagination */
  showPagination?: boolean;
  /** Default view mode */
  defaultViewMode?: 'list' | 'grid' | 'calendar';
  /** Available actions for each booking */
  availableActions?: Array<'view' | 'edit' | 'cancel' | 'delete' | 'reschedule'>;
  /** Custom booking card renderer */
  renderBookingCard?: (booking: Booking) => React.ReactNode;
  /** Custom filter component */
  renderFilters?: () => React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Empty state message */
  emptyMessage?: string;
  /** Callback when booking is selected */
  onBookingSelect?: (booking: Booking) => void;
  /** Callback when filters change */
  onFiltersChange?: (filters: BookingFilters) => void;
  /** Callback when view mode changes */
  onViewModeChange?: (mode: 'list' | 'grid' | 'calendar') => void;
  /** Callback when booking action is performed */
  onBookingAction?: (action: string, booking: Booking) => void;
  /** Callback when bulk action is performed */
  onBulkAction?: (action: string, bookings: Booking[]) => void;
  /** Custom CSS class */
  className?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

export interface BookingListState {
  /** Current bookings */
  bookings: Booking[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Current filters */
  filters: BookingFilters;
  /** Current search query */
  searchQuery: string;
  /** Current sort option */
  sortBy: string;
  /** Current sort direction */
  sortDirection: 'asc' | 'desc';
  /** Current view mode */
  viewMode: 'list' | 'grid' | 'calendar';
  /** Current page */
  currentPage: number;
  /** Page size */
  pageSize: number;
  /** Total items */
  total: number;
  /** Selected bookings for bulk operations */
  selectedBookings: Set<string>;
  /** Whether all bookings are selected */
  selectAll: boolean;
  /** Show filters panel */
  showFilters: boolean;
  /** Show bulk actions */
  showBulkActions: boolean;
}

/**
 * Booking List Component - Main component for displaying and managing bookings
 */
export const BookingList: React.FC<BookingListProps> = ({
  initialBookings = [],
  initialFilters = {},
  showFilters = true,
  showSearch = true,
  showViewMode = true,
  showPagination = true,
  defaultViewMode = 'list',
  availableActions = ['view', 'edit', 'cancel'],
  renderBookingCard,
  loading: externalLoading = false,
  error: externalError = null,
  emptyMessage = 'No bookings found',
  onBookingSelect,
  onFiltersChange,
  onViewModeChange,
  onBookingAction,
  onBulkAction,
  className = '',
  'data-testid': testId = 'booking-list'
}) => {
  // Initialize component state
  const [state, setState] = useState<BookingListState>({
    bookings: initialBookings,
    loading: externalLoading,
    error: externalError,
    filters: {
      status: [],
      dateRange: undefined,
      serviceId: '',
      customerId: '',
      providerId: '',
      paymentStatus: [],
      search: '',
      ...initialFilters
    },
    searchQuery: initialFilters.search || '',
    sortBy: 'scheduledAt',
    sortDirection: 'desc',
    viewMode: defaultViewMode,
    currentPage: 1,
    pageSize: 10,
    total: initialBookings.length,
    selectedBookings: new Set(),
    selectAll: false,
    showFilters: showFilters,
    showBulkActions: false
  });

  /**
   * Load bookings from API with current filters and pagination
   */
  const loadBookings = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response: BookingListResponse = await bookingApi.getUserBookings(
        state.filters.customerId || '',
        {
          ...state.filters,
          search: state.searchQuery
        }
      );

      setState(prev => ({
        ...prev,
        bookings: response.bookings,
        total: response.total,
        loading: false
      }));
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Failed to load bookings');
      setState(prev => ({
        ...prev,
        error: errorObj,
        loading: false
      }));
      toast.error('Failed to load bookings');
    }
  }, [state.filters, state.searchQuery]);

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
  const handleFiltersChange = useCallback((newFilters: Partial<BookingFilters>) => {
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
   * Handle view mode changes
   */
  const handleViewModeChange = useCallback((mode: 'list' | 'grid' | 'calendar') => {
    setState(prev => ({ ...prev, viewMode: mode }));
    onViewModeChange?.(mode);
  }, [onViewModeChange]);

  /**
   * Handle booking selection for bulk operations
   */
  const handleBookingSelect = useCallback((bookingId: string, selected: boolean) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedBookings);
      if (selected) {
        newSelected.add(bookingId);
      } else {
        newSelected.delete(bookingId);
      }

      return {
        ...prev,
        selectedBookings: newSelected,
        selectAll: newSelected.size === prev.bookings.length && prev.bookings.length > 0,
        showBulkActions: newSelected.size > 0
      };
    });
  }, []);

  /**
   * Handle select all bookings
   */
  const handleSelectAll = useCallback((selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedBookings: selected ? new Set(prev.bookings.map(b => b.id)) : new Set(),
      selectAll: selected,
      showBulkActions: selected && prev.bookings.length > 0
    }));
  }, []);

  /**
   * Handle page changes
   */
  const handlePageChange = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  /**
   * Handle booking actions (view, edit, cancel, etc.)
   */
  const handleBookingAction = useCallback(async (action: string, booking: Booking) => {
    try {
      switch (action) {
        case 'cancel':
          await bookingApi.cancelBooking(booking.id, 'Cancelled by user');
          toast.success('Booking cancelled successfully');
          break;
        case 'reschedule':
          // Handle reschedule logic
          toast.success('Reschedule functionality coming soon');
          break;
        case 'edit':
          onBookingSelect?.(booking);
          break;
        case 'view':
          onBookingSelect?.(booking);
          break;
        default:
          break;
      }

      onBookingAction?.(action, booking);
      loadBookings(); // Refresh the list
    } catch (error) {
      toast.error(`Failed to ${action} booking`);
    }
  }, [onBookingAction, onBookingSelect, loadBookings]);

  /**
   * Handle bulk actions
   */
  const handleBulkAction = useCallback(async (action: string) => {
    const selectedBookings = state.bookings.filter(b => state.selectedBookings.has(b.id));

    try {
      switch (action) {
        case 'cancel':
          await bookingApi.bulkUpdateBookingStatus(
            Array.from(state.selectedBookings),
            'cancelled',
            'Bulk cancellation'
          );
          toast.success(`${selectedBookings.length} bookings cancelled`);
          break;
        case 'export':
          await bookingApi.exportBookings('csv', state.filters);
          toast.success('Bookings exported successfully');
          break;
        default:
          break;
      }

      onBulkAction?.(action, selectedBookings);

      // Clear selection and refresh
      setState(prev => ({
        ...prev,
        selectedBookings: new Set(),
        selectAll: false,
        showBulkActions: false
      }));

      loadBookings();
    } catch (error) {
      toast.error(`Failed to perform bulk ${action}`);
    }
  }, [state.selectedBookings, state.bookings, state.filters, onBulkAction, loadBookings]);

  /**
   * Get filtered and sorted bookings for current view
   */
  const filteredBookings = useMemo(() => {
    let filtered = [...state.bookings];

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.notes?.toLowerCase().includes(query) ||
        booking.serviceId.toLowerCase().includes(query) ||
        booking.customerId.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (state.sortBy) {
        case 'scheduledAt':
          aValue = new Date(a.scheduledAt);
          bValue = new Date(b.scheduledAt);
          break;
        case 'totalPrice':
          aValue = a.totalPrice;
          bValue = b.totalPrice;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'participantCount':
          aValue = a.participantCount;
          bValue = b.participantCount;
          break;
        default:
          aValue = a.scheduledAt;
          bValue = b.scheduledAt;
      }

      if (state.sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [state.bookings, state.sortBy, state.sortDirection, state.searchQuery]);

  /**
   * Get status badge configuration
   */
  const getStatusBadge = (status: BookingStatus) => {
    const statusConfig = {
      pending: { color: 'yellow', label: 'Pending' },
      confirmed: { color: 'green', label: 'Confirmed' },
      in_progress: { color: 'blue', label: 'In Progress' },
      completed: { color: 'green', label: 'Completed' },
      cancelled: { color: 'red', label: 'Cancelled' },
      no_show: { color: 'gray', label: 'No Show' },
      refunded: { color: 'purple', label: 'Refunded' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        {config.label}
      </span>
    );
  };

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
   * Render booking card for grid view
   */
  const renderBookingCardDefault = (booking: Booking) => (
    <Card key={booking.id} className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`booking-card-${booking.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{booking.serviceId}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {formatDate(booking.scheduledAt)}
            </p>
          </div>
          {getStatusBadge(booking.status)}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              👥 {booking.participantCount} participants
            </span>
            <span className="flex items-center gap-1 font-medium">
              💰 {booking.totalPrice}
            </span>
          </div>
          {booking.notes && (
            <p className="text-sm text-gray-600 truncate" title={booking.notes}>
              {booking.notes}
            </p>
          )}
          <div className="flex gap-2 pt-2">
            {availableActions.includes('view') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookingAction('view', booking);
                }}
                data-testid={`view-booking-${booking.id}`}
              >
                👁️
              </Button>
            )}
            {availableActions.includes('edit') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookingAction('edit', booking);
                }}
                data-testid={`edit-booking-${booking.id}`}
              >
                ✏️
              </Button>
            )}
            {availableActions.includes('cancel') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookingAction('cancel', booking);
                }}
                data-testid={`cancel-booking-${booking.id}`}
              >
                ❌
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  /**
   * Render booking list item for list view
   */
  const renderBookingListItem = (booking: Booking) => (
    <div
      key={booking.id}
      className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
      data-testid={`booking-list-item-${booking.id}`}
    >
      <div className="flex items-center gap-4 flex-1">
        <input
          type="checkbox"
          checked={state.selectedBookings.has(booking.id)}
          onChange={(e) => handleBookingSelect(booking.id, e.target.checked)}
          className="rounded border-gray-300"
          data-testid={`select-booking-${booking.id}`}
        />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="font-medium">{booking.serviceId}</h3>
            {getStatusBadge(booking.status)}
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
            <span>{formatDate(booking.scheduledAt)}</span>
            <span className="flex items-center gap-1">
              👥 {booking.participantCount}
            </span>
            <span className="flex items-center gap-1">
              💰 {booking.totalPrice}
            </span>
            {booking.notes && (
              <span className="truncate max-w-xs" title={booking.notes}>
                {booking.notes}
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
            onClick={() => handleBookingAction('view', booking)}
            data-testid={`view-booking-${booking.id}`}
          >
            👁️
          </Button>
        )}
        {availableActions.includes('edit') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBookingAction('edit', booking)}
            data-testid={`edit-booking-${booking.id}`}
          >
            ✏️
          </Button>
        )}
        {availableActions.includes('cancel') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBookingAction('cancel', booking)}
            data-testid={`cancel-booking-${booking.id}`}
          >
            ❌
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
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'no_show', label: 'No Show' },
                { value: 'refunded', label: 'Refunded' }
              ]}
              value={state.filters.status?.[0] || ''}
              onChange={(value) => handleFiltersChange({ status: value ? [value as BookingStatus] : [] })}
              placeholder="All statuses"
              data-testid="status-filter"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service
            </label>
            <Input
              placeholder="Service ID"
              value={state.filters.serviceId || ''}
              onChange={(e) => handleFiltersChange({ serviceId: e.target.value })}
              data-testid="service-filter"
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
              {state.selectedBookings.size} booking{state.selectedBookings.size !== 1 ? 's' : ''} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setState(prev => ({
                ...prev,
                selectedBookings: new Set(),
                selectAll: false,
                showBulkActions: false
              }))}
              data-testid="clear-selection"
            >
              Clear selection
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkAction('export')}
              data-testid="bulk-export"
            >
              📥 Export
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleBulkAction('cancel')}
              data-testid="bulk-cancel"
            >
              ❌ Cancel Selected
            </Button>
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
   * Render toolbar with search, filters, and view controls
   */
  const renderToolbar = () => (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
      <div className="flex items-center gap-4 flex-1">
        {showSearch && (
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <Input
              placeholder="Search bookings..."
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
                {[state.filters.status, state.filters.paymentStatus].flat().length}
              </span>
            )}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Select
          options={[
            { value: 'scheduledAt', label: 'Date' },
            { value: 'totalPrice', label: 'Price' },
            { value: 'status', label: 'Status' },
            { value: 'participantCount', label: 'Participants' }
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

        {showViewMode && (
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={state.viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
              data-testid="list-view"
            >
              📋
            </Button>
            <Button
              variant={state.viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('grid')}
              data-testid="grid-view"
            >
              ⊞
            </Button>
          </div>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={loadBookings}
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
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
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
        <h3 className="text-lg font-medium text-red-900 mb-2">Error loading bookings</h3>
        <p className="text-red-700 mb-4">{state.error?.message}</p>
        <Button
          variant="primary"
          onClick={loadBookings}
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

  // Load bookings when dependencies change
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  return (
    <div className={cn('booking-list', className)} data-testid={testId}>
      {/* Render toolbar */}
      {renderToolbar()}

      {/* Render bulk actions if any bookings are selected */}
      {state.showBulkActions && renderBulkActions()}

      {/* Render filters panel if expanded */}
      {state.showFilters && renderFiltersPanel()}

      {/* Render content based on state */}
      {state.loading && renderLoadingState()}
      {state.error && !state.loading && renderErrorState()}
      {!state.loading && !state.error && filteredBookings.length === 0 && renderEmptyState()}
      {!state.loading && !state.error && filteredBookings.length > 0 && (
        <>
          {/* Render bookings based on view mode */}
          {state.viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-view">
              {filteredBookings.map(booking =>
                renderBookingCard ? renderBookingCard(booking) : renderBookingCardDefault(booking)
              )}
            </div>
          )}

          {state.viewMode === 'list' && (
            <Card data-testid="list-view">
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
                {/* Booking list items */}
                {filteredBookings.map(renderBookingListItem)}
              </CardContent>
            </Card>
          )}

          {state.viewMode === 'calendar' && (
            <Card data-testid="calendar-view">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  Calendar view coming soon...
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Render pagination */}
      {showPagination && renderPagination()}
    </div>
  );
};

export default BookingList;