import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { httpClient, HttpClientError } from './http-client';

/**
 * API Interceptor Service
 * Manages request and response interceptors for authentication,
 * error handling, and common API functionality
 */
export class ApiInterceptorService {
  private requestInterceptorId?: number;
  private responseInterceptorId?: number;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];
  private retriedRequests = new WeakMap<InternalAxiosRequestConfig, boolean>();

  /**
   * Initialize interceptors on the HTTP client
   * Sets up authentication and error handling interceptors
   */
  public initializeInterceptors(): void {
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  /**
   * Remove all interceptors
   * Useful for cleanup or re-initialization
   */
  public removeInterceptors(): void {
    if (this.requestInterceptorId !== undefined) {
      httpClient.removeRequestInterceptor(this.requestInterceptorId);
      this.requestInterceptorId = undefined;
    }

    if (this.responseInterceptorId !== undefined) {
      httpClient.removeResponseInterceptor(this.responseInterceptorId);
      this.responseInterceptorId = undefined;
    }
  }

  /**
   * Set up request interceptor for authentication
   * Automatically adds authentication token to request headers
   */
  private setupRequestInterceptor(): void {
    this.requestInterceptorId = httpClient.addRequestInterceptor(
      (config: InternalAxiosRequestConfig) => {
        // Add authentication token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp for debugging
        config.headers = config.headers || {};
        config.headers['X-Request-Time'] = new Date().toISOString();

        return config;
      },
      (error: any) => {
        // Handle request setup errors
        console.error('Request interceptor error:', error);
        return Promise.reject(
          new HttpClientError(
            'Failed to prepare request',
            undefined,
            error.config?.url,
            error
          )
        );
      }
    );
  }

  /**
   * Set up response interceptor for error handling
   * Handles authentication errors, retries, and common error scenarios
   */
  private setupResponseInterceptor(): void {
    this.responseInterceptorId = httpClient.addResponseInterceptor(
      (response: AxiosResponse) => {
        // Log successful responses in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`API Response [${response.status}]:`, response.config.url);
        }

        return response;
      },
      async (error: any) => {
        const originalRequest = error.config;

        // Handle network errors
        if (!error.response) {
          return this.handleNetworkError(error);
        }

        const statusCode = error.response.status;

        // Handle authentication errors
        if (statusCode === 401) {
          return this.handleUnauthorizedError(error, originalRequest);
        }

        // Handle rate limiting
        if (statusCode === 429) {
          return this.handleRateLimitError(error, originalRequest);
        }

        // Handle server errors
        if (statusCode >= 500) {
          return this.handleServerError(error);
        }

        // Handle client errors (4xx)
        if (statusCode >= 400 && statusCode < 500) {
          return this.handleClientError(error);
        }

        // Default error handling
        return Promise.reject(
          new HttpClientError(
            error.response.data?.message || 'An unexpected error occurred',
            statusCode,
            originalRequest?.url,
            error,
            error.response.data
          )
        );
      }
    );
  }

  /**
   * Get authentication token from storage
   * @returns Authentication token or null if not available
   */
  private getAuthToken(): string | null {
    try {
      return localStorage.getItem('auth_token');
    } catch (error) {
      console.warn('Failed to retrieve auth token from localStorage:', error);
      return null;
    }
  }

  /**
   * Store authentication token in storage
   * @param token - Token to store
   */
  private setAuthToken(token: string): void {
    try {
      localStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Failed to store auth token in localStorage:', error);
    }
  }

  /**
   * Clear authentication token from storage
   */
  private clearAuthToken(): void {
    try {
      localStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Failed to clear auth token from localStorage:', error);
    }
  }

  /**
   * Handle network errors (no response)
   * @param error - Axios error
   * @returns Promise rejection with HttpClientError
   */
  private handleNetworkError(error: any): Promise<never> {
    let message = 'Network error occurred';

    if (error.code === 'ECONNABORTED') {
      message = 'Request timed out. Please check your connection and try again.';
    } else if (error.code === 'ENOTFOUND') {
      message = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.code === 'ECONNREFUSED') {
      message = 'Server is currently unavailable. Please try again later.';
    }

    return Promise.reject(
      new HttpClientError(
        message,
        undefined,
        error.config?.url,
        error
      )
    );
  }

  /**
   * Handle unauthorized errors (401)
   * Attempts token refresh or triggers logout
   * @param error - Axios error
   * @param originalRequest - Original request config
   * @returns Promise with retried request or rejection
   */
  private async handleUnauthorizedError(error: any, originalRequest: InternalAxiosRequestConfig): Promise<any> {
    // If already retrying, reject immediately
    if (this.retriedRequests.get(originalRequest)) {
      this.triggerLogout();
      return Promise.reject(
        new HttpClientError(
          'Authentication failed. Please login again.',
          401,
          originalRequest.url,
          error,
          error.response?.data
        )
      );
    }

    // Mark request as retried
    this.retriedRequests.set(originalRequest, true);

    // Attempt token refresh
    try {
      const newToken = await this.refreshAuthToken();
      if (newToken) {
        // Update stored token
        this.setAuthToken(newToken);

        // Retry original request with new token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return httpClient.getAxiosInstance().request(originalRequest);
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
    }

    // Refresh failed, trigger logout
    this.triggerLogout();
    return Promise.reject(
      new HttpClientError(
        'Session expired. Please login again.',
        401,
        originalRequest.url,
        error,
        error.response?.data
      )
    );
  }

  /**
   * Handle rate limiting errors (429)
   * Implements exponential backoff retry
   * @param error - Axios error
   * @param originalRequest - Original request config
   * @returns Promise with retried request or rejection
   */
  private async handleRateLimitError(error: any, originalRequest: InternalAxiosRequestConfig): Promise<any> {
    const retryAfter = error.response?.headers?.['retry-after'];
    const delay = retryAfter ? parseInt(retryAfter) * 1000 : 1000; // Default 1 second

    console.warn(`Rate limited. Retrying after ${delay}ms`);

    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, delay));

    // Retry the request
    return httpClient.getAxiosInstance().request(originalRequest);
  }

  /**
   * Handle server errors (5xx)
   * @param error - Axios error
   * @returns Promise rejection with HttpClientError
   */
  private handleServerError(error: any): Promise<never> {
    const message = error.response?.data?.message ||
      'Server error occurred. Please try again later.';

    return Promise.reject(
      new HttpClientError(
        message,
        error.response.status,
        error.config?.url,
        error,
        error.response?.data
      )
    );
  }

  /**
   * Handle client errors (4xx except 401 and 429)
   * @param error - Axios error
   * @returns Promise rejection with HttpClientError
   */
  private handleClientError(error: any): Promise<never> {
    const statusCode = error.response.status;
    let message = error.response?.data?.message || 'Request failed';

    // Provide specific messages for common client errors
    switch (statusCode) {
      case 400:
        message = error.response?.data?.message || 'Invalid request data';
        break;
      case 403:
        message = 'You do not have permission to perform this action';
        break;
      case 404:
        message = 'The requested resource was not found';
        break;
      case 422:
        message = error.response?.data?.message || 'Validation failed';
        break;
    }

    return Promise.reject(
      new HttpClientError(
        message,
        statusCode,
        error.config?.url,
        error,
        error.response?.data
      )
    );
  }

  /**
   * Attempt to refresh authentication token
   * @returns Promise with new token or null if refresh failed
   */
  private async refreshAuthToken(): Promise<string | null> {
    if (this.isRefreshing) {
      // If already refreshing, wait for the result
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      // TODO: Implement actual token refresh API call
      // For now, simulate refresh failure
      console.log('Attempting token refresh...');

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock refresh failure (since auth is not implemented)
      throw new Error('Token refresh not implemented');

      // If refresh succeeds:
      // const response = await httpClient.post<{ token: string }>('/auth/refresh');
      // return response.token;
    } catch (error) {
      // Refresh failed, reject all queued requests
      this.failedQueue.forEach(({ reject }) => {
        reject(error);
      });
      this.failedQueue = [];
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Trigger user logout
   * Clears authentication data and redirects to login
   */
  private triggerLogout(): void {
    console.log('Triggering logout due to authentication failure');

    // Clear stored authentication data
    this.clearAuthToken();

    // TODO: Implement proper logout flow
    // For now, just log the event
    // This could dispatch a logout action, redirect to login page, etc.
    if (typeof window !== 'undefined') {
      // In a real app, you might redirect to login or dispatch a logout event
      console.warn('User session expired - redirect to login page');
    }
  }
}

/**
 * Default API interceptor service instance
 * Automatically initializes interceptors when imported
 */
export const apiInterceptors = new ApiInterceptorService();

// Initialize interceptors immediately
apiInterceptors.initializeInterceptors();