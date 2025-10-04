// Payment service types and interfaces based on OpenAPI specifications
// This file defines all TypeScript interfaces for payment-related entities

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { getAccessToken } from './token';

export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';

export type PaymentMethod = 'CreditCard' | 'DebitCard' | 'PayPal' | 'BankTransfer';

// Core payment entity interface
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  paymentGateway?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  refundAmount?: number;
}

// Request interfaces for API operations
export interface CreatePaymentRequest {
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentGateway?: string;
  transactionId?: string;
}

export interface UpdatePaymentRequest {
  paymentStatus?: PaymentStatus;
  transactionId?: string;
  paidAt?: string;
}

export interface RefundRequest {
  amount?: number;
  reason?: string;
}

// Response interfaces
export interface PaymentResponse {
  data: Payment;
}

export interface PaymentListResponse {
  data: Payment[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  links?: {
    self: string;
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
}

// Query parameters for payment listing
export interface PaymentQueryParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  status?: PaymentStatus;
  bookingId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

// Payment method interfaces
export interface PaymentMethodEntity {
  id: string;
  type: string;
  lastFourDigits: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  createdAt: string;
}

export interface CreatePaymentMethodRequest {
  type: string;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardholderName?: string;
}
export interface UpdatePaymentMethodRequest {
  expiryMonth?: number;
  expiryYear?: number;
  cardholderName?: string;
}

export interface PaymentMethodResponse {
  data: PaymentMethodEntity;
}

export interface PaymentMethodListResponse {
  data: PaymentMethodEntity[];
}

// Error interface
export interface PaymentError {
  message: string;
  code?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// Base API URL - should come from environment variables in production
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.appointmentsystem.com/v1';

// Axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - could trigger logout
      console.warn('Unauthorized access - token may be expired');
    }
    return Promise.reject(error);
  }
);

/**
 * Query keys for React Query caching
 */
export const paymentQueryKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentQueryKeys.all, 'list'] as const,
  list: (params: PaymentQueryParams) => [...paymentQueryKeys.lists(), params] as const,
  details: () => [...paymentQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentQueryKeys.details(), id] as const,
  methods: ['payment-methods'] as const,
  methodList: (userId?: string, tenantId?: string) => [...paymentQueryKeys.methods, 'list', { userId, tenantId }] as const,
};

/**
 * Fetches a paginated list of payments with optional filtering
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to payment list response
 */
export const fetchPayments = async (params: PaymentQueryParams = {}): Promise<PaymentListResponse> => {
  try {
    const response = await apiClient.get<PaymentListResponse>('/payments', { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const paymentError: PaymentError = {
        message: error.response.data?.error?.message || 'Failed to fetch payments',
        code: error.response.status.toString(),
        details: error.response.data?.error?.details,
      };
      throw paymentError;
    }
    throw { message: 'Network error while fetching payments' } as PaymentError;
  }
};

/**
 * Fetches a single payment by ID
 * @param id - Payment ID
 * @returns Promise resolving to payment response
 */
export const fetchPaymentById = async (id: string): Promise<PaymentResponse> => {
  try {
    const response = await apiClient.get<PaymentResponse>(`/payments/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const paymentError: PaymentError = {
        message: error.response.data?.error?.message || 'Failed to fetch payment',
        code: error.response.status.toString(),
        details: error.response.data?.error?.details,
      };
      throw paymentError;
    }
    throw { message: 'Network error while fetching payment' } as PaymentError;
  }
};

/**
 * Creates a new payment
 * @param paymentData - Payment creation data
 * @returns Promise resolving to payment response
 */
export const createPayment = async (paymentData: CreatePaymentRequest): Promise<PaymentResponse> => {
  try {
    const response = await apiClient.post<PaymentResponse>('/payments', paymentData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const paymentError: PaymentError = {
        message: error.response.data?.error?.message || 'Failed to create payment',
        code: error.response.status.toString(),
        details: error.response.data?.error?.details,
      };
      throw paymentError;
    }
    throw { message: 'Network error while creating payment' } as PaymentError;
  }
};

/**
 * Updates an existing payment
 * @param id - Payment ID
 * @param updateData - Payment update data
 * @returns Promise resolving to payment response
 */
export const updatePayment = async (id: string, updateData: UpdatePaymentRequest): Promise<PaymentResponse> => {
  try {
    const response = await apiClient.put<PaymentResponse>(`/payments/${id}`, updateData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const paymentError: PaymentError = {
        message: error.response.data?.error?.message || 'Failed to update payment',
        code: error.response.status.toString(),
        details: error.response.data?.error?.details,
      };
      throw paymentError;
    }
    throw { message: 'Network error while updating payment' } as PaymentError;
  }
};

/**
 * Processes a refund for a payment
 * @param id - Payment ID
 * @param refundData - Refund request data
 * @returns Promise resolving to payment response
 */
export const refundPayment = async (id: string, refundData: RefundRequest = {}): Promise<PaymentResponse> => {
  try {
    const response = await apiClient.post<PaymentResponse>(`/payments/${id}/refund`, refundData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const paymentError: PaymentError = {
        message: error.response.data?.error?.message || 'Failed to process refund',
        code: error.response.status.toString(),
        details: error.response.data?.error?.details,
      };
      throw paymentError;
    }
    throw { message: 'Network error while processing refund' } as PaymentError;
  }
};

/**
 * Fetches payment methods for a user or tenant
 * @param userId - Optional user ID
 * @param tenantId - Optional tenant ID
 * @returns Promise resolving to payment method list response
 */
export const fetchPaymentMethods = async (userId?: string, tenantId?: string): Promise<PaymentMethodListResponse> => {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (tenantId) params.append('tenantId', tenantId);

    const response = await apiClient.get<PaymentMethodListResponse>(`/payment-methods?${params.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const paymentError: PaymentError = {
        message: error.response.data?.error?.message || 'Failed to fetch payment methods',
        code: error.response.status.toString(),
        details: error.response.data?.error?.details,
      };
      throw paymentError;
    }
    throw { message: 'Network error while fetching payment methods' } as PaymentError;
  }
};

/**
 * Creates a new payment method
 * @param methodData - Payment method creation data
 * @param userId - Optional user ID
 * @param tenantId - Optional tenant ID
 * @returns Promise resolving to payment method response
 */
export const createPaymentMethod = async (
  methodData: CreatePaymentMethodRequest,
  userId?: string,
  tenantId?: string
): Promise<PaymentMethodResponse> => {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (tenantId) params.append('tenantId', tenantId);

    const response = await apiClient.post<PaymentMethodResponse>(`/payment-methods?${params.toString()}`, methodData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const paymentError: PaymentError = {
        message: error.response.data?.error?.message || 'Failed to create payment method',
        code: error.response.status.toString(),
        details: error.response.data?.error?.details,
      };
      throw paymentError;
    }
    throw { message: 'Network error while creating payment method' } as PaymentError;
  }
};

/**
 * Updates an existing payment method
 * @param id - Payment method ID
 * @param updateData - Payment method update data
 * @param userId - Optional user ID
 * @param tenantId - Optional tenant ID
 * @returns Promise resolving to payment method response
 */
export const updatePaymentMethod = async (
  id: string,
  updateData: UpdatePaymentMethodRequest,
  userId?: string,
  tenantId?: string
): Promise<PaymentMethodResponse> => {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (tenantId) params.append('tenantId', tenantId);

    const response = await apiClient.put<PaymentMethodResponse>(`/payment-methods/${id}?${params.toString()}`, updateData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const paymentError: PaymentError = {
        message: error.response.data?.error?.message || 'Failed to update payment method',
        code: error.response.status.toString(),
        details: error.response.data?.error?.details,
      };
      throw paymentError;
    }
    throw { message: 'Network error while updating payment method' } as PaymentError;
  }
};

/**
 * Deletes a payment method
 * @param id - Payment method ID
 * @param userId - Optional user ID
 * @param tenantId - Optional tenant ID
 * @returns Promise resolving when deletion is complete
 */
export const deletePaymentMethod = async (id: string, userId?: string, tenantId?: string): Promise<void> => {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (tenantId) params.append('tenantId', tenantId);

    await apiClient.delete(`/payment-methods/${id}?${params.toString()}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const paymentError: PaymentError = {
        message: error.response.data?.error?.message || 'Failed to delete payment method',
        code: error.response.status.toString(),
        details: error.response.data?.error?.details,
      };
      throw paymentError;
    }
    throw { message: 'Network error while deleting payment method' } as PaymentError;
  }
};

/**
 * Sets a payment method as the default
 * @param id - Payment method ID
 * @param userId - Optional user ID
 * @param tenantId - Optional tenant ID
 * @returns Promise resolving when operation is complete
 */
export const setDefaultPaymentMethod = async (id: string, userId?: string, tenantId?: string): Promise<void> => {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (tenantId) params.append('tenantId', tenantId);

    await apiClient.put(`/payment-methods/${id}/default?${params.toString()}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const paymentError: PaymentError = {
        message: error.response.data?.error?.message || 'Failed to set default payment method',
        code: error.response.status.toString(),
        details: error.response.data?.error?.details,
      };
      throw paymentError;
    }
    throw { message: 'Network error while setting default payment method' } as PaymentError;
  }
};

// React Query Hooks

/**
 * Hook to fetch payments with React Query
 * @param params - Query parameters
 * @returns Query object with payments data
 */
export const usePayments = (params: PaymentQueryParams = {}) => {
  return useQuery({
    queryKey: paymentQueryKeys.list(params),
    queryFn: () => fetchPayments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch a single payment by ID
 * @param id - Payment ID
 * @returns Query object with payment data
 */
export const usePayment = (id: string) => {
  return useQuery({
    queryKey: paymentQueryKeys.detail(id),
    queryFn: () => fetchPaymentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to create a payment
 * @returns Mutation object for payment creation
 */
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      // Invalidate and refetch payments
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.lists() });
    },
  });
};

/**
 * Hook to update a payment
 * @returns Mutation object for payment update
 */
export const useUpdatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentRequest }) => updatePayment(id, data),
    onSuccess: (data, variables) => {
      // Update the specific payment in cache
      queryClient.setQueryData(paymentQueryKeys.detail(variables.id), { data: data.data });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.lists() });
    },
  });
};

/**
 * Hook to refund a payment
 * @returns Mutation object for payment refund
 */
export const useRefundPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: RefundRequest }) => refundPayment(id, data),
    onSuccess: (data, variables) => {
      // Update the specific payment in cache
      queryClient.setQueryData(paymentQueryKeys.detail(variables.id), { data: data.data });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.lists() });
    },
  });
};

/**
 * Hook to fetch payment methods
 * @param userId - Optional user ID
 * @param tenantId - Optional tenant ID
 * @returns Query object with payment methods data
 */
export const usePaymentMethods = (userId?: string, tenantId?: string) => {
  return useQuery({
    queryKey: paymentQueryKeys.methodList(userId, tenantId),
    queryFn: () => fetchPaymentMethods(userId, tenantId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to create a payment method
 * @returns Mutation object for payment method creation
 */
export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, userId, tenantId }: { data: CreatePaymentMethodRequest; userId?: string; tenantId?: string }) =>
      createPaymentMethod(data, userId, tenantId),
    onSuccess: () => {
      // Invalidate payment methods
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.methods });
    },
  });
};

/**
 * Hook to update a payment method
 * @returns Mutation object for payment method update
 */
export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, userId, tenantId }: { id: string; data: UpdatePaymentMethodRequest; userId?: string; tenantId?: string }) =>
      updatePaymentMethod(id, data, userId, tenantId),
    onSuccess: () => {
      // Invalidate payment methods
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.methods });
    },
  });
};

/**
 * Hook to delete a payment method
 * @returns Mutation object for payment method deletion
 */
export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId, tenantId }: { id: string; userId?: string; tenantId?: string }) =>
      deletePaymentMethod(id, userId, tenantId),
    onSuccess: () => {
      // Invalidate payment methods
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.methods });
    },
  });
};

/**
 * Hook to set default payment method
 * @returns Mutation object for setting default payment method
 */
export const useSetDefaultPaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId, tenantId }: { id: string; userId?: string; tenantId?: string }) =>
      setDefaultPaymentMethod(id, userId, tenantId),
    onSuccess: () => {
      // Invalidate payment methods
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.methods });
    },
  });
};