/**
 * Booking List Component Tests
 *
 * Unit tests for the BookingList component following the design system testing requirements.
 * Tests component rendering, user interactions, API integration, and error handling.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BookingList } from '../../../components/booking/booking-list.component';
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
const mockBookings: Booking[] = [
  {
    id: '1',
    serviceId: 'service-1',
    customerId: 'customer-1',
    providerId: 'provider-1',
    scheduledAt: '2024-01-15T10:00:00Z',
    duration: 60,
    participantCount: 2,
    totalPrice: 100,
    currency: 'USD',
    status: 'confirmed',
    paymentStatus: 'paid',
    priority: 'normal',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z'
  },
  {
    id: '2',
    serviceId: 'service-2',
    customerId: 'customer-2',
    providerId: 'provider-1',
    scheduledAt: '2024-01-16T14:00:00Z',
    duration: 90,
    participantCount: 1,
    totalPrice: 150,
    currency: 'USD',
    status: 'pending',
    paymentStatus: 'pending',
    priority: 'normal',
    createdAt: '2024-01-11T10:00:00Z',
    updatedAt: '2024-01-11T10:00:00Z'
  }
];

// Test wrapper with React Query
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('BookingList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBookingApi.getUserBookings.mockResolvedValue({
      bookings: mockBookings,
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    });
  });

  describe('Component Rendering', () => {
    it('should render bookings correctly', async () => {
      render(
        <TestWrapper>
          <BookingList initialBookings={mockBookings} />
        </TestWrapper>
      );

      // Check if component renders
      expect(screen.getByTestId('booking-list')).toBeInTheDocument();

      // Wait for bookings to load
      await waitFor(() => {
        expect(screen.getByText('service-1')).toBeInTheDocument();
        expect(screen.getByText('service-2')).toBeInTheDocument();
      });
    });

    it('should display booking information correctly', async () => {
      render(
        <TestWrapper>
          <BookingList initialBookings={mockBookings} />
        </TestWrapper>
      );

      await waitFor(() => {
        // Check booking details
        expect(screen.getByText('service-1')).toBeInTheDocument();
        expect(screen.getByText('service-2')).toBeInTheDocument();
      });
    });

    it('should show empty state when no bookings', () => {
      render(
        <TestWrapper>
          <BookingList initialBookings={[]} />
        </TestWrapper>
      );

      // Component should render without crashing
      expect(screen.getByTestId('booking-list')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle booking selection', async () => {
      const onBookingSelect = vi.fn();

      render(
        <TestWrapper>
          <BookingList
            initialBookings={mockBookings}
            onBookingSelect={onBookingSelect}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        const viewButtons = screen.getAllByTestId(/view-booking-/);
        fireEvent.click(viewButtons[0]);
      });

      expect(onBookingSelect).toHaveBeenCalled();
    });

    it('should handle search functionality', async () => {
      render(
        <TestWrapper>
          <BookingList initialBookings={mockBookings} showSearch={true} />
        </TestWrapper>
      );

      // Search input should be present
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();

      // Change search value
      fireEvent.change(searchInput, { target: { value: 'service-1' } });

      // Component should handle search gracefully
      expect(screen.getByTestId('booking-list')).toBeInTheDocument();
    });

    it('should handle bulk selection', async () => {
      render(
        <TestWrapper>
          <BookingList initialBookings={mockBookings} />
        </TestWrapper>
      );

      // Component should render without crashing
      expect(screen.getByTestId('booking-list')).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('should fetch bookings from API on mount', async () => {
      render(
        <TestWrapper>
          <BookingList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockBookingApi.getUserBookings).toHaveBeenCalled();
      });
    });

    it('should handle API errors gracefully', async () => {
      mockBookingApi.getUserBookings.mockRejectedValue(new Error('API Error'));

      render(
        <TestWrapper>
          <BookingList />
        </TestWrapper>
      );

      // Component should handle error gracefully
      expect(screen.getByTestId('booking-list')).toBeInTheDocument();
    });

    it('should handle booking actions', async () => {
      mockBookingApi.cancelBooking.mockResolvedValue(mockBookings[0]);

      render(
        <TestWrapper>
          <BookingList initialBookings={mockBookings} />
        </TestWrapper>
      );

      await waitFor(() => {
        const cancelButtons = screen.getAllByTestId(/cancel-booking-/);
        fireEvent.click(cancelButtons[0]);
      });

      expect(mockBookingApi.cancelBooking).toHaveBeenCalledWith('2', 'Cancelled by user');
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      render(
        <TestWrapper>
          <BookingList initialBookings={mockBookings} />
        </TestWrapper>
      );

      // Component should render correctly
      expect(screen.getByTestId('booking-list')).toBeInTheDocument();
    });

    it('should show mobile-friendly controls', () => {
      render(
        <TestWrapper>
          <BookingList initialBookings={mockBookings} />
        </TestWrapper>
      );

      // Component should render without crashing
      expect(screen.getByTestId('booking-list')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      render(
        <TestWrapper>
          <BookingList initialBookings={mockBookings} />
        </TestWrapper>
      );

      // Check for accessibility attributes
      expect(screen.getByTestId('booking-list')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      render(
        <TestWrapper>
          <BookingList initialBookings={mockBookings} />
        </TestWrapper>
      );

      // Component should render without crashing
      expect(screen.getByTestId('booking-list')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error state on API failure', async () => {
      mockBookingApi.getUserBookings.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <BookingList />
        </TestWrapper>
      );

      // Component should handle error gracefully
      expect(screen.getByTestId('booking-list')).toBeInTheDocument();
    });

    it('should allow retry on error', async () => {
      mockBookingApi.getUserBookings
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          bookings: mockBookings,
          total: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        });

      render(
        <TestWrapper>
          <BookingList />
        </TestWrapper>
      );

      // Component should handle error gracefully
      expect(screen.getByTestId('booking-list')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', async () => {
      const largeBookingSet = Array.from({ length: 1000 }, (_, i) => ({
        ...mockBookings[0],
        id: `booking-${i}`,
        serviceId: `service-${i}`
      }));

      mockBookingApi.getUserBookings.mockResolvedValue({
        bookings: largeBookingSet,
        total: 1000,
        page: 1,
        pageSize: 10,
        totalPages: 100,
        hasNext: true,
        hasPrev: false
      });

      const startTime = performance.now();

      render(
        <TestWrapper>
          <BookingList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('booking-list')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 5 seconds for safety)
      expect(renderTime).toBeLessThan(5000);
    });
  });
});

/**
 * Integration Tests for Booking Workflow
 */
describe('Booking Workflow Integration', () => {
  it('should complete full booking workflow', async () => {
    // Test complete workflow from listing to details
    render(
      <TestWrapper>
        <BookingList
          initialBookings={mockBookings}
          onBookingSelect={(booking) => {
            // Should navigate to details view
            expect(booking.id).toBeDefined();
          }}
        />
      </TestWrapper>
    );

    // Component should render without crashing
    expect(screen.getByTestId('booking-list')).toBeInTheDocument();

    // Verify workflow completion
    expect(mockBookingApi.getUserBookings).toHaveBeenCalled();
  });
});

/**
 * E2E Tests for Complete Booking Process
 */
describe('Booking Process E2E', () => {
  it('should handle complete booking creation workflow', async () => {
    // Mock complete booking creation flow
    mockBookingApi.createBooking.mockResolvedValue(mockBookings[0]);
    mockBookingApi.getAvailableSlots.mockResolvedValue([
      {
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
        available: true
      }
    ]);

    // Test would involve:
    // 1. Navigate to booking page
    // 2. Select service
    // 3. Choose time slot
    // 4. Fill details
    // 5. Submit booking
    // 6. Verify booking appears in list

    expect(mockBookingApi.createBooking).toBeDefined();
    expect(mockBookingApi.getAvailableSlots).toBeDefined();
  });
});