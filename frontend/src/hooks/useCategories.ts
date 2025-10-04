import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ServiceCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryListResponse,
  CategoryQueryParams,
  CategoryTreeNode,
} from '../types/service';

/**
 * Category Management Hooks using TanStack Query
 *
 * Provides React hooks for category management operations with automatic caching,
 * background refetching, and optimistic updates.
 */

// Import the API request function from useServices
// TODO: Consider creating a shared API utility
import { apiRequest } from './useServices';

// ==================== QUERY KEYS ====================

/**
 * Query keys for category-related queries
 */
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (params: CategoryQueryParams) => [...categoryKeys.lists(), params] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  tree: () => [...categoryKeys.all, 'tree'] as const,
};

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch categories with optional filtering
 *
 * @param params - Query parameters for filtering categories
 * @returns Query object with categories data, loading state, and error handling
 *
 * @example
 * ```typescript
 * const { data, isLoading, error } = useCategories({ isActive: true });
 * ```
 */
export const useCategories = (params?: CategoryQueryParams) => {
  return useQuery({
    queryKey: categoryKeys.list(params || {}),
    queryFn: async (): Promise<CategoryListResponse> => {
      const queryParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const queryString = queryParams.toString();
      const endpoint = `/categories${queryString ? `?${queryString}` : ''}`;

      return apiRequest<CategoryListResponse>(endpoint);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - categories change less frequently
  });
};

/**
 * Hook to fetch a single category by ID
 *
 * @param id - Category ID to fetch
 * @returns Query object with category data
 *
 * @example
 * ```typescript
 * const { data: category, isLoading } = useCategory('category-123');
 * ```
 */
export const useCategory = (id: string) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: async (): Promise<ServiceCategory> => {
      const response = await apiRequest<{ data: ServiceCategory }>(`/categories/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook to fetch category tree (hierarchical structure)
 *
 * @returns Query object with category tree data
 *
 * @example
 * ```typescript
 * const { data: categoryTree, isLoading } = useCategoryTree();
 * ```
 */
export const useCategoryTree = () => {
  return useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: async (): Promise<CategoryTreeNode[]> => {
      const response = await apiRequest<CategoryListResponse>('/categories');
      const categories = response.data;

      // Build hierarchical tree
      const categoryMap = new Map<string, ServiceCategory & { children: CategoryTreeNode[] }>();
      const rootNodes: CategoryTreeNode[] = [];

      // Initialize all categories with children array
      categories.forEach((category: ServiceCategory) => {
        categoryMap.set(category.id, { ...category, children: [] });
      });

      // Build the tree
      categories.forEach((category: ServiceCategory) => {
        const node = categoryMap.get(category.id)!;

        if (category.parentCategoryId) {
          const parent = categoryMap.get(category.parentCategoryId);
          if (parent) {
            parent.children.push(node);
          } else {
            // Parent not found, treat as root
            rootNodes.push(node);
          }
        } else {
          rootNodes.push(node);
        }
      });

      return rootNodes;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Hook to create a new category
 *
 * @returns Mutation object for creating categories
 *
 * @example
 * ```typescript
 * const createCategoryMutation = useCreateCategory();
 *
 * const handleCreate = async (categoryData) => {
 *   try {
 *     await createCategoryMutation.mutateAsync(categoryData);
 *     // Category created successfully
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData: CreateCategoryRequest): Promise<ServiceCategory> => {
      // Basic validation
      if (!categoryData.name?.trim()) {
        throw new Error('Category name is required');
      }

      // Validate parent category ID format if provided
      if (categoryData.parentCategoryId && typeof categoryData.parentCategoryId !== 'string') {
        throw new Error('Parent category ID must be a valid string');
      }

      // Validate sort order if provided
      if (categoryData.sortOrder !== undefined && (typeof categoryData.sortOrder !== 'number' || categoryData.sortOrder < 0)) {
        throw new Error('Sort order must be a non-negative number');
      }

      const response = await apiRequest<{ data: ServiceCategory }>('/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch categories list and tree
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
    },
  });
};

/**
 * Hook to update an existing category
 *
 * @returns Mutation object for updating categories
 *
 * @example
 * ```typescript
 * const updateCategoryMutation = useUpdateCategory();
 *
 * const handleUpdate = async (id, updateData) => {
 *   await updateCategoryMutation.mutateAsync({ id, data: updateData });
 * };
 * ```
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string;
      data: UpdateCategoryRequest;
    }): Promise<ServiceCategory> => {
      if (!id || typeof id !== 'string') {
        throw new Error('Category ID is required and must be a valid string');
      }

      // Basic validation for provided fields
      if (data.name !== undefined && !data.name?.trim()) {
        throw new Error('Category name cannot be empty');
      }

      // Validate parent category ID format if provided
      if (data.parentCategoryId !== undefined && data.parentCategoryId !== null && typeof data.parentCategoryId !== 'string') {
        throw new Error('Parent category ID must be a valid string or null');
      }

      // Validate sort order if provided
      if (data.sortOrder !== undefined && (typeof data.sortOrder !== 'number' || data.sortOrder < 0)) {
        throw new Error('Sort order must be a non-negative number');
      }

      const response = await apiRequest<{ data: ServiceCategory }>(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific category in cache
      queryClient.setQueryData(categoryKeys.detail(variables.id), data);
      // Invalidate lists and tree to ensure consistency
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
    },
  });
};

/**
 * Hook to delete a category
 *
 * @returns Mutation object for deleting categories
 *
 * @example
 * ```typescript
 * const deleteCategoryMutation = useDeleteCategory();
 *
 * const handleDelete = async (id) => {
 *   await deleteCategoryMutation.mutateAsync(id);
 * };
 * ```
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!id || typeof id !== 'string') {
        throw new Error('Category ID is required and must be a valid string');
      }

      await apiRequest(`/categories/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      // Invalidate categories lists and tree
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
    },
  });
};