// TypeScript interfaces for Service Management API based on OpenAPI specification

/**
 * Represents a service entity in the system
 */
export interface Service {
  /** Unique identifier for the service */
  id: string;
  /** Service name */
  name: string;
  /** Detailed service description */
  description: string;
  /** Reference to service category */
  categoryId: string;
  /** Reference to service provider (User) */
  providerId: string;
  /** Reference to tenant */
  tenantId: string;
  /** Service duration in minutes */
  duration: number;
  /** Service price */
  price: number;
  /** Currency code */
  currency: string;
  /** Service status */
  isActive: boolean;
  /** Service creation timestamp */
  createdAt: string;
  /** Last service update timestamp */
  updatedAt: string;
  /** Featured service flag */
  isFeatured?: boolean;
  /** Maximum bookings per day */
  maxBookingsPerDay?: number;
  /** Availability exceptions */
  availabilityExceptions?: Array<{
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  }>;
}

/**
 * Represents a service category entity
 */
export interface ServiceCategory {
  /** Unique identifier for the category */
  id: string;
  /** Category name */
  name: string;
  /** Category description */
  description?: string;
  /** Reference to parent category (for hierarchy) */
  parentCategoryId?: string;
  /** Category icon/image URL */
  iconUrl?: string;
  /** Display order */
  sortOrder?: number;
  /** Category status */
  isActive?: boolean;
  /** Category creation timestamp */
  createdAt: string;
  /** Last category update timestamp */
  updatedAt: string;
}

/**
 * Request payload for creating a new service
 */
export interface CreateServiceRequest {
  name: string;
  description: string;
  categoryId: string;
  providerId: string;
  tenantId: string;
  duration: number;
  price: number;
  currency: string;
  isActive?: boolean;
  isFeatured?: boolean;
  maxBookingsPerDay?: number;
}

/**
 * Request payload for updating an existing service
 */
export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  categoryId?: string;
  duration?: number;
  price?: number;
  currency?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  maxBookingsPerDay?: number;
}

/**
 * Request payload for creating a new category
 */
export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentCategoryId?: string;
  iconUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

/**
 * Request payload for updating an existing category
 */
export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  parentCategoryId?: string;
  iconUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  /** Current page number */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
}

/**
 * Response wrapper for single service
 */
export interface ServiceResponse {
  data: Service;
}

/**
 * Response wrapper for service list with pagination
 */
export interface ServiceListResponse {
  data: Service[];
  meta: PaginationMeta;
  links?: {
    self: string;
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
}

/**
 * Response wrapper for single category
 */
export interface CategoryResponse {
  data: ServiceCategory;
}

/**
 * Response wrapper for category list
 */
export interface CategoryListResponse {
  data: ServiceCategory[];
}

/**
 * Query parameters for service filtering
 */
export interface ServiceQueryParams extends Record<string, string | number | boolean | undefined> {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  categoryId?: string;
  providerId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

/**
 * Query parameters for category filtering
 */
export interface CategoryQueryParams extends Record<string, string | number | boolean | undefined> {
  isActive?: boolean;
}

/**
 * Generic API error response
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Request payload for rejecting a service
 */
export interface RejectServiceRequest {
  reason?: string;
}

/**
 * Category tree node interface for hierarchical display
 */
export interface CategoryTreeNode extends ServiceCategory {
  children: CategoryTreeNode[];
}