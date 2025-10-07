import { HttpClient } from './base-api.service';
import type {
  User,
  UserCreateData,
  UserUpdateData,
  UserLoginData,
  UserPreferences
} from '../types/user';

/**
 * User API Service - Handles all user-related API operations
 * Provides authentication, profile management, and user administration
 */
export class UserApiService {
  private client: HttpClient;

  constructor(client?: HttpClient) {
    this.client = client || new HttpClient();
  }

  /**
   * User authentication
   */
  async login(credentials: UserLoginData): Promise<{ user: User; token: string }> {
    return this.client.post<{ user: User; token: string }>('/auth/login', credentials);
  }

  async logout(): Promise<void> {
    return this.client.post<void>('/auth/logout');
  }

  async refreshToken(): Promise<{ token: string }> {
    return this.client.post<{ token: string }>('/auth/refresh');
  }

  /**
   * User registration
   */
  async register(userData: UserCreateData): Promise<User> {
    return this.client.post<User>('/users', userData);
  }

  async verifyEmail(token: string): Promise<void> {
    return this.client.post<void>('/auth/verify-email', { token });
  }

  async resendVerification(): Promise<void> {
    return this.client.post<void>('/auth/resend-verification');
  }

  /**
   * Password management
   */
  async forgotPassword(email: string): Promise<void> {
    return this.client.post<void>('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    return this.client.post<void>('/auth/reset-password', { token, newPassword });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return this.client.post<void>('/auth/change-password', { currentPassword, newPassword });
  }

  /**
   * User profile management
   */
  async getCurrentUser(): Promise<User> {
    return this.client.get<User>('/users/me');
  }

  async getUser(id: string): Promise<User> {
    return this.client.get<User>(`/users/${id}`);
  }

  async updateProfile(userData: UserUpdateData): Promise<User> {
    return this.client.put<User>('/users/me', userData);
  }

  async updateProfileImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);

    return this.client.upload<{ imageUrl: string }>('/users/me/avatar', formData);
  }

  /**
   * User preferences
   */
  async getUserPreferences(): Promise<UserPreferences> {
    return this.client.get<UserPreferences>('/users/me/preferences');
  }

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    return this.client.put<UserPreferences>('/users/me/preferences', preferences);
  }

  /**
   * User administration (admin only)
   */
  async getAllUsers(params?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ users: User[]; total: number }> {
    return this.client.get<{ users: User[]; total: number }>('/admin/users', params);
  }

  async updateUserStatus(userId: string, status: User['status']): Promise<User> {
    return this.client.put<User>(`/admin/users/${userId}/status`, { status });
  }

  async deleteUser(userId: string): Promise<void> {
    return this.client.delete<void>(`/admin/users/${userId}`);
  }

  /**
   * Social authentication
   */
  async loginWithGoogle(): Promise<{ authUrl: string }> {
    return this.client.get<{ authUrl: string }>('/auth/google');
  }

  async handleGoogleCallback(code: string): Promise<{ user: User; token: string }> {
    return this.client.post<{ user: User; token: string }>('/auth/google/callback', { code });
  }

  /**
   * Two-factor authentication
   */
  async enable2FA(): Promise<{ qrCode: string; secret: string }> {
    return this.client.post<{ qrCode: string; secret: string }>('/auth/2fa/enable');
  }

  async verify2FA(token: string): Promise<void> {
    return this.client.post<void>('/auth/2fa/verify', { token });
  }

  async disable2FA(password: string): Promise<void> {
    return this.client.post<void>('/auth/2fa/disable', { password });
  }

  /**
   * Session management
   */
  async getActiveSessions(): Promise<Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current: boolean;
  }>> {
    return this.client.get('/users/me/sessions');
  }

  async revokeSession(sessionId: string): Promise<void> {
    return this.client.delete(`/users/me/sessions/${sessionId}`);
  }

  async revokeAllSessions(): Promise<void> {
    return this.client.delete('/users/me/sessions');
  }
}

/**
 * User API service instance
 */
export const userApi = new UserApiService();