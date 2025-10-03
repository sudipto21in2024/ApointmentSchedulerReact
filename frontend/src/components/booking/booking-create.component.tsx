/**
 * Booking Create Component
 *
 * Simple booking creation form with service selection, date/time selection,
 * and participant details. Follows the design system guidelines for form architecture.
 *
 * Features:
 * - Service selection from available options
 * - Date and time slot selection
 * - Participant count and notes
 * - Form validation with error handling
 * - Integration with booking API
 * - Responsive design with mobile-friendly interface
 * - Loading states and error handling
 */

import React, { useState, useCallback, useEffect } from 'react';

// Import UI components from the design system
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

// Import types and services
import type {
  Booking,
  BookingCreateData,
  BookingStatus,
  TimeSlot
} from '../../types/booking';
import { bookingApi } from '../../services/booking-api.service';

// Import utilities
import { cn } from '../../utils/cn';
import { toast } from 'react-hot-toast';

// Service interface for booking creation
interface ServiceOption {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category?: string;
}

export interface BookingCreateProps {
  /** Initial form values */
  initialValues?: Partial<BookingCreateData>;
  /** Available services for selection */
  services?: ServiceOption[];
  /** Form submission handler */
  onSubmit?: (data: BookingCreateData) => Promise<void>;
  /** Form cancellation handler */
  onCancel?: () => void;
  /** Success callback after booking creation */
  onSuccess?: (booking: Booking) => void;
  /** Error handler */
  onError?: (error: Error) => void;
  /** Loading state */
  loading?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

interface FormErrors {
  serviceId?: string;
  scheduledAt?: string;
  participantCount?: string;
  notes?: string;
  promoCode?: string;
  paymentMethodId?: string;
}

/**
 * Booking Create Component - Main component for creating new bookings
 */
export const BookingCreate: React.FC<BookingCreateProps> = ({
  initialValues = {},
  services: initialServices = [],
  onSubmit: externalOnSubmit,
  onCancel,
  onSuccess,
  onError,
  loading = false,
  className = '',
  'data-testid': testId = 'booking-create'
}) => {
  // Form state management
  const [formData, setFormData] = useState<BookingCreateData>({
    serviceId: '',
    scheduledAt: '',
    participantCount: 1,
    notes: '',
    promoCode: '',
    paymentMethodId: '',
    ...initialValues
  });

  const [availableServices, setAvailableServices] = useState<ServiceOption[]>(initialServices);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState({
    services: false,
    slots: false,
    submission: false
  });

  // Available dates for selection (next 30 days)
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      value: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    };
  });

  /**
   * Load available services
   */
  const loadServices = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, services: true }));
    try {
      // Mock services for now - in real app this would call API
      const mockServices: ServiceOption[] = [
        {
          id: '1',
          name: 'Haircut & Styling',
          description: 'Professional haircut and styling service',
          price: 50,
          duration: 60,
          category: 'Beauty'
        },
        {
          id: '2',
          name: 'Massage Therapy',
          description: 'Relaxing massage therapy session',
          price: 80,
          duration: 90,
          category: 'Wellness'
        },
        {
          id: '3',
          name: 'Personal Training',
          description: 'One-on-one personal training session',
          price: 60,
          duration: 60,
          category: 'Fitness'
        }
      ];
      setAvailableServices(mockServices);
    } catch (error) {
      toast.error('Failed to load services');
      onError?.(error instanceof Error ? error : new Error('Failed to load services'));
    } finally {
      setIsLoading(prev => ({ ...prev, services: false }));
    }
  }, [onError]);

  /**
   * Load available time slots for selected service and date
   */
  const loadTimeSlots = useCallback(async (serviceId: string, date: string) => {
    if (!serviceId || !date) return;

    setIsLoading(prev => ({ ...prev, slots: true }));
    try {
      const slots = await bookingApi.getAvailableSlots(serviceId, date);
      setAvailableSlots(slots);
    } catch (error) {
      toast.error('Failed to load available time slots');
      onError?.(error instanceof Error ? error : new Error('Failed to load time slots'));
    } finally {
      setIsLoading(prev => ({ ...prev, slots: false }));
    }
  }, [onError]);

  /**
   * Handle form field changes
   */
  const handleFieldChange = useCallback((field: keyof BookingCreateData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Load time slots when service or date changes
    if (field === 'serviceId') {
      loadTimeSlots(value, formData.scheduledAt.split('T')[0]);
    } else if (field === 'scheduledAt') {
      loadTimeSlots(formData.serviceId, value.split('T')[0]);
    }
  }, [formData.serviceId, formData.scheduledAt, loadTimeSlots, errors]);

  /**
   * Validate form data
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.serviceId) {
      newErrors.serviceId = 'Please select a service';
    }

    if (!formData.scheduledAt) {
      newErrors.scheduledAt = 'Please select a date and time';
    }

    if (!formData.participantCount || formData.participantCount < 1) {
      newErrors.participantCount = 'At least 1 participant required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsLoading(prev => ({ ...prev, submission: true }));

    try {
      let booking: Booking;

      if (externalOnSubmit) {
        await externalOnSubmit(formData);
        // Create a mock booking response for success callback
        booking = {
          id: 'temp-id',
          ...formData,
          status: 'pending' as BookingStatus,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Booking;
      } else {
        booking = await bookingApi.createBooking(formData);
      }

      toast.success('Booking created successfully!');
      onSuccess?.(booking);

      // Reset form after successful submission
      setFormData({
        serviceId: '',
        scheduledAt: '',
        participantCount: 1,
        notes: '',
        promoCode: '',
        paymentMethodId: ''
      });
      setAvailableSlots([]);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Failed to create booking');
      toast.error(errorObj.message);
      onError?.(errorObj);
    } finally {
      setIsLoading(prev => ({ ...prev, submission: false }));
    }
  }, [formData, validateForm, externalOnSubmit, onSuccess, onError]);

  /**
   * Load services on component mount
   */
  useEffect(() => {
    loadServices();
  }, [loadServices]);

  return (
    <div className={cn('booking-create max-w-2xl mx-auto', className)} data-testid={testId}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📅 Create New Booking
          </CardTitle>
          <p className="text-gray-600">
            Fill in the details below to create your booking.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Service *
              </label>
              {isLoading.services ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableServices.map((service) => (
                    <Card
                      key={service.id}
                      className={cn(
                        'cursor-pointer transition-all hover:shadow-md',
                        formData.serviceId === service.id && 'ring-2 ring-primary-main bg-primary-50'
                      )}
                      onClick={() => handleFieldChange('serviceId', service.id)}
                      data-testid={`service-option-${service.id}`}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-medium text-gray-900 mb-2">
                          {service.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-primary-main">
                            ${service.price}
                          </span>
                          <span className="text-sm text-gray-500">
                            {service.duration}min
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {errors.serviceId && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.serviceId}
                </p>
              )}
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date *
              </label>
              <Select
                options={availableDates}
                value={formData.scheduledAt ? formData.scheduledAt.split('T')[0] : ''}
                onChange={(value) => {
                  // Update the date part while keeping time if already selected
                  const currentTime = formData.scheduledAt ? formData.scheduledAt.split('T')[1] : '09:00:00.000Z';
                  handleFieldChange('scheduledAt', `${value}T${currentTime}`);
                }}
                placeholder="Choose a date"
                data-testid="date-select"
              />
              {errors.scheduledAt && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.scheduledAt}
                </p>
              )}
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Available Time Slots
              </label>
              {isLoading.slots ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {availableSlots.map((slot, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant={formData.scheduledAt === slot.startTime ? 'primary' : 'secondary'}
                      className="h-10"
                      onClick={() => handleFieldChange('scheduledAt', slot.startTime)}
                      disabled={!slot.available}
                      data-testid={`time-slot-${index}`}
                    >
                      {new Date(slot.startTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">⏰</div>
                  <p>No time slots available for the selected date.</p>
                  <p className="text-sm">Please select a different date.</p>
                </div>
              )}
            </div>

            {/* Participant Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Participants *
              </label>
              <Input
                type="number"
                min="1"
                max="50"
                value={formData.participantCount}
                onChange={(e) => handleFieldChange('participantCount', parseInt(e.target.value) || 1)}
                variant={errors.participantCount ? 'error' : 'default'}
                errorMessage={errors.participantCount}
                data-testid="participant-count"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                rows={4}
                className={cn(
                  'w-full px-3 py-2 border rounded-md resize-none',
                  'focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent',
                  errors.notes && 'border-red-500'
                )}
                placeholder="Any special requests or notes for the service provider..."
                data-testid="booking-notes"
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.notes}
                </p>
              )}
            </div>

            {/* Promo Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Promo Code (Optional)
              </label>
              <Input
                value={formData.promoCode}
                onChange={(e) => handleFieldChange('promoCode', e.target.value)}
                placeholder="Enter promo code"
                data-testid="promo-code"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isLoading.submission}
                data-testid="cancel-booking"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isLoading.submission}
                disabled={loading || isLoading.submission}
                data-testid="submit-booking"
              >
                Create Booking
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingCreate;