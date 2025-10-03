import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceList } from './ServiceList';
import type { Service, ServiceFilters, ServiceSortOption } from '../types';

// Mock the ServiceCard component
vi.mock('../ServiceCard', () => ({
  ServiceCard: ({ service, onClick }: { service: Service; onClick?: (service: Service) => void }) => (
    <div data-testid={`service-card-${service.id}`} onClick={() => onClick?.(service)}>
      <div>{service.name}</div>
      <div>{service.category.name}</div>
      <div>${service.pricing.basePrice}</div>
    </div>
  ),
}));

// Mock the UI components
vi.mock('../../ui', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
  Input: ({ value, onChange, placeholder, ...props }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  ),
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

// Mock the cn utility
vi.mock('../../../utils/cn', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

const mockServices: Service[] = [
  {
    id: '1',
    providerId: 'provider1',
    name: 'Haircut Service',
    description: 'Professional haircut service',
    shortDescription: 'Professional haircut',
    category: {
      id: 'cat1',
      name: 'Beauty',
      description: 'Beauty services',
      order: 1,
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    pricing: {
      basePrice: 50,
      currency: 'USD',
      taxIncluded: false,
    },
    schedule: {
      duration: 60,
      bufferTime: 15,
      availableOnWeekends: false,
      timeSlots: [],
    },
    media: {
      mainImage: '/image1.jpg',
      altText: 'Haircut service',
    },
    location: {
      type: 'fixed',
    },
    status: 'approved',
    visibility: 'public',
    tags: ['haircut', 'beauty'],
    slug: 'haircut-service',
    isFeatured: false,
    bookingCount: 10,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    providerId: 'provider2',
    name: 'Massage Service',
    description: 'Relaxing massage service',
    shortDescription: 'Relaxing massage',
    category: {
      id: 'cat2',
      name: 'Wellness',
      description: 'Wellness services',
      order: 2,
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    pricing: {
      basePrice: 80,
      currency: 'USD',
      taxIncluded: true,
    },
    schedule: {
      duration: 90,
      bufferTime: 15,
      availableOnWeekends: true,
      timeSlots: [],
    },
    media: {
      mainImage: '/image2.jpg',
      altText: 'Massage service',
    },
    location: {
      type: 'mobile',
    },
    status: 'approved',
    visibility: 'public',
    tags: ['massage', 'wellness'],
    slug: 'massage-service',
    isFeatured: true,
    bookingCount: 25,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
];

describe('ServiceList', () => {
  const defaultProps = {
    services: mockServices,
    filters: {},
    sortBy: 'name_asc' as ServiceSortOption,
    pagination: {
      page: 1,
      pageSize: 12,
      total: 2,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders services correctly', () => {
    render(<ServiceList {...defaultProps} />);

    expect(screen.getByText('Haircut Service')).toBeInTheDocument();
    expect(screen.getByText('Massage Service')).toBeInTheDocument();
    expect(screen.getByText('Beauty')).toBeInTheDocument();
    expect(screen.getByText('Wellness')).toBeInTheDocument();
  });

  it('displays search bar when showFilters is true', () => {
    render(<ServiceList {...defaultProps} showFilters={true} />);

    const searchInput = screen.getByPlaceholderText('Search services...');
    expect(searchInput).toBeInTheDocument();
  });

  it('filters services based on search query', async () => {
    render(<ServiceList {...defaultProps} showFilters={true} />);

    const searchInput = screen.getByPlaceholderText('Search services...');

    fireEvent.change(searchInput, { target: { value: 'haircut' } });

    await waitFor(() => {
      expect(screen.getByText('Haircut Service')).toBeInTheDocument();
      expect(screen.queryByText('Massage Service')).not.toBeInTheDocument();
    });
  });

  it('calls onServiceSelect when service card is clicked', () => {
    const onServiceSelect = vi.fn();
    render(<ServiceList {...defaultProps} onServiceSelect={onServiceSelect} />);

    const serviceCard = screen.getByTestId('service-card-1');
    fireEvent.click(serviceCard);

    expect(onServiceSelect).toHaveBeenCalledWith(mockServices[0]);
  });

  it('displays loading skeleton when loading', () => {
    render(<ServiceList {...defaultProps} loading={true} />);

    // Should show loading skeleton instead of service cards
    expect(screen.queryByText('Haircut Service')).not.toBeInTheDocument();
  });

  it('displays empty state when no services', () => {
    render(<ServiceList {...defaultProps} services={[]} />);

    expect(screen.getByText('No services found')).toBeInTheDocument();
  });

  it('calls onSortChange when sort option is changed', () => {
    const onSortChange = vi.fn();
    render(<ServiceList {...defaultProps} showSorting={true} onSortChange={onSortChange} />);

    const sortSelect = screen.getByDisplayValue('Name (A-Z)');
    fireEvent.change(sortSelect, { target: { value: 'price_asc' } });

    expect(onSortChange).toHaveBeenCalledWith('price_asc');
  });

  it('calls onPageChange when pagination buttons are clicked', () => {
    const onPageChange = vi.fn();
    const paginationProps = {
      ...defaultProps.pagination,
      totalPages: 3,
      hasNext: true,
      hasPrev: false,
    };

    render(
      <ServiceList
        {...defaultProps}
        showPagination={true}
        pagination={paginationProps}
        onPageChange={onPageChange}
      />
    );

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('displays results summary correctly', () => {
    render(<ServiceList {...defaultProps} />);

    expect(screen.getByText('Showing 2 services')).toBeInTheDocument();
  });

  it('toggles layout between grid and list', () => {
    render(<ServiceList {...defaultProps} />);

    // Should start with grid layout - check the grid container
    const gridContainer = document.querySelector('.grid-cols-1');
    expect(gridContainer).toBeInTheDocument();

    // Note: Layout toggle functionality would need additional testing
    // with the actual toggle button implementation
  });

  it('applies custom className correctly', () => {
    render(<ServiceList {...defaultProps} className="custom-class" />);

    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });

  it('handles filter changes correctly', () => {
    const onFiltersChange = vi.fn();
    const filters: ServiceFilters = { categoryId: 'cat1' };

    render(
      <ServiceList
        {...defaultProps}
        filters={filters}
        onFiltersChange={onFiltersChange}
      />
    );

    // Filter functionality would be tested here
    // This is a basic test to ensure the component renders with filters
    expect(screen.getByText('Haircut Service')).toBeInTheDocument();
  });
});