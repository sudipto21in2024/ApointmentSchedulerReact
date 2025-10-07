import React from 'react';
import { useUser } from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import type { User, UserRole } from '../../types/user';

/**
 * Props for the UserDetail component
 */
export interface UserDetailProps {
  /** The ID of the user to display details for */
  userId: string;
  /** Callback when the component encounters an error */
  onError?: (error: Error) => void;
  /** Callback when user data is successfully loaded */
  onSuccess?: (user: User) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * UserDetail component - Displays comprehensive user profile information
 *
 * Features:
 * - Fetches user data using React Query
 * - Implements privacy controls based on current user's role
 * - Handles loading and error states gracefully
 * - Displays user information in organized card sections
 * - Follows accessibility guidelines
 * - Uses design system components for consistent styling
 */
export const UserDetail: React.FC<UserDetailProps> = ({
  userId,
  onError,
  onSuccess,
  className
}) => {
  // Get current authenticated user for privacy controls
  const { user: currentUser } = useAuth();

  // Fetch user data using React Query
  const {
    data: user,
    isLoading,
    error,
    refetch
  } = useUser(userId);

  // Notify parent components of state changes
  React.useEffect(() => {
    if (error && onError) {
      onError(error as Error);
    }
    if (user && onSuccess) {
      onSuccess(user);
    }
  }, [error, user, onError, onSuccess]);

  /**
   * Determines if the current user can view sensitive information
   * Privacy rules:
   * - System admins can see everything
   * - Tenant admins can see users in their tenant
   * - Service providers can see customer details but not other providers' sensitive info
   * - Customers can only see their own details
   */
  const canViewSensitiveInfo = React.useMemo(() => {
    if (!currentUser || !user) return false;

    // System admins can see everything
    if (currentUser.role === 'system_admin') return true;

    // Tenant admins can see users in their tenant (assuming same tenant for now)
    if (currentUser.role === 'tenant_admin') return true;

    // Service providers can see customer details
    if (currentUser.role === 'service_provider' && user.role === 'customer') return true;

    // Users can see their own details
    if (currentUser.id === user.id) return true;

    return false;
  }, [currentUser, user]);

  /**
   * Determines if the current user can view basic information
   * Less restrictive than sensitive info
   */
  const canViewBasicInfo = React.useMemo(() => {
    if (!currentUser || !user) return false;

    // System and tenant admins can see basic info of all users
    if (currentUser.role && ['system_admin', 'tenant_admin'].includes(currentUser.role)) return true;

    // Service providers can see basic info of all users (but not sensitive info of other providers)
    if (currentUser.role === 'service_provider') return true;

    // Users can see their own info
    if (currentUser.id === user.id) return true;

    return false;
  }, [currentUser, user]);

  /**
   * Formats a date string for display
   */
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Gets the display name for a user role
   */
  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case 'customer':
        return 'Customer';
      case 'service_provider':
        return 'Service Provider';
      case 'tenant_admin':
        return 'Tenant Administrator';
      case 'system_admin':
        return 'System Administrator';
      default:
        return role;
    }
  };

  /**
   * Gets the CSS classes for status badges
   */
  const getStatusBadgeClasses = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-600';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading user details...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                Failed to load user details. Please try again.
              </div>
              <Button onClick={() => refetch()} variant="ghost">
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No user data
  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              User not found.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No permission to view user
  if (!canViewBasicInfo) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              You don't have permission to view this user's details.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* User Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.fullName}'s avatar`}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xl font-semibold text-gray-600">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {user.fullName}
              </h1>
              <p className="text-gray-600 mb-2">{user.email}</p>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {getRoleDisplayName(user.role)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(user.status)}`}>
                  {user.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <p className="text-gray-900">{user.firstName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <p className="text-gray-900">{user.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <p className="text-gray-900">{getRoleDisplayName(user.role)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(user.status)}`}>
                {user.status.replace('_', ' ')}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Verified
              </label>
              <p className="text-gray-900">
                {user.emailVerified ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      {canViewSensitiveInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <p className="text-gray-900">{user.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <p className="text-gray-900">
                  {user.dateOfBirth ? formatDate(user.dateOfBirth) : 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <p className="text-gray-900">{user.timezone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <p className="text-gray-900">{user.language}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Two-Factor Authentication
              </label>
              <p className="text-gray-900">
                {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Login
              </label>
              <p className="text-gray-900">
                {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Created
              </label>
              <p className="text-gray-900">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Updated
              </label>
              <p className="text-gray-900">{formatDate(user.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      {!canViewSensitiveInfo && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-800">
                  Privacy Protected
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Some information is hidden to protect user privacy. Only authorized personnel can view sensitive details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserDetail;