import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(),
  },
}));

import axios from 'axios';
import { HttpClient, HttpClientError } from '../../services/http-client';

describe('HttpClient', () => {
  let httpClient: HttpClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock axios instance
    mockAxiosInstance = {
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
      patch: vi.fn(),
      delete: vi.fn(),
    };

    // Mock axios.create to return our mock instance
    (axios.create as any).mockReturnValue(mockAxiosInstance);

    // Create HttpClient instance
    httpClient = new HttpClient({
      baseURL: '/api',
      timeout: 5000,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create axios instance with correct configuration', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: '/api',
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: false,
      });
    });

    it('should use default configuration when no config provided', () => {
      const defaultClient = new HttpClient();

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: '/api',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: false,
      });
    });

    it('should merge custom headers with defaults', () => {
      const clientWithHeaders = new HttpClient({
        headers: { 'X-Custom': 'value' },
      });

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'X-Custom': 'value',
          },
        })
      );
    });
  });

  describe('HTTP methods', () => {
    const mockResponse = {
      data: { success: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };

    beforeEach(() => {
      mockAxiosInstance.get.mockResolvedValue(mockResponse);
      mockAxiosInstance.post.mockResolvedValue(mockResponse);
      mockAxiosInstance.put.mockResolvedValue(mockResponse);
      mockAxiosInstance.patch.mockResolvedValue(mockResponse);
      mockAxiosInstance.delete.mockResolvedValue(mockResponse);
    });

    describe('get', () => {
      it('should make GET request and return data', async () => {
        const result = await httpClient.get('/test');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', undefined);
        expect(result).toEqual({ success: true });
      });

      it('should pass config to axios', async () => {
        const config = { headers: { 'X-Test': 'value' } } as any;
        await httpClient.get('/test', config);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', config);
      });
    });

    describe('post', () => {
      it('should make POST request with data', async () => {
        const data = { name: 'test' };
        const result = await httpClient.post('/test', data);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', data, undefined);
        expect(result).toEqual({ success: true });
      });
    });

    describe('put', () => {
      it('should make PUT request with data', async () => {
        const data = { name: 'updated' };
        const result = await httpClient.put('/test', data);

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test', data, undefined);
        expect(result).toEqual({ success: true });
      });
    });

    describe('patch', () => {
      it('should make PATCH request with data', async () => {
        const data = { name: 'patched' };
        const result = await httpClient.patch('/test', data);

        expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/test', data, undefined);
        expect(result).toEqual({ success: true });
      });
    });

    describe('delete', () => {
      it('should make DELETE request', async () => {
        const result = await httpClient.delete('/test');

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test', undefined);
        expect(result).toEqual({ success: true });
      });
    });
  });

  describe('upload', () => {
    it('should upload files with FormData', async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'test.txt');

      const mockResponse = {
        data: { uploaded: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await httpClient.upload('/upload', formData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      expect(result).toEqual({ uploaded: true });
    });
  });

  // Error handling is tested in api-interceptor.test.ts

  describe('interceptors', () => {
    it('should add request interceptor', () => {
      const onFulfilled = vi.fn();
      const onRejected = vi.fn();

      httpClient.addRequestInterceptor(onFulfilled, onRejected);

      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledWith(
        onFulfilled,
        onRejected
      );
    });

    it('should add response interceptor', () => {
      const onFulfilled = vi.fn();
      const onRejected = vi.fn();

      httpClient.addResponseInterceptor(onFulfilled, onRejected);

      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledWith(
        onFulfilled,
        onRejected
      );
    });

    it('should remove request interceptor', () => {
      httpClient.removeRequestInterceptor(1);

      expect(mockAxiosInstance.interceptors.request.eject).toHaveBeenCalledWith(1);
    });

    it('should remove response interceptor', () => {
      httpClient.removeResponseInterceptor(2);

      expect(mockAxiosInstance.interceptors.response.eject).toHaveBeenCalledWith(2);
    });
  });

  describe('getAxiosInstance', () => {
    it('should return the axios instance', () => {
      const instance = httpClient.getAxiosInstance();

      expect(instance).toBe(mockAxiosInstance);
    });
  });
});