# UI Flow: Tenant Admin - Service Approval & Management

## 1. Overview

This document outlines the UI flow for the Service Approval & Management section within the Tenant Admin panel of the Multi-Tenant Appointment Booking System. This section allows clinic administrators to review and approve new or updated service listings submitted by practitioners, and to manage the overall service catalog of their tenant. It directly supports FR-9.2 and aspects of Journey 2: Small to Medium Clinic - Multi-Practitioner Scheduling (Service Catalog).

## 2. Purpose

To ensure that all services offered by a tenant meet internal quality standards and policies before being published, and to provide a centralized interface for administrators to manage their organization's service offerings.

## 3. Actors

*   **Clinic Administrator:** The primary user responsible for managing a tenant's operations.

## 4. Preconditions

*   The user is logged into the platform with a "Tenant Admin" role.
*   The user has navigated to the Service Approval & Management section (e.g., via the sidebar navigation).
*   There are pending service submissions or existing services to manage.

## 5. Postconditions

*   Service listings are reviewed, approved, or rejected.
*   Service catalog is accurately maintained and reflects approved offerings.

## 6. Flow Steps

The Service Approval & Management section will typically feature a list of services with their status (pending, approved, rejected), and actions for review or modification.

### 6.1. Page Structure

**Template Type:** Layout 2 (Main Application / Logged In).
**Specific Layout Pattern:** Header, footer, and a main content area with a collapsible sidebar. The main content area will primarily feature a data table for service listings and potentially a detail view for individual service review.

**UI Elements:**
*   **Header:** Standard logged-in header with logo, company name, user profile info, notifications drawer, and breadcrumb. The breadcrumb should indicate "Service Management".
*   **Sidebar:** Tenant Admin-specific navigation menu. The "Services" item will be active.
*   **Main Content Area:**
    *   **Page Title:** "Service Management" or "Service Catalog"
    *   **Tabs/Filters:**
        *   `All Services`
        *   `Pending Approval`
        *   `Approved`
        *   `Rejected`
        *   `Drafts`
    *   **Action Buttons:**
        *   `Add New Service` button (links to the existing service creation flow: `service-management/create-edit.html`).
    *   **Service List Table:** (Utilizing AG Grid for advanced features as per TAR-1.3)
        *   **Columns:**
            *   Service Name
            *   Category
            *   Provider (if multi-practitioner clinic)
            *   Price
            *   Duration
            *   Status (Pending, Approved, Rejected, Draft)
            *   Last Modified
            *   Actions (View Details, Edit, Approve/Reject (for pending), Publish/Unpublish, Delete)
        *   **Search/Filter:** Input field for searching by service name or provider. Dropdowns for filtering by category or status.
        *   **Pagination:** For navigating through large lists of services.
    *   **Service Detail/Approval View (Modal or Separate Page):** (Accessible by clicking "View Details" or "Edit" on a service)
        *   **Header:** "Service Details: [Service Name]" or "Review Service: [Service Name]"
        *   **Sections:**
            *   **Basic Information:** Name, Description, Category.
            *   **Pricing & Slots:** Price, Duration, Parallel Slots, Multi-booking settings.
            *   **Media:** Images, Videos.
            *   **Provider Information:** Details of the service provider/practitioner.
        *   **Approval/Rejection Actions (for pending services):**
            *   `Approve` button.
            *   `Reject` button (with optional text input for reason).
        *   **Edit Actions (for all services):**
            *   `Edit` button (links to the existing service creation/edit form).
        *   **Status Toggles:** `Published/Unpublished` (for approved services).
        *   **Actions:** `Save Changes`, `Cancel`.
*   **Footer:** Standard logged-in footer.

## 7. Angular Component Definitions

*   **`TenantAdminServiceManagementComponent` (Smart Component):**
    *   **Purpose:** Manages the overall service management functionality for the tenant admin, including fetching services, handling approval/rejection, and orchestrating child components.
    *   **Selector:** `app-tenant-admin-service-management`
    *   **Location:** `src/app/features/tenant-admin/service-management/tenant-admin-service-management.component.ts`
    *   **TypeScript Logic:**
        *   Fetches service list from a `ServiceService` (with admin-specific filters/endpoints).
        *   Manages tab/filter states.
        *   Handles service approval, rejection, publishing, unpublishing, and deletion requests via `ServiceService`.
        *   Opens `ServiceDetailViewComponent` (or navigates to `ServiceDetailViewPageComponent`).
        *   Manages loading states and displays success/error messages.
        *   Injects `ServiceService`.
    *   **Template:** Integrates `ServiceListTableComponent` and `ServiceDetailViewComponent` (or `ServiceDetailViewPageComponent`).

*   **`ServiceListTableComponent` (Dumb Component):**
    *   **Purpose:** Displays the list of services in a table format.
    *   **Selector:** `app-service-list-table`
    *   **Inputs:** `services: ServiceDto[]`, `pagination: PaginationDto`.
    *   **Outputs:** `viewDetails: EventEmitter<string>`, `editService: EventEmitter<string>`, `approveService: EventEmitter<string>`, `rejectService: EventEmitter<string>`, `publishService: EventEmitter<string>`, `unpublishService: EventEmitter<string>`, `deleteService: EventEmitter<string>`.
    *   **Template:** Renders the AG Grid table with service details, status, and action buttons.

*   **`ServiceDetailViewComponent` (Dumb Component - or `ServiceDetailViewPageComponent`):**
    *   **Purpose:** Displays detailed information about a service and provides approval/management actions.
    *   **Selector:** `app-service-detail-view`
    *   **Inputs:** `service: ServiceDto`.
    *   **Outputs:** `serviceApproved: EventEmitter<string>`, `serviceRejected: EventEmitter<{id: string, reason: string}>`, `servicePublished: EventEmitter<string>`, `serviceUnpublished: EventEmitter<string>`, `editService: EventEmitter<string>`.
    *   **Template:** Renders all service details, including images, description, pricing, and provider info, along with approval/management buttons.

## 8. Styling and Responsiveness

*   **Layout:** Responsive table with horizontal scroll on smaller screens. Detail view will adapt to single-column on mobile.
*   **Table:** Clear and readable, with distinct rows and action buttons. Status badges for visual clarity.
*   **Detail View:** Well-organized sections for service information.
*   **Theming:** Adheres to `DesignTokens.json` and `StyleGuide.md`.

## 9. Accessibility Considerations

*   Semantic HTML for tables, forms, and headings.
*   Keyboard navigation for all interactive elements.
*   ARIA attributes for table elements, form validation, and modal dialogs.
*   Sufficient color contrast.
*   Clear focus indicators.

## 10. Integration

*   **Backend API:** `ServiceService` will communicate with backend API endpoints for `GET /api/tenant-admin/services` (with status filters), `PUT /api/tenant-admin/services/:id/approve`, `PUT /api/tenant-admin/services/:id/reject`, `PUT /api/tenant-admin/services/:id/publish`, `PUT /api/tenant-admin/services/:id/unpublish`, `DELETE /api/tenant-admin/services/:id`.
*   **Routing:** Edit actions will route to the existing service creation/edit form (`service-management/create-edit.html`).