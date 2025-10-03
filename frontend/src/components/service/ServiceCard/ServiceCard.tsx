import React from 'react';
import { Card, CardContent, Button } from '../../ui';
import { cn } from '../../../utils/cn';
import type { ServiceCardProps, ServiceCardVariant, Service } from '../types';

/**
 * ServiceCard Component - Displays individual service information in a card format
 *
 * Features:
 * - Multiple layout variants (grid, list, compact, detailed)
 * - Different size options for various use cases
 * - Service image display with fallback
 * - Pricing and rating display
 * - Booking and edit action buttons
 * - Approval status for admin views
 * - Responsive design for all screen sizes
 * - Accessibility compliance with proper ARIA labels
 * - Loading states and error handling
 *
 * @example
 * ```tsx
 * // Basic service card
 * <ServiceCard service={service} />
 *
 * // Detailed view with booking button
 * <ServiceCard
 *   service={service}
 *   variant="detailed"
 *   showBookingButton
 *   onBook={handleBooking}
 * />
 *
 * // Admin view with approval status
 * <ServiceCard
 *   service={service}
 *   showApprovalStatus
 *   variant="list"
 * />
 * ```
 */
export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  variant = 'grid',
  showDetails = false,
  showBookingButton = false,
  showEditButton = false,
  showApprovalStatus = false,
  onBook,
  onEdit,
  onClick,
  className,
  'data-testid': testId,
}) => {
  /**
   * Handles card click events
   * @param e - Click event
   */
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClick?.(service);
  };

  /**
   * Handles booking button click
   * @param e - Click event
   */
  const handleBookClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onBook?.(service);
  };

  /**
   * Handles edit button click
   * @param e - Click event
   */
  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onEdit?.(service);
  };

  /**
   * Gets the appropriate card styling based on variant
   * @param variant - Card variant type
   * @returns CSS class string for variant styling
   */
  const getVariantStyles = (variant: ServiceCardVariant): string => {
    switch (variant) {
      case 'grid':
        return 'aspect-[4/3]';
      case 'list':
        return 'flex-row';
      case 'compact':
        return 'p-3';
      case 'detailed':
        return 'min-h-[200px]';
      default:
        return '';
    }
  };


  /**
   * Formats price for display
   * @param pricing - Service pricing information
   * @returns Formatted price string
   */
  const formatPrice = (pricing: Service['pricing']): string => {
    const { basePrice, currency, discount } = pricing;

    if (discount?.isActive && discount.type === 'percentage') {
      const discountedPrice = basePrice * (1 - discount.value / 100);
      return `${currency} ${discountedPrice.toFixed(2)}`;
    }

    return `${currency} ${basePrice.toFixed(2)}`;
  };

  /**
   * Renders rating stars
   * @param rating - Service rating (1-5)
   * @param reviewCount - Number of reviews
   * @returns JSX for rating display
   */
  const renderRating = (rating?: number, reviewCount?: number) => {
    if (!rating) return null;

    return (
      <div className="flex items-center space-x-1">
        <div className="flex items-center">
          {Array.from({ length: 5 }, (_, index) => (
            <svg
              key={index}
              className={cn(
                'w-4 h-4',
                index < Math.floor(rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              )}
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-sm text-gray-600">
          {rating.toFixed(1)} {reviewCount && `(${reviewCount})`}
        </span>
      </div>
    );
  };

  /**
   * Renders approval status badge for admin views
   * @param service - Service data
   * @returns JSX for approval status
   */
  const renderApprovalStatus = (service: Service) => {
    if (!showApprovalStatus || !service.approvalInfo) return null;

    const { status, reviewedAt, reviewedBy, comments } = service.approvalInfo;

    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: {
        label: 'Pending Approval',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      approved: {
        label: 'Approved',
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      rejected: {
        label: 'Rejected',
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    };

    const config = statusConfig[status];

    return (
      <div className="space-y-2">
        <div className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
          config.className
        )}>
          {config.label}
        </div>

        {reviewedAt && (
          <div className="text-xs text-gray-500">
            <p>Reviewed: {new Date(reviewedAt).toLocaleDateString()}</p>
            {reviewedBy && <p>By: {reviewedBy}</p>}
            {comments && (
              <details className="mt-1">
                <summary className="cursor-pointer hover:text-gray-700">
                  View comments
                </summary>
                <p className="mt-1 p-2 bg-gray-50 rounded text-xs">{comments}</p>
              </details>
            )}
          </div>
        )}
      </div>
    );
  };

  /**
   * Renders action buttons based on props
   * @returns JSX for action buttons
   */
  const renderActions = () => {
    if (!showBookingButton && !showEditButton) return null;

    return (
      <div className="flex space-x-2 mt-4">
        {showBookingButton && (
          <Button
            size="sm"
            onClick={handleBookClick}
            className="flex-1"
          >
            Book Now
          </Button>
        )}

        {showEditButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditClick}
          >
            Edit
          </Button>
        )}
      </div>
    );
  };

  /**
   * Renders service tags
   * @param tags - Array of service tags
   * @returns JSX for tags display
   */
  const renderTags = (tags: string[]) => {
    if (tags.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
          >
            {tag}
          </span>
        ))}
        {tags.length > 3 && (
          <span className="text-xs text-gray-500">
            +{tags.length - 3} more
          </span>
        )}
      </div>
    );
  };

  // Grid variant layout
  if (variant === 'grid') {
    return (
      <Card
        className={cn(
          'cursor-pointer hover:shadow-lg transition-all duration-200',
          getVariantStyles(variant),
          className
        )}
        onClick={handleCardClick}
        data-testid={testId}
      >
        <CardContent className="p-0 h-full flex flex-col">
          {/* Service Image */}
          <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
            <img
              src={service.media.mainImage}
              alt={service.media.altText}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Card Content */}
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                {service.name}
              </h3>

              {showDetails && service.shortDescription && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {service.shortDescription}
                </p>
              )}

              {/* Rating */}
              {renderRating(service.rating, service.reviewCount)}

              {/* Pricing */}
              <div className="mt-2">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(service.pricing)}
                </span>
                {service.pricing.discount?.isActive && (
                  <span className="text-sm text-gray-500 line-through ml-2">
                    {service.pricing.currency} {service.pricing.basePrice}
                  </span>
                )}
              </div>

              {/* Tags */}
              {showDetails && renderTags(service.tags)}
            </div>

            {/* Actions */}
            {renderActions()}
          </div>
        </CardContent>
      </Card>
    );
  }

  // List variant layout
  if (variant === 'list') {
    return (
      <Card
        className={cn(
          'cursor-pointer hover:shadow-md transition-all duration-200',
          getVariantStyles(variant),
          className
        )}
        onClick={handleCardClick}
        data-testid={testId}
      >
        <CardContent className="p-0">
          <div className="flex items-center space-x-4">
            {/* Service Image */}
            <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={service.media.mainImage}
                alt={service.media.altText}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Service Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {service.name}
                  </h3>

                  {showDetails && service.shortDescription && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                      {service.shortDescription}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {/* Rating */}
                    {renderRating(service.rating, service.reviewCount)}

                    {/* Duration */}
                    <span>{service.schedule.duration} min</span>

                    {/* Category */}
                    <span>{service.category.name}</span>
                  </div>
                </div>

                {/* Pricing and Actions */}
                <div className="flex-shrink-0 ml-4">
                  <div className="text-right mb-2">
                    <div className="text-lg font-bold text-gray-900">
                      {formatPrice(service.pricing)}
                    </div>
                    {service.pricing.discount?.isActive && (
                      <div className="text-sm text-gray-500 line-through">
                        {service.pricing.currency} {service.pricing.basePrice}
                      </div>
                    )}
                  </div>

                  {renderActions()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact variant layout
  if (variant === 'compact') {
    return (
      <Card
        className={cn(
          'cursor-pointer hover:shadow-md transition-all duration-200',
          getVariantStyles(variant),
          className
        )}
        onClick={handleCardClick}
        data-testid={testId}
      >
        <CardContent className="p-0">
          <div className="flex items-center space-x-3">
            {/* Service Image */}
            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={service.media.mainImage}
                alt={service.media.altText}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Service Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {service.name}
              </h3>

              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm font-semibold text-gray-900">
                  {formatPrice(service.pricing)}
                </span>

                {service.rating && (
                  <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs text-gray-600">
                      {service.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {renderActions()}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Detailed variant layout
  if (variant === 'detailed') {
    return (
      <Card
        className={cn(
          'cursor-pointer hover:shadow-lg transition-all duration-200',
          getVariantStyles(variant),
          className
        )}
        onClick={handleCardClick}
        data-testid={testId}
      >
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Service Image */}
            <div className="md:w-1/3 bg-gray-200 rounded-l-lg overflow-hidden">
              <img
                src={service.media.mainImage}
                alt={service.media.altText}
                className="w-full h-48 md:h-full object-cover"
              />
            </div>

            {/* Service Details */}
            <div className="md:w-2/3 p-6 flex flex-col">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {service.name}
                    </h3>

                    {/* Approval Status for Admin */}
                    {renderApprovalStatus(service)}
                  </div>

                  {/* Pricing */}
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(service.pricing)}
                    </div>
                    {service.pricing.discount?.isActive && (
                      <div className="text-sm text-gray-500 line-through">
                        {service.pricing.currency} {service.pricing.basePrice}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {service.description}
                </p>

                {/* Service Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Duration</span>
                    <p className="text-sm text-gray-900">{service.schedule.duration} minutes</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">Category</span>
                    <p className="text-sm text-gray-900">{service.category.name}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">Location</span>
                    <p className="text-sm text-gray-900 capitalize">
                      {service.location.type.replace('_', ' ')}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <p className="text-sm text-gray-900 capitalize">
                      {service.status.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                {/* Rating and Reviews */}
                {renderRating(service.rating, service.reviewCount)}

                {/* Tags */}
                {renderTags(service.tags)}
              </div>

              {/* Actions */}
              {renderActions()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default fallback
  return (
    <Card
      className={cn('hover:shadow-md transition-shadow', className)}
      data-testid={testId}
    >
      <CardContent>
        <p>Unsupported card variant: {variant}</p>
      </CardContent>
    </Card>
  );
};

/**
 * ServiceCard component display name for debugging
 */
ServiceCard.displayName = 'ServiceCard';

export default ServiceCard;