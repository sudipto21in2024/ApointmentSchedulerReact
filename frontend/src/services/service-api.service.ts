import { HttpClient } from './base-api.service';
import type {
  Service,
  ServiceCreateData,
  ServiceUpdateData,
  ServiceListResponse,
  ServiceFilters,
  ServiceSortOption,
  ServicePagination,
  ServiceApprovalResponse,
  ServiceCategory
} from '../components/service/types';

/**
 * Service API Service - Handles all service-related API operations
 * Provides type-safe methods for service CRUD operations and management
 */
export class ServiceApiService {
  private client: HttpClient;

  constructor(client?: HttpClient) {
    this.client = client || new HttpClient();
  }

  /**
   * Get all services with optional filtering and pagination
   */
  async getServices(
    filters?: ServiceFilters,
    sortBy?: ServiceSortOption,
    pagination?: Partial<ServicePagination>
  ): Promise<ServiceListResponse> {
    const params: Record<string, any> = {};

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params[key] = value;
        }
      });
    }

    if (sortBy) {
      params.sortBy = sortBy;
    }

    if (pagination) {
      Object.entries(pagination).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params[key] = value;
        }
      });
    }

    return this.client.get<ServiceListResponse>('/services', params);
  }

  /**
   * Get a single service by ID
   */
  async getService(id: string): Promise<Service> {
    return this.client.get<Service>(`/services/${id}`);
  }

  /**
   * Create a new service
   */
  async createService(serviceData: ServiceCreateData): Promise<Service> {
    return this.client.post<Service>('/services', serviceData);
  }

  /**
   * Update an existing service
   */
  async updateService(id: string, serviceData: ServiceUpdateData): Promise<Service> {
    return this.client.put<Service>(`/services/${id}`, serviceData);
  }

  /**
   * Delete a service
   */
  async deleteService(id: string): Promise<void> {
    return this.client.delete<void>(`/services/${id}`);
  }

  /**
   * Approve a service (tenant admin)
   */
  async approveService(
    id: string,
    comments?: string
  ): Promise<ServiceApprovalResponse> {
    return this.client.put<ServiceApprovalResponse>(`/services/${id}/approve`, { comments });
  }

  /**
   * Reject a service (tenant admin)
   */
  async rejectService(
    id: string,
    reason: string,
    comments?: string
  ): Promise<ServiceApprovalResponse> {
    return this.client.put<ServiceApprovalResponse>(`/services/${id}/reject`, { reason, comments });
  }

  /**
   * Get services pending approval (tenant admin)
   */
  async getPendingServices(pagination?: Partial<ServicePagination>): Promise<ServiceListResponse> {
    const params = pagination ? this.buildPaginationParams(pagination) : {};
    return this.client.get<ServiceListResponse>('/services/pending', params);
  }

  /**
   * Get service categories
   */
  async getCategories(): Promise<ServiceCategory[]> {
    return this.client.get<ServiceCategory[]>('/categories');
  }

  /**
   * Upload service images
   */
  async uploadServiceImages(files: File[]): Promise<string[]> {
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });

    return this.client.upload<string[]>('/services/upload-images', formData);
  }

  /**
   * Get services by provider
   */
  async getServicesByProvider(providerId: string): Promise<Service[]> {
    return this.client.get<Service[]>('/services', { providerId });
  }

  /**
   * Search services
   */
  async searchServices(query: string, filters?: ServiceFilters): Promise<ServiceListResponse> {
    const params: Record<string, any> = { search: query };

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params[key] = value;
        }
      });
    }

    return this.client.get<ServiceListResponse>('/services', params);
  }

  /**
   * Get featured services
   */
  async getFeaturedServices(): Promise<Service[]> {
    return this.client.get<Service[]>('/services', { featured: true });
  }

  /**
   * Get service statistics
   */
  async getServiceStats(serviceId: string): Promise<{
    views: number;
    bookings: number;
    rating: number;
    reviews: number;
  }> {
    return this.client.get(`/services/${serviceId}/stats`);
  }

  /**
   * Update service status
   */
  async updateServiceStatus(
    id: string,
    status: Service['status']
  ): Promise<Service> {
    return this.client.put<Service>(`/services/${id}/status`, { status });
  }

  /**
   * Bulk update services
   */
  async bulkUpdateServices(
    serviceIds: string[],
    updates: Partial<ServiceUpdateData>
  ): Promise<Service[]> {
    return this.client.put<Service[]>('/services/bulk', { serviceIds, updates });
  }

  /**
   * Get service availability
   */
  async getServiceAvailability(
    serviceId: string,
    startDate: string,
    endDate: string
  ): Promise<Array<{ date: string; slots: string[] }>> {
    return this.client.get(`/services/${serviceId}/availability`, {
      startDate,
      endDate,
    });
  }

  /**
   * Private helper method to build pagination parameters
   */
  private buildPaginationParams(pagination: Partial<ServicePagination>): Record<string, any> {
    const params: Record<string, any> = {};

    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params[key] = value;
      }
    });

    return params;
  }
}

/**
 * Service API service instance
 */
export const serviceApi = new ServiceApiService();