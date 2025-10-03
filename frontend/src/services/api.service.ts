/**
 * @deprecated This file is deprecated. Use the new modular API services instead.
 *
 * Migration guide:
 * - Instead of: import { serviceApi } from '../../../services/api.service'
 * - Use: import { serviceApi } from '../../../services'
 *
 * The new structure provides better separation of concerns and maintainability.
 */

// Re-export from the new modular structure for backward compatibility
export {
  serviceApi,
  ServiceApiService
} from './service-api.service';

// Re-export types from the service types
export type {
  Service,
  ServiceCreateData,
  ServiceUpdateData,
  ServiceListResponse,
  ServiceFilters,
  ServiceSortOption,
  ServicePagination,
  ServiceApprovalResponse,
  ServiceCategory
} from '../components/service/types';

// For backward compatibility, also export the main API service
export { api as ApiService } from './index';