# UI Flow: System Admin - Tenant Management

## 1. Overview

This document outlines the UI flow for the Tenant Management section within the System Admin panel of the Multi-Tenant Appointment Booking System. This section allows super administrators to manage all tenants on the platform, including onboarding new tenants, activating/deactivating existing ones, updating tenant details, and monitoring high-level tenant usage. It directly supports FR-9.1 and FR-10.1.

## 2. Purpose

To provide system administrators with a centralized interface to oversee and control the lifecycle of all tenants on the platform, ensuring proper provisioning, access, and resource allocation.

## 3. Actors

*   **System Administrator:** The primary user responsible for maintaining and supporting the entire platform.

## 4. Preconditions

*   The user is logged into the platform with a "SuperAdmin" role.
*   The user has navigated to the Tenant Management section (e.g., via the sidebar navigation).

## 5. Postconditions

*   User has viewed a list of all tenants.
*   User has successfully onboarded a new tenant.
*   User has updated details or status of an existing tenant.

## 6. Flow Steps

The Tenant Management section will typically feature a table of all tenants, with options to add new tenants or perform actions on individual tenants.

### 6.1. Page Structure

**Template Type:** Layout 2 (Main Application / Logged In).
**Specific Layout Pattern:** Header, footer, and a main content area with a collapsible sidebar. The main content area will primarily feature a data table for tenant listings and a form/modal for adding/editing tenants.

**UI Elements:**
*   **Header:** System Admin-specific logged-in header.
*   **Sidebar:** System Admin-specific navigation menu. The "Tenant Management" item will be active.
*   **Main Content Area:**
    *   **Page Title:** "Tenant Management"
    *   **Action Buttons:**
        *   `Onboard New Tenant` button: Opens a form (modal or new page) to add a new tenant to the system.
    *   **Tenant List Table:** (Utilizing AG Grid for advanced features)
        *   **Columns:**
            *   Tenant Name
            *   Subdomain URL
            *   Administrator Email
            *   Current Plan
            *   Status (Active, Inactive, Suspended)
            *   Creation Date
            *   Last Activity
            *   Actions (View Details, Edit, Activate/Deactivate/Suspend, Delete, View Tenant Dashboard)
        *   **Search/Filter:** Input field for searching by tenant name or admin email. Dropdowns for filtering by plan or status.
        *   **Pagination:** For navigating through large lists of tenants.
    *   **Add/Edit Tenant Form (Modal or Separate Page):**
        *   **Header:** "Onboard New Tenant" or "Edit Tenant: [Tenant Name]"
        *   **Form Fields:**
            *   `Tenant Name` (Text Input)
            *   `Desired Subdomain` (Text Input with `.yourdomain.com` suffix hint, unique validation)
            *   `Admin First Name` (Text Input)
            *   `Admin Last Name` (Text Input)
            *   `Admin Email Address` (Email Input - unique validation)
            *   `Admin Password` (Password Input - for new tenant admin)
            *   `Initial Subscription Plan` (Dropdown/Select - links to Pricing Plan Management)
            *   `Status` (Dropdown/Select - for editing tenant status)
        *   **Actions:** `Save`, `Cancel`.
*   **Footer:** Standard logged-in footer.

## 7. Angular Component Definitions

*   **`SystemAdminTenantManagementComponent` (Smart Component):**
    *   **Purpose:** Manages the overall tenant management functionality, including fetching tenants, handling add/edit/delete operations, and orchestrating child components.
    *   **Selector:** `app-system-admin-tenant-management`
    *   **Location:** `src/app/features/system-admin/tenant-management/system-admin-tenant-management.component.ts`
    *   **TypeScript Logic:**
        *   Fetches tenant list from a `TenantService`.
        *   Manages search, filter, and pagination states for the tenant table.
        *   Opens `AddEditTenantModalComponent` (or navigates to `AddEditTenantPageComponent`).
        *   Handles tenant creation, update, and deletion requests via `TenantService`.
        *   Manages loading states and displays success/error messages.
        *   Injects `TenantService`, `PricingPlanService`.
    *   **Template:** Integrates `TenantListTableComponent` and `AddEditTenantModalComponent` (or `AddEditTenantPageComponent`).

*   **`TenantListTableComponent` (Dumb Component):**
    *   **Purpose:** Displays the list of tenants in a sortable, filterable table.
    *   **Selector:** `app-tenant-list-table`
    *   **Inputs:** `tenants: TenantDto[]`, `pagination: PaginationDto`.
    *   **Outputs:** `editTenant: EventEmitter<string>`, `deleteTenant: EventEmitter<string>`, `changeTenantStatus: EventEmitter<{id: string, status: string}>`, `viewTenantDashboard: EventEmitter<string>`.
    *   **Template:** Renders the AG Grid table with columns and actions.

*   **`AddEditTenantModalComponent` (Dumb Component - or `AddEditTenantPageComponent`):**
    *   **Purpose:** Provides a form for adding or editing tenant details.
    *   **Selector:** `app-add-edit-tenant-modal`
    *   **Inputs:** `tenant: TenantDto` (optional, for editing), `pricingPlans: PricingPlanDto[]`.
    *   **Outputs:** `tenantSaved: EventEmitter<TenantDto>`, `modalClosed: EventEmitter<void>`.
    *   **Template:** Renders the form fields for tenant details, admin info, and initial plan selection.
    *   **TypeScript Logic:** Manages the reactive form, validation, and emits `tenantSaved` on successful submission.

## 8. Styling and Responsiveness

*   **Layout:** Responsive table with horizontal scroll on smaller screens. Forms will adapt to single-column layout on mobile.
*   **Table:** Clear and readable, with distinct rows and action buttons. Status badges for visual clarity.
*   **Forms:** Well-organized and easy to navigate.
*   **Theming:** Adheres to `DesignTokens.json` and `StyleGuide.md`.

## 9. Accessibility Considerations

*   Semantic HTML for tables, forms, and headings.
*   Keyboard navigation for all interactive elements.
*   ARIA attributes for table elements, form validation, and modal dialogs.
*   Sufficient color contrast.
*   Clear focus indicators.

## 10. Integration

*   **Backend API:** `TenantService` will communicate with backend API endpoints for `GET /api/system-admin/tenants`, `POST /api/system-admin/tenants`, `PUT /api/system-admin/tenants/:id`, `DELETE /api/system-admin/tenants/:id`, `PUT /api/system-admin/tenants/:id/status`.
*   **Routing:** `View Tenant Dashboard` action will likely redirect to the tenant's specific admin dashboard URL (e.g., `[subdomain].yourdomain.com/dashboard`).