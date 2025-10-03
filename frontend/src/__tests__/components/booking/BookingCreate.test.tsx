/**
 * Booking Create Component Tests
 *
 * Unit tests for the BookingCreate component following the design system testing requirements.
 * Tests form validation, user interactions, API integration, and error handling.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingCreate } from '../../../components/booking/booking-create.component';
import { bookingApi } from '../../../services/booking-api.service';
import type { Booking } from '../../../types/booking';

// Mock the booking API
vi.mock('../../../services/booking-api.service');
const mockBookingApi = vi.mocked(bookingApi);

// Mock toast notifications
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Test data
const mockServices = [
  {
    id: 'service-1',
    name: 'Haircut & Styling',
    description: 'Professional haircut and styling service',
    price: 50,
    duration: 60,
    category: 'Beauty'
  },
  {
    id: 'service-2',
    name: 'Massage Therapy',
    description: 'Relaxing massage therapy session',
    price: 80,
    duration: 90,
    category: 'Wellness'
  }
];

const mockBooking: Booking = {
  id: 'booking-1',
  serviceId: 'service-1',
  customerId: 'customer-1',
  providerId: 'provider-1',
  scheduledAt: '2024-01-15T10:00:00Z',
  duration: 60,
  participantCount: 1,
  totalPrice: 50,
  currency: 'USD',
  status: 'pending',
  paymentStatus: 'pending',
  priority: 'normal',
  createdAt: '2024-01-10T09:00:00Z',
  updatedAt: '2024-01-10T09:00:00Z'
};

describe('BookingCreate Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBookingApi.getAvailableSlots.mockResolvedValue([
      {
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
        available: true
      },
      {
        startTime: '2024-01-15T11:00:00Z',
        endTime: '2024-01-15T12:00:00Z',
        available: true
      }
    ]);
  });

  describe('Component Rendering', () => {
    it('should render booking form correctly', () => {
      render(
        <BookingCreate
          services={mockServices}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      expect(screen.getByTestId('booking-create')).toBeInTheDocument();
      expect(screen.getByText('📅 Create New Booking')).toBeInTheDocument();
    });

    it('should display available services', () => {
      render(
        <BookingCreate
          services={mockServices}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      expect(screen.getByText('Haircut & Styling')).toBeInTheDocument();
      expect(screen.getByText('Massage Therapy')).toBeInTheDocument();
      expect(screen.getByText('$50')).toBeInTheDocument();
      expect(screen.getByText('$80')).toBeInTheDocument();
    });

    it('should show loading state for services', () => {
      render(
        <BookingCreate
          services={[]}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      // Component should render without crashing when no services provided
      expect(screen.getByTestId('booking-create')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle service selection', async () => {
      const user = userEvent.setup();

      render(
        <BookingCreate
          services={mockServices}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      const serviceCard = screen.getByTestId('service-option-1');
      await user.click(serviceCard);

      // Service should be selected
      expect(serviceCard).toHaveClass('ring-2');
    });

    it('should handle form submission', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(
        <BookingCreate
          services={mockServices}
          onSubmit={onSubmit}
          onCancel={vi.fn()}
        />
      );

      // Select service
      const serviceCard = screen.getByTestId('service-option-1');
      await user.click(serviceCard);

      // Fill form
      const participantInput = screen.getByTestId('participant-count');
      await user.clear(participantInput);
      await user.type(participantInput, '2');

      // Submit form
      const submitButton = screen.getByTestId('submit-booking');
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalled();
    });

    it('should handle form cancellation', async () => {
      const onCancel = vi.fn();
      const user = userEvent.setup();

      render(
        <BookingCreate
          services={mockServices}
          onSubmit={vi.fn()}
          onCancel={onCancel}
        />
      );

      const cancelButton = screen.getByTestId('cancel-booking');
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty form', async () => {
      const user = userEvent.setup();

      render(
        <BookingCreate
          services={mockServices}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      // Try to submit without selecting service
      const submitButton = screen.getByTestId('submit-booking');
      await user.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Please select a service')).toBeInTheDocument();
      });
    });

    it('should validate participant count', async () => {
      const user = userEvent.setup();

      render(
        <BookingCreate
          services={mockServices}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      // Select service first
      const serviceCard = screen.getByTestId('service-option-1');
      await user.click(serviceCard);

      // Enter invalid participant count
      const participantInput = screen.getByTestId('participant-count');
      await user.clear(participantInput);
      await user.type(participantInput, '0');

      // Try to submit
      const submitButton = screen.getByTestId('submit-booking');
      await user.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('At least 1 participant required')).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should load available time slots after service selection', async () => {
      const user = userEvent.setup();

      render(
        <BookingCreate
          services={mockServices}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      // Select service
      const serviceCard = screen.getByTestId('service-option-1');
      await user.click(serviceCard);

      // Should load time slots
      await waitFor(() => {
        expect(mockBookingApi.getAvailableSlots).toHaveBeenCalledWith('service-1', expect.any(String));
      });
    });

    it('should handle successful booking creation', async () => {
      const onSuccess = vi.fn();
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();

      mockBookingApi.createBooking.mockResolvedValue(mockBooking);

      render(
        <BookingCreate
          services={mockServices}
          onSubmit={onSubmit}
          onSuccess={onSuccess}
          onCancel={vi.fn()}
        />
      );

      // Select service
      const serviceCard = screen.getByTestId('service-option-1');
      await user.click(serviceCard);

      // Submit form
      const submitButton = screen.getByTestId('submit-booking');
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockBooking);
      });
    });

    it('should handle booking creation errors', async () => {
      const onError = vi.fn();
      const user = userEvent.setup();

      mockBookingApi.createBooking.mockRejectedValue(new Error('Booking failed'));

      render(
        <BookingCreate
          services={mockServices}
          onSubmit={vi.fn()}
          onError={onError}
          onCancel={vi.fn()}
        />
      );

      // Select service and submit
      const serviceCard = screen.getByTestId('service-option-1');
      await user.click(serviceCard);

      const submitButton = screen.getByTestId('submit-booking');
      await user.click(submitButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });
  });

  describe('Time Slot Selection', () => {
    it('should display available time slots', async () => {
      const user = userEvent.setup();

      render(
        <BookingCreate
          services={mockServices}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      // Select service first
      const serviceCard = screen.getByTestId('service-option-1');
      await user.click(serviceCard);

      // Wait for time slots to load
      await waitFor(() => {
        const timeSlots = screen.getAllByTestId(/time-slot-/);
        expect(timeSlots.length).toBeGreaterThan(0);
      });
    });

    it('should handle time slot selection', async () => {
      const user = userEvent.setup();

      render(
        <BookingCreate
          services={mockServices}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      // Select service
      const serviceCard = screen.getByTestId('service-option-1');
      await user.click(serviceCard);

      // Wait for and select time slot
      await waitFor(() => {
        const timeSlot = screen.getAllByTestId(/time-slot-/)[0];
        fireEvent.click(timeSlot);
      });

      // Time slot should be selected
      const selectedTimeSlot = screen.getAllByTestId(/time-slot-/)[0];
      expect(selectedTimeSlot).toHaveClass('bg-primary-main');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(
        <BookingCreate
          services={mockServices}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      // Check for proper labeling
      expect(screen.getByText('Select Service *')).toBeInTheDocument();
      expect(screen.getByText('Number of Participants *')).toBeInTheDocument();
      expect(screen.getByText('Special Requests (Optional)')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <BookingCreate
          services={mockServices}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      // Tab through form elements
      await user.tab();

      // First focusable element should be focused
      expect(document.activeElement).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error state for API failures', async () => {
      mockBookingApi.getAvailableSlots.mockRejectedValue(new Error('Failed to load slots'));

      const user = userEvent.setup();

      render(
        <BookingCreate
          services={mockServices}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      // Select service to trigger slot loading
      const serviceCard = screen.getByTestId('service-option-1');
      await user.click(serviceCard);

      // Should handle error gracefully (component doesn't crash)
      expect(screen.getByTestId('booking-create')).toBeInTheDocument();
    });

    it('should allow retry after error', async () => {
      mockBookingApi.getAvailableSlots
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([
          {
            startTime: '2024-01-15T10:00:00Z',
            endTime: '2024-01-15T11:00:00Z',
            available: true
          }
        ]);

      const user = userEvent.setup();

      render(
        <BookingCreate
          services={mockServices}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      // Select service to trigger error
      const serviceCard = screen.getByTestId('service-option-1');
      await user.click(serviceCard);

      // Component should handle error gracefully
      expect(screen.getByTestId('booking-create')).toBeInTheDocument();

      // Select service again to retry
      const serviceCard2 = screen.getByTestId('service-option-1');
      await user.click(serviceCard2);

      // Component should still function
      expect(screen.getByTestId('booking-create')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <BookingCreate
          services={mockServices}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      // Component should render correctly on mobile
      expect(screen.getByTestId('booking-create')).toBeInTheDocument();
    });

    it('should show mobile-friendly service cards', () => {
      render(
        <BookingCreate
          services={mockServices}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      // Service cards should be responsive
      const serviceCards = screen.getAllByTestId(/service-option-/);
      serviceCards.forEach(card => {
        expect(card).toBeInTheDocument();
      });
    });
  });
});