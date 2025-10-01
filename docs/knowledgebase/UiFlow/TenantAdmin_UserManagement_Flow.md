# UI Flow: Tenant Admin - User Management

## 1. Overview

This document outlines the UI flow for the User Management section within the Tenant Admin panel of the Multi-Tenant Appointment Booking System. This section allows clinic administrators to manage their staff (practitioners, receptionists, etc.) by adding new users, editing existing user details, assigning roles, and controlling access. It directly supports FR-9.1 and aspects of Journey 2: Small to Medium Clinic - Multi-Practitioner Scheduling (Staff Onboarding, Permissions Setup).

## 2. Purpose

To provide tenant administrators with the tools to efficiently manage their internal users, ensuring proper role assignments, access control, and up-to-date staff information, which is crucial for multi-practitioner scheduling and overall clinic operations.

## 3. Actors

*   **Clinic Administrator:** The primary user responsible for managing a tenant's operations.

## 4. Preconditions

*   The user is logged into the platform with a "Tenant Admin" role.
*   The user has navigated to the User Management section (e.g., via the sidebar navigation).

## 5. Postconditions

*   User has successfully viewed, added, edited, or removed internal users/staff.
*   User roles and permissions are correctly assigned.

## 6. Flow Steps

The User Management section will typically feature a list of existing users, with options to add new users or perform actions on individual users.

### 6.1. Page Structure

**Template Type:** Layout 2 (Main Application / Logged In).
**Specific Layout Pattern:** Header, footer, and a main content area with a collapsible sidebar. The main content area will primarily feature a data table for user listings and a form/modal for adding/editing users.

**UI Elements:**
*   **Header:** Standard logged-in header with logo, company name, user profile info, notifications drawer, and breadcrumb. The breadcrumb should indicate "User Management".
*   **Sidebar:** Tenant Admin-specific navigation menu. The "Users" item will be active.
*   **Main Content Area:**
    *   **Page Title:** "User Management" or "Staff Accounts"
    *   **Action Buttons:**
        *   `Add New User` button: Opens a form (modal or new page) to create a new user account.
    *   **User List Table:** (Utilizing AG Grid for advanced features as per TAR-1.3)
        *   **Columns:**
            *   User Name (First Name, Last Name)
            *   Email
            *   Role (e.g., Practitioner, Receptionist, Admin)
            *   Status (e.g., Active, Inactive, Pending Invitation)
            *   Last Login
            *   Actions (Edit, Deactivate/Activate, Resend Invitation, Delete)
        *   **Search/Filter:** Input field for searching by name or email. Dropdowns for filtering by role or status.
        *   **Pagination:** For navigating through large lists of users.
    *   **Add/Edit User Form (Modal or Separate Page):**
        *   **Header:** "Add New User" or "Edit User: [User Name]"
        *   **Form Fields:**
            *   `First Name` (Text Input)
            *   `Last Name` (Text Input)
            *   `Email Address` (Email Input - read-only for edit, unique validation for add)
            *   `Password` (Password Input - optional for edit, required for add)
            *   `Confirm Password` (Password Input)
            *   `Role` (Dropdown/Select - e.g., Practitioner, Receptionist, Admin)
            *   `Status` (Dropdown/Select - for editing user status)
            *   `Permissions` (Checkboxes/Toggles based on selected role, or granular permissions if applicable)
            *   `Associated Services` (Multi-select or search for Practitioners, to link them to services they provide)
        *   **Actions:** `Save`, `Cancel`.
*   **Footer:** Standard logged-in footer.

## 7. Angular Component Definitions

*   **`TenantAdminUserManagementComponent` (Smart Component):**
    *   **Purpose:** Manages the overall user management functionality, including fetching users, handling add/edit/delete operations, and orchestrating child components.
    *   **Selector:** `app-tenant-admin-user-management`
    *   **Location:** `src/app/features/tenant-admin/user-management/tenant-admin-user-management.component.ts`
    *   **TypeScript Logic:**
        *   Fetches user list from a `UserService`.
        *   Manages search, filter, and pagination states for the user table.
        *   Opens `AddEditUserModalComponent` (or navigates to `AddEditUserPageComponent`).
        *   Handles user creation, update, and deletion requests via `UserService`.
        *   Manages loading states and displays success/error messages.
        *   Injects `UserService`, `RoleService`, `PermissionService`.
    *   **Template:** Integrates `UserListTableComponent` and `AddEditUserModalComponent` (or `AddEditUserPageComponent`).

*   **`UserListTableComponent` (Dumb Component):**
    *   **Purpose:** Displays the list of users in a sortable, filterable table.
    *   **Selector:** `app-user-list-table`
    *   **Inputs:** `users: UserDto[]`, `pagination: PaginationDto`.
    *   **Outputs:** `editUser: EventEmitter<string>`, `deleteUser: EventEmitter<string>`, `filterChanged: EventEmitter<FilterDto>`, `sortChanged: EventEmitter<SortDto>`, `pageChanged: EventEmitter<number>`.
    *   **Template:** Renders the AG Grid table with columns and actions.

*   **`AddEditUserModalComponent` (Dumb Component - or `AddEditUserPageComponent`):**
    *   **Purpose:** Provides a form for adding or editing user details.
    *   **Selector:** `app-add-edit-user-modal`
    *   **Inputs:** `user: UserDto` (optional, for editing), `roles: RoleDto[]`, `permissions: PermissionDto[]`.
    *   **Outputs:** `userSaved: EventEmitter<UserDto>`, `modalClosed: EventEmitter<void>`.
    *   **Template:** Renders the form fields for user details, roles, and permissions.
    *   **TypeScript Logic:** Manages the reactive form, validation, and emits `userSaved` on successful submission.

## 8. Styling and Responsiveness

*   **Layout:** Responsive table with horizontal scroll on smaller screens. Forms will adapt to single-column layout on mobile.
*   **Table:** Clear and readable, with distinct rows and action buttons.
*   **Forms:** Well-organized and easy to navigate.
*   **Theming:** Adheres to `DesignTokens.json` and `StyleGuide.md`.

## 9. Accessibility Considerations

*   Semantic HTML for tables, forms, and headings.
*   Keyboard navigation for all interactive elements (table sorting, filters, form fields, buttons).
*   ARIA attributes for table elements, form validation, and modal dialogs.
*   Sufficient color contrast.
*   Clear focus indicators.

## 10. Integration

*   **Backend API:** `UserService` will communicate with backend API endpoints for `GET /api/users`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id`. `RoleService` and `PermissionService` for dropdown data.
*   **Routing:** Adding/editing users might involve routing to a separate page or opening a modal.