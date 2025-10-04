import axios from 'axios';
import { login, register, refreshToken } from '../../services/auth';

// Mock axios for integration tests
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Note: These are integration tests that test the interaction between auth service and token service
// In a real scenario, these would test against a test API server

describe('Auth Service Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  describe('Login flow integration', () => {
    it('should handle complete login flow with token storage', async () => {
      // Arrange
      const credentials = { username: 'test@example.com', password: 'password123' };
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
      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await login(credentials);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('accessToken')).toBe('access-token-123');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token-456');
    });

    it('should handle login failure without storing invalid tokens', async () => {
      // Arrange
      const credentials = { username: 'test@example.com', password: 'wrongpassword' };
      const errorResponse = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' },
        },
      };
      mockedAxios.post.mockRejectedValue(errorResponse);

      // Act & Assert
      await expect(login(credentials)).rejects.toThrow();

      // Ensure no tokens were stored
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('Token refresh integration', () => {
    it('should handle token refresh and update stored tokens', async () => {
      // Arrange
      // Set initial tokens
      localStorage.setItem('accessToken', 'old-access-token');
      localStorage.setItem('refreshToken', 'old-refresh-token');

      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };
      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await refreshToken();

      // Assert
      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('accessToken')).toBe('new-access-token');
      expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
    });
  });

  describe('Registration integration', () => {
    it('should handle user registration without automatic login', async () => {
      // Arrange
      const userData = {
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
      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await register(userData);

      // Assert
      expect(result).toEqual(mockResponse);
      // Registration should not store tokens automatically
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });
});