/**
 * Slot Selector Component
 *
 * Advanced time slot selection component with calendar integration, real-time
 * availability checking, and intuitive user interface. Designed for seamless
 * booking experience with visual feedback and accessibility features.
 *
 * Features:
 * - Interactive calendar for date selection
 * - Time slot grid with availability indicators
 * - Real-time availability checking
 * - Support for different service durations
 * - Visual conflict detection and resolution
 * - Mobile-responsive design with touch-friendly interface
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Loading states and error handling
 * - Customizable time slot intervals
 * - Integration with booking system
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';

// Import UI components from the design system
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Select } from '../ui/Select';

// Import types and services
import type {
  TimeSlot,
  Booking
} from '../../types/booking';
import { bookingApi } from '../../services/booking-api.service';

// Import utilities
import { cn } from '../../utils/cn';
import { toast } from 'react-hot-toast';

export interface SlotSelectorProps {
  /** Service ID for slot availability checking */
  serviceId: string;
  /** Selected date */
  selectedDate?: string;
  /** Selected time slot */
  selectedSlot?: string;
  /** Service duration in minutes */
  duration?: number;
  /** Whether to show calendar view */
  showCalendar?: boolean;
  /** Whether to show time slot grid */
  showTimeGrid?: boolean;
  /** Custom time slot interval in minutes */
  timeSlotInterval?: number;
  /** Business hours configuration */
  businessHours?: {
    start: string; // HH:mm format
    end: string;   // HH:mm format
    workingDays: number[]; // 0-6, Sunday = 0
  };
  /** Callback when slot is selected */
  onSlotSelect?: (date: string, slot: TimeSlot) => void;
  /** Callback when date is changed */
  onDateChange?: (date: string) => void;
  /** Callback when availability is checked */
  onAvailabilityCheck?: (available: boolean, conflicts: Booking[]) => void;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Custom CSS class */
  className?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

interface TimeSlotDisplay extends TimeSlot {
  displayTime: string;
  endTimeDisplay: string;
  isPast: boolean;
  isAvailable: boolean;
  conflictCount?: number;
}

/**
 * Slot Selector Component - Main component for time slot selection
 */
export const SlotSelector: React.FC<SlotSelectorProps> = ({
  serviceId,
  selectedDate,
  selectedSlot,
  duration = 60,
  showCalendar = true,
  showTimeGrid = true,
  timeSlotInterval = 30,
  businessHours = {
    start: '09:00',
    end: '18:00',
    workingDays: [1, 2, 3, 4, 5, 6] // Monday to Saturday
  },
  onSlotSelect,
  onDateChange,
  onAvailabilityCheck,
  error = null,
  className = '',
  'data-testid': testId = 'slot-selector'
}) => {
  const [selectedDateTime, setSelectedDateTime] = useState<string>(selectedDate || '');
  const [availableSlots, setAvailableSlots] = useState<TimeSlotDisplay[]>([]);
  const [conflicts, setConflicts] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  /**
   * Generate available dates for the next 30 days
   */
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const isWorkingDay = businessHours.workingDays.includes(date.getDay());
      const isNotPast = date >= today;

      // Simple date formatting
      const formatDate = (d: Date) => d.toISOString().split('T')[0];
      const formatLabel = (d: Date) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
      };

      dates.push({
        date,
        value: formatDate(date),
        label: formatLabel(date),
        disabled: !isWorkingDay || !isNotPast,
        isToday: i === 0,
        isSelected: selectedDateTime.startsWith(formatDate(date))
      });
    }
    return dates;
  }, [selectedDateTime, businessHours.workingDays]);

  /**
   * Generate time slots for the selected date
   */
  const generateTimeSlots = useCallback((date: string): TimeSlotDisplay[] => {
    const slots: TimeSlotDisplay[] = [];
    const [startHour] = businessHours.start.split(':').map(Number);
    const [endHour, endMinute] = businessHours.end.split(':').map(Number);

    // Simple time formatting function
    const formatTime = (date: Date) => {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += timeSlotInterval) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart.getTime() + (duration * 60000));

        // Don't generate slots that end after business hours
        if (slotEnd.getHours() > endHour || (slotEnd.getHours() === endHour && slotEnd.getMinutes() > endMinute)) {
          continue;
        }

        const slot: TimeSlotDisplay = {
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          available: true, // Will be updated by availability check
          displayTime: formatTime(slotStart),
          endTimeDisplay: formatTime(slotEnd),
          isPast: slotStart < new Date(),
          isAvailable: true,
          conflictCount: 0
        };

        slots.push(slot);
      }
    }

    return slots;
  }, [businessHours, duration, timeSlotInterval]);

  /**
   * Check availability for selected date
   */
  const checkAvailability = useCallback(async (date: string) => {
    if (!serviceId || !date) return;

    setIsLoading(true);
    try {
      // Get available slots for the date
      const slots = await bookingApi.getAvailableSlots(serviceId, date, duration);
      const timeSlots = generateTimeSlots(date);

      // Merge availability data
      const slotsWithAvailability = timeSlots.map(slot => {
        const availableSlot = slots.find(s =>
          s.startTime === slot.startTime && s.available
        );

        return {
          ...slot,
          available: !!availableSlot,
          isAvailable: !!availableSlot
        };
      });

      setAvailableSlots(slotsWithAvailability);

      // Check for conflicts if a specific slot is selected
      if (selectedSlot) {
        const conflictCheck = await bookingApi.checkAvailability(
          serviceId,
          selectedSlot,
          duration
        );

        setConflicts(conflictCheck.conflictingBookings || []);
        onAvailabilityCheck?.(conflictCheck.available, conflictCheck.conflictingBookings || []);
      }
    } catch (error) {
      toast.error('Failed to check slot availability');
    } finally {
      setIsLoading(false);
    }
  }, [serviceId, duration, selectedSlot, generateTimeSlots, onAvailabilityCheck]);

  /**
   * Handle date selection
   */
  const handleDateSelect = useCallback((date: string) => {
    setSelectedDateTime(date);
    setAvailableSlots([]);
    setConflicts([]);
    onDateChange?.(date);
    checkAvailability(date);
  }, [onDateChange, checkAvailability]);

  /**
   * Handle time slot selection
   */
  const handleSlotSelect = useCallback((slot: TimeSlotDisplay) => {
    if (!slot.available || slot.isPast) return;

    const selectedDateTime = slot.startTime;
    setSelectedDateTime(selectedDateTime);
    onSlotSelect?.(selectedDateTime.split('T')[0], slot);
  }, [onSlotSelect]);

  /**
   * Get slot availability color
   */
  const getSlotColor = (slot: TimeSlotDisplay) => {
    if (slot.isPast) return 'bg-gray-100 text-gray-400 cursor-not-allowed';
    if (!slot.available) return 'bg-red-100 text-red-600 cursor-not-allowed';
    if (slot.conflictCount && slot.conflictCount > 0) return 'bg-yellow-100 text-yellow-800';
    if (selectedSlot === slot.startTime) return 'bg-primary-main text-white';
    return 'bg-green-100 text-green-800 hover:bg-green-200';
  };

  /**
   * Load slots when date or service changes
   */
  useEffect(() => {
    if (selectedDateTime) {
      checkAvailability(selectedDateTime.split('T')[0]);
    }
  }, [selectedDateTime, checkAvailability]);

  /**
   * Initialize with current date if no date selected
   */
  useEffect(() => {
    if (!selectedDateTime) {
      const today = new Date().toISOString().split('T')[0];
      handleDateSelect(today);
    }
  }, [selectedDateTime, handleDateSelect]);

  return (
    <div className={cn('slot-selector', className)} data-testid={testId}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⏰ Select Date & Time
          </CardTitle>
          <p className="text-gray-600">
            Choose your preferred date and time slot for the booking.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                data-testid="calendar-view"
              >
                📅 Calendar
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                data-testid="list-view"
              >
                📋 List
              </Button>
            </div>
          </div>

          {/* Calendar View */}
          {viewMode === 'calendar' && showCalendar && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Date
              </label>
              <div className="grid grid-cols-7 gap-2" data-testid="date-grid">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}

                {/* Date cells */}
                {availableDates.slice(0, 35).map((dateInfo, index) => {
                  return (
                    <Button
                      key={index}
                      variant={dateInfo.isSelected ? 'primary' : 'ghost'}
                      className={cn(
                        'h-12 flex flex-col items-center justify-center',
                        dateInfo.disabled && 'opacity-50 cursor-not-allowed',
                        dateInfo.isToday && 'ring-2 ring-primary-main',
                        !dateInfo.disabled && 'hover:bg-gray-100'
                      )}
                      disabled={dateInfo.disabled}
                      onClick={() => !dateInfo.disabled && handleDateSelect(dateInfo.value)}
                      data-testid={`date-${dateInfo.value}`}
                    >
                      <span className="text-xs">{dateInfo.date.getDate()}</span>
                      {dateInfo.isToday && (
                        <span className="text-xs text-primary-main font-medium">Today</span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* List View for Dates */}
          {viewMode === 'list' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Date
              </label>
              <Select
                options={availableDates.map(date => ({
                  value: date.value,
                  label: `${date.label}${date.isToday ? ' (Today)' : ''}`
                }))}
                value={selectedDateTime.split('T')[0]}
                onChange={(value) => handleDateSelect(typeof value === 'string' ? value : value[0] || selectedDateTime.split('T')[0])}
                placeholder="Choose a date"
                data-testid="date-select"
              />
            </div>
          )}

          {/* Time Slots Grid */}
          {showTimeGrid && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Available Time Slots
                </label>
                {conflicts.length > 0 && (
                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                    ⚠️ {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} detected
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {availableSlots.map((slot, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="ghost"
                      className={cn(
                        'h-12 flex flex-col items-center justify-center text-xs font-medium',
                        getSlotColor(slot)
                      )}
                      onClick={() => handleSlotSelect(slot)}
                      disabled={slot.isPast || !slot.available}
                      data-testid={`time-slot-${index}`}
                    >
                      <span>{slot.displayTime}</span>
                      {slot.conflictCount && slot.conflictCount > 0 && (
                        <span className="text-xs opacity-75">
                          ({slot.conflictCount})
                        </span>
                      )}
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

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                  <span>Unavailable</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                  <span>Has Conflicts</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary-main rounded"></div>
                  <span>Selected</span>
                </div>
              </div>
            </div>
          )}

          {/* Conflicts Information */}
          {conflicts.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-900">
                  ⚠️ Scheduling Conflicts Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-yellow-800">
                    The selected time slot has {conflicts.length} existing booking{conflicts.length !== 1 ? 's' : ''}.
                    Please choose a different time slot or contact support.
                  </p>
                  <div className="space-y-1">
                    {conflicts.slice(0, 3).map((conflict, index) => (
                      <div key={index} className="text-xs text-yellow-700 bg-white p-2 rounded border">
                        <span className="font-medium">Booking #{conflict.id.slice(-8)}</span>
                        <span className="ml-2">
                          {new Date(conflict.scheduledAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                    ))}
                    {conflicts.length > 3 && (
                      <p className="text-xs text-yellow-600">
                        ... and {conflicts.length - 3} more conflict{conflicts.length - 3 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected Slot Summary */}
          {selectedSlot && (
            <Card className="border-primary-200 bg-primary-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary-900">
                  ✅ Selected Time Slot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-primary-900">
                      {new Date(selectedSlot).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-primary-700">
                      {new Date(selectedSlot).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })} - {new Date(availableSlots.find(s => s.startTime === selectedSlot)?.endTime || selectedSlot).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-primary-600">Duration</p>
                    <p className="font-medium text-primary-900">{duration} minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">❌</div>
                  <p className="text-red-700 mb-2">Error loading availability</p>
                  <p className="text-sm text-red-600">{error.message}</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => selectedDateTime && checkAvailability(selectedDateTime.split('T')[0])}
                    className="mt-3"
                    data-testid="retry-availability"
                  >
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Compact Slot Selector for inline use
 */
export interface CompactSlotSelectorProps {
  serviceId: string;
  selectedDate?: string;
  selectedSlot?: string;
  onSlotSelect?: (slot: string) => void;
  className?: string;
  'data-testid'?: string;
}

export const CompactSlotSelector: React.FC<CompactSlotSelectorProps> = ({
  serviceId,
  selectedDate,
  selectedSlot,
  onSlotSelect,
  className = '',
  'data-testid': testId = 'compact-slot-selector'
}) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDate) return;

      setLoading(true);
      try {
        const availableSlots = await bookingApi.getAvailableSlots(serviceId, selectedDate);
        setSlots(availableSlots);
      } catch (error) {
        console.error('Failed to load slots:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSlots();
  }, [serviceId, selectedDate]);

  return (
    <div className={cn('compact-slot-selector', className)} data-testid={testId}>
      {loading ? (
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      ) : slots.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {slots.slice(0, 8).map((slot, index) => (
            <Button
              key={index}
              variant={selectedSlot === slot.startTime ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => onSlotSelect?.(slot.startTime)}
              disabled={!slot.available}
              className="text-xs"
              data-testid={`compact-slot-${index}`}
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
        <p className="text-sm text-gray-500">No slots available</p>
      )}
    </div>
  );
};

export default SlotSelector;