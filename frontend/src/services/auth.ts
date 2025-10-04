import axios from 'axios';
import { setTokens, getRefreshToken, removeTokens } from './token';

// Base API URL - in production, this should come from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.appointmentsystem.com/v1';

// Type definitions based on OpenAPI spec
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  userType: string; // From enums
  tenantId: string;
}

export interface UserResponse {
  user: User;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterProviderRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  tenantName: string;
  subdomain: string;
  description?: string;
  contactEmail?: string;
  domain?: string;
  logoUrl?: string;
  pricingPlanId: string;
  paymentMethod?: string;
  cardToken?: string;
}

export interface RegistrationResult {
  success: boolean;
  message: string;
  user?: User;
  tenant?: Tenant;
  subscription?: Subscription;
  accessToken?: string;
  refreshToken?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  userType: string;
  role?: string; // For backward compatibility
  tenantId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  // Other fields as needed
}

export interface Subscription {
  id: string;
  pricingPlanId: string;
  status: string;
  // Other fields
}

export interface AuthError {
  message: string;
  code?: string;
}

/**
 * Authenticates a user with username and password
 * @param credentials - Login credentials
 * @returns Promise resolving to login response
 * @throws AuthError on failure
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/login`, credentials);

    // Store tokens upon successful login
    setTokens(response.data.accessToken, response.data.refreshToken);

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const authError: AuthError = {
        message: error.response.data?.message || 'Login failed',
        code: error.response.status.toString(),
      };
      throw authError;
    }
    throw { message: 'Network error during login' } as AuthError;
  }
};

/**
 * Registers a new user account
 * @param userData - Registration data
 * @returns Promise resolving to user response
 * @throws AuthError on failure
 */
export const register = async (userData: RegisterRequest): Promise<UserResponse> => {
  try {
    const response = await axios.post<UserResponse>(`${API_BASE_URL}/auth/register`, userData);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const authError: AuthError = {
        message: error.response.data?.message || 'Registration failed',
        code: error.response.status.toString(),
      };
      throw authError;
    }
    throw { message: 'Network error during registration' } as AuthError;
  }
};

/**
 * Registers a new service provider with tenant and subscription
 * @param providerData - Provider registration data
 * @returns Promise resolving to registration result
 * @throws AuthError on failure
 */
export const registerProvider = async (providerData: RegisterProviderRequest): Promise<RegistrationResult> => {
  try {
    const response = await axios.post<RegistrationResult>(`${API_BASE_URL}/auth/register/provider`, providerData);

    // Store tokens if provided in response
    if (response.data.accessToken && response.data.refreshToken) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const authError: AuthError = {
        message: error.response.data?.message || 'Provider registration failed',
        code: error.response.status.toString(),
      };
      throw authError;
    }
    throw { message: 'Network error during provider registration' } as AuthError;
  }
};

/**
 * Refreshes the access token using the refresh token
 * @returns Promise resolving to refresh response
 * @throws AuthError on failure
 */
export const refreshToken = async (): Promise<RefreshResponse> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw { message: 'No refresh token available' } as AuthError;
  }

  try {
    const response = await axios.post<RefreshResponse>(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    } as RefreshRequest);

    // Update stored tokens
    setTokens(response.data.accessToken, response.data.refreshToken);

    return response.data;
  } catch (error: any) {
    // Clear tokens on refresh failure
    removeTokens();

    if (axios.isAxiosError(error) && error.response) {
      const authError: AuthError = {
        message: error.response.data?.message || 'Token refresh failed',
        code: error.response.status.toString(),
      };
      throw authError;
    }
    throw { message: 'Network error during token refresh' } as AuthError;
  }
};

/**
 * Logs out the current user by invalidating the session
 * @returns Promise resolving when logout is complete
 * @throws AuthError on failure
 */
export const logout = async (): Promise<void> => {
  try {
    // Call logout endpoint to invalidate server-side session
    await axios.post(`${API_BASE_URL}/auth/logout`);

    // Clear local tokens regardless of API response
    removeTokens();
  } catch (error: any) {
    // Always clear local tokens, even if API call fails
    removeTokens();

    if (axios.isAxiosError(error) && error.response) {
      const authError: AuthError = {
        message: error.response.data?.message || 'Logout failed',
        code: error.response.status.toString(),
      };
      throw authError;
    }
    throw { message: 'Network error during logout' } as AuthError;
  }
};

/**
 * Checks if the user is currently authenticated
 * @returns True if access token exists, false otherwise
 */
export const isAuthenticated = (): boolean => {
  // This is a basic check; in production, you might want to validate token expiration
  return !!getRefreshToken(); // Using refresh token as indicator of authentication
};