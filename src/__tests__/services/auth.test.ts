import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { login, register, registerProvider, refreshToken, logout, isAuthenticated } from '../../services/auth';
import { setTokens, getRefreshToken, removeTokens } from '../../services/token';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Mock token service
vi.mock('../../services/token');
const mockedSetTokens = vi.mocked(setTokens);
const mockedGetRefreshToken = vi.mocked(getRefreshToken);
const mockedRemoveTokens = vi.mocked(removeTokens);

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    const mockCredentials = {
      username: 'testuser',
      password: 'password123',
    };

    const mockResponse = {
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-456',
      user: {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        userType: 'Customer',
        isActive: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
    };

    it('should successfully login and store tokens', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await login(mockCredentials);

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.appointmentsystem.com/v1/auth/login',
        mockCredentials
      );
      expect(mockedSetTokens).toHaveBeenCalledWith(mockResponse.accessToken, mockResponse.refreshToken);
      expect(result).toEqual(mockResponse);
    });

    it('should handle login failure with server error', async () => {
      // Arrange
      const errorResponse = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' },
        },
      };
      mockedAxios.post.mockRejectedValue(errorResponse);

      // Act & Assert
      await expect(login(mockCredentials)).rejects.toEqual({
        message: 'Invalid credentials',
        code: '401',
      });
      expect(mockedSetTokens).not.toHaveBeenCalled();
    });

    it('should handle network errors during login', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(login(mockCredentials)).rejects.toEqual({
        message: 'Network error during login',
      });
      expect(mockedSetTokens).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const mockUserData = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      userType: 'Customer',
      tenantId: 'tenant-1',
    };

    const mockResponse = {
      user: {
        id: 'user-2',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        userType: 'Customer',
        tenantId: 'tenant-1',
        isActive: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
    };

    it('should successfully register a user', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await register(mockUserData);

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.appointmentsystem.com/v1/auth/register',
        mockUserData
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle registration failure', async () => {
      // Arrange
      const errorResponse = {
        response: {
          status: 400,
          data: { message: 'Email already exists' },
        },
      };
      mockedAxios.post.mockRejectedValue(errorResponse);

      // Act & Assert
      await expect(register(mockUserData)).rejects.toEqual({
        message: 'Email already exists',
        code: '400',
      });
    });
  });

  describe('registerProvider', () => {
    const mockProviderData = {
      firstName: 'Provider',
      lastName: 'User',
      email: 'provider@example.com',
      password: 'password123',
      tenantName: 'Test Clinic',
      subdomain: 'testclinic',
      pricingPlanId: 'plan-1',
    };

    const mockResponse = {
      success: true,
      message: 'Provider registered successfully',
      user: {
        id: 'user-3',
        email: 'provider@example.com',
        firstName: 'Provider',
        lastName: 'User',
        userType: 'ServiceProvider',
        isActive: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
      tenant: {
        id: 'tenant-2',
        name: 'Test Clinic',
        subdomain: 'testclinic',
        status: 'Active',
      },
      subscription: {
        id: 'sub-1',
        pricingPlanId: 'plan-1',
        status: 'Active',
      },
      accessToken: 'access-token-789',
      refreshToken: 'refresh-token-101',
    };

    it('should successfully register a provider and store tokens', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await registerProvider(mockProviderData);

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.appointmentsystem.com/v1/auth/register/provider',
        mockProviderData
      );
      expect(mockedSetTokens).toHaveBeenCalledWith(mockResponse.accessToken, mockResponse.refreshToken);
      expect(result).toEqual(mockResponse);
    });

    it('should handle provider registration failure', async () => {
      // Arrange
      const errorResponse = {
        response: {
          status: 409,
          data: { message: 'Subdomain already exists' },
        },
      };
      mockedAxios.post.mockRejectedValue(errorResponse);

      // Act & Assert
      await expect(registerProvider(mockProviderData)).rejects.toEqual({
        message: 'Subdomain already exists',
        code: '409',
      });
      expect(mockedSetTokens).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    const mockRefreshTokenValue = 'refresh-token-456';
    const mockResponse = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };

    it('should successfully refresh tokens', async () => {
      // Arrange
      mockedGetRefreshToken.mockReturnValue(mockRefreshTokenValue);
      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await refreshToken();

      // Assert
      expect(mockedGetRefreshToken).toHaveBeenCalled();
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.appointmentsystem.com/v1/auth/refresh',
        { refreshToken: mockRefreshTokenValue }
      );
      expect(mockedSetTokens).toHaveBeenCalledWith(mockResponse.accessToken, mockResponse.refreshToken);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when no refresh token available', async () => {
      // Arrange
      mockedGetRefreshToken.mockReturnValue(null);

      // Act & Assert
      await expect(refreshToken()).rejects.toEqual({
        message: 'No refresh token available',
      });
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should handle refresh failure and clear tokens', async () => {
      // Arrange
      mockedGetRefreshToken.mockReturnValue(mockRefreshTokenValue);
      const errorResponse = {
        response: {
          status: 401,
          data: { message: 'Invalid refresh token' },
        },
      };
      mockedAxios.post.mockRejectedValue(errorResponse);

      // Act & Assert
      await expect(refreshToken()).rejects.toEqual({
        message: 'Invalid refresh token',
        code: '401',
      });
      expect(mockedRemoveTokens).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should successfully logout and clear tokens', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({});

      // Act
      await logout();

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith('https://api.appointmentsystem.com/v1/auth/logout');
      expect(mockedRemoveTokens).toHaveBeenCalled();
    });

    it('should clear tokens even if logout API fails', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValue(new Error('API error'));

      // Act & Assert
      await expect(logout()).rejects.toEqual({
        message: 'Network error during logout',
      });
      expect(mockedRemoveTokens).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when refresh token exists', () => {
      // Arrange
      mockedGetRefreshToken.mockReturnValue('refresh-token-123');

      // Act
      const result = isAuthenticated();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when no refresh token exists', () => {
      // Arrange
      mockedGetRefreshToken.mockReturnValue(null);

      // Act
      const result = isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });
  });
});