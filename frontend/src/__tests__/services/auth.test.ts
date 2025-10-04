import { describe, it, expect, vi } from 'vitest';
import { isAuthenticated } from '../../services/auth';
import { getRefreshToken } from '../../services/token';

// Mock token service
vi.mock('../../services/token', () => ({
  getRefreshToken: vi.fn(),
}));

const mockedGetRefreshToken = vi.mocked(getRefreshToken);

describe('Auth Service', () => {
  describe('isAuthenticated', () => {
    it('should return true when refresh token exists', () => {
      // Arrange
      mockedGetRefreshToken.mockReturnValue('refresh-token-123');

      // Act
      const result = isAuthenticated();

      // Assert
      expect(result).toBe(true);
      expect(mockedGetRefreshToken).toHaveBeenCalled();
    });

    it('should return false when no refresh token exists', () => {
      // Arrange
      mockedGetRefreshToken.mockReturnValue(null);

      // Act
      const result = isAuthenticated();

      // Assert
      expect(result).toBe(false);
      expect(mockedGetRefreshToken).toHaveBeenCalled();
    });

    it('should return false when refresh token is empty string', () => {
      // Arrange
      mockedGetRefreshToken.mockReturnValue('');

      // Act
      const result = isAuthenticated();

      // Assert
      expect(result).toBe(false);
      expect(mockedGetRefreshToken).toHaveBeenCalled();
    });
  });
});