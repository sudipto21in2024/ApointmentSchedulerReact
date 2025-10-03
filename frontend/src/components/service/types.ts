/**
 * Comprehensive TypeScript type definitions for Service Management Components
 *
 * This file contains all type definitions used across the service management component library,
 * providing type safety and better developer experience for service-related functionality.
 */

import type { ReactNode } from 'react';

/**
 * Base service component props that all service components can extend
 */
export interface BaseServiceComponentProps {
  /** Additional CSS classes */
  className?: string;
  /** Child components */
  children?: ReactNode;
  /** Test ID for testing purposes */
  'data-testid'?: string;
  /** Custom error handler */
  onError?: (error: ServiceError) => void;
  /** Loading state */
  loading?: boolean;
}

/**
 * Service status enumeration
 */
export type ServiceStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'suspended' | 'archived';

/**
 * Service visibility enumeration
 */
export type ServiceVisibility = 'public' | 'private' | 'unlisted';

/**
 * Service category interface
 */
export interface ServiceCategory {
  /** Unique category identifier */
  id: string;
  /** Category name */
  name: string;
  /** Category description */
  description?: string;
  /** Category icon or image URL */
  icon?: string;
  /** Parent category ID for hierarchical categories */
  parentId?: string;
  /** Category display order */
  order: number;
  /** Whether category is active */
  isActive: boolean;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Service pricing structure
 */
export interface ServicePricing {
  /** Base price for the service */
  basePrice: number;
  /** Currency code (ISO 4217) */
  currency: string;
  /** Price per unit if applicable */
  pricePerUnit?: number;
  /** Unit type (hour, session, person, etc.) */
  unitType?: string;
  /** Whether price includes taxes */
  taxIncluded: boolean;
  /** Discount information */
  discount?: {
    /** Discount type */
    type: 'percentage' | 'fixed_amount';
    /** Discount value */
    value: number;
    /** Discount description */
    description?: string;
    /** Whether discount is active */
    isActive: boolean;
  };
}

/**
 * Service schedule and availability
 */
export interface ServiceSchedule {
  /** Service duration in minutes */
  duration: number;
  /** Buffer time between appointments in minutes */
  bufferTime: number;
  /** Whether service is available on weekends */
  availableOnWeekends: boolean;
  /** Available time slots */
  timeSlots: Array<{
    /** Day of week (0-6, Sunday = 0) */
    dayOfWeek: number;
    /** Start time in HH:mm format */
    startTime: string;
    /** End time in HH:mm format */
    endTime: string;
    /** Whether this time slot is active */
    isActive: boolean;
  }>;
  /** Blackout dates when service is unavailable */
  blackoutDates?: Array<{
    /** Blackout date */
    date: string;
    /** Reason for blackout */
    reason?: string;
  }>;
}

/**
 * Service media and assets
 */
export interface ServiceMedia {
  /** Main service image URL */
  mainImage: string;
  /** Additional service images */
  galleryImages?: string[];
  /** Service video URL if applicable */
  videoUrl?: string;
  /** Image alt text for accessibility */
  altText: string;
}

/**
 * Service location information
 */
export interface ServiceLocation {
  /** Location type */
  type: 'fixed' | 'mobile' | 'virtual' | 'customer_location';
  /** Physical address if applicable */
  address?: {
    /** Street address */
    street: string;
    /** City */
    city: string;
    /** State/Province */
    state: string;
    /** Postal code */
    postalCode: string;
    /** Country */
    country: string;
    /** Coordinates for mapping */
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  /** Service radius for mobile services */
  serviceRadius?: number;
  /** Virtual meeting details */
  virtualDetails?: {
    /** Meeting platform (zoom, teams, etc.) */
    platform: string;
    /** Meeting link or instructions */
    meetingLink?: string;
    /** Additional instructions */
    instructions?: string;
  };
}

/**
 * Service requirements and prerequisites
 */
export interface ServiceRequirements {
  /** Minimum age requirement */
  minimumAge?: number;
  /** Maximum participants */
  maxParticipants?: number;
  /** Required documents or certifications */
  requiredDocuments?: string[];
  /** Prerequisites or prior knowledge required */
  prerequisites?: string[];
  /** Equipment provided by service provider */
  equipmentProvided?: string[];
  /** Equipment customer must bring */
  equipmentRequired?: string[];
}

/**
 * Service interface representing complete service data
 */
export interface Service {
  /** Unique service identifier */
  id: string;
  /** Service provider ID */
  providerId: string;
  /** Service name */
  name: string;
  /** Service description */
  description: string;
  /** Service short description for listings */
  shortDescription?: string;
  /** Service category */
  category: ServiceCategory;
  /** Service subcategory if applicable */
  subcategory?: ServiceCategory;
  /** Service pricing information */
  pricing: ServicePricing;
  /** Service schedule and availability */
  schedule: ServiceSchedule;
  /** Service media and images */
  media: ServiceMedia;
  /** Service location information */
  location: ServiceLocation;
  /** Service requirements */
  requirements?: ServiceRequirements;
  /** Service status */
  status: ServiceStatus;
  /** Service visibility */
  visibility: ServiceVisibility;
  /** Service tags for search and filtering */
  tags: string[];
  /** SEO-friendly URL slug */
  slug: string;
  /** Whether service is featured */
  isFeatured: boolean;
  /** Service rating (1-5) */
  rating?: number;
  /** Number of reviews */
  reviewCount?: number;
  /** Number of times booked */
  bookingCount: number;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Approval/rejection information */
  approvalInfo?: {
    /** Approval status */
    status: 'pending' | 'approved' | 'rejected';
    /** Admin who approved/rejected */
    reviewedBy?: string;
    /** Review timestamp */
    reviewedAt?: string;
    /** Review comments */
    comments?: string;
    /** Rejection reason if applicable */
    rejectionReason?: string;
  };
}

/**
 * Service creation form data interface
 */
export interface ServiceCreateData {
  /** Service name */
  name: string;
  /** Service description */
  description: string;
  /** Service short description */
  shortDescription?: string;
  /** Category ID */
  categoryId: string;
  /** Subcategory ID (optional) */
  subcategoryId?: string;
  /** Service pricing */
  pricing: Omit<ServicePricing, 'discount'>;
  /** Service schedule */
  schedule: ServiceSchedule;
  /** Service location */
  location: ServiceLocation;
  /** Service requirements (optional) */
  requirements?: ServiceRequirements;
  /** Service visibility */
  visibility: ServiceVisibility;
  /** Service tags */
  tags: string[];
  /** Main service image */
  mainImage?: File | string;
  /** Gallery images */
  galleryImages?: (File | string)[];
}

/**
 * Service update form data interface
 */
export interface ServiceUpdateData extends Partial<ServiceCreateData> {
  /** Service ID to update */
  id: string;
  /** Specific fields to update */
  updatedFields?: (keyof ServiceCreateData)[];
}

/**
 * Service filter and search interface
 */
export interface ServiceFilters {
  /** Search query string */
  search?: string;
  /** Category filter */
  categoryId?: string;
  /** Price range filter */
  priceRange?: {
    min: number;
    max: number;
  };
  /** Location filter */
  location?: {
    /** Search radius in kilometers */
    radius?: number;
    /** Center point coordinates */
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    /** Location type filter */
    type?: ServiceLocation['type'];
  };
  /** Rating filter (minimum rating) */
  rating?: number;
  /** Availability filter */
  availability?: {
    /** Start date */
    startDate?: string;
    /** End date */
    endDate?: string;
    /** Specific time slots */
    timeSlots?: string[];
  };
  /** Status filter for admin views */
  status?: ServiceStatus[];
  /** Provider filter */
  providerId?: string;
  /** Tags filter */
  tags?: string[];
  /** Featured services only */
  featured?: boolean;
}

/**
 * Service sorting options
 */
export type ServiceSortOption =
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc'
  | 'rating_asc'
  | 'rating_desc'
  | 'newest'
  | 'oldest'
  | 'most_booked'
  | 'least_booked';

/**
 * Service list pagination interface
 */
export interface ServicePagination {
  /** Current page number (1-based) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there are more pages */
  hasNext: boolean;
  /** Whether there are previous pages */
  hasPrev: boolean;
}

/**
 * Service list response interface
 */
export interface ServiceListResponse {
  /** Array of services */
  services: Service[];
  /** Pagination information */
  pagination: ServicePagination;
  /** Available filters and aggregations */
  aggregations?: {
    /** Available categories with counts */
    categories: Array<ServiceCategory & { count: number }>;
    /** Price range */
    priceRange: { min: number; max: number };
    /** Available tags */
    tags: string[];
    /** Rating distribution */
    ratings: Record<number, number>;
  };
}

/**
 * Service card component props
 */
export interface ServiceCardProps extends BaseServiceComponentProps {
  /** Service data to display */
  service: Service;
  /** Whether to show detailed information */
  showDetails?: boolean;
  /** Whether to show booking button */
  showBookingButton?: boolean;
  /** Whether to show edit button (for service providers) */
  showEditButton?: boolean;
  /** Whether to show approval status (for admins) */
  showApprovalStatus?: boolean;
  /** Custom booking handler */
  onBook?: (service: Service) => void;
  /** Custom edit handler */
  onEdit?: (service: Service) => void;
  /** Card click handler */
  onClick?: (service: Service) => void;
  /** Layout variant */
  variant?: 'grid' | 'list' | 'compact';
}

/**
 * Service list component props
 */
export interface ServiceListProps extends BaseServiceComponentProps {
  /** Array of services to display */
  services: Service[];
  /** Service filters */
  filters?: ServiceFilters;
  /** Sort option */
  sortBy?: ServiceSortOption;
  /** Pagination settings */
  pagination?: Partial<ServicePagination>;
  /** Whether to show filters */
  showFilters?: boolean;
  /** Whether to show sorting options */
  showSorting?: boolean;
  /** Whether to show pagination */
  showPagination?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Filter change handler */
  onFiltersChange?: (filters: ServiceFilters) => void;
  /** Sort change handler */
  onSortChange?: (sort: ServiceSortOption) => void;
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** Service selection handler */
  onServiceSelect?: (service: Service) => void;
}

/**
 * Service creation form props
 */
export interface ServiceCreateProps extends BaseServiceComponentProps {
  /** Initial form values */
  initialValues?: Partial<ServiceCreateData>;
  /** Available categories for selection */
  categories: ServiceCategory[];
  /** Form submission handler */
  onSubmit: (data: ServiceCreateData) => Promise<void>;
  /** Form cancellation handler */
  onCancel?: () => void;
  /** Whether form is in multi-step mode */
  multiStep?: boolean;
  /** Current step for multi-step forms */
  currentStep?: number;
  /** Step change handler for multi-step forms */
  onStepChange?: (step: number) => void;
}

/**
 * Service editing form props
 */
export interface ServiceEditProps extends BaseServiceComponentProps {
  /** Service to edit */
  service: Service;
  /** Available categories for selection */
  categories: ServiceCategory[];
  /** Form submission handler */
  onSubmit: (data: ServiceUpdateData) => Promise<void>;
  /** Form cancellation handler */
  onCancel?: () => void;
  /** Whether form is in multi-step mode */
  multiStep?: boolean;
  /** Current step for multi-step forms */
  currentStep?: number;
  /** Step change handler for multi-step forms */
  onStepChange?: (step: number) => void;
}

/**
 * Service filter component props
 */
export interface ServiceFilterProps extends BaseServiceComponentProps {
  /** Current filters */
  filters: ServiceFilters;
  /** Available categories */
  categories: ServiceCategory[];
  /** Available tags */
  tags: string[];
  /** Price range */
  priceRange: { min: number; max: number };
  /** Filter change handler */
  onFiltersChange: (filters: ServiceFilters) => void;
  /** Filter reset handler */
  onReset?: () => void;
  /** Whether filters are collapsible */
  collapsible?: boolean;
  /** Whether filters are initially collapsed */
  defaultCollapsed?: boolean;
}

/**
 * Service approval component props (for tenant admins)
 */
export interface ServiceApprovalProps extends BaseServiceComponentProps {
  /** Services pending approval */
  pendingServices: Service[];
  /** Approval handler */
  onApprove: (serviceId: string, comments?: string) => Promise<void>;
  /** Rejection handler */
  onReject: (serviceId: string, reason: string, comments?: string) => Promise<void>;
  /** Service selection handler */
  onServiceSelect?: (service: Service) => void;
  /** Pagination settings */
  pagination?: Partial<ServicePagination>;
  /** Page change handler */
  onPageChange?: (page: number) => void;
}

/**
 * Service form validation errors
 */
export interface ServiceFormErrors {
  /** Service name error */
  name?: string;
  /** Description error */
  description?: string;
  /** Category error */
  categoryId?: string;
  /** Pricing errors */
  pricing?: {
    basePrice?: string;
    currency?: string;
  };
  /** Schedule errors */
  schedule?: {
    duration?: string;
    timeSlots?: string;
  };
  /** Media errors */
  media?: {
    mainImage?: string;
    altText?: string;
  };
  /** General form error */
  general?: string;
}

/**
 * Service API response interfaces
 */
export interface ServiceCreateResponse {
  /** Created service data */
  service: Service;
  /** Success message */
  message: string;
  /** Whether service requires approval */
  requiresApproval: boolean;
}

export interface ServiceUpdateResponse {
  /** Updated service data */
  service: Service;
  /** Success message */
  message: string;
}

export interface ServiceApprovalResponse {
  /** Updated service data */
  service: Service;
  /** Approval action performed */
  action: 'approved' | 'rejected';
  /** Success message */
  message: string;
}

/**
 * Service error interface
 */
export interface ServiceError {
  /** Error code for programmatic handling */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Field-specific errors */
  fieldErrors?: Record<string, string>;
  /** HTTP status code if applicable */
  statusCode?: number;
  /** Timestamp when error occurred */
  timestamp: Date;
}

/**
 * Service search and filter utilities
 */
export interface ServiceSearchProps {
  /** Search query */
  query: string;
  /** Search handler */
  onSearch: (query: string) => void;
  /** Search placeholder text */
  placeholder?: string;
  /** Whether search is loading */
  loading?: boolean;
  /** Search suggestions */
  suggestions?: string[];
}

/**
 * Service booking interface
 */
export interface ServiceBooking {
  /** Service being booked */
  service: Service;
  /** Customer ID */
  customerId: string;
  /** Scheduled date and time */
  scheduledAt: string;
  /** Number of participants */
  participantCount: number;
  /** Special requests or notes */
  notes?: string;
  /** Total price including taxes */
  totalPrice: number;
  /** Booking status */
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

/**
 * Service review interface
 */
export interface ServiceReview {
  /** Review ID */
  id: string;
  /** Service ID */
  serviceId: string;
  /** Customer ID */
  customerId: string;
  /** Review rating (1-5) */
  rating: number;
  /** Review title */
  title?: string;
  /** Review content */
  content: string;
  /** Review images */
  images?: string[];
  /** Whether review is verified */
  isVerified: boolean;
  /** Review creation timestamp */
  createdAt: string;
  /** Review update timestamp */
  updatedAt?: string;
}

/**
 * Service analytics interface
 */
export interface ServiceAnalytics {
  /** Service ID */
  serviceId: string;
  /** Total bookings */
  totalBookings: number;
  /** Total revenue */
  totalRevenue: number;
  /** Average rating */
  averageRating: number;
  /** Total reviews */
  totalReviews: number;
  /** Booking trend data */
  bookingTrend: Array<{
    date: string;
    bookings: number;
    revenue: number;
  }>;
  /** Popular time slots */
  popularTimeSlots: Array<{
    timeSlot: string;
    bookings: number;
  }>;
}

/**
 * Service component composition types
 */
export type ServiceComponentWithChildren<T = {}> = T & { children?: ReactNode };
export type ServiceComponentWithClassName<T = {}> = T & { className?: string };
export type ServiceComponentWithError<T = {}> = T & { error?: ServiceError };

/**
 * Event handler types for service components
 */
export type ServiceSelectHandler = (service: Service) => void;
export type ServiceCreateHandler = (data: ServiceCreateData) => Promise<void>;
export type ServiceUpdateHandler = (data: ServiceUpdateData) => Promise<void>;
export type ServiceDeleteHandler = (serviceId: string) => Promise<void>;
export type ServiceApproveHandler = (serviceId: string, comments?: string) => Promise<void>;
export type ServiceRejectHandler = (serviceId: string, reason: string, comments?: string) => Promise<void>;
export type ServiceErrorHandler = (error: ServiceError) => void;

/**
 * Form validation types for services
 */
export interface ServiceFormValidation<T> {
  /** Form data */
  data: T;
  /** Validation errors */
  errors: Partial<Record<keyof T, string>>;
  /** Whether form is valid */
  isValid: boolean;
  /** Whether form is currently validating */
  isValidating: boolean;
  /** Field-specific validation state */
  fieldStates: Record<keyof T, {
    isValid: boolean;
    isValidating: boolean;
    error?: string;
  }>;
}

/**
 * Service list configuration
 */
export interface ServiceListConfig {
  /** Number of items per page */
  pageSize: number;
  /** Default sort option */
  defaultSort: ServiceSortOption;
  /** Available sort options */
  availableSorts: ServiceSortOption[];
  /** Default filters */
  defaultFilters: ServiceFilters;
  /** Whether to enable virtualization for large lists */
  enableVirtualization: boolean;
  /** Virtual scrolling threshold */
  virtualizationThreshold: number;
}

/**
 * Service card layout variants
 */
export type ServiceCardVariant = 'grid' | 'list' | 'compact' | 'detailed';

/**
 * Service card size options
 */
export type ServiceCardSize = 'sm' | 'md' | 'lg';

/**
 * Service form step configuration
 */
export interface ServiceFormStep {
  /** Step ID */
  id: string;
  /** Step title */
  title: string;
  /** Step description */
  description?: string;
  /** Step icon */
  icon?: ReactNode;
  /** Whether step is optional */
  optional?: boolean;
  /** Step validation function */
  validate?: (data: any) => ValidationResult;
  /** Step component */
  component: ReactNode;
}

/**
 * Service form configuration
 */
export interface ServiceFormConfig {
  /** Form steps for multi-step forms */
  steps?: ServiceFormStep[];
  /** Whether to use multi-step layout */
  multiStep: boolean;
  /** Form submission handler */
  onSubmit: (data: any) => Promise<void>;
  /** Form validation configuration */
  validation: {
    /** Real-time validation */
    realTime?: boolean;
    /** Validation debounce delay */
    debounceMs?: number;
    /** Custom validation rules */
    customRules?: Record<string, (value: any) => ValidationResult>;
  };
}

/**
 * Service approval workflow
 */
export interface ServiceApprovalWorkflow {
  /** Approval steps */
  steps: Array<{
    /** Step name */
    name: string;
    /** Step order */
    order: number;
    /** Whether step is required */
    required: boolean;
    /** Step assignee roles */
    assigneeRoles: string[];
    /** Step actions */
    actions: Array<{
      name: string;
      label: string;
      type: 'approve' | 'reject' | 'request_changes';
    }>;
  }>;
  /** Current workflow status */
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  /** Current step */
  currentStep?: number;
}

/**
 * Service notification preferences
 */
export interface ServiceNotificationSettings {
  /** Email notifications for new bookings */
  bookingEmails: boolean;
  /** SMS notifications for booking updates */
  bookingSMS: boolean;
  /** Email notifications for reviews */
  reviewEmails: boolean;
  /** Marketing communications */
  marketingEmails: boolean;
  /** Weekly summary reports */
  weeklyReports: boolean;
}

/**
 * Service provider profile interface
 */
export interface ServiceProviderProfile {
  /** Provider ID */
  id: string;
  /** Provider name */
  name: string;
  /** Provider description */
  description: string;
  /** Provider logo */
  logo?: string;
  /** Provider website */
  website?: string;
  /** Contact information */
  contact: {
    email: string;
    phone: string;
    address?: string;
  };
  /** Business hours */
  businessHours: ServiceSchedule['timeSlots'];
  /** Services offered */
  services: Service[];
  /** Provider rating */
  rating: number;
  /** Total reviews */
  reviewCount: number;
  /** Years in business */
  yearsInBusiness?: number;
  /** Certifications and licenses */
  certifications?: string[];
}

/**
 * Service booking slot interface
 */
export interface ServiceBookingSlot {
  /** Slot start time */
  startTime: string;
  /** Slot end time */
  endTime: string;
  /** Whether slot is available */
  available: boolean;
  /** Slot price (may vary by time) */
  price?: number;
  /** Maximum participants for this slot */
  maxParticipants?: number;
}

/**
 * Service availability calendar
 */
export interface ServiceAvailabilityCalendar {
  /** Service ID */
  serviceId: string;
  /** Available dates and slots */
  availability: Record<string, ServiceBookingSlot[]>;
  /** Unavailable dates with reasons */
  unavailability: Record<string, string>;
  /** Recurring availability rules */
  recurringRules?: Array<{
    /** Days of week (0-6) */
    daysOfWeek: number[];
    /** Start time */
    startTime: string;
    /** End time */
    endTime: string;
    /** Rule description */
    description?: string;
  }>;
}

/**
 * Service comparison interface
 */
export interface ServiceComparison {
  /** Services being compared */
  services: Service[];
  /** Comparison criteria */
  criteria: Array<{
    field: keyof Service;
    label: string;
    format?: (value: any) => string;
  }>;
}

/**
 * Service recommendation interface
 */
export interface ServiceRecommendation {
  /** Recommended service */
  service: Service;
  /** Recommendation score (0-1) */
  score: number;
  /** Recommendation reasons */
  reasons: string[];
  /** User's preferences that influenced recommendation */
  basedOn: Record<string, any>;
}

/**
 * Service wishlist interface
 */
export interface ServiceWishlist {
  /** Wishlist ID */
  id: string;
  /** User ID */
  userId: string;
  /** Wishlisted services */
  services: Array<{
    service: Service;
    /** Date added to wishlist */
    addedAt: string;
    /** User's notes */
    notes?: string;
  }>;
}

/**
 * Service statistics interface
 */
export interface ServiceStatistics {
  /** Service ID */
  serviceId: string;
  /** View count */
  views: number;
  /** Bookmark count */
  bookmarks: number;
  /** Share count */
  shares: number;
  /** Average time spent viewing */
  averageViewTime: number;
  /** Conversion rate (views to bookings) */
  conversionRate: number;
  /** Geographic distribution of views */
  geographicDistribution: Record<string, number>;
}

/**
 * Service component theme interface
 */
export interface ServiceTheme {
  /** Color scheme */
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    border: string;
  };
  /** Typography */
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
      xlarge: string;
    };
  };
  /** Spacing scale */
  spacing: {
    small: string;
    medium: string;
    large: string;
    xlarge: string;
  };
}

/**
 * Service component responsive props
 */
export interface ServiceResponsiveProps {
  /** Mobile breakpoint styles */
  mobile?: Record<string, any>;
  /** Tablet breakpoint styles */
  tablet?: Record<string, any>;
  /** Desktop breakpoint styles */
  desktop?: Record<string, any>;
}

/**
 * Service form field configuration
 */
export interface ServiceFormField {
  /** Field name */
  name: keyof ServiceCreateData;
  /** Field type */
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'file' | 'checkbox' | 'radio';
  /** Field label */
  label: string;
  /** Field placeholder */
  placeholder?: string;
  /** Field description/help text */
  description?: string;
  /** Whether field is required */
  required?: boolean;
  /** Field validation rules */
  validation?: ValidationRule[];
  /** Field options for select/radio */
  options?: Array<{ label: string; value: any; disabled?: boolean }>;
  /** Field dependencies */
  dependencies?: Array<{
    field: string;
    value: any;
    action: 'show' | 'hide' | 'enable' | 'disable';
  }>;
}

/**
 * Service form step configuration
 */
export interface ServiceFormStepConfig {
  /** Step ID */
  id: string;
  /** Step title */
  title: string;
  /** Step description */
  description?: string;
  /** Step fields */
  fields: ServiceFormField[];
  /** Step validation */
  validation?: (data: Partial<ServiceCreateData>) => ValidationResult;
}

/**
 * Service management hooks return types
 */
export interface UseServiceListReturn {
  /** List of services */
  services: Service[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: ServiceError | null;
  /** Pagination info */
  pagination: ServicePagination;
  /** Refresh function */
  refresh: () => Promise<void>;
  /** Load more function */
  loadMore: () => Promise<void>;
  /** Filter function */
  filter: (filters: ServiceFilters) => void;
  /** Sort function */
  sort: (sortBy: ServiceSortOption) => void;
}

export interface UseServiceReturn {
  /** Service data */
  service: Service | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: ServiceError | null;
  /** Update function */
  update: (data: ServiceUpdateData) => Promise<void>;
  /** Delete function */
  delete: () => Promise<void>;
  /** Refresh function */
  refresh: () => Promise<void>;
}

export interface UseServiceFormReturn {
  /** Form data */
  data: ServiceCreateData | ServiceUpdateData;
  /** Form errors */
  errors: ServiceFormErrors;
  /** Form validation state */
  validation: ServiceFormValidation<ServiceCreateData | ServiceUpdateData>;
  /** Form submission state */
  submission: {
    isSubmitting: boolean;
    isSubmitted: boolean;
    error?: ServiceError;
  };
  /** Form handlers */
  handlers: {
    updateField: (field: string, value: any) => void;
    validateField: (field: string) => Promise<ValidationResult>;
    validateForm: () => Promise<boolean>;
    submitForm: () => Promise<void>;
    resetForm: () => void;
  };
}

/**
 * Service approval workflow types
 */
export interface ServiceApprovalAction {
  /** Action type */
  type: 'approve' | 'reject' | 'request_changes';
  /** Admin user ID */
  adminId: string;
  /** Action timestamp */
  timestamp: string;
  /** Action comments */
  comments?: string;
  /** Rejection reason if applicable */
  rejectionReason?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Service component testing utilities
 */
export interface ServiceTestUtils {
  /** Mock service data */
  mockService: Service;
  /** Mock service list */
  mockServiceList: Service[];
  /** Mock categories */
  mockCategories: ServiceCategory[];
  /** Helper to render service components */
  renderServiceComponent: (component: ReactNode) => any;
  /** Helper to simulate service creation */
  simulateServiceCreation: (data?: Partial<ServiceCreateData>) => Promise<void>;
  /** Helper to simulate service booking */
  simulateServiceBooking: (service: Service) => Promise<void>;
}

/**
 * Utility types for better type inference
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type ServiceFormData = ServiceCreateData | ServiceUpdateData;
export type ServiceComponentProps<T = {}> = T & BaseServiceComponentProps;

/**
 * Import the ValidationResult and ValidationRule types from validation utils
 */
import type { ValidationResult, ValidationRule } from '../../utils/validation';

/**
 * All service-related types are already exported above
 * This section provides additional utility type exports
 */