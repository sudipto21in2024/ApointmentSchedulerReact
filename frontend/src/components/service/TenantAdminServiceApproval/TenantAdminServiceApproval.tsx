import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui';
import { ServiceCard } from '../ServiceCard';
import { cn } from '../../../utils/cn';
import { serviceApi } from '../../../services';
import type {
  ServiceApprovalProps,
  Service,
  ServicePagination,
  ServiceError
} from '../types';

/**
 * TenantAdminServiceApproval Component - Handles service approval workflow for tenant administrators
 *
 * Features:
 * - Display services pending approval
 * - View detailed service information
 * - Approve or reject services with comments
 * - Bulk approval/rejection operations
 * - Integration with backend approval APIs
 * - Responsive design for all screen sizes
 * - Accessibility compliance with WCAG 2.1 AA
 *
 * @example
 * ```tsx
 * // Basic service approval interface
 * <TenantAdminServiceApproval
 *   onApprove={handleApproval}
 *   onReject={handleRejection}
 * />
 * ```
 */
export const TenantAdminServiceApproval: React.FC<ServiceApprovalProps> = ({
  pendingServices: initialServices = [],
  onApprove,
  onReject,
  onServiceSelect,
  pagination = { page: 1, pageSize: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
  onPageChange,
  className,
  'data-testid': testId,
}) => {
  // Component state
  const [services, setServices] = useState<Service[]>(initialServices);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ServiceError | null>(null);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [approvalComments, setApprovalComments] = useState<Record<string, string>>({});
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [rejectionComments, setRejectionComments] = useState<Record<string, string>>({});
  const [currentPagination, setCurrentPagination] = useState<ServicePagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
    ...pagination,
  });

  /**
   * Load pending services from API
   */
  const loadPendingServices = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await serviceApi.getPendingServices({
        page,
        pageSize: currentPagination.pageSize,
      });

      setServices(response.services);
      setCurrentPagination(response.pagination);
      onPageChange?.(page);
    } catch (err) {
      const serviceError: ServiceError = {
        code: 'LOAD_FAILED',
        message: err instanceof Error ? err.message : 'Failed to load pending services',
        timestamp: new Date(),
      };
      setError(serviceError);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle service approval
   */
  const handleApprove = async (serviceId: string) => {
    setLoading(true);
    setError(null);

    try {
      const comments = approvalComments[serviceId] || '';
      await serviceApi.approveService(serviceId, comments);

      // Update local state
      setServices(prev => prev.filter(service => service.id !== serviceId));

      // Call external handler
      onApprove?.(serviceId, comments);

      // Clear form data for this service
      setApprovalComments(prev => {
        const updated = { ...prev };
        delete updated[serviceId];
        return updated;
      });

    } catch (err) {
      const serviceError: ServiceError = {
        code: 'APPROVAL_FAILED',
        message: err instanceof Error ? err.message : 'Failed to approve service',
        timestamp: new Date(),
      };
      setError(serviceError);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle service rejection
   */
  const handleReject = async (serviceId: string) => {
    const reason = rejectionReasons[serviceId];
    if (!reason) {
      setError({
        code: 'VALIDATION_ERROR',
        message: 'Rejection reason is required',
        timestamp: new Date(),
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const comments = rejectionComments[serviceId] || '';
      await serviceApi.rejectService(serviceId, reason, comments);

      // Update local state
      setServices(prev => prev.filter(service => service.id !== serviceId));

      // Call external handler
      onReject?.(serviceId, reason, comments);

      // Clear form data for this service
      setRejectionReasons(prev => {
        const updated = { ...prev };
        delete updated[serviceId];
        return updated;
      });
      setRejectionComments(prev => {
        const updated = { ...prev };
        delete updated[serviceId];
        return updated;
      });

    } catch (err) {
      const serviceError: ServiceError = {
        code: 'REJECTION_FAILED',
        message: err instanceof Error ? err.message : 'Failed to reject service',
        timestamp: new Date(),
      };
      setError(serviceError);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle bulk approval
   */
  const handleBulkApprove = async () => {
    if (selectedServices.size === 0) return;

    setLoading(true);
    setError(null);

    try {
      const approvalPromises = Array.from(selectedServices).map(serviceId =>
        serviceApi.approveService(serviceId, approvalComments[serviceId] || '')
      );

      await Promise.all(approvalPromises);

      // Update local state
      setServices(prev => prev.filter(service => !selectedServices.has(service.id)));
      setSelectedServices(new Set());

      // Clear form data for selected services
      setApprovalComments(prev => {
        const updated = { ...prev };
        selectedServices.forEach(id => delete updated[id]);
        return updated;
      });

    } catch (err) {
      const serviceError: ServiceError = {
        code: 'BULK_APPROVAL_FAILED',
        message: err instanceof Error ? err.message : 'Failed to approve selected services',
        timestamp: new Date(),
      };
      setError(serviceError);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle bulk rejection
   */
  const handleBulkReject = async () => {
    const invalidServices = Array.from(selectedServices).filter(
      serviceId => !rejectionReasons[serviceId]
    );

    if (invalidServices.length > 0) {
      setError({
        code: 'VALIDATION_ERROR',
        message: 'All selected services must have rejection reasons',
        timestamp: new Date(),
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rejectionPromises = Array.from(selectedServices).map(serviceId =>
        serviceApi.rejectService(
          serviceId,
          rejectionReasons[serviceId],
          rejectionComments[serviceId] || ''
        )
      );

      await Promise.all(rejectionPromises);

      // Update local state
      setServices(prev => prev.filter(service => !selectedServices.has(service.id)));
      setSelectedServices(new Set());

      // Clear form data for selected services
      setRejectionReasons(prev => {
        const updated = { ...prev };
        selectedServices.forEach(id => delete updated[id]);
        return updated;
      });
      setRejectionComments(prev => {
        const updated = { ...prev };
        selectedServices.forEach(id => delete updated[id]);
        return updated;
      });

    } catch (err) {
      const serviceError: ServiceError = {
        code: 'BULK_REJECTION_FAILED',
        message: err instanceof Error ? err.message : 'Failed to reject selected services',
        timestamp: new Date(),
      };
      setError(serviceError);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle service selection for bulk operations
   */
  const handleServiceSelection = (serviceId: string, selected: boolean) => {
    setSelectedServices(prev => {
      const updated = new Set(prev);
      if (selected) {
        updated.add(serviceId);
      } else {
        updated.delete(serviceId);
      }
      return updated;
    });
  };

  /**
   * Handle select all services
   */
  const handleSelectAll = () => {
    if (selectedServices.size === services.length) {
      setSelectedServices(new Set());
    } else {
      setSelectedServices(new Set(services.map(service => service.id)));
    }
  };

  /**
   * Load services on component mount and pagination changes
   */
  useEffect(() => {
    if (initialServices.length === 0) {
      loadPendingServices(currentPagination.page);
    }
  }, [currentPagination.page]);

  /**
   * Render error state
   */
  const renderError = () => {
    if (!error) return null;

    return (
      <div
        className="p-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error.message}</span>
        </div>
      </div>
    );
  };

  /**
   * Render service approval card
   */
  const renderServiceApprovalCard = (service: Service) => (
    <Card key={service.id} className="mb-4">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={selectedServices.has(service.id)}
              onChange={(e) => handleServiceSelection(service.id, e.target.checked)}
              className="mt-1 h-4 w-4 text-primary-main focus:ring-primary-main border-gray-300 rounded"
            />
            <div>
              <CardTitle className="text-lg">{service.name}</CardTitle>
              <CardDescription>
                Submitted by {service.providerId} • {new Date(service.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
              Pending Approval
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Service preview */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <ServiceCard
            service={service}
            variant="compact"
            showApprovalStatus={false}
            onClick={() => onServiceSelect?.(service)}
          />
        </div>

        {/* Approval actions */}
        <div className="flex flex-col space-y-4 pt-4 border-t">
          {/* Approval comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approval Comments (Optional)
            </label>
            <textarea
              value={approvalComments[service.id] || ''}
              onChange={(e) => setApprovalComments(prev => ({
                ...prev,
                [service.id]: e.target.value
              }))}
              placeholder="Add comments for the service provider..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent"
              rows={2}
            />
          </div>

          {/* Rejection section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Rejection Reason (Required if rejecting)
            </label>
            <select
              value={rejectionReasons[service.id] || ''}
              onChange={(e) => setRejectionReasons(prev => ({
                ...prev,
                [service.id]: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent"
            >
              <option value="">Select rejection reason</option>
              <option value="incomplete_information">Incomplete Information</option>
              <option value="inappropriate_content">Inappropriate Content</option>
              <option value="policy_violation">Policy Violation</option>
              <option value="low_quality">Low Quality</option>
              <option value="duplicate_service">Duplicate Service</option>
              <option value="other">Other</option>
            </select>

            {/* Rejection comments */}
            {rejectionReasons[service.id] && (
              <textarea
                value={rejectionComments[service.id] || ''}
                onChange={(e) => setRejectionComments(prev => ({
                  ...prev,
                  [service.id]: e.target.value
                }))}
                placeholder="Provide detailed feedback for the service provider..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent"
                rows={2}
              />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => handleReject(service.id)}
              disabled={loading || !rejectionReasons[service.id]}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Reject
            </Button>

            <Button
              onClick={() => handleApprove(service.id)}
              disabled={loading}
              loading={loading}
            >
              Approve Service
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  /**
   * Render bulk actions
   */
  const renderBulkActions = () => {
    if (selectedServices.size === 0) return null;

    return (
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-900">
                {selectedServices.size} service{selectedServices.size !== 1 ? 's' : ''} selected
              </span>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedServices(new Set())}
                className="text-blue-600 hover:text-blue-700"
              >
                Clear Selection
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkReject}
                disabled={loading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Reject Selected
              </Button>

              <Button
                size="sm"
                onClick={handleBulkApprove}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Approve Selected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        No services pending approval
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        All service submissions have been reviewed.
      </p>
    </div>
  );

  return (
    <div className={cn('space-y-6', className)} data-testid={testId}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Service Approvals</h2>
          <p className="text-gray-600">
            Review and approve service submissions from providers
          </p>
        </div>

        <Button
          onClick={() => loadPendingServices(1)}
          disabled={loading}
          variant="ghost"
          size="sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </Button>
      </div>

      {/* Error display */}
      {renderError()}

      {/* Bulk actions */}
      {renderBulkActions()}

      {/* Select all checkbox */}
      {services.length > 0 && (
        <div className="flex items-center space-x-2 pb-4">
          <input
            type="checkbox"
            checked={selectedServices.size === services.length && services.length > 0}
            onChange={handleSelectAll}
            className="h-4 w-4 text-primary-main focus:ring-primary-main border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">
            Select all services ({services.length})
          </span>
        </div>
      )}

      {/* Loading state */}
      {loading && services.length === 0 && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Services list */}
      {services.length > 0 ? (
        <div className="space-y-4">
          {services.map(renderServiceApprovalCard)}
        </div>
      ) : !loading ? (
        renderEmptyState()
      ) : null}

      {/* Pagination would go here if needed */}
      {currentPagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-gray-700">
            Showing {services.length} of {currentPagination.total} services
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={!currentPagination.hasPrev || loading}
              onClick={() => loadPendingServices((currentPagination.page || 1) - 1)}
            >
              Previous
            </Button>

            <span className="text-sm text-gray-700">
              Page {currentPagination.page} of {currentPagination.totalPages}
            </span>

            <Button
              variant="ghost"
              size="sm"
              disabled={!currentPagination.hasNext || loading}
              onClick={() => loadPendingServices((currentPagination.page || 1) + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * TenantAdminServiceApproval component display name for debugging
 */
TenantAdminServiceApproval.displayName = 'TenantAdminServiceApproval';

export default TenantAdminServiceApproval;