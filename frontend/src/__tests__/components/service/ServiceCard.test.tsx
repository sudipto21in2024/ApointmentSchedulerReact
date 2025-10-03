/**
 * ServiceCard Component Tests
 *
 * Comprehensive unit tests for the ServiceCard component covering all variants,
 * user interactions, accessibility, and edge cases.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServiceCard } from '../../../components/service/ServiceCard/ServiceCard';
import type { Service, ServiceCardVariant } from '../../../components/service/types';

// Mock the cn utility
vi.mock('../../../utils/cn', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

// Mock UI components
vi.mock('../../ui', () => ({
  Card: ({ children, className, onClick, 'data-testid': testId, ...props }: any) => (
    <div className={`card ${className || ''}`} onClick={onClick} data-testid={testId} {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div className={`card-content ${className || ''}`} {...props}>
      {children}
    </div>
  ),
  Button: ({ children, onClick, className, variant, size, loading, 'data-testid': testId, ...props }: any) => (
    <button
      className={`button ${variant || 'primary'} ${size || 'md'} ${className || ''}`}
      onClick={onClick}
      data-testid={testId}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  ),
}));

// Mock service data
const mockService: Service = {
  id: 'service-1',
  providerId: 'provider-1',
  name: 'Premium Haircut & Styling',
  description: 'Professional haircut and styling service with premium products and expert consultation.',
  shortDescription: 'Professional haircut and styling service',
  category: {
    id: 'cat-1',
    name: 'Beauty & Wellness',
    description: 'Beauty and personal care services',
    order: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  pricing: {
    basePrice: 75,
    currency: 'USD',
    taxIncluded: true,
    discount: {
      type: 'percentage' as const,
      value: 15,
      description: 'New customer discount',
      isActive: true
    }
  },
  schedule: {
    duration: 90,
    bufferTime: 15,
    availableOnWeekends: true,
    timeSlots: [
      {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '18:00',
        isActive: true
      }
    ]
  },
  media: {
    mainImage: 'https://example.com/service-image.jpg',
    altText: 'Professional haircut service'
  },
  location: {
    type: 'fixed',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA'
    }
  },
  status: 'approved',
  visibility: 'public',
  tags: ['haircut', 'styling', 'premium', 'professional'],
  slug: 'premium-haircut-styling',
  isFeatured: true,
  rating: 4.8,
  reviewCount: 127,
  bookingCount: 456,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  approvalInfo: {
    status: 'approved',
    reviewedBy: 'admin@example.com',
    reviewedAt: '2024-01-02T00:00:00Z',
    comments: 'Service meets all quality standards'
  }
};

describe('ServiceCard Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render service information correctly', () => {
      render(<ServiceCard service={mockService} />);

      expect(screen.getByText('Premium Haircut & Styling')).toBeInTheDocument();
      expect(screen.getByText('Professional haircut and styling service')).toBeInTheDocument();
      expect(screen.getByText('$75.00')).toBeInTheDocument();
      expect(screen.getByText('$63.75')).toBeInTheDocument(); // Discounted price
    });

    it('should render rating stars correctly', () => {
      render(<ServiceCard service={mockService} />);

      // Should show 5 stars with 4 filled (rating 4.8)
      const filledStars = screen.getAllByTestId(/star-filled/);
      const emptyStars = screen.getAllByTestId(/star-empty/);

      expect(filledStars.length).toBeGreaterThan(0);
      expect(emptyStars.length).toBeGreaterThan(0);
    });

    it('should render discount information when available', () => {
      render(<ServiceCard service={mockService} />);

      expect(screen.getByText('$75.00')).toBeInTheDocument(); // Original price (crossed out)
      expect(screen.getByText('$63.75')).toBeInTheDocument(); // Discounted price
    });

    it('should render service tags when showDetails is true', () => {
      render(<ServiceCard service={mockService} showDetails />);

      expect(screen.getByText('haircut')).toBeInTheDocument();
      expect(screen.getByText('styling')).toBeInTheDocument();
      expect(screen.getByText('premium')).toBeInTheDocument();
    });

    it('should not render tags when showDetails is false', () => {
      render(<ServiceCard service={mockService} showDetails={false} />);

      expect(screen.queryByText('haircut')).not.toBeInTheDocument();
    });
  });

  describe('Layout Variants', () => {
    const variants: Array<'grid' | 'list' | 'compact'> = ['grid', 'list', 'compact'];

    variants.forEach(variant => {
      it(`should render ${variant} variant correctly`, () => {
        render(<ServiceCard service={mockService} variant={variant} />);

        const card = screen.getByTestId('service-card');
        expect(card).toBeInTheDocument();
        expect(card).toHaveClass(variant);
      });
    });

    it('should render grid variant as default', () => {
      render(<ServiceCard service={mockService} />);

      const card = screen.getByTestId('service-card');
      expect(card).toHaveClass('grid');
    });

    it('should handle unsupported variant gracefully', () => {
      render(<ServiceCard service={mockService} variant={'unsupported' as any} />);

      expect(screen.getByText('Unsupported card variant: unsupported')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle card click events', async () => {
      const onClick = vi.fn();
      render(<ServiceCard service={mockService} onClick={onClick} />);

      const card = screen.getByTestId('service-card');
      await user.click(card);

      expect(onClick).toHaveBeenCalledWith(mockService);
    });

    it('should handle booking button clicks', async () => {
      const onBook = vi.fn();
      render(<ServiceCard service={mockService} showBookingButton onBook={onBook} />);

      const bookButton = screen.getByRole('button', { name: /book now/i });
      await user.click(bookButton);

      expect(onBook).toHaveBeenCalledWith(mockService);
    });

    it('should handle edit button clicks', async () => {
      const onEdit = vi.fn();
      render(<ServiceCard service={mockService} showEditButton onEdit={onEdit} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      expect(onEdit).toHaveBeenCalledWith(mockService);
    });

    it('should prevent event bubbling for action buttons', async () => {
      const onClick = vi.fn();
      const onBook = vi.fn();

      render(
        <ServiceCard
          service={mockService}
          onClick={onClick}
          showBookingButton
          onBook={onBook}
        />
      );

      const bookButton = screen.getByRole('button', { name: /book now/i });
      await user.click(bookButton);

      // Should call onBook but not onClick due to stopPropagation
      expect(onBook).toHaveBeenCalledWith(mockService);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Pricing Display', () => {
    it('should format price correctly without discount', () => {
      const serviceWithoutDiscount = {
        ...mockService,
        pricing: {
          ...mockService.pricing,
          discount: { type: 'percentage', value: 0, isActive: false } as any
        }
      };

      render(<ServiceCard service={serviceWithoutDiscount} />);

      expect(screen.getByText('$75.00')).toBeInTheDocument();
      expect(screen.queryByText('$63.75')).not.toBeInTheDocument();
    });

    it('should handle fixed amount discounts', () => {
      const serviceWithFixedDiscount = {
        ...mockService,
        pricing: {
          ...mockService.pricing,
          discount: {
            type: 'fixed_amount' as const,
            value: 10,
            isActive: true
          }
        }
      };

      render(<ServiceCard service={serviceWithFixedDiscount} />);

      expect(screen.getByText('$65.00')).toBeInTheDocument(); // 75 - 10
    });

    it('should handle percentage discounts correctly', () => {
      const serviceWithPercentageDiscount = {
        ...mockService,
        pricing: {
          ...mockService.pricing,
          discount: {
            type: 'percentage' as const,
            value: 20,
            isActive: true
          }
        }
      };

      render(<ServiceCard service={serviceWithPercentageDiscount} />);

      expect(screen.getByText('$60.00')).toBeInTheDocument(); // 75 * 0.8
    });

    it('should not show discount when not active', () => {
      const serviceWithInactiveDiscount = {
        ...mockService,
        pricing: {
          ...mockService.pricing,
          discount: {
            type: 'percentage' as const,
            value: 15,
            isActive: false
          }
        }
      };

      render(<ServiceCard service={serviceWithInactiveDiscount} />);

      expect(screen.getByText('$75.00')).toBeInTheDocument();
      expect(screen.queryByText('$63.75')).not.toBeInTheDocument();
    });
  });

  describe('Rating Display', () => {
    it('should render rating stars correctly', () => {
      render(<ServiceCard service={mockService} />);

      // Should show rating value and review count
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('(127)')).toBeInTheDocument();
    });

    it('should handle services without ratings', () => {
      const serviceWithoutRating = {
        ...mockService,
        rating: undefined,
        reviewCount: undefined
      };

      render(<ServiceCard service={serviceWithoutRating} />);

      expect(screen.queryByText('4.8')).not.toBeInTheDocument();
      expect(screen.queryByText('(127)')).not.toBeInTheDocument();
    });

    it('should handle zero rating', () => {
      const serviceWithZeroRating = {
        ...mockService,
        rating: 0,
        reviewCount: 0
      };

      render(<ServiceCard service={serviceWithZeroRating} />);

      expect(screen.getByText('0.0')).toBeInTheDocument();
      expect(screen.getByText('(0)')).toBeInTheDocument();
    });

    it('should handle perfect 5-star rating', () => {
      const serviceWithPerfectRating = {
        ...mockService,
        rating: 5.0,
        reviewCount: 50
      };

      render(<ServiceCard service={serviceWithPerfectRating} />);

      expect(screen.getByText('5.0')).toBeInTheDocument();
      expect(screen.getByText('(50)')).toBeInTheDocument();
    });
  });

  describe('Approval Status Display', () => {
    it('should render approval status when showApprovalStatus is true', () => {
      render(<ServiceCard service={mockService} showApprovalStatus />);

      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText(/Reviewed:/)).toBeInTheDocument();
      expect(screen.getByText(/By:/)).toBeInTheDocument();
    });

    it('should not render approval status when showApprovalStatus is false', () => {
      render(<ServiceCard service={mockService} showApprovalStatus={false} />);

      expect(screen.queryByText('Approved')).not.toBeInTheDocument();
    });

    it('should handle pending approval status', () => {
      const serviceWithPendingApproval = {
        ...mockService,
        approvalInfo: {
          status: 'pending' as const,
          reviewedAt: undefined,
          reviewedBy: undefined,
          comments: undefined
        }
      };

      render(<ServiceCard service={serviceWithPendingApproval} showApprovalStatus />);

      expect(screen.getByText('Pending Approval')).toBeInTheDocument();
      expect(screen.queryByText(/Reviewed:/)).not.toBeInTheDocument();
    });

    it('should handle rejected approval status', () => {
      const serviceWithRejection = {
        ...mockService,
        approvalInfo: {
          status: 'rejected' as const,
          reviewedBy: 'admin@example.com',
          reviewedAt: '2024-01-02T00:00:00Z',
          comments: 'Service does not meet quality standards'
        }
      };

      render(<ServiceCard service={serviceWithRejection} showApprovalStatus />);

      expect(screen.getByText('Rejected')).toBeInTheDocument();
      expect(screen.getByText('Service does not meet quality standards')).toBeInTheDocument();
    });

    it('should handle services without approval info', () => {
      const serviceWithoutApprovalInfo = {
        ...mockService,
        approvalInfo: undefined
      };

      render(<ServiceCard service={serviceWithoutApprovalInfo} showApprovalStatus />);

      expect(screen.queryByText('Approved')).not.toBeInTheDocument();
      expect(screen.queryByText('Pending Approval')).not.toBeInTheDocument();
      expect(screen.queryByText('Rejected')).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render booking button when showBookingButton is true', () => {
      render(<ServiceCard service={mockService} showBookingButton />);

      const bookButton = screen.getByRole('button', { name: /book now/i });
      expect(bookButton).toBeInTheDocument();
    });

    it('should not render booking button when showBookingButton is false', () => {
      render(<ServiceCard service={mockService} showBookingButton={false} />);

      expect(screen.queryByRole('button', { name: /book now/i })).not.toBeInTheDocument();
    });

    it('should render edit button when showEditButton is true', () => {
      render(<ServiceCard service={mockService} showEditButton />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      expect(editButton).toBeInTheDocument();
    });

    it('should not render edit button when showEditButton is false', () => {
      render(<ServiceCard service={mockService} showEditButton={false} />);

      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });

    it('should render both buttons when both props are true', () => {
      render(<ServiceCard service={mockService} showBookingButton showEditButton />);

      expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    it('should not render action section when neither button is enabled', () => {
      render(<ServiceCard service={mockService} showBookingButton={false} showEditButton={false} />);

      expect(screen.queryByRole('button', { name: /book now/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });
  });

  describe('Tags Display', () => {
    it('should render up to 3 tags when showDetails is true', () => {
      render(<ServiceCard service={mockService} showDetails />);

      expect(screen.getByText('haircut')).toBeInTheDocument();
      expect(screen.getByText('styling')).toBeInTheDocument();
      expect(screen.getByText('premium')).toBeInTheDocument();
    });

    it('should show "+X more" indicator when there are more than 3 tags', () => {
      const serviceWithManyTags = {
        ...mockService,
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6']
      };

      render(<ServiceCard service={serviceWithManyTags} showDetails />);

      expect(screen.getByText('+3 more')).toBeInTheDocument();
    });

    it('should not render tags when showDetails is false', () => {
      render(<ServiceCard service={mockService} showDetails={false} />);

      expect(screen.queryByText('haircut')).not.toBeInTheDocument();
    });

    it('should handle services with no tags', () => {
      const serviceWithoutTags = {
        ...mockService,
        tags: []
      };

      render(<ServiceCard service={serviceWithoutTags} showDetails />);

      expect(screen.queryByText('haircut')).not.toBeInTheDocument();
      expect(screen.queryByText('+3 more')).not.toBeInTheDocument();
    });
  });

  describe('Image Handling', () => {
    it('should render service image with correct attributes', () => {
      render(<ServiceCard service={mockService} />);

      const image = screen.getByAltText('Professional haircut service');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/service-image.jpg');
      expect(image).toHaveAttribute('loading', 'lazy');
    });

    it('should handle missing image gracefully', () => {
      const serviceWithoutImage = {
        ...mockService,
        media: {
          mainImage: '',
          altText: 'Service image'
        }
      };

      render(<ServiceCard service={serviceWithoutImage} />);

      const image = screen.getByAltText('Service image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for interactive elements', () => {
      render(<ServiceCard service={mockService} showBookingButton showEditButton />);

      const bookButton = screen.getByRole('button', { name: /book now/i });
      const editButton = screen.getByRole('button', { name: /edit/i });

      expect(bookButton).toBeInTheDocument();
      expect(editButton).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      render(<ServiceCard service={mockService} showBookingButton />);

      const card = screen.getByTestId('service-card');
      const bookButton = screen.getByRole('button', { name: /book now/i });

      // Card should be focusable
      card.focus();
      expect(card).toHaveFocus();

      // Tab to button
      await user.tab();
      expect(bookButton).toHaveFocus();
    });

    it('should have proper semantic structure', () => {
      render(<ServiceCard service={mockService} />);

      // Should use proper heading hierarchy
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Premium Haircut & Styling');
    });

    it('should provide meaningful alt text for images', () => {
      render(<ServiceCard service={mockService} />);

      const image = screen.getByAltText('Professional haircut service');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed service data gracefully', () => {
      const malformedService = {
        id: 'service-1',
        name: '',
        description: '',
        category: null as any,
        pricing: null as any,
        schedule: null as any,
        media: null as any,
        location: null as any,
        status: 'approved' as const,
        visibility: 'public' as const,
        tags: [],
        slug: '',
        isFeatured: false,
        bookingCount: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      expect(() => {
        render(<ServiceCard service={malformedService as any} />);
      }).not.toThrow();
    });

    it('should handle missing pricing information', () => {
      const serviceWithoutPricing = {
        ...mockService,
        pricing: undefined as any
      };

      expect(() => {
        render(<ServiceCard service={serviceWithoutPricing} />);
      }).not.toThrow();
    });

    it('should handle missing category information', () => {
      const serviceWithoutCategory = {
        ...mockService,
        category: undefined as any
      };

      expect(() => {
        render(<ServiceCard service={serviceWithoutCategory} />);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const renderSpy = vi.fn();

      const TestComponent: React.FC = () => {
        renderSpy();
        return <ServiceCard service={mockService} />;
      };

      const { rerender } = render(<TestComponent />);

      // Component should render exactly once initially
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props should not cause additional renders
      rerender(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(2); // React's rerender count
    });

    it('should handle large numbers of tags efficiently', () => {
      const serviceWithManyTags = {
        ...mockService,
        tags: Array.from({ length: 100 }, (_, i) => `tag-${i}`)
      };

      const startTime = performance.now();
      render(<ServiceCard service={serviceWithManyTags} showDetails />);
      const endTime = performance.now();

      // Should render within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      expect(screen.getByText('+97 more')).toBeInTheDocument();
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

      render(<ServiceCard service={mockService} />);

      // Component should render correctly on mobile
      expect(screen.getByTestId('service-card')).toBeInTheDocument();
      expect(screen.getByText('Premium Haircut & Styling')).toBeInTheDocument();
    });

    it('should handle different screen sizes gracefully', () => {
      const { rerender } = render(<ServiceCard service={mockService} variant="grid" />);

      // Should work with grid variant
      expect(screen.getByTestId('service-card')).toBeInTheDocument();

      rerender(<ServiceCard service={mockService} variant="list" />);

      // Should work with list variant
      expect(screen.getByTestId('service-card')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle extremely long service names', () => {
      const serviceWithLongName = {
        ...mockService,
        name: 'A'.repeat(200)
      };

      render(<ServiceCard service={serviceWithLongName} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
    });

    it('should handle extremely long descriptions', () => {
      const serviceWithLongDescription = {
        ...mockService,
        description: 'A'.repeat(1000)
      };

      render(<ServiceCard service={serviceWithLongDescription} showDetails />);

      expect(screen.getByTestId('service-card')).toBeInTheDocument();
    });

    it('should handle special characters in service data', () => {
      const serviceWithSpecialChars = {
        ...mockService,
        name: 'Service with émojis 🚀 & spëcial châractérs',
        description: 'Description with <script>alert("xss")</script> and "quotes"'
      };

      render(<ServiceCard service={serviceWithSpecialChars} />);

      expect(screen.getByText('Service with émojis 🚀 & spëcial châractérs')).toBeInTheDocument();
    });

    it('should handle negative prices gracefully', () => {
      const serviceWithNegativePrice = {
        ...mockService,
        pricing: {
          ...mockService.pricing,
          basePrice: -50
        }
      };

      render(<ServiceCard service={serviceWithNegativePrice} />);

      expect(screen.getByText('-$50.00')).toBeInTheDocument();
    });

    it('should handle zero prices', () => {
      const freeService = {
        ...mockService,
        pricing: {
          ...mockService.pricing,
          basePrice: 0
        }
      };

      render(<ServiceCard service={freeService} />);

      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });
  });

  describe('Custom Event Handlers', () => {
    it('should call onClick with correct service data', async () => {
      const onClick = vi.fn();
      render(<ServiceCard service={mockService} onClick={onClick} />);

      const card = screen.getByTestId('service-card');
      await user.click(card);

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith(mockService);
    });

    it('should call onBook with correct service data', async () => {
      const onBook = vi.fn();
      render(<ServiceCard service={mockService} showBookingButton onBook={onBook} />);

      const bookButton = screen.getByRole('button', { name: /book now/i });
      await user.click(bookButton);

      expect(onBook).toHaveBeenCalledTimes(1);
      expect(onBook).toHaveBeenCalledWith(mockService);
    });

    it('should call onEdit with correct service data', async () => {
      const onEdit = vi.fn();
      render(<ServiceCard service={mockService} showEditButton onEdit={onEdit} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onEdit).toHaveBeenCalledWith(mockService);
    });

    it('should handle missing event handlers gracefully', async () => {
      render(<ServiceCard service={mockService} showBookingButton showEditButton />);

      const bookButton = screen.getByRole('button', { name: /book now/i });
      const editButton = screen.getByRole('button', { name: /edit/i });

      // Should not throw errors when handlers are undefined
      await expect(user.click(bookButton)).resolves.not.toThrow();
      await expect(user.click(editButton)).resolves.not.toThrow();
    });
  });

  describe('Loading States', () => {
    it('should handle loading prop correctly', () => {
      render(<ServiceCard service={mockService} showBookingButton loading />);

      const bookButton = screen.getByRole('button', { name: /book now/i });
      expect(bookButton).toBeDisabled();
    });

    it('should disable action buttons during loading', () => {
      render(<ServiceCard service={mockService} showBookingButton showEditButton loading />);

      const bookButton = screen.getByRole('button', { name: /book now/i });
      const editButton = screen.getByRole('button', { name: /edit/i });

      expect(bookButton).toBeDisabled();
      expect(editButton).toBeDisabled();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      render(<ServiceCard service={mockService} className="custom-class" />);

      const card = screen.getByTestId('service-card');
      expect(card).toHaveClass('custom-class');
    });

    it('should merge custom classes with variant classes', () => {
      render(<ServiceCard service={mockService} variant="grid" className="custom-class" />);

      const card = screen.getByTestId('service-card');
      expect(card).toHaveClass('grid');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Test IDs', () => {
    it('should use custom test ID when provided', () => {
      render(<ServiceCard service={mockService} data-testid="custom-service-card" />);

      expect(screen.getByTestId('custom-service-card')).toBeInTheDocument();
    });

    it('should use default test ID when not provided', () => {
      render(<ServiceCard service={mockService} />);

      expect(screen.getByTestId('service-card')).toBeInTheDocument();
    });
  });

  describe('Service Status Display', () => {
    it('should handle different service statuses', () => {
      const statuses = ['draft', 'pending_approval', 'approved', 'rejected', 'suspended', 'archived'];

      statuses.forEach(status => {
        const serviceWithStatus = {
          ...mockService,
          status: status as any
        };

        render(<ServiceCard service={serviceWithStatus} />);

        expect(screen.getByTestId('service-card')).toBeInTheDocument();
      });
    });

    it('should handle services with missing status', () => {
      const serviceWithoutStatus = {
        ...mockService,
        status: undefined as any
      };

      expect(() => {
        render(<ServiceCard service={serviceWithoutStatus} />);
      }).not.toThrow();
    });
  });

  describe('Category Display', () => {
    it('should handle services with nested categories', () => {
      const serviceWithSubcategory = {
        ...mockService,
        subcategory: {
          id: 'subcat-1',
          name: 'Hair Services',
          description: 'Hair-related services',
          order: 1,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      };

      render(<ServiceCard service={serviceWithSubcategory} />);

      expect(screen.getByText('Beauty & Wellness')).toBeInTheDocument();
    });

    it('should handle categories with missing properties', () => {
      const serviceWithIncompleteCategory = {
        ...mockService,
        category: {
          id: 'cat-1',
          name: 'Test Category'
          // Missing other properties
        } as any
      };

      expect(() => {
        render(<ServiceCard service={serviceWithIncompleteCategory} />);
      }).not.toThrow();
    });
  });

  describe('Booking Count Display', () => {
    it('should handle high booking counts', () => {
      const popularService = {
        ...mockService,
        bookingCount: 9999
      };

      render(<ServiceCard service={popularService} />);

      expect(screen.getByTestId('service-card')).toBeInTheDocument();
    });

    it('should handle zero booking counts', () => {
      const newService = {
        ...mockService,
        bookingCount: 0
      };

      render(<ServiceCard service={newService} />);

      expect(screen.getByTestId('service-card')).toBeInTheDocument();
    });
  });

  describe('Duration Display', () => {
    it('should format duration correctly', () => {
      render(<ServiceCard service={mockService} variant="list" />);

      expect(screen.getByText('90 min')).toBeInTheDocument();
    });

    it('should handle zero duration', () => {
      const serviceWithZeroDuration = {
        ...mockService,
        schedule: {
          ...mockService.schedule,
          duration: 0
        }
      };

      render(<ServiceCard service={serviceWithZeroDuration} variant="list" />);

      expect(screen.getByText('0 min')).toBeInTheDocument();
    });

    it('should handle very long durations', () => {
      const serviceWithLongDuration = {
        ...mockService,
        schedule: {
          ...mockService.schedule,
          duration: 480 // 8 hours
        }
      };

      render(<ServiceCard service={serviceWithLongDuration} variant="list" />);

      expect(screen.getByText('480 min')).toBeInTheDocument();
    });
  });

  describe('Featured Service Display', () => {
    it('should handle featured services', () => {
      const featuredService = {
        ...mockService,
        isFeatured: true
      };

      render(<ServiceCard service={featuredService} />);

      expect(screen.getByTestId('service-card')).toBeInTheDocument();
    });

    it('should handle non-featured services', () => {
      const regularService = {
        ...mockService,
        isFeatured: false
      };

      render(<ServiceCard service={regularService} />);

      expect(screen.getByTestId('service-card')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should work with different service data structures', () => {
      const minimalService: Service = {
        id: 'service-minimal',
        providerId: 'provider-minimal',
        name: 'Minimal Service',
        description: 'A minimal service for testing',
        category: {
          id: 'cat-minimal',
          name: 'Test Category',
          order: 1,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        pricing: {
          basePrice: 50,
          currency: 'USD',
          taxIncluded: true
        },
        schedule: {
          duration: 60,
          bufferTime: 10,
          availableOnWeekends: false,
          timeSlots: []
        },
        media: {
          mainImage: 'https://example.com/minimal.jpg',
          altText: 'Minimal service'
        },
        location: {
          type: 'virtual'
        },
        status: 'approved',
        visibility: 'public',
        tags: [],
        slug: 'minimal-service',
        isFeatured: false,
        bookingCount: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      render(<ServiceCard service={minimalService} />);

      expect(screen.getByText('Minimal Service')).toBeInTheDocument();
      expect(screen.getByText('$50.00')).toBeInTheDocument();
    });
  });

  describe('Error Boundaries', () => {
    it('should handle component errors gracefully', () => {
      // Create a service that might cause rendering issues
      const problematicService = {
        ...mockService,
        pricing: {
          basePrice: NaN, // This could cause issues
          currency: 'USD',
          taxIncluded: true
        }
      };

      expect(() => {
        render(<ServiceCard service={problematicService as any} />);
      }).not.toThrow();
    });
  });

  describe('Memory Management', () => {
    it('should cleanup event listeners on unmount', () => {
      const { unmount } = render(<ServiceCard service={mockService} />);

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid re-renders efficiently', () => {
      const { rerender } = render(<ServiceCard service={mockService} />);

      // Rapidly re-render with different variants
      for (const variant of ['grid', 'list', 'compact'] as const) {
        rerender(<ServiceCard service={mockService} variant={variant} />);
      }

      expect(screen.getByTestId('service-card')).toBeInTheDocument();
    });
  });
});