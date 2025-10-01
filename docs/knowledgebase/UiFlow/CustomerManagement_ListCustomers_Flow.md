# UI Flow: Customer Management - List Customers

## 1. Overview

This document outlines the user interface flow for viewing and managing a list of customers for the service provider.

## 2. User Journey Context

This flow is crucial for service providers to access customer information, view their booking history, and potentially contact them. It directly addresses Functional Requirement FR-4.3: View customer history, preferences, and feedback.

## 3. High-Level Layout

**Template Type:** Layout 2 (Main Application / Logged In)
**Specific Layout Pattern:** `dashboard_sidebar_layout` from `docs/layout-patterns/page-layouts.json`

The layout will feature the standard logged-in application structure: header, sidebar, and main content area. The customer list will be displayed within the main content area.

## 4. Wireframe (Textual Representation)

```
+---------------------------------------------------------------------------------+
| [Header: Logo | Company Name | Breadcrumbs | User Profile | Notifications]     |
+---------------------------------------------------------------------------------+
| [Sidebar]                   | [Main Content Area]                             |
|  - [Navigation Menu]        |                                                 |
|    - Dashboard              |  [Page Header: Customers]                       |
|    - Services               |                                                 |
|    - Bookings               |  [Search and Filter Bar]                        |
|    - Customers (Active)     |  +--------------------------------------------+ |
|    - Analytics              |  | [Search Input] [Filter by Last Booking Date] |
|                             |  +--------------------------------------------+ |
|                             |                                                 |
|                             |  [Customer List - Table/Grid]                   |
|                             |  +--------------------------------------------+ |
|                             |  | [Table Header: Name, Email, Phone, Last Booking, Actions] |
|                             |  | [Customer Row 1: Jane Doe, jane@example.com, 555-1234, 2023-10-26, [View Profile] [View Bookings]] |
|                             |  | [Customer Row 2: Mike Smith, mike@example.com, 555-5678, 2023-10-26, [View Profile] [View Bookings]] |
|                             |  | ...                                        | |
|                             |  +--------------------------------------------+ |
|                             |                                                 |
|                             |  [Pagination]                                   |
|                             |                                                 |
+---------------------------------------------------------------------------------+
| [Footer: Copyright | Links]                                                     |
+---------------------------------------------------------------------------------+
```

## 5. Angular Component Definitions

### 5.1. `CustomerListComponent` (Feature Component)

*   **Purpose:** Displays a paginated, filterable, and searchable list of customers.
*   **Selector:** `app-customer-list`
*   **Location:** `src/app/features/customer-management/customer-list/customer-list.component.ts`
*   **TypeScript Logic:**
    *   **Imports:** `CustomerService`, `Router`, `Customer`.
    *   **Properties:** `customers: Customer[]`, `isLoading: boolean`, `filter: CustomerFilterDto`.
    *   **Constructor:** Injects `CustomerService`, `Router`.
    *   **`ngOnInit()`:** Calls `customerService.getCustomers()` to fetch initial data.
    *   **`applyFilters()`:** Fetches data based on search and filter inputs.
    *   **`onViewProfile(customerId)`:** Navigates to a customer profile detail page (not yet defined).
    *   **`onViewBookings(customerId)`:** Navigates to a customer's specific booking history (not yet defined).
*   **Styling:** Uses Tailwind CSS for layout, forms, and table styling.

### 5.2. `CustomerService` (Core Service)

*   **Purpose:** Provides methods for fetching customer data.
*   **Selector:** N/A (service)
*   **Location:** `src/app/core/services/customer.service.ts`
*   **Methods:**
    *   `getCustomers(filter?: CustomerFilterDto): Observable<Customer[]>`: Fetches a list of customers, supporting filtering.
    *   `getCustomer(id: string): Observable<Customer>`: Fetches a single customer's details.

### 5.3. Reused Components

*   **`MainLayoutComponent`**: Provides the overall page structure.
*   **`AppHeaderComponent`**: Displays header with breadcrumbs (e.g., Customers / List).
*   **`AppSidebarComponent`**: Handles main navigation.
*   **`AppFooterComponent`**: Displays footer content.
*   **`AgGridTableComponent`**: (Conceptual usage) Used for displaying the customer list with pagination.
*   **`CardComponent`**: Used to wrap filter section and the table.
*   **Form Elements**: `form-input`, `form-select`, `btn`, `btn-primary`, `btn-secondary`.

## 6. Strict Adherence

All HTML structure, CSS classes, and design tokens used in the implementation of these components must strictly follow the specifications provided in `docs/ui-components/auth-components-spec.json` (for basic form elements), `docs/design-system/design-tokens.json`, and `docs/layout-patterns/page-layouts.json`. No deviations are allowed.