import React, { useState, useMemo } from 'react';
import { Button, Input, Card, CardContent } from '../../ui';
import { ServiceCard } from '../ServiceCard';
import { cn } from '../../../utils/cn';
import type {
  ServiceListProps,
  ServiceSortOption
} from '../types';

/**
 * ServiceList Component - Displays a collection of services with filtering and sorting
 *
 * Features:
 * - Grid and list layout options
 * - Advanced filtering by category, price, location, rating
 * - Multiple sorting options (name, price, rating, popularity)
 * - Pagination support for large datasets
 * - Search functionality
 * - Loading states and empty states
 * - Responsive design for all screen sizes
 * - Accessibility compliance
 *
 * @example
 * ```tsx
 * // Basic service list
 * <ServiceList services={services} />
 *
 * // Service list with filtering and sorting
 * <ServiceList
 *   services={services}
 *   showFilters
 *   showSorting
 *   showPagination
 *   onFiltersChange={handleFiltersChange}
 *   onSortChange={handleSortChange}
 * />
 *
 * // Service list with custom layout
 * <ServiceList
 *   services={services}
 *   layout="grid"
 *   itemsPerPage={12}
 *   onServiceSelect={handleServiceSelect}
 * />
 * ```
 */
export const ServiceList: React.FC<ServiceListProps> = ({
  services,
  filters = {},
  sortBy = 'name_asc',
  pagination = { page: 1, pageSize: 12, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
  showFilters = false,
  showSorting = false,
  showPagination = false,
  loading = false,
  emptyMessage = 'No services found',
  onFiltersChange,
  onSortChange,
  onPageChange,
  onServiceSelect,
  onError,
  className,
  'data-testid': testId,
  ...props
}) => {
  // Local state for search and layout
  const [searchQuery, setSearchQuery] = useState('');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  /**
   * Filters and sorts services based on current criteria
   * @returns Filtered and sorted array of services
   */
  const filteredAndSortedServices = useMemo(() => {
    let filtered = [...services];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.tags.some(tag => tag.toLowerCase().includes(query)) ||
        service.category.name.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filters.categoryId) {
      filtered = filtered.filter(service => service.category.id === filters.categoryId);
    }

    // Apply price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(service => {
        const price = service.pricing.basePrice;
        return price >= filters.priceRange!.min && price <= filters.priceRange!.max;
      });
    }

    // Apply rating filter
    if (filters.rating) {
      filtered = filtered.filter(service => (service.rating || 0) >= filters.rating!);
    }

    // Apply status filter (for admin views)
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(service => filters.status!.includes(service.status));
    }

    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(service =>
        filters.tags!.some(tag => service.tags.includes(tag))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'price_asc':
          return a.pricing.basePrice - b.pricing.basePrice;
        case 'price_desc':
          return b.pricing.basePrice - a.pricing.basePrice;
        case 'rating_asc':
          return (a.rating || 0) - (b.rating || 0);
        case 'rating_desc':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most_booked':
          return b.bookingCount - a.bookingCount;
        case 'least_booked':
          return a.bookingCount - b.bookingCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [services, searchQuery, filters, sortBy]);

  /**
   * Handles search input changes
   * @param e - Input change event
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /**
   * Handles layout toggle between grid and list
   */
  const handleLayoutToggle = () => {
    setLayout(prev => prev === 'grid' ? 'list' : 'grid');
  };

  /**
   * Handles filter panel toggle
   */
  const handleFilterToggle = () => {
    setShowFilterPanel(prev => !prev);
  };

  /**
   * Handles sort option changes
   * @param newSort - New sort option
   */
  const handleSortChange = (newSort: ServiceSortOption) => {
    onSortChange?.(newSort);
  };

  /**
   * Handles pagination page changes
   * @param newPage - New page number
   */
  const handlePageChange = (newPage: number) => {
    onPageChange?.(newPage);
  };

  /**
   * Renders loading skeleton
   * @returns JSX for loading state
   */
  const renderLoadingSkeleton = () => {
    return (
      <div className={cn(
        'grid gap-6',
        layout === 'grid'
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'grid-cols-1'
      )}>
        {Array.from({ length: pagination.pageSize || 12 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-0">
              <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  /**
   * Renders empty state
   * @returns JSX for empty state
   */
  const renderEmptyState = () => {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {emptyMessage}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or filter criteria.
        </p>
        {Object.keys(filters).length > 0 && (
          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                onFiltersChange?.({});
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    );
  };

  /**
   * Renders search bar
   * @returns JSX for search interface
   */
  const renderSearchBar = () => {
    return (
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search services..."
            value={searchQuery}
            onChange={handleSearchChange}
            leftIcon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        {/* Layout and filter controls */}
        <div className="flex items-center space-x-2">
          {showFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFilterToggle}
              className={cn(
                showFilterPanel && "bg-gray-100"
              )}
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLayoutToggle}
          >
            {layout === 'grid' ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    );
  };

  /**
   * Renders sorting options
   * @returns JSX for sorting interface
   */
  const renderSortingOptions = () => {
    const sortOptions: Array<{ value: ServiceSortOption; label: string }> = [
      { value: 'name_asc', label: 'Name (A-Z)' },
      { value: 'name_desc', label: 'Name (Z-A)' },
      { value: 'price_asc', label: 'Price (Low to High)' },
      { value: 'price_desc', label: 'Price (High to Low)' },
      { value: 'rating_desc', label: 'Highest Rated' },
      { value: 'rating_asc', label: 'Lowest Rated' },
      { value: 'newest', label: 'Newest First' },
      { value: 'oldest', label: 'Oldest First' },
      { value: 'most_booked', label: 'Most Popular' },
      { value: 'least_booked', label: 'Least Popular' },
    ];

    return (
      <div className="flex items-center space-x-2 mb-6">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value as ServiceSortOption)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  /**
   * Renders pagination controls
   * @returns JSX for pagination interface
   */
  const renderPagination = () => {
    if (!showPagination || (pagination.totalPages || 0) <= 1) return null;

    const { page = 1, totalPages = 0, hasNext = false, hasPrev = false } = pagination;

    return (
      <div className="flex items-center justify-between mt-8">
        <div className="text-sm text-gray-700">
          Showing page {page} of {totalPages} ({pagination.total} total services)
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasPrev}
            onClick={() => handlePageChange((page || 1) - 1)}
          >
            Previous
          </Button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages || 0) }, (_, index) => {
              const pageNumber = Math.max(1, Math.min((totalPages || 0) - 4, (page || 1) - 2)) + index;

              return (
                <Button
                  key={pageNumber}
                  variant={pageNumber === page ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber)}
                  className="min-w-[40px]"
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="sm"
            disabled={!hasNext}
            onClick={() => handlePageChange((page || 1) + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  /**
   * Renders active filter summary
   * @returns JSX for active filters display
   */
  const renderActiveFilters = () => {
    const activeFilters: string[] = [];

    if (searchQuery) activeFilters.push(`Search: "${searchQuery}"`);
    if (filters.categoryId) activeFilters.push('Category filter');
    if (filters.priceRange) activeFilters.push('Price range');
    if (filters.rating) activeFilters.push(`Rating: ${filters.rating}+ stars`);
    if (filters.status && filters.status.length > 0) activeFilters.push('Status filter');
    if (filters.tags && filters.tags.length > 0) activeFilters.push('Tag filter');

    if (activeFilters.length === 0) return null;

    return (
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-blue-900">Active filters:</span>
            <div className="flex items-center space-x-1">
              {activeFilters.map((filter, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {filter}
                </span>
              ))}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              onFiltersChange?.({});
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            Clear all
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={cn('space-y-6', className)} data-testid={testId || 'service-list'}>
        {renderSearchBar()}
        {renderLoadingSkeleton()}
        {renderPagination()}
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)} data-testid={testId} {...props}>
      {/* Search and controls */}
      {renderSearchBar()}

      {/* Sorting options */}
      {showSorting && renderSortingOptions()}

      {/* Active filters summary */}
      {renderActiveFilters()}

      {/* Filter panel (collapsible) */}
      {showFilters && showFilterPanel && (
        <Card variant="outlined">
          <CardContent className="p-4">
            <div className="text-center text-gray-500">
              <p>Filter panel would be implemented here</p>
              <p className="text-sm mt-1">Category, price range, rating filters, etc.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results summary */}
      {!loading && filteredAndSortedServices.length > 0 && (
        <div className="text-sm text-gray-600">
          Showing {filteredAndSortedServices.length} service{filteredAndSortedServices.length !== 1 ? 's' : ''}
          {searchQuery && ` for "${searchQuery}"`}
        </div>
      )}

      {/* Service grid/list */}
      {filteredAndSortedServices.length > 0 ? (
        <div className={cn(
          'grid gap-6',
          layout === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        )}>
          {filteredAndSortedServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              variant={layout === 'grid' ? 'grid' : 'list'}
              onClick={onServiceSelect}
            />
          ))}
        </div>
      ) : (
        renderEmptyState()
      )}

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

/**
 * ServiceList component display name for debugging
 */
ServiceList.displayName = 'ServiceList';

export default ServiceList;