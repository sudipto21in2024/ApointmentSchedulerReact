import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setTokens, getAccessToken, getRefreshToken, removeTokens, hasAccessToken, hasRefreshToken } from '../../services/token';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => {
      return key in store ? store[key] : null;
    },
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Token Service', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('setTokens', () => {
    it('should store access and refresh tokens in localStorage', () => {
      // Arrange
      const accessToken = 'access-token-123';
      const refreshToken = 'refresh-token-456';

      // Act
      setTokens(accessToken, refreshToken);

      // Assert
      expect(localStorage.getItem('accessToken')).toBe(accessToken);
      expect(localStorage.getItem('refreshToken')).toBe(refreshToken);
    });

    it('should handle empty tokens', () => {
      // Act
      setTokens('', '');

      // Assert
      expect(localStorage.getItem('accessToken')).toBe('');
      expect(localStorage.getItem('refreshToken')).toBe('');
    });
  });

  describe('getAccessToken', () => {
    it('should return the stored access token', () => {
      // Arrange
      const accessToken = 'access-token-123';
      localStorage.setItem('accessToken', accessToken);

      // Act
      const result = getAccessToken();

      // Assert
      expect(result).toBe(accessToken);
    });

    it('should return null when no access token is stored', () => {
      // Act
      const result = getAccessToken();

      // Assert
      expect(result).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      // Arrange
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn(() => {
        throw new Error('localStorage error');
      });

      // Act
      const result = getAccessToken();

      // Assert
      expect(result).toBeNull();

      // Cleanup
      localStorage.getItem = originalGetItem;
    });
  });

  describe('getRefreshToken', () => {
    it('should return the stored refresh token', () => {
      // Arrange
      const refreshToken = 'refresh-token-456';
      localStorage.setItem('refreshToken', refreshToken);

      // Act
      const result = getRefreshToken();

      // Assert
      expect(result).toBe(refreshToken);
    });

    it('should return null when no refresh token is stored', () => {
      // Act
      const result = getRefreshToken();

      // Assert
      expect(result).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      // Arrange
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn(() => {
        throw new Error('localStorage error');
      });

      // Act
      const result = getRefreshToken();

      // Assert
      expect(result).toBeNull();

      // Cleanup
      localStorage.getItem = originalGetItem;
    });
  });

  describe('removeTokens', () => {
    it('should remove both tokens from localStorage', () => {
      // Arrange
      localStorage.setItem('accessToken', 'access-token-123');
      localStorage.setItem('refreshToken', 'refresh-token-456');

      // Act
      removeTokens();

      // Assert
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      // Arrange
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = vi.fn(() => {
        throw new Error('localStorage error');
      });

      // Act & Assert
      expect(() => removeTokens()).toThrow('Unable to clear authentication tokens');

      // Cleanup
      localStorage.removeItem = originalRemoveItem;
    });
  });

  describe('hasAccessToken', () => {
    it('should return true when access token exists', () => {
      // Arrange
      localStorage.setItem('accessToken', 'access-token-123');

      // Act
      const result = hasAccessToken();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when no access token exists', () => {
      // Act
      const result = hasAccessToken();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('hasRefreshToken', () => {
    it('should return true when refresh token exists', () => {
      // Arrange
      localStorage.setItem('refreshToken', 'refresh-token-456');

      // Act
      const result = hasRefreshToken();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when no refresh token exists', () => {
      // Act
      const result = hasRefreshToken();

      // Assert
      expect(result).toBe(false);
    });
  });
});