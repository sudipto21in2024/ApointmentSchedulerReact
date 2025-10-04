// Token service for managing authentication tokens securely
// Note: In production, consider using HttpOnly cookies for better security
// localStorage is used here for simplicity but is vulnerable to XSS attacks

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Stores the access and refresh tokens in localStorage
 * @param accessToken - The JWT access token
 * @param refreshToken - The refresh token
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Failed to store tokens:', error);
    throw new Error('Unable to store authentication tokens');
  }
};

/**
 * Retrieves the access token from localStorage
 * @returns The access token or null if not found
 */
export const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to retrieve access token:', error);
    return null;
  }
};

/**
 * Retrieves the refresh token from localStorage
 * @returns The refresh token or null if not found
 */
export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to retrieve refresh token:', error);
    return null;
  }
};

/**
 * Removes both access and refresh tokens from localStorage
 */
export const removeTokens = (): void => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to remove tokens:', error);
    throw new Error('Unable to clear authentication tokens');
  }
};

/**
 * Checks if an access token exists
 * @returns True if access token is present, false otherwise
 */
export const hasAccessToken = (): boolean => {
  return getAccessToken() !== null;
};

/**
 * Checks if a refresh token exists
 * @returns True if refresh token is present, false otherwise
 */
export const hasRefreshToken = (): boolean => {
  return getRefreshToken() !== null;
};