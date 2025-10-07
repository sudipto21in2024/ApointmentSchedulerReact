import React, { useState } from 'react';
import { useUsers, type UsersQueryParams } from '../../hooks/useUsers';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell
} from '../ui/Table';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import type { UserRole, UserStatus } from '../../types/user';

/**
 * Props for the UserList component
 */
export interface UserListProps {
  /** Initial page size */
  initialPageSize?: number;
  /** Whether to show filters */
  showFilters?: boolean;
  /** Whether to show pagination */
  showPagination?: boolean;
  /** Callback when a user is selected */
  onUserSelect?: (user: any) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * UserList component - Displays a list of users with filtering, sorting, and pagination
 * Uses React Query for data fetching and caching
 */
export const UserList: React.FC<UserListProps> = ({
  initialPageSize = 10,
  showFilters = true,
  showPagination = true,
  onUserSelect,
  className
}) => {
  // State for query parameters
  const [queryParams, setQueryParams] = useState<UsersQueryParams>({
    page: 1,
    pageSize: initialPageSize,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Fetch users using the custom hook
  const {
    data: usersData,
    isLoading,
    error,
    refetch
  } = useUsers(queryParams);

  /**
   * Handle search input change
   * Debounced to avoid excessive API calls
   */
  const handleSearchChange = (value: string) => {
    setQueryParams(prev => ({
      ...prev,
      search: value || undefined,
      page: 1 // Reset to first page when searching
    }));
  };

  /**
   * Handle role filter change
   */
  const handleRoleChange = (value: string | string[]) => {
    const roleValue = Array.isArray(value) ? value[0] : value;
    setQueryParams(prev => ({
      ...prev,
      role: roleValue === 'all' ? undefined : roleValue as UserRole,
      page: 1 // Reset to first page when filtering
    }));
  };

  /**
   * Handle status filter change
   */
  const handleStatusChange = (value: string | string[]) => {
    const statusValue = Array.isArray(value) ? value[0] : value;
    setQueryParams(prev => ({
      ...prev,
      status: statusValue === 'all' ? undefined : statusValue as UserStatus,
      page: 1 // Reset to first page when filtering
    }));
  };

  /**
   * Handle sorting by column
   */
  const handleSort = (sortBy: UsersQueryParams['sortBy']) => {
    setQueryParams(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  /**
   * Handle page change
   */
  const handlePageChange = (page: number) => {
    setQueryParams(prev => ({ ...prev, page }));
  };

  /**
   * Handle page size change
   */
  const handlePageSizeChange = (pageSize: number) => {
    setQueryParams(prev => ({
      ...prev,
      pageSize,
      page: 1 // Reset to first page when changing page size
    }));
  };

  /**
   * Handle user row click
   */
  const handleUserClick = (user: any) => {
    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'suspended':
        return 'text-red-600 bg-red-100';
      case 'pending_verification':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  /**
   * Get role display name
   */
  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'customer':
        return 'Customer';
      case 'service_provider':
        return 'Service Provider';
      case 'tenant_admin':
        return 'Tenant Admin';
      case 'system_admin':
        return 'System Admin';
      default:
        return role;
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
              <p className="text-muted-foreground">Loading users...</p>
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
              <p className="text-red-600 mb-4">
                Failed to load users. Please try again.
              </p>
              <Button onClick={() => refetch()} variant="ghost">
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { users = [], total = 0, page = 1, pageSize = 10, totalPages = 0 } = usersData || {};

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Search users by name or email..."
                value={queryParams.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full"
              />
            </div>
            <Select
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'customer', label: 'Customer' },
                { value: 'service_provider', label: 'Service Provider' },
                { value: 'tenant_admin', label: 'Tenant Admin' },
                { value: 'system_admin', label: 'System Admin' }
              ]}
              value={queryParams.role || 'all'}
              onChange={handleRoleChange}
              placeholder="All Roles"
            />
            <Select
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'suspended', label: 'Suspended' },
                { value: 'pending_verification', label: 'Pending Verification' }
              ]}
              value={queryParams.status || 'all'}
              onChange={handleStatusChange}
              placeholder="All Statuses"
            />
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Results summary */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {users.length} of {total} users
        </div>

        {/* Users table */}
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader
                sortable
                sortDirection={queryParams.sortBy === 'firstName' ? queryParams.sortOrder : null}
                onSort={() => handleSort('firstName')}
              >
                Name
              </TableHeader>
              <TableHeader
                sortable
                sortDirection={queryParams.sortBy === 'email' ? queryParams.sortOrder : null}
                onSort={() => handleSort('email')}
              >
                Email
              </TableHeader>
              <TableHeader
                sortable
                sortDirection={queryParams.sortBy === 'role' ? queryParams.sortOrder : null}
                onSort={() => handleSort('role')}
              >
                Role
              </TableHeader>
              <TableHeader
                sortable
                sortDirection={queryParams.sortBy === 'status' ? queryParams.sortOrder : null}
                onSort={() => handleSort('status')}
              >
                Status
              </TableHeader>
              <TableHeader
                sortable
                sortDirection={queryParams.sortBy === 'createdAt' ? queryParams.sortOrder : null}
                onSort={() => handleSort('createdAt')}
              >
                Created
              </TableHeader>
              <TableHeader
                sortable
                sortDirection={queryParams.sortBy === 'lastLoginAt' ? queryParams.sortOrder : null}
                onSort={() => handleSort('lastLoginAt')}
              >
                Last Login
              </TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No users found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className={onUserSelect ? 'cursor-pointer hover:bg-muted/50' : ''}
                  onClick={() => handleUserClick(user)}
                >
                  <TableCell className="font-medium">
                    {user.fullName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {getRoleDisplayName(user.role)}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {showPagination && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select
                options={[
                  { value: '5', label: '5' },
                  { value: '10', label: '10' },
                  { value: '25', label: '25' },
                  { value: '50', label: '50' }
                ]}
                value={pageSize.toString()}
                onChange={(value) => handlePageSizeChange(Number(Array.isArray(value) ? value[0] : value))}
                placeholder="10"
                className="w-20"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserList;