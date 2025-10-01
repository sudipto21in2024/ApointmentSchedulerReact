# UI Flow: Service Management - List Services

## 1. Overview

This document outlines the user interface flow for viewing and managing a list of services provided by the service provider.

## 2. User Journey Context

This flow is essential for service providers to manage their offerings effectively. It's a direct follow-up to service creation and precedes any editing or deletion actions.

## 3. High-Level Layout

**Template Type:** Layout 2 (Main Application / Logged In)
**Specific Layout Pattern:** `dashboard_sidebar_layout` from `docs/layout-patterns/page-layouts.json`

The layout will feature the standard logged-in application structure: header, sidebar, and main content area. The service list will be displayed within the main content area.

## 4. Wireframe (Textual Representation)

```
+---------------------------------------------------------------------------------+
| [Header: Logo | Company Name | Breadcrumbs | User Profile | Notifications]     |
+---------------------------------------------------------------------------------+
| [Sidebar]                   | [Main Content Area]                             |
|  - [Navigation Menu]        |                                                 |
|    - Dashboard              |  [Page Header: Services]                        |
|    - Services (Active)      |  [Action Buttons: + Add New Service]            |
|    - Bookings               |                                                 |
|                             |  [Search and Filter Bar]                        |
|                             |  +--------------------------------------------+ |
|                             |  | [Search Input] [Category Filter] [Status Filter] |
|                             |  +--------------------------------------------+ |
|                             |                                                 |
|                             |  [Service List - Table/Grid]                    |
|                             |  +--------------------------------------------+ |
|                             |  | [Table Header: Service Name, Category, Price, Status, Actions] |
|                             |  | [Service Row 1: Haircut, Beauty, $50, Active, [Edit] [Delete]] |
|                             |  | [Service Row 2: Dental Check-up, Health, $100, Active, [Edit] [Delete]] |
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

### 5.1. `ServiceListComponent` (Feature Component)

*   **Purpose:** Displays a paginated, filterable, and searchable list of services with actions.
*   **Selector:** `app-service-list`
*   **Location:** `src/app/features/service-management/service-list/service-list.component.ts`
*   **TypeScript Logic:**
    *   **Imports:** `ServiceService`, `Router`, `Service`.
    *   **Properties:** `services: Service[]`, `isLoading: boolean`, `filter: ServiceFilterDto`.
    *   **Constructor:** Injects `ServiceService`, `Router`.
    *   **`ngOnInit()`:** Calls `serviceService.getServices()` to fetch initial data.
    *   **`applyFilters()`:** Fetches data based on search and filter inputs.
    *   **`onAddService()`:** Navigates to `service-management/create-edit.html`.
    *   **`onEditService(serviceId)`:** Navigates to `service-management/create-edit.html?id=serviceId`.
    *   **`onDeleteService(serviceId)`:** Calls `serviceService.deleteService(serviceId)` and refreshes the list. Includes confirmation dialog.
*   **Styling:** Uses Tailwind CSS for layout, forms, and table styling.

### 5.2. `ServiceService` (Core Service)

*   **Purpose:** Provides methods for fetching and managing service data.
*   **Selector:** N/A (service)
*   **Location:** `src/app/core/services/service.service.ts`
*   **Methods:**
    *   `getServices(filter?: ServiceFilterDto): Observable<Service[]>`: Fetches a list of services, supporting filtering.
    *   `deleteService(id: string): Observable<void>`: Deletes a service.

### 5.3. Reused Components

*   **`MainLayoutComponent`**: Provides the overall page structure.
*   **`AppHeaderComponent`**: Displays header with breadcrumbs (e.g., Services / List).
*   **`AppSidebarComponent`**: Handles main navigation.
*   **`AppFooterComponent`**: Displays footer content.
*   **`AgGridTableComponent`**: (Conceptual usage) Used for displaying the service list with pagination and actions.
*   **`CardComponent`**: Used to wrap filter section and the table.
*   **Form Elements**: `form-input`, `form-select`, `btn`, `btn-primary`, `btn-secondary`.

## 6. Strict Adherence

All HTML structure, CSS classes, and design tokens used in the implementation of these components must strictly follow the specifications provided in `docs/ui-components/auth-components-spec.json` (for basic form elements), `docs/design-system/design-tokens.json`, and `docs/layout-patterns/page-layouts.json`. No deviations are allowed.