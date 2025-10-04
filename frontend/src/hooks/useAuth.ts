import { useState, useEffect } from 'react';

/**
 * User interface for authentication
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'CUSTOMER' | 'TENANT_ADMIN' | 'SYSTEM_ADMIN';
}

/**
 * Authentication context interface
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

/**
 * Custom hook for authentication management
 * Provides user authentication state and methods
 *
 * @returns {AuthContextType} Authentication context
 */
export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // TODO: Implement actual authentication check
        // For now, return mock authenticated user
        const mockUser: User = {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          role: 'CUSTOMER'
        };
        setUser(mockUser);
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Authenticate user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   */
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      // TODO: Implement actual login API call
      console.log('Login attempt:', { email, password });

      // Mock successful login
      const mockUser: User = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: email,
        role: 'CUSTOMER'
      };
      setUser(mockUser);

      // Store auth token (mock)
      localStorage.setItem('auth_token', 'mock_token');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout current user
   * Clears authentication state and removes stored tokens
   */
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      // TODO: Implement actual logout API call
      console.log('Logout');

      // Clear stored auth data
      localStorage.removeItem('auth_token');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading
  };
};