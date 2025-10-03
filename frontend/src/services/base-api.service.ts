/**
 * Base API Service - Provides common HTTP functionality for all API services
 * Handles authentication, error handling, request/response interceptors
 */
export abstract class BaseApiService {
  protected baseUrl: string;
  protected defaultHeaders: HeadersInit;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Generic HTTP request method with error handling
   */
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Build query string from parameters object
   */
  protected buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          searchParams.append(key, JSON.stringify(value));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    return searchParams.toString();
  }

  /**
   * Handle API errors with proper error types
   */
  protected handleError(error: unknown, context: string): never {
    console.error(`API Error in ${context}:`, error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(`Unknown error in ${context}`);
  }
}

/**
 * API Error class for better error handling
 */
export class ApiError extends Error {
  public statusCode?: number;
  public endpoint?: string;
  public originalError?: unknown;

  constructor(
    message: string,
    statusCode?: number,
    endpoint?: string,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.originalError = originalError;
  }
}

/**
 * HTTP Client configuration
 */
export interface HttpClientConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  headers?: HeadersInit;
}

/**
 * Core HTTP client with advanced features
 */
export class HttpClient extends BaseApiService {
  private timeout: number;
  private retries: number;

  constructor(config: HttpClientConfig = {}) {
    super(config.baseUrl);
    this.timeout = config.timeout || 30000; // 30 seconds
    this.retries = config.retries || 3;

    if (config.headers) {
      this.defaultHeaders = {
        ...this.defaultHeaders,
        ...config.headers,
      };
    }
  }

  /**
   * Make HTTP request with retry logic and timeout
   */
  protected async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        // Add timeout to request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: {
            ...this.defaultHeaders,
            ...options.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new ApiError(
            `HTTP error! status: ${response.status}`,
            response.status,
            endpoint
          );
        }

        return await response.json();
      } catch (error) {
        lastError = error;

        // Don't retry on client errors (4xx) or specific errors
        if (error instanceof ApiError && error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
          throw error;
        }

        if (attempt === this.retries) {
          break;
        }

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw new ApiError(
      `Request failed after ${this.retries} attempts`,
      undefined,
      endpoint,
      lastError
    );
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? `?${this.buildQueryString(params)}` : '';
    return this.requestWithRetry<T>(`${endpoint}${queryString}`);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Upload files with FormData
   */
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }
}

/**
 * Create HTTP client instance
 */
export const httpClient = new HttpClient({
  baseUrl: '/api',
  timeout: 30000,
  retries: 3,
});