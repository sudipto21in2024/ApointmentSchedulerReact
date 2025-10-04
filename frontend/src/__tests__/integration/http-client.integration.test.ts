import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';

// Mock axios for integration testing
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: {
          use: vi.fn(),
          eject: vi.fn(),
        },
        response: {
          use: vi.fn(),
          eject: vi.fn(),
        },
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    })),
  },
}));

import { httpClient, HttpClientError } from '../../services/http-client';

describe('HTTP Client Integration Tests', () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Get the mock axios instance
    mockAxiosInstance = (axios as any).create.mock.results[0].value;

    // Mock localStorage for auth token
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'test_token'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication Integration', () => {
    it('should include auth token in requests', async () => {
      const mockResponse = { data: { success: true } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      await httpClient.get('/test');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test_token',
          'X-Request-Time': expect.any(String),
        }),
      }));
    });

    it('should handle missing auth token gracefully', async () => {
      // Mock no token
      (window.localStorage.getItem as any).mockReturnValue(null);

      const mockResponse = { data: { success: true } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      await httpClient.get('/test');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', expect.objectContaining({
        headers: expect.not.objectContaining({
          Authorization: expect.any(String),
        }),
      }));
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle 401 unauthorized with token refresh attempt', async () => {
      // First call returns 401
      const unauthorizedError = {
        response: { status: 401, data: { message: 'Unauthorized' } },
        config: { url: '/protected' },
      };

      // Mock token refresh failure
      mockAxiosInstance.get
        .mockRejectedValueOnce(unauthorizedError)
        .mockRejectedValueOnce(new Error('Refresh failed'));

      // Mock logout trigger
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await expect(httpClient.get('/protected')).rejects.toThrow(HttpClientError);

      expect(consoleSpy).toHaveBeenCalledWith('User session expired - redirect to login page');

      consoleSpy.mockRestore();
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      (networkError as any).code = 'ENOTFOUND';

      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(httpClient.get('/test')).rejects.toThrow(HttpClientError);
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Timeout');
      (timeoutError as any).code = 'ECONNABORTED';

      mockAxiosInstance.get.mockRejectedValue(timeoutError);

      await expect(httpClient.get('/test')).rejects.toThrow(HttpClientError);
    });

    it('should handle 404 not found', async () => {
      const notFoundError = {
        response: { status: 404, data: { message: 'Not found' } },
        config: { url: '/missing' },
      };

      mockAxiosInstance.get.mockRejectedValue(notFoundError);

      await expect(httpClient.get('/missing')).rejects.toThrow(HttpClientError);
    });

    it('should handle 500 server error', async () => {
      const serverError = {
        response: { status: 500, data: { message: 'Internal server error' } },
        config: { url: '/error' },
      };

      mockAxiosInstance.get.mockRejectedValue(serverError);

      await expect(httpClient.get('/error')).rejects.toThrow(HttpClientError);
    });
  });

  describe('Successful Requests Integration', () => {
    it('should successfully make GET request and return data', async () => {
      const expectedData = { users: [{ id: 1, name: 'John' }] };
      const mockResponse = { data: expectedData };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await httpClient.get('/users');

      expect(result).toEqual(expectedData);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', expect.any(Object));
    });

    it('should successfully make POST request with data', async () => {
      const postData = { name: 'New User', email: 'user@example.com' };
      const expectedResponse = { id: 1, ...postData };
      const mockResponse = { data: expectedResponse };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await httpClient.post('/users', postData);

      expect(result).toEqual(expectedResponse);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users', postData, expect.any(Object));
    });

    it('should successfully make PUT request', async () => {
      const updateData = { name: 'Updated User' };
      const expectedResponse = { id: 1, ...updateData };
      const mockResponse = { data: expectedResponse };

      mockAxiosInstance.put.mockResolvedValue(mockResponse);

      const result = await httpClient.put('/users/1', updateData);

      expect(result).toEqual(expectedResponse);
    });

    it('should successfully make DELETE request', async () => {
      const mockResponse = { data: { success: true } };
      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await httpClient.delete('/users/1');

      expect(result).toEqual({ success: true });
    });
  });

  describe('File Upload Integration', () => {
    it('should upload files with FormData', async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test content']), 'test.txt');

      const expectedResponse = { uploaded: true, filename: 'test.txt' };
      const mockResponse = { data: expectedResponse };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await httpClient.upload('/upload', formData);

      expect(result).toEqual(expectedResponse);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/upload', formData, expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'multipart/form-data',
        }),
      }));
    });
  });

  describe('Rate Limiting Integration', () => {
    it('should handle rate limiting with retry', async () => {
      vi.useFakeTimers();

      const rateLimitError = {
        response: {
          status: 429,
          headers: { 'retry-after': '2' },
          data: { message: 'Too many requests' },
        },
        config: { url: '/rate-limited' },
      };

      const successResponse = { data: { success: true } };

      // First call fails with 429, second succeeds
      mockAxiosInstance.get
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce(successResponse);

      const promise = httpClient.get('/rate-limited');

      // Fast-forward time past the retry delay
      vi.advanceTimersByTime(2000);

      const result = await promise;

      expect(result).toEqual({ success: true });
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });
  });
});