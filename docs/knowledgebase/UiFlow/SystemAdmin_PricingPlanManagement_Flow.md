# UI Flow: System Admin - Pricing Plan Management

## 1. Overview

This document outlines the UI flow for the Pricing Plan Management section within the System Admin panel of the Multi-Tenant Appointment Booking System. This section allows super administrators to dynamically manage the subscription pricing plans offered across the entire platform, including creating new plans, editing existing ones, and activating/deactivating them. It directly supports FR-8.1.

## 2. Purpose

To provide system administrators with the tools to configure and control the platform's revenue model, allowing for flexible adjustments to pricing strategies, introduction of new tiers, and retirement of old plans without requiring code changes.

## 3. Actors

*   **System Administrator:** The primary user responsible for maintaining and supporting the entire platform.

## 4. Preconditions

*   The user is logged into the platform with a "SuperAdmin" role.
*   The user has navigated to the Pricing Plan Management section (e.g., via the sidebar navigation).

## 5. Postconditions

*   User has viewed a list of all pricing plans.
*   User has successfully created a new pricing plan.
*   User has updated details or status of an existing pricing plan.

## 6. Flow Steps

The Pricing Plan Management section will typically feature a table of all pricing plans, with options to add new plans or perform actions on individual plans.

### 6.1. Page Structure

**Template Type:** Layout 2 (Main Application / Logged In).
**Specific Layout Pattern:** Header, footer, and a main content area with a collapsible sidebar. The main content area will primarily feature a data table for pricing plan listings and a form/modal for adding/editing plans.

**UI Elements:**
*   **Header:** System Admin-specific logged-in header.
*   **Sidebar:** System Admin-specific navigation menu. The "Pricing Plan Management" item will be active.
*   **Main Content Area:**
    *   **Page Title:** "Pricing Plan Management"
    *   **Action Buttons:**
        *   `Create New Plan` button: Opens a form (modal or new page) to define a new pricing plan.
    *   **Pricing Plan List Table:** (Utilizing AG Grid for advanced features)
        *   **Columns:**
            *   Plan Name
            *   Price
            *   Billing Cycle (Monthly, Annually)
            *   Max Services
            *   Max Parallel Slots
            *   Max Staff Users
            *   Status (Active, Inactive, Archived)
            *   Actions (Edit, Activate/Deactivate, Archive)
        *   **Search/Filter:** Input field for searching by plan name. Dropdowns for filtering by status.
        *   **Pagination:** For navigating through large lists of plans.
    *   **Add/Edit Pricing Plan Form (Modal or Separate Page):**
        *   **Header:** "Create New Pricing Plan" or "Edit Plan: [Plan Name]"
        *   **Form Fields:**
            *   `Plan Name` (Text Input)
            *   `Description` (Text Area)
            *   `Price` (Number Input)
            *   `Billing Cycle` (Radio buttons: Monthly, Annually)
            *   `Max Services` (Number Input - or "Unlimited" checkbox)
            *   `Max Parallel Slots` (Number Input - or "Unlimited" checkbox)
            *   `Max Staff Users` (Number Input - or "Unlimited" checkbox)
            *   `Included Features` (Checkboxes for features like "Advanced Analytics", "SMS Notifications", "Multi-user Support", "Custom Integrations", "Dedicated Support", "White-label Options")
            *   `Status` (Dropdown/Select: Active, Inactive, Archived)
        *   **Actions:** `Save`, `Cancel`.
*   **Footer:** Standard logged-in footer.

## 7. Angular Component Definitions

*   **`SystemAdminPricingPlanManagementComponent` (Smart Component):**
    *   **Purpose:** Manages the overall pricing plan functionality, including fetching plans, handling add/edit/archive operations, and orchestrating child components.
    *   **Selector:** `app-system-admin-pricing-plan-management`
    *   **Location:** `src/app/features/system-admin/pricing-plan-management/system-admin-pricing-plan-management.component.ts`
    *   **TypeScript Logic:**
        *   Fetches pricing plan list from a `PricingPlanService`.
        *   Manages search, filter, and pagination states for the plan table.
        *   Opens `AddEditPricingPlanModalComponent` (or navigates to `AddEditPricingPlanPageComponent`).
        *   Handles plan creation, update, and archiving requests via `PricingPlanService`.
        *   Manages loading states and displays success/error messages.
        *   Injects `PricingPlanService`.
    *   **Template:** Integrates `PricingPlanListTableComponent` and `AddEditPricingPlanModalComponent` (or `AddEditPricingPlanPageComponent`).

*   **`PricingPlanListTableComponent` (Dumb Component):**
    *   **Purpose:** Displays the list of pricing plans in a sortable, filterable table.
    *   **Selector:** `app-pricing-plan-list-table`
    *   **Inputs:** `plans: PricingPlanDto[]`, `pagination: PaginationDto`.
    *   **Outputs:** `editPlan: EventEmitter<string>`, `changePlanStatus: EventEmitter<{id: string, status: string}>`, `archivePlan: EventEmitter<string>`.
    *   **Template:** Renders the AG Grid table with columns and actions.

*   **`AddEditPricingPlanModalComponent` (Dumb Component - or `AddEditPricingPlanPageComponent`):**
    *   **Purpose:** Provides a form for adding or editing pricing plan details.
    *   **Selector:** `app-add-edit-pricing-plan-modal`
    *   **Inputs:** `plan: PricingPlanDto` (optional, for editing).
    *   **Outputs:** `planSaved: EventEmitter<PricingPlanDto>`, `modalClosed: EventEmitter<void>`.
    *   **Template:** Renders the form fields for plan details and features.
    *   **TypeScript Logic:** Manages the reactive form, validation, and emits `planSaved` on successful submission.

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

*   **Backend API:** `PricingPlanService` will communicate with backend API endpoints for `GET /api/system-admin/pricing-plans`, `POST /api/system-admin/pricing-plans`, `PUT /api/system-admin/pricing-plans/:id`, `PUT /api/system-admin/pricing-plans/:id/status`.