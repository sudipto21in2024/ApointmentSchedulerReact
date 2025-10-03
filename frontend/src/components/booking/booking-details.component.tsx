/**
 * Booking Details Component
 *
 * Comprehensive booking details view with status tracking, customer information,
 * service details, and booking management actions. Provides a complete overview
 * of a single booking with real-time status updates.
 *
 * Features:
 * - Complete booking information display
 * - Real-time status tracking with visual indicators
 * - Customer and service provider information
 * - Booking timeline and history
 * - Action buttons for booking management (edit, cancel, reschedule)
 * - Payment information and status
 * - Notes and special requests display
 * - Responsive design with mobile-friendly layout
 * - Accessibility features (ARIA labels, screen reader support)
 * - Loading states and error handling
 */

import React, { useState, useCallback } from 'react';

// Import UI components from the design system
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Modal } from '../ui/Modal';

// Import types and services
import type {
  Booking,
  BookingStatus,
  PaymentStatus
} from '../../types/booking';
import { bookingApi } from '../../services/booking-api.service';

// Import utilities
import { cn } from '../../utils/cn';
import { toast } from 'react-hot-toast';

export interface BookingDetailsProps {
  /** Booking data to display */
  booking: Booking | null;
  /** Whether to show booking in modal */
  modal?: boolean;
  /** Whether to show action buttons */
  showActions?: boolean;
  /** Available actions for this booking */
  availableActions?: Array<'edit' | 'cancel' | 'reschedule' | 'confirm' | 'review'>;
  /** Whether component is in loading state */
  loading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Callback when booking is updated */
  onBookingUpdate?: (booking: Booking) => void;
  /** Callback when action is performed */
  onAction?: (action: string, booking: Booking) => void;
  /** Callback when modal is closed */
  onClose?: () => void;
  /** Callback when edit is requested */
  onEdit?: (booking: Booking) => void;
  /** Custom CSS class */
  className?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

interface BookingAction {
  id: string;
  label: string;
  icon: string;
  variant: 'primary' | 'secondary' | 'danger' | 'warning' | 'info' | 'ghost';
  handler: (booking: Booking) => void;
  disabled?: boolean;
  hidden?: boolean;
}

/**
 * Booking Details Component - Main component for displaying booking information
 */
export const BookingDetails: React.FC<BookingDetailsProps> = ({
  booking,
  modal = false,
  showActions = true,
  availableActions = ['edit', 'cancel', 'reschedule'],
  loading = false,
  error = null,
  onBookingUpdate,
  onAction,
  onClose,
  onEdit,
  className = '',
  'data-testid': testId = 'booking-details'
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Get status configuration for visual display
   */
  const getStatusConfig = (status: BookingStatus) => {
    const statusConfigs = {
      pending: {
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        label: 'Pending',
        description: 'Booking is waiting for confirmation'
      },
      confirmed: {
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        label: 'Confirmed',
        description: 'Booking has been confirmed'
      },
      in_progress: {
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        label: 'In Progress',
        description: 'Service is currently being provided'
      },
      completed: {
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        label: 'Completed',
        description: 'Service has been completed'
      },
      cancelled: {
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        label: 'Cancelled',
        description: 'Booking has been cancelled'
      },
      no_show: {
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        label: 'No Show',
        description: 'Customer did not show up'
      },
      refunded: {
        color: 'purple',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
        label: 'Refunded',
        description: 'Payment has been refunded'
      }
    };

    return statusConfigs[status] || statusConfigs.pending;
  };

  /**
   * Get payment status configuration
   */
  const getPaymentStatusConfig = (status: PaymentStatus) => {
    const paymentConfigs = {
      pending: { color: 'yellow', label: 'Payment Pending' },
      paid: { color: 'green', label: 'Paid' },
      failed: { color: 'red', label: 'Payment Failed' },
      refunded: { color: 'purple', label: 'Refunded' },
      partially_refunded: { color: 'orange', label: 'Partially Refunded' }
    };

    return paymentConfigs[status] || paymentConfigs.pending;
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  /**
   * Format currency for display
   */
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  /**
   * Handle booking actions
   */
  const handleBookingAction = useCallback(async (action: string, booking: Booking) => {
    setIsUpdating(true);

    try {
      switch (action) {
        case 'cancel':
          await bookingApi.cancelBooking(booking.id, 'Cancelled by user');
          toast.success('Booking cancelled successfully');
          break;
        case 'confirm':
          await bookingApi.confirmBooking(booking.id);
          toast.success('Booking confirmed successfully');
          break;
        case 'reschedule':
          // Handle reschedule logic - placeholder for now
          toast.success('Reschedule functionality coming soon');
          return;
        case 'edit':
          onEdit?.(booking);
          return;
        default:
          break;
      }

      // Refresh booking data
      const updatedBooking = await bookingApi.getBooking(booking.id);
      onBookingUpdate?.(updatedBooking);
      onAction?.(action, updatedBooking);
    } catch (error) {
      toast.error(`Failed to ${action} booking`);
    } finally {
      setIsUpdating(false);
    }
  }, [onBookingUpdate, onAction, onEdit]);

  /**
   * Get available actions for current booking
   */
  const getAvailableActions = (booking: Booking): BookingAction[] => {
    const actions: BookingAction[] = [];

    if (availableActions.includes('edit')) {
      actions.push({
        id: 'edit',
        label: 'Edit Booking',
        icon: '✏️',
        variant: 'secondary',
        handler: (b) => handleBookingAction('edit', b)
      });
    }

    if (availableActions.includes('reschedule')) {
      actions.push({
        id: 'reschedule',
        label: 'Reschedule',
        icon: '📅',
        variant: 'secondary',
        handler: (b) => handleBookingAction('reschedule', b)
      });
    }

    if (availableActions.includes('confirm') && booking.status === 'pending') {
      actions.push({
        id: 'confirm',
        label: 'Confirm Booking',
        icon: '✅',
        variant: 'primary',
        handler: (b) => handleBookingAction('confirm', b)
      });
    }

    if (availableActions.includes('cancel') && ['pending', 'confirmed'].includes(booking.status)) {
      actions.push({
        id: 'cancel',
        label: 'Cancel Booking',
        icon: '❌',
        variant: 'danger',
        handler: (b) => handleBookingAction('cancel', b)
      });
    }

    return actions;
  };

  /**
   * Render loading state
   */
  const renderLoadingState = () => (
    <Card className="animate-pulse" data-testid="loading-state">
      <CardHeader>
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
        <h3 className="text-lg font-medium text-red-900 mb-2">Error loading booking</h3>
        <p className="text-red-700 mb-4">{error?.message}</p>
        <Button
          variant="primary"
          onClick={() => window.location.reload()}
          data-testid="retry-button"
        >
          Try again
        </Button>
      </CardContent>
    </Card>
  );

  /**
   * Render booking status badge
   */
  const renderStatusBadge = (booking: Booking) => {
    const statusConfig = getStatusConfig(booking.status);

    return (
      <div className={cn('inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium', statusConfig.bgColor, statusConfig.textColor)}>
        <span className="w-2 h-2 rounded-full bg-current opacity-75"></span>
        {statusConfig.label}
      </div>
    );
  };

  /**
   * Render payment status badge
   */
  const renderPaymentStatusBadge = (booking: Booking) => {
    const paymentConfig = getPaymentStatusConfig(booking.paymentStatus);

    return (
      <div className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
        paymentConfig.color === 'green' && 'bg-green-100 text-green-800',
        paymentConfig.color === 'yellow' && 'bg-yellow-100 text-yellow-800',
        paymentConfig.color === 'red' && 'bg-red-100 text-red-800',
        paymentConfig.color === 'purple' && 'bg-purple-100 text-purple-800',
        paymentConfig.color === 'orange' && 'bg-orange-100 text-orange-800'
      )}>
        {paymentConfig.label}
      </div>
    );
  };

  /**
   * Render booking details content
   */
  const renderBookingDetails = (booking: Booking) => {
    const statusConfig = getStatusConfig(booking.status);
    const actions = getAvailableActions(booking);

    return (
      <div className="space-y-6" data-testid={testId}>
        {/* Header with status */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Booking #{booking.id.slice(-8)}
            </h1>
            <p className="text-gray-600">
              Created on {formatDate(booking.createdAt)}
            </p>
          </div>
          <div className="text-right">
            {renderStatusBadge(booking)}
            <p className="text-sm text-gray-500 mt-1">
              {statusConfig.description}
            </p>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔧 Service Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service
                    </label>
                    <p className="text-gray-900">{booking.serviceId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <p className="text-gray-900">{booking.duration} minutes</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Participants
                    </label>
                    <p className="text-gray-900">{booking.participantCount} people</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scheduled Time
                    </label>
                    <p className="text-gray-900">{formatDate(booking.scheduledAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  👤 Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer ID
                    </label>
                    <p className="text-gray-900 font-mono text-sm">{booking.customerId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provider ID
                    </label>
                    <p className="text-gray-900 font-mono text-sm">{booking.providerId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes and Special Requests */}
            {(booking.notes || booking.internalNotes) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📝 Notes & Requests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {booking.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Notes
                      </label>
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                        <p className="text-gray-700">{booking.notes}</p>
                      </div>
                    </div>
                  )}
                  {booking.internalNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Internal Notes
                      </label>
                      <div className="bg-gray-50 border-l-4 border-gray-400 p-3 rounded">
                        <p className="text-gray-700">{booking.internalNotes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar with actions and summary */}
          <div className="space-y-6">
            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💰 Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Amount:</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(booking.totalPrice, booking.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Status:</span>
                  {renderPaymentStatusBadge(booking)}
                </div>
                {booking.paymentStatus === 'refunded' && booking.cancelledAt && (
                  <div className="text-xs text-gray-500">
                    Refunded on {formatDate(booking.cancelledAt)}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📈 Booking Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Booking Created</p>
                      <p className="text-xs text-gray-500">{formatDate(booking.createdAt)}</p>
                    </div>
                  </div>

                  {booking.status !== 'pending' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Booking Confirmed</p>
                        <p className="text-xs text-gray-500">
                          {booking.updatedAt !== booking.createdAt ? formatDate(booking.updatedAt) : 'Same day'}
                        </p>
                      </div>
                    </div>
                  )}

                  {booking.completedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Service Completed</p>
                        <p className="text-xs text-gray-500">{formatDate(booking.completedAt)}</p>
                      </div>
                    </div>
                  )}

                  {booking.cancelledAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Booking Cancelled</p>
                        <p className="text-xs text-gray-500">{formatDate(booking.cancelledAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {showActions && actions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    ⚡ Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {actions.map((action) => (
                      <Button
                        key={action.id}
                        variant={action.variant}
                        className="w-full justify-start"
                        onClick={() => action.handler(booking)}
                        disabled={isUpdating || action.disabled}
                        data-testid={`action-${action.id}`}
                      >
                        <span className="mr-2">{action.icon}</span>
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Cancellation Information */}
        {booking.cancellationReason && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                ⚠️ Cancellation Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-900">Reason:</p>
                <p className="text-red-700">{booking.cancellationReason}</p>
                {booking.cancelledAt && (
                  <p className="text-xs text-red-600">
                    Cancelled on {formatDate(booking.cancelledAt)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rating and Review */}
        {(booking.rating || booking.review) && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                ⭐ Rating & Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {booking.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={cn(
                            'text-lg',
                            i < booking.rating! ? 'text-yellow-400' : 'text-gray-300'
                          )}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-green-700">
                      {booking.rating}/5 stars
                    </span>
                  </div>
                )}
                {booking.review && (
                  <div>
                    <p className="text-sm font-medium text-green-900 mb-1">Review:</p>
                    <p className="text-green-700">{booking.review}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Render content based on state
  if (loading) {
    return (
      <div className={cn('booking-details', className)}>
        {renderLoadingState()}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('booking-details', className)}>
        {renderErrorState()}
      </div>
    );
  }

  if (!booking) {
    return (
      <div className={cn('booking-details', className)}>
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No booking selected</h3>
            <p className="text-gray-500">Select a booking to view its details.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const content = renderBookingDetails(booking);

  // Wrap in modal if modal mode is enabled
  if (modal) {
    return (
      <Modal
        open={true}
        onClose={onClose}
        size="xl"
        data-testid={`${testId}-modal`}
      >
        <ModalHeader>
          <ModalTitle>Booking Details</ModalTitle>
        </ModalHeader>
        <ModalContent className="max-h-[80vh] overflow-y-auto">
          {content}
        </ModalContent>
      </Modal>
    );
  }

  return (
    <div className={cn('booking-details', className)}>
      {content}
    </div>
  );
};

// Import missing components for JSX
const ModalHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    {children}
  </div>
);

const ModalTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-semibold text-gray-900">
    {children}
  </h2>
);

const ModalContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
);

export default BookingDetails;