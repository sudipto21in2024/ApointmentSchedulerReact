# UI Flow: Tenant Admin - Subscription & Billing Management

## 1. Overview

This document outlines the UI flow for the Subscription & Billing Management section within the Tenant Admin panel of the Multi-Tenant Appointment Booking System. This section allows clinic administrators to oversee their organization's subscription plan, track usage against plan limits, manage payment methods for the subscription, and view billing history. It directly supports FR-8.1, FR-8.2, FR-8.3, FR-8.4, and aspects of Journey 2: Small to Medium Clinic - Multi-Practitioner Scheduling (Reporting and Optimization).

## 2. Purpose

To provide tenant administrators with comprehensive control and visibility over their subscription and billing, enabling them to make informed decisions about scaling their usage, managing costs, and ensuring uninterrupted service.

## 3. Actors

*   **Clinic Administrator:** The primary user responsible for managing a tenant's operations.

## 4. Preconditions

*   The user is logged into the platform with a "Tenant Admin" role.
*   The user has navigated to the Subscription & Billing Management section (e.g., via the sidebar navigation).

## 5. Postconditions

*   User has viewed their current subscription plan and its details.
*   User has tracked their usage against plan limits.
*   User has managed payment methods for their subscription.
*   User has viewed their billing history.
*   User has initiated a plan upgrade or downgrade.

## 6. Flow Steps

The Subscription & Billing Management section will typically be structured into several key areas: current plan summary, usage tracking, payment methods, and billing history.

### 6.1. Page Structure

**Template Type:** Layout 2 (Main Application / Logged In).
**Specific Layout Pattern:** Header, footer, and a main content area with a collapsible sidebar. The main content area will feature distinct sections for different aspects of subscription and billing.

**UI Elements:**
*   **Header:** Standard logged-in header with logo, company name, user profile info, notifications drawer, and breadcrumb. The breadcrumb should indicate "Subscription & Billing".
*   **Sidebar:** Tenant Admin-specific navigation menu. The "Subscriptions" item will be active.
*   **Main Content Area:**
    *   **Page Title:** "Subscription & Billing"
    *   **Current Plan Summary Card:**
        *   **Plan Name:** (e.g., "Pro Plan")
        *   **Price:** (e.g., "$29/month")
        *   **Next Billing Date:**
        *   **Key Features:** Highlight top features of the current plan.
        *   **Actions:** `Change Plan` button (navigates to a plan selection interface, potentially similar to `service-provider-register.html` Step 3).
    *   **Usage Tracking Section:**
        *   **Section Title:** "Usage Overview"
        *   **Metrics:** Display progress bars or numerical counts for:
            *   `Services Created` (e.g., 15/Unlimited)
            *   `Parallel Slots Used` (e.g., 20/35)
            *   `Staff Members` (e.g., 8/10)
            *   `SMS Notifications Sent` (e.g., 500/1000)
        *   **Warning/Alerts:** If approaching or exceeding limits.
    *   **Payment Methods Section:**
        *   **Section Title:** "Payment Methods"
        *   **List of Stored Payment Methods:** Display masked card numbers/payment types.
        *   **Actions for Each Method:** `Edit`, `Remove`, `Set as Default`.
        *   **`Add New Payment Method` button.**
    *   **Billing History Section:**
        *   **Section Title:** "Billing History"
        *   **Table:**
            *   **Columns:** Invoice ID, Date, Amount, Status (Paid, Due, Failed), Actions (View Invoice, Download PDF).
        *   **Pagination/Search:** For navigating through billing records.
*   **Footer:** Standard logged-in footer.

## 7. Angular Component Definitions

*   **`TenantAdminSubscriptionBillingComponent` (Smart Component):**
    *   **Purpose:** Manages the overall subscription and billing functionality for the tenant admin.
    *   **Selector:** `app-tenant-admin-subscription-billing`
    *   **Location:** `src/app/features/tenant-admin/subscription-billing/tenant-admin-subscription-billing.component.ts`
    *   **TypeScript Logic:**
        *   Fetches current subscription details, usage metrics, payment methods, and billing history from `SubscriptionService` and `PaymentService`.
        *   Handles plan changes (upgrade/downgrade) via `SubscriptionService`.
        *   Manages payment method additions/edits/removals via `PaymentService`.
        *   Manages loading states and displays success/error messages.
        *   Injects `SubscriptionService`, `PaymentService`.
    *   **Template:** Integrates `CurrentPlanSummaryComponent`, `UsageTrackingComponent`, `PaymentMethodsListComponent`, `BillingHistoryTableComponent`.

*   **`CurrentPlanSummaryComponent` (Dumb Component):**
    *   **Purpose:** Displays the current subscription plan details.
    *   **Selector:** `app-current-plan-summary`
    *   **Inputs:** `currentPlan: SubscriptionPlanDto`.
    *   **Outputs:** `changePlan: EventEmitter<void>`.

*   **`UsageTrackingComponent` (Dumb Component):**
    *   **Purpose:** Visualizes usage metrics against plan limits.
    *   **Selector:** `app-usage-tracking`
    *   **Inputs:** `usageData: UsageMetricsDto[]`.
    *   **Template:** Renders progress bars or other visual indicators for usage.

*   **`PaymentMethodsListComponent` (Dumb Component):**
    *   **Purpose:** Displays and manages payment methods for the subscription. (Can reuse the customer-facing component if generic enough, or create a tenant-admin specific one).
    *   **Selector:** `app-payment-methods-list-admin`
    *   **Inputs:** `paymentMethods: PaymentMethodDto[]`.
    *   **Outputs:** `addMethod: EventEmitter<void>`, `editMethod: EventEmitter<string>`, `removeMethod: EventEmitter<string>`, `setDefault: EventEmitter<string>`.

*   **`BillingHistoryTableComponent` (Dumb Component):**
    *   **Purpose:** Displays a table of past invoices and transactions.
    *   **Selector:** `app-billing-history-table`
    *   **Inputs:** `billingRecords: InvoiceDto[]`.
    *   **Outputs:** `viewInvoice: EventEmitter<string>`, `downloadInvoice: EventEmitter<string>`.

## 8. Styling and Responsiveness

*   **Layout:** Responsive layout for various sections, adapting to screen size.
*   **Usage Tracking:** Clear visual indicators for usage.
*   **Tables:** Readable and responsive, potentially with horizontal scroll on mobile.
*   **Theming:** Adheres to `DesignTokens.json` and `StyleGuide.md`.

## 9. Accessibility Considerations

*   Semantic HTML for all sections, forms, and tables.
*   Keyboard navigation for all interactive elements.
*   ARIA attributes for progress bars, tables, and forms.
*   Sufficient color contrast.
*   Clear focus indicators.

## 10. Integration

*   **Backend API:** `SubscriptionService` and `PaymentService` will communicate with backend API endpoints for `GET /api/tenant-admin/subscription`, `GET /api/tenant-admin/usage`, `GET /api/tenant-admin/payment-methods`, `GET /api/tenant-admin/billing-history`, `PUT /api/tenant-admin/subscription/change-plan`, `POST /api/tenant-admin/payment-methods`, etc.
*   **Routing:** `Change Plan` button might route to the public pricing page or a dedicated internal plan selection page.