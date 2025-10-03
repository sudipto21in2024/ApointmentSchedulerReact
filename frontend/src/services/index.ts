/**
 * Main API Services - Centralized export for all API services
 *
 * This module provides a clean, organized way to access all API services
 * throughout the application, preventing circular dependencies and maintaining
 * a clear separation of concerns.
 */

// Import base HTTP client
import { HttpClient, type HttpClientConfig } from './base-api.service';

// Import domain-specific API services
import { ServiceApiService } from './service-api.service';
import { UserApiService } from './user-api.service';
import { BookingApiService } from './booking-api.service';

// Import service instances
import { serviceApi } from './service-api.service';
import { userApi } from './user-api.service';
import { bookingApi } from './booking-api.service';

// Re-export for convenience
export { HttpClient, type HttpClientConfig } from './base-api.service';
export { ServiceApiService } from './service-api.service';
export { UserApiService } from './user-api.service';
export { BookingApiService } from './booking-api.service';

// Export service instances
export { serviceApi, userApi, bookingApi };

// Import types for convenience
export type {
  Service,
  ServiceCreateData,
  ServiceUpdateData,
  ServiceListResponse,
  ServiceFilters,
  ServiceCategory
} from '../components/service/types';

export type {
  User,
  UserCreateData,
  UserUpdateData,
  UserLoginData,
  UserProfile,
  UserPreferences
} from '../types/user';

export type {
  Booking,
  BookingCreateData,
  BookingUpdateData,
  BookingListResponse,
  BookingFilters,
  BookingStatus
} from '../types/booking';

/**
 * Main API service class that composes all domain services
 * Provides a single entry point for the entire API layer
 */
export class ApiService {
  public services: ServiceApiService;
  public users: UserApiService;
  public bookings: BookingApiService;

  constructor(httpClient?: HttpClient) {
    // Create shared HTTP client instance if not provided
    const client = httpClient || new HttpClient();

    // Initialize domain services with shared client
    this.services = new ServiceApiService(client);
    this.users = new UserApiService(client);
    this.bookings = new BookingApiService(client);
  }

  /**
   * Health check for API connectivity
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    services: Record<string, boolean>;
    timestamp: string;
  }> {
    const timestamp = new Date().toISOString();
    const services = {
      services: false,
      users: false,
      bookings: false,
    };

    try {
      // Test basic connectivity with each service
      await Promise.allSettled([
        this.services.getCategories().then(() => { services.services = true; }),
        this.users.getCurrentUser().then(() => { services.users = true; }),
        this.bookings.getUpcomingBookings().then(() => { services.bookings = true; }),
      ]);
    } catch (error) {
      console.warn('API health check failed:', error);
    }

    return {
      status: Object.values(services).every(Boolean) ? 'healthy' : 'unhealthy',
      services,
      timestamp,
    };
  }

  /**
   * Get API service status and configuration
   */
  getStatus() {
    return {
      timestamp: new Date().toISOString(),
      services: 'initialized',
      client: 'configured',
    };
  }
}

/**
 * Default API service instance with shared HTTP client
 */
export const api = new ApiService();

/**
 * Create a new API service instance with custom configuration
 */
export const createApiService = (config?: HttpClientConfig): ApiService => {
  const client = new HttpClient(config);
  return new ApiService(client);
};

// Export individual service instances for direct access (already exported above)

/**
 * API Service configuration options
 */
export interface ApiServiceConfig {
  /** Base URL for API */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Number of retries for failed requests */
  retries?: number;
  /** Custom headers */
  headers?: HeadersInit;
  /** Authentication token */
  authToken?: string;
}

/**
 * Initialize API service with configuration
 */
export const initializeApiService = (config: ApiServiceConfig = {}): ApiService => {
  const { authToken, ...httpConfig } = config;

  // Add auth token to headers if provided
  if (authToken) {
    httpConfig.headers = {
      ...httpConfig.headers,
      Authorization: `Bearer ${authToken}`,
    };
  }

  return createApiService(httpConfig);
};

/**
 * Utility function to check if API is available
 */
export const isApiAvailable = async (): Promise<boolean> => {
  try {
    const health = await api.healthCheck();
    return health.status === 'healthy';
  } catch {
    return false;
  }
};

/**
 * Utility function to get API response time
 */
export const getApiResponseTime = async (): Promise<number> => {
  const start = Date.now();

  try {
    await api.services.getCategories();
    return Date.now() - start;
  } catch {
    return -1; // Error indicator
  }
};