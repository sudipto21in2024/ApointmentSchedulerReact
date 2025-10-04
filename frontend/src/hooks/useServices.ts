import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Service,
  CreateServiceRequest,
  UpdateServiceRequest,
  ServiceListResponse,
  ServiceQueryParams,
} from '../types/service';

/**
 * Service Management Hooks using TanStack Query
 *
 * Provides React hooks for service management operations with automatic caching,
 * background refetching, and optimistic updates.
 */

// Base URL for API - should match environment configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.appointmentsystem.com/v1';

/**
 * Get authentication token
 * TODO: Replace with proper auth context
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Generic API request function with authentication
 */
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json();
};

// ==================== QUERY KEYS ====================

/**
 * Query keys for service-related queries
 */
export const serviceKeys = {
  all: ['services'] as const,
  lists: () => [...serviceKeys.all, 'list'] as const,
  list: (params: ServiceQueryParams) => [...serviceKeys.lists(), params] as const,
  details: () => [...serviceKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceKeys.details(), id] as const,
};

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch services with filtering and pagination
 *
 * @param params - Query parameters for filtering services
 * @returns Query object with services data, loading state, and error handling
 *
 * @example
 * ```typescript
 * const { data, isLoading, error } = useServices({ categoryId: 'cat-1', isActive: true });
 * ```
 */
export const useServices = (params?: ServiceQueryParams) => {
  return useQuery({
    queryKey: serviceKeys.list(params || {}),
    queryFn: async (): Promise<ServiceListResponse> => {
      const queryParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const queryString = queryParams.toString();
      const endpoint = `/services${queryString ? `?${queryString}` : ''}`;

      return apiRequest<ServiceListResponse>(endpoint);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch a single service by ID
 *
 * @param id - Service ID to fetch
 * @returns Query object with service data
 *
 * @example
 * ```typescript
 * const { data: service, isLoading } = useService('service-123');
 * ```
 */
export const useService = (id: string) => {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: async (): Promise<Service> => {
      const response = await apiRequest<{ data: Service }>(`/services/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Hook to create a new service
 *
 * @returns Mutation object for creating services
 *
 * @example
 * ```typescript
 * const createServiceMutation = useCreateService();
 *
 * const handleCreate = async (serviceData) => {
 *   try {
 *     await createServiceMutation.mutateAsync(serviceData);
 *     // Service created successfully
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceData: CreateServiceRequest): Promise<Service> => {
      // Basic validation
      if (!serviceData.name?.trim()) {
        throw new Error('Service name is required');
      }
      if (!serviceData.description?.trim()) {
        throw new Error('Service description is required');
      }
      if (!serviceData.categoryId) {
        throw new Error('Category ID is required');
      }
      if (!serviceData.providerId) {
        throw new Error('Provider ID is required');
      }
      if (!serviceData.tenantId) {
        throw new Error('Tenant ID is required');
      }
      if (serviceData.duration <= 0) {
        throw new Error('Service duration must be greater than 0');
      }
      if (serviceData.price < 0) {
        throw new Error('Service price cannot be negative');
      }
      if (!serviceData.currency?.trim()) {
        throw new Error('Currency is required');
      }

      const response = await apiRequest<{ data: Service }>('/services', {
        method: 'POST',
        body: JSON.stringify(serviceData),
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch services list
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
    },
  });
};

/**
 * Hook to update an existing service
 *
 * @returns Mutation object for updating services
 *
 * @example
 * ```typescript
 * const updateServiceMutation = useUpdateService();
 *
 * const handleUpdate = async (id, updateData) => {
 *   await updateServiceMutation.mutateAsync({ id, data: updateData });
 * };
 * ```
 */
export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string;
      data: UpdateServiceRequest;
    }): Promise<Service> => {
      if (!id || typeof id !== 'string') {
        throw new Error('Service ID is required and must be a valid string');
      }

      // Basic validation for provided fields
      if (data.name !== undefined && !data.name?.trim()) {
        throw new Error('Service name cannot be empty');
      }
      if (data.description !== undefined && !data.description?.trim()) {
        throw new Error('Service description cannot be empty');
      }
      if (data.duration !== undefined && data.duration <= 0) {
        throw new Error('Service duration must be greater than 0');
      }
      if (data.price !== undefined && data.price < 0) {
        throw new Error('Service price cannot be negative');
      }
      if (data.currency !== undefined && !data.currency?.trim()) {
        throw new Error('Currency cannot be empty');
      }

      const response = await apiRequest<{ data: Service }>(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      // Update the specific service in cache
      queryClient.setQueryData(serviceKeys.detail(variables.id), _data);
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
    },
  });
};

/**
 * Hook to delete a service
 *
 * @returns Mutation object for deleting services
 *
 * @example
 * ```typescript
 * const deleteServiceMutation = useDeleteService();
 *
 * const handleDelete = async (id) => {
 *   await deleteServiceMutation.mutateAsync(id);
 * };
 * ```
 */
export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!id || typeof id !== 'string') {
        throw new Error('Service ID is required and must be a valid string');
      }

      await apiRequest(`/services/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      // Invalidate services lists
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
    },
  });
};

/**
 * Hook to approve a service
 *
 * @returns Mutation object for approving services
 *
 * @example
 * ```typescript
 * const approveServiceMutation = useApproveService();
 *
 * const handleApprove = async (id) => {
 *   await approveServiceMutation.mutateAsync(id);
 * };
 * ```
 */
export const useApproveService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ message: string }> => {
      if (!id || typeof id !== 'string') {
        throw new Error('Service ID is required and must be a valid string');
      }

      return apiRequest<{ message: string }>(`/services/${id}/approve`, {
        method: 'PUT',
      });
    },
    onSuccess: (_data, id) => {
      // Update the service status in cache
      queryClient.setQueryData(serviceKeys.detail(id), (old: Service | undefined) => {
        if (!old) return old;
        return { ...old, isActive: true }; // Assuming approval activates the service
      });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
    },
  });
};

/**
 * Hook to reject a service
 *
 * @returns Mutation object for rejecting services
 *
 * @example
 * ```typescript
 * const rejectServiceMutation = useRejectService();
 *
 * const handleReject = async (id, reason) => {
 *   await rejectServiceMutation.mutateAsync({ id, reason });
 * };
 * ```
 */
export const useRejectService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reason
    }: {
      id: string;
      reason?: string;
    }): Promise<{ message: string }> => {
      if (!id || typeof id !== 'string') {
        throw new Error('Service ID is required and must be a valid string');
      }

      const body = reason ? { reason } : undefined;

      return apiRequest<{ message: string }>(`/services/${id}/reject`, {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      });
    },
    onSuccess: (_data, { id }) => {
      // Update the service status in cache
      queryClient.setQueryData(serviceKeys.detail(id), (old: Service | undefined) => {
        if (!old) return old;
        return { ...old, isActive: false }; // Assuming rejection deactivates the service
      });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
    },
  });
};