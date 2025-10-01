# UI Flow: Service Provider Dashboard

## 1. Overview

This document outlines the user interface flow for the Service Provider Dashboard. This is the primary landing page for authenticated service providers, offering a comprehensive overview of their business performance, recent bookings, and quick access to key management features.

## 2. User Journey Context

This flow is central to the following user journeys:
- **Journey 1: Individual Practitioner - Setting Up and Managing Services** (Stage 2: Service Management - Step 3: Review Bookings, Step 5: View Analytics), and (Stage 3: Booking Management - Step 4: Generate Reports).
- It directly addresses Functional Requirements related to Dashboard & Analytics (FR-4.1, FR-4.2, FR-4.3, FR-4.4) and provides the entry point for other service provider features.

## 3. High-Level Layout

**Template Type:** Layout 2 (Main Application / Logged In)
**Specific Layout Pattern:** `dashboard_sidebar_layout` from `docs/layout-patterns/page-layouts.json`

The layout will consist of:
- **Header:** Fixed at the top, including logo, company name, breadcrumbs, user profile information, and a notifications drawer.
- **Sidebar:** Fixed on the left, containing a hierarchical navigation menu (collapsible and mobile-responsive), quick stats, and a tenant selector.
- **Main Content Area:** The primary dynamic area for the dashboard content, featuring cards, charts, and data grids.
- **Footer:** Minimal, at the bottom of the page, containing copyright information and general links.

## 4. Wireframe (Textual Representation)

```
+---------------------------------------------------------------------------------+
| [Header: Logo | Company Name | Breadcrumbs | User Profile | Notifications]     |
+---------------------------------------------------------------------------------+
| [Sidebar]                   | [Main Content Area]                             |
|  - [Navigation Menu]        |                                                 |
|    - Dashboard              |  [Dashboard Overview - Cards/Widgets]           |
|    - Services               |  +-----------------------+ +------------------+ |
|    - Bookings               |  | Total Earnings        | | Upcoming Bookings| |
|    - Customers              |  | [Value]               | | [Count]          | |
|    - Analytics              |  +-----------------------+ +------------------+ |
|  - [Quick Stats - optional] |                                                 |
|  - [Tenant Selector]        |  [Charts/Graphs - e.g., Booking Trends]         |
|                             |  +--------------------------------------------+ |
|                             |  | [Chart Area]                               | |
|                             |  +--------------------------------------------+ |
|                             |                                                 |
|                             |  [Recent Bookings - Table/List]                 |
|                             |  +--------------------------------------------+ |
|                             |  | [Table Header]                             | |
|                             |  | [Booking Row 1]                            | |
|                             |  | [Booking Row 2]                            | |
|                             |  | ...                                        | |
|                             |  +--------------------------------------------+ |
|                             |                                                 |
+---------------------------------------------------------------------------------+
| [Footer: Copyright | Links]                                                     |
+---------------------------------------------------------------------------------+
```

## 5. Angular Component Definitions

### 5.1. `MainLayoutComponent` (Container/Wrapper)

*   **Purpose:** Implements the `dashboard_sidebar_layout` pattern, serving as the top-level layout for the authenticated application.
*   **Selector:** `app-main-layout`
*   **Location:** `src/app/core/layout/main-layout/main-layout.component.ts`
*   **Template:**
    ```html
    <div class="flex min-h-screen">
      <app-sidebar></app-sidebar>
      <div class="ml-64 flex-1 bg-neutral-50 p-8"> <!-- Classes from page-layouts.json -->
        <app-header></app-header>
        <router-outlet></router-outlet>
        <app-footer></app-footer>
      </div>
    </div>
    ```
*   **TypeScript Logic:** Manages overall layout state, e.g., sidebar open/close.
*   **Styling:** Uses Tailwind CSS classes from `dashboard_sidebar_layout` in `docs/layout-patterns/page-layouts.json`.

### 5.2. `AppHeaderComponent` (Shared UI Component)

*   **Purpose:** Displays common header elements across authenticated pages.
*   **Selector:** `app-header`
*   **Location:** `src/app/shared/components/layout/app-header/app-header.component.ts`
*   **Inputs:** `userName: string`, `notificationsCount: number`, `breadcrumbs: BreadcrumbItem[]`.
*   **Outputs:** `profileClicked: EventEmitter<void>`, `notificationsClicked: EventEmitter<void>`, `logoutClicked: EventEmitter<void>`.
*   **TypeScript Logic:** Handles user interaction, passes events to parent components/services. Dynamically renders breadcrumbs.
*   **Styling:** Uses Tailwind CSS classes, potentially `navigation` tokens from `docs/UI/DesignTokens.json`.

### 5.3. `AppSidebarComponent` (Shared UI Component)

*   **Purpose:** Provides the main application navigation, supporting hierarchical menus, collapsibility, and mobile responsiveness.
*   **Selector:** `app-sidebar`
*   **Location:** `src/app/shared/components/layout/app-sidebar/app-sidebar.component.ts`
*   **Inputs:** `menuItems: MenuItem[]`.
*   **Outputs:** `menuItemClicked: EventEmitter<string>`.
*   **TypeScript Logic:** Manages sidebar state (collapsed/expanded), handles mobile hamburger menu, navigates on menu item click.
*   **Styling:** Uses Tailwind CSS classes and responsive utilities (e.g., `hidden`, `md:block`).

### 5.4. `AppFooterComponent` (Shared UI Component)

*   **Purpose:** Displays consistent footer content across the application.
*   **Selector:** `app-footer`
*   **Location:** `src/app/shared/components/layout/app-footer/app-footer.component.ts`
*   **Template:** Simple HTML for copyright and general links.
*   **Styling:** Uses Tailwind CSS classes.

### 5.5. `DashboardComponent` (Feature Component)

*   **Purpose:** Displays the service provider's key business metrics and recent activities.
*   **Selector:** `app-dashboard`
*   **Location:** `src/app/features/dashboard/dashboard.component.ts`
*   **TypeScript Logic:**
    *   **Imports:** `DashboardService`, `Booking`, `DashboardOverviewDto`, `BookingAnalyticsDto`.
    *   **Properties:** `overviewData: DashboardOverviewDto | null`, `bookingTrends: BookingAnalyticsDto[]`, `recentBookings: Booking[]`, `isLoading: boolean`.
    *   **Constructor:** Injects `DashboardService`.
    *   **`ngOnInit()`:** Fetches data using `DashboardService` methods.
    *   **Data Binding:** Binds `overviewData` to `app-card` components, `bookingTrends` to `app-chart`, and `recentBookings` to `app-ag-grid-table`.
    *   Manages loading indicators and error display.
*   **Styling:** Uses Tailwind CSS classes, `cards` and `spacing` tokens from `docs/UI/DesignTokens.json`.

### 5.6. `DashboardService` (Core Service)

*   **Purpose:** Provides methods to fetch dashboard-specific data from the backend API.
*   **Selector:** N/A (service)
*   **Location:** `src/app/core/services/dashboard.service.ts`
*   **Methods:**
    *   `getOverview(): Observable<DashboardOverviewDto>`: Calls API endpoint for summary data (e.g., `/api/dashboard/overview`).
    *   `getBookingTrends(filter: DashboardFilterDto): Observable<BookingAnalyticsDto[]>`: Calls API for booking trend data (e.g., `/api/dashboard/booking-trends`).
    *   `getRecentBookings(): Observable<Booking[]>`: Calls API for recent bookings (e.g., `/api/dashboard/recent-bookings`).
*   **Dependencies:** `HttpClient`.

### 5.7. `CardComponent` (Shared UI Component)

*   **Purpose:** Reusable component for displaying content within a card-like visual container.
*   **Selector:** `app-card`
*   **Location:** `src/app/shared/components/ui/card/card.component.ts`
*   **Inputs:** `title: string`, `subtitle?: string`, `value?: string`. Content projected via `<ng-content>`.
*   **Styling:** Uses Tailwind CSS classes and `cards` tokens from `docs/UI/DesignTokens.json` (e.g., `rounded-lg`, `shadow-md`, `p-6`).

### 5.8. `ChartComponent` (Shared UI Component)

*   **Purpose:** Generic wrapper for integrating a charting library to display various types of data visualizations.
*   **Selector:** `app-chart`
*   **Location:** `src/app/shared/components/ui/chart/chart.component.ts`
*   **Inputs:** `chartData: any`, `chartOptions: any`, `chartType: string`.
*   **TypeScript Logic:** Initializes and updates the chart based on inputs.
*   **Styling:** Minimal, focuses on responsiveness.

### 5.9. `AgGridTableComponent` (Shared UI Component)

*   **Purpose:** Generic wrapper component for AG-Grid to display tabular data with advanced features like pagination, sorting, and filtering.
*   **Selector:** `app-ag-grid-table`
*   **Location:** `src/app/shared/components/ui/ag-grid-table/ag-grid-table.component.ts`
*   **Inputs:** `rowData: any[]`, `columnDefs: any[]`, `pagination: boolean`, `paginationPageSize: number`.
*   **Outputs:** `gridReady: EventEmitter<any>`, `rowClicked: EventEmitter<any>`, `paginationChanged: EventEmitter<any>`.
*   **TypeScript Logic:** Configures AG-Grid, handles data updates, and emits events for user interactions.
*   **Styling:** Uses AG-Grid themes, potentially overridden or extended with Tailwind CSS.

## 6. Strict Adherence

All HTML structure, CSS classes, and design tokens used in the implementation of these components must strictly follow the specifications provided in `docs/ui-components/auth-components-spec.json`, `docs/design-system/design-tokens.json`, and `docs/layout-patterns/page-layouts.json`. No deviations are allowed.