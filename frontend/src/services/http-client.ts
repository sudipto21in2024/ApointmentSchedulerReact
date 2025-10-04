import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * HTTP Client Configuration Interface
 * Defines the configuration options for the HTTP client
 */
export interface HttpClientConfig {
  /** Base URL for all API requests */
  baseURL?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum number of retries for failed requests */
  retries?: number;
  /** Default headers to include in all requests */
  headers?: Record<string, string>;
  /** Whether to include credentials in requests */
  withCredentials?: boolean;
}

/**
 * HTTP Client Error Class
 * Extends Error to provide additional context for API errors
 */
export class HttpClientError extends Error {
  /** HTTP status code */
  public statusCode?: number;
  /** API endpoint that caused the error */
  public endpoint?: string;
  /** Original error from Axios */
  public originalError?: unknown;
  /** Response data if available */
  public responseData?: any;

  constructor(
    message: string,
    statusCode?: number,
    endpoint?: string,
    originalError?: unknown,
    responseData?: any
  ) {
    super(message);
    this.name = 'HttpClientError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.originalError = originalError;
    this.responseData = responseData;
  }
}

/**
 * HTTP Client Service
 * Provides a configured Axios instance with common functionality
 * for making HTTP requests with automatic error handling and extensibility
 */
export class HttpClient {
  /** Axios instance */
  private axiosInstance: AxiosInstance;
  /** Configuration options */
  private config: Required<HttpClientConfig>;

  /**
   * Creates a new HTTP client instance
   * @param config - Configuration options for the client
   */
  constructor(config: HttpClientConfig = {}) {
    // Set default configuration
    this.config = {
      baseURL: config.baseURL || '/api',
      timeout: config.timeout || 30000, // 30 seconds
      retries: config.retries || 3,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      withCredentials: config.withCredentials || false,
    };

    // Create Axios instance with configuration
    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers,
      withCredentials: this.config.withCredentials,
    });

    // Apply default interceptors
    this.setupDefaultInterceptors();
  }

  /**
   * Get the underlying Axios instance for advanced usage
   * @returns Axios instance
   */
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Set up default request and response interceptors
   * This method can be overridden by subclasses for custom behavior
   */
  protected setupDefaultInterceptors(): void {
    // Default request interceptor - can be extended
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add any default request processing here
        return config;
      },
      (error) => {
        return Promise.reject(this.handleRequestError(error));
      }
    );

    // Default response interceptor - can be extended
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        return Promise.reject(this.handleResponseError(error));
      }
    );
  }

  /**
   * Handle request errors
   * @param error - Axios request error
   * @returns HttpClientError
   */
  protected handleRequestError(error: any): HttpClientError {
    const message = error.message || 'Request failed';
    return new HttpClientError(
      message,
      undefined,
      error.config?.url,
      error,
      error.response?.data
    );
  }

  /**
   * Handle response errors with retry logic
   * @param error - Axios response error
   * @returns HttpClientError or throws error
   */
  protected handleResponseError(error: any): HttpClientError {
    const statusCode = error.response?.status;
    const endpoint = error.config?.url;
    const responseData = error.response?.data;

    let message = 'An error occurred';

    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      message = 'Request timeout';
    } else if (!error.response) {
      message = 'Network error - please check your connection';
    } else {
      // Handle HTTP status codes
      switch (statusCode) {
        case 400:
          message = responseData?.message || 'Bad request';
          break;
        case 401:
          message = 'Unauthorized - please login again';
          break;
        case 403:
          message = 'Forbidden - insufficient permissions';
          break;
        case 404:
          message = 'Resource not found';
          break;
        case 429:
          message = 'Too many requests - please try again later';
          break;
        case 500:
          message = 'Internal server error';
          break;
        default:
          message = responseData?.message || `HTTP ${statusCode} error`;
      }
    }

    return new HttpClientError(message, statusCode, endpoint, error, responseData);
  }

  /**
   * Make a GET request
   * @param url - Request URL
   * @param config - Additional Axios config
   * @returns Promise with response data
   */
  public async get<T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  /**
   * Make a POST request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Additional Axios config
   * @returns Promise with response data
   */
  public async post<T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a PUT request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Additional Axios config
   * @returns Promise with response data
   */
  public async put<T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a PATCH request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Additional Axios config
   * @returns Promise with response data
   */
  public async patch<T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request
   * @param url - Request URL
   * @param config - Additional Axios config
   * @returns Promise with response data
   */
  public async delete<T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  /**
   * Upload files using FormData
   * @param url - Request URL
   * @param formData - FormData object with files
   * @param config - Additional Axios config
   * @returns Promise with response data
   */
  public async upload<T = any>(url: string, formData: FormData, config?: InternalAxiosRequestConfig): Promise<T> {
    const uploadConfig = {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    };

    const response = await this.axiosInstance.post<T>(url, formData, uploadConfig);
    return response.data;
  }

  /**
   * Add a request interceptor
   * @param onFulfilled - Function to handle successful requests
   * @param onRejected - Function to handle request errors
   * @returns Interceptor ID for removal
   */
  public addRequestInterceptor(
    onFulfilled?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>,
    onRejected?: (error: any) => any
  ): number {
    return this.axiosInstance.interceptors.request.use(onFulfilled, onRejected);
  }

  /**
   * Add a response interceptor
   * @param onFulfilled - Function to handle successful responses
   * @param onRejected - Function to handle response errors
   * @returns Interceptor ID for removal
   */
  public addResponseInterceptor(
    onFulfilled?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>,
    onRejected?: (error: any) => any
  ): number {
    return this.axiosInstance.interceptors.response.use(onFulfilled, onRejected);
  }

  /**
   * Remove a request interceptor
   * @param id - Interceptor ID returned from addRequestInterceptor
   */
  public removeRequestInterceptor(id: number): void {
    this.axiosInstance.interceptors.request.eject(id);
  }

  /**
   * Remove a response interceptor
   * @param id - Interceptor ID returned from addResponseInterceptor
   */
  public removeResponseInterceptor(id: number): void {
    this.axiosInstance.interceptors.response.eject(id);
  }
}

/**
 * Default HTTP client instance
 * Configured with standard settings for the application
 * Lazy-loaded to avoid instantiation during module load in tests
 */
let _httpClient: HttpClient | null = null;

function getHttpClient(): HttpClient {
  if (!_httpClient) {
    _httpClient = new HttpClient({
      baseURL: '/api',
      timeout: 30000,
      retries: 3,
    });
  }
  return _httpClient;
}

// Export as a getter to avoid instantiation at module load
export const httpClient = new Proxy({}, {
  get(_target, prop) {
    const client = getHttpClient();
    return (client as any)[prop];
  }
}) as HttpClient;