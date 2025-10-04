import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock http-client before importing
vi.mock('../../services/http-client', () => ({
  httpClient: {
    addRequestInterceptor: vi.fn(() => 1),
    addResponseInterceptor: vi.fn(() => 2),
    removeRequestInterceptor: vi.fn(),
    removeResponseInterceptor: vi.fn(),
    getAxiosInstance: vi.fn(),
  },
  HttpClientError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'HttpClientError';
    }
  },
}));

import { ApiInterceptorService } from '../../services/api-interceptor';
import { httpClient, HttpClientError } from '../../services/http-client';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ApiInterceptorService', () => {
  let interceptorService: ApiInterceptorService;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock localStorage
    localStorageMock.getItem.mockReturnValue('mock_token');
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});

    // Create mock axios instance
    mockAxiosInstance = {
      interceptors: {
        request: {
          use: vi.fn().mockReturnValue(1),
          eject: vi.fn(),
        },
        response: {
          use: vi.fn().mockReturnValue(2),
          eject: vi.fn(),
        },
      },
      request: vi.fn(),
    };

    // Mock httpClient.getAxiosInstance
    vi.spyOn(httpClient, 'getAxiosInstance').mockReturnValue(mockAxiosInstance);

    // Create interceptor service
    interceptorService = new ApiInterceptorService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initializeInterceptors', () => {
    it('should set up request and response interceptors', () => {
      interceptorService.initializeInterceptors();

      expect(httpClient.addRequestInterceptor).toHaveBeenCalled();
      expect(httpClient.addResponseInterceptor).toHaveBeenCalled();
    });
  });

  describe('removeInterceptors', () => {
    it('should remove request and response interceptors', () => {
      // First initialize
      interceptorService.initializeInterceptors();

      // Then remove
      interceptorService.removeInterceptors();

      expect(httpClient.removeRequestInterceptor).toHaveBeenCalledWith(1);
      expect(httpClient.removeResponseInterceptor).toHaveBeenCalledWith(2);
    });
  });

  describe('request interceptor', () => {
    let requestInterceptor: any;

    beforeEach(() => {
      interceptorService.initializeInterceptors();
      requestInterceptor = vi.mocked(httpClient.addRequestInterceptor).mock.calls[0][0];
    });

    it('should add authorization header when token exists', () => {
      const config: any = {
        url: '/test',
        method: 'get',
        headers: {},
      };

      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe('Bearer mock_token');
      expect(result.headers['X-Request-Time']).toBeDefined();
    });

    it('should not add authorization header when no token', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const config: any = {
        url: '/test',
        method: 'get',
        headers: {},
      };

      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const config: any = {
        url: '/test',
        method: 'get',
        headers: {},
      };

      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('response interceptor', () => {
    let responseInterceptor: any;

    beforeEach(() => {
      interceptorService.initializeInterceptors();
      responseInterceptor = vi.mocked(httpClient.addResponseInterceptor).mock.calls[0][1]; // onRejected
    });

    it('should handle network errors', async () => {
      const networkError = {
        code: 'ENOTFOUND',
        message: 'Network Error',
        config: { url: '/test' },
      };

      await expect(responseInterceptor(networkError)).rejects.toThrow(HttpClientError);
    });

    it('should handle unauthorized errors', async () => {
      const unauthorizedError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
        config: { url: '/test' },
      };

      mockAxiosInstance.request.mockRejectedValue(new Error('Refresh failed'));

      await expect(responseInterceptor(unauthorizedError)).rejects.toThrow(HttpClientError);
    });

    it('should handle rate limiting', async () => {
      const rateLimitError = {
        response: {
          status: 429,
          headers: { 'retry-after': '1' },
          data: { message: 'Too many requests' },
        },
        config: { url: '/test' },
      };

      mockAxiosInstance.request.mockResolvedValue({
        data: { success: true },
      });

      vi.useFakeTimers();

      const promise = responseInterceptor(rateLimitError);

      // Fast-forward time
      vi.advanceTimersByTime(1000);

      const result = await promise;

      expect(result.data).toEqual({ success: true });
      vi.useRealTimers();
    });

    it('should handle server errors', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
        config: { url: '/test' },
      };

      await expect(responseInterceptor(serverError)).rejects.toThrow(HttpClientError);
    });

    it('should handle client errors', async () => {
      const clientError = {
        response: {
          status: 404,
          data: { message: 'Not found' },
        },
        config: { url: '/test' },
      };

      await expect(responseInterceptor(clientError)).rejects.toThrow(HttpClientError);
    });

    it('should handle timeout errors', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout',
        config: { url: '/test' },
      };

      await expect(responseInterceptor(timeoutError)).rejects.toThrow(HttpClientError);
    });
  });

  describe('token management', () => {
    it('should get auth token from localStorage', () => {
      // Access private method through type assertion
      const service = interceptorService as any;
      const token = service.getAuthToken();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
      expect(token).toBe('mock_token');
    });

    it('should set auth token in localStorage', () => {
      const service = interceptorService as any;
      service.setAuthToken('new_token');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'new_token');
    });

    it('should clear auth token from localStorage', () => {
      const service = interceptorService as any;
      service.clearAuthToken();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('logout trigger', () => {
    it('should clear auth token and log warning on logout', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const service = interceptorService as any;
      service.triggerLogout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(consoleSpy).toHaveBeenCalledWith('User session expired - redirect to login page');

      consoleSpy.mockRestore();
    });
  });
});