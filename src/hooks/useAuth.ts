import { useAuthContext } from '../contexts/AuthContext';
import { login as authLogin, register, registerProvider, logout as authLogout, refreshToken, isAuthenticated } from '../services/auth';
import { LoginRequest, RegisterRequest, RegisterProviderRequest, LoginResponse, UserResponse, RegistrationResult, AuthError } from '../services/auth';

/**
 * Custom hook for authentication operations
 * Provides convenient methods for login, registration, logout, and token management
 * Must be used within an AuthProvider
 */
export const useAuth = () => {
  // Get auth context
  const { user, isAuthenticated, isLoading, login, logout, updateUser, error, clearError } = useAuthContext();

  /**
   * Performs user login
   * @param credentials - User login credentials
   * @returns Promise resolving to login response
   */
  const handleLogin = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      clearError();
      const response = await authLogin(credentials);
      login(response); // Update context state
      return response;
    } catch (err) {
      const authError = err as AuthError;
      // Error is handled in context, but we can re-throw for component handling
      throw authError;
    }
  };

  /**
   * Performs user registration
   * @param userData - User registration data
   * @returns Promise resolving to user response
   */
  const handleRegister = async (userData: RegisterRequest): Promise<UserResponse> => {
    try {
      clearError();
      const response = await register(userData);
      // Note: Registration doesn't automatically log in the user
      // The user would need to login separately after registration
      return response;
    } catch (err) {
      const authError = err as AuthError;
      throw authError;
    }
  };

  /**
   * Performs service provider registration
   * @param providerData - Provider registration data
   * @returns Promise resolving to registration result
   */
  const handleRegisterProvider = async (providerData: RegisterProviderRequest): Promise<RegistrationResult> => {
    try {
      clearError();
      const response = await registerProvider(providerData);
      // If tokens are provided, update context
      if (response.accessToken && response.user) {
        login({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken || '',
          user: response.user,
        });
      }
      return response;
    } catch (err) {
      const authError = err as AuthError;
      throw authError;
    }
  };

  /**
   * Performs user logout
   * @returns Promise resolving when logout is complete
   */
  const handleLogout = async (): Promise<void> => {
    try {
      clearError();
      await authLogout();
      logout(); // Update context state
    } catch (err) {
      const authError = err as AuthError;
      // Even if logout API fails, we clear local state
      logout();
      throw authError;
    }
  };

  /**
   * Refreshes the authentication token
   * @returns Promise resolving to refresh response
   */
  const handleRefreshToken = async (): Promise<void> => {
    try {
      clearError();
      await refreshToken();
      // Note: Token refresh doesn't change user data, just updates stored tokens
    } catch (err) {
      const authError = err as AuthError;
      throw authError;
    }
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login: handleLogin,
    register: handleRegister,
    registerProvider: handleRegisterProvider,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
    updateUser,
    clearError,
  };
};