import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginResponse, AuthError } from '../services/auth';
import { hasAccessToken, getAccessToken } from '../services/token';

// Auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (response: LoginResponse) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  error: AuthError | null;
  clearError: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that manages authentication state
 * Provides authentication context to child components
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State for user data
  const [user, setUser] = useState<User | null>(null);

  // State for authentication status
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // State for loading status
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // State for error handling
  const [error, setError] = useState<AuthError | null>(null);

  /**
   * Effect to check authentication status on mount
   * This runs once when the component mounts to check if user is already logged in
   */
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        // Check if access token exists
        const hasToken = hasAccessToken();

        if (hasToken) {
          // TODO: In a real implementation, you might want to validate the token
          // or fetch user details from the token or API
          // For now, we assume the user is authenticated if token exists
          setIsAuthenticated(true);

          // TODO: Decode user info from JWT token or fetch from API
          // For this implementation, we'll set a placeholder user
          // In production, you'd decode the JWT or call an API to get user details
          const token = getAccessToken();
          if (token) {
            // Basic JWT decode (without validation for demo purposes)
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              // Assuming the token contains user info
              if (payload.user) {
                setUser(payload.user);
              }
            } catch (decodeError) {
              console.warn('Failed to decode token payload:', decodeError);
            }
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  /**
   * Logs in the user with the provided login response
   * Updates authentication state and user data
   * @param response - The login response containing user data and tokens
   */
  const login = (response: LoginResponse) => {
    try {
      setUser(response.user);
      setIsAuthenticated(true);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error('Error during login state update:', err);
      setError({ message: 'Failed to update authentication state' });
    }
  };

  /**
   * Logs out the current user
   * Clears user data and authentication status
   */
  const logout = () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      // Note: Token removal is handled in the auth service
    } catch (err) {
      console.error('Error during logout state update:', err);
    }
  };

  /**
   * Updates the current user data
   * Useful for profile updates or when user data changes
   * @param updatedUser - The updated user object
   */
  const updateUser = (updatedUser: User) => {
    try {
      setUser(updatedUser);
    } catch (err) {
      console.error('Error updating user data:', err);
      setError({ message: 'Failed to update user data' });
    }
  };

  /**
   * Clears any authentication errors
   */
  const clearError = () => {
    setError(null);
  };

  // Context value
  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the authentication context
 * Must be used within an AuthProvider
 * @returns AuthContextType
 * @throws Error if used outside AuthProvider
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};