import { useQuery } from '@tanstack/react-query';
import { userApi } from '../services/user-api.service';
import type { User, UserRole, UserStatus } from '../types/user';

/**
 * Parameters for fetching users list
 */
export interface UsersQueryParams {
  /** Current page number (1-based) */
  page?: number;
  /** Number of users per page */
  pageSize?: number;
  /** Search query for filtering users */
  search?: string;
  /** Filter by user role */
  role?: UserRole;
  /** Filter by user status */
  status?: UserStatus;
  /** Sort field */
  sortBy?: 'firstName' | 'lastName' | 'email' | 'role' | 'status' | 'createdAt' | 'lastLoginAt';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Response structure for users query
 */
export interface UsersQueryResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Custom hook for fetching users with React Query
 * Handles caching, loading states, and error handling
 *
 * @param params - Query parameters for filtering, sorting, and pagination
 * @returns React Query result with users data
 */
export const useUsers = (params: UsersQueryParams = {}) => {
  const {
    page = 1,
    pageSize = 10,
    search,
    role,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = params;

  return useQuery<UsersQueryResponse>({
    queryKey: ['users', { page, pageSize, search, role, status, sortBy, sortOrder }],
    queryFn: async () => {
      // Build filters object for API call
      const filters: Record<string, any> = {};

      if (search) filters.search = search;
      if (role) filters.role = role;
      if (status) filters.status = status;

      // Add pagination and sorting parameters
      const queryParams = {
        ...filters,
        page,
        pageSize,
        sortBy,
        sortOrder
      };

      const response = await userApi.getAllUsers(queryParams);

      // Transform response to include pagination metadata
      return {
        users: response.users,
        total: response.total,
        page,
        pageSize,
        totalPages: Math.ceil(response.total / pageSize)
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < 3;
    }
  });
};

/**
 * Hook for fetching a single user by ID
 * Useful for user detail views or when user data is needed in other components
 *
 * @param userId - The ID of the user to fetch
 * @returns React Query result with user data
 */
export const useUser = (userId: string) => {
  return useQuery<User>({
    queryKey: ['user', userId],
    queryFn: () => userApi.getUser(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 (user not found)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        if (status === 404) {
          return false;
        }
      }
      return failureCount < 3;
    }
  });
};