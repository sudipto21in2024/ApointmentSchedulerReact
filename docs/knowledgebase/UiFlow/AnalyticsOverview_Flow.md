# UI Flow: Analytics Overview

## 1. Overview

This document outlines the user interface flow for the Analytics Overview page, providing service providers with insights into their business performance.

## 2. User Journey Context

This flow is crucial for service providers to analyze booking patterns, popular services, and peak times. It directly addresses Functional Requirement FR-4.2: Analyze booking patterns, popular services, peak times.

## 3. High-Level Layout

**Template Type:** Layout 2 (Main Application / Logged In)
**Specific Layout Pattern:** `dashboard_sidebar_layout` from `docs/layout-patterns/page-layouts.json`

The layout will feature the standard logged-in application structure: header, sidebar, and main content area. The analytics dashboard will be displayed within the main content area.

## 4. Wireframe (Textual Representation)

```
+---------------------------------------------------------------------------------+
| [Header: Logo | Company Name | Breadcrumbs | User Profile | Notifications]     |
+---------------------------------------------------------------------------------+
| [Sidebar]                   | [Main Content Area]                             |
|  - [Navigation Menu]        |                                                 |
|    - Dashboard              |  [Page Header: Analytics]                       |
|    - Services               |                                                 |
|    - Bookings               |  [Filter Bar: Date Range, Service Type]         |
|    - Customers              |  +--------------------------------------------+ |
|    - Analytics (Active)     |  | [Date Range Picker] [Service Type Dropdown] |
|    - Settings               |  +--------------------------------------------+ |
|                             |                                                 |
|                             |  [Card: Revenue Trends Over Time]               |
|                             |  +--------------------------------------------+ |
|                             |  | [Line Chart: Monthly Revenue]              | |
|                             |  +--------------------------------------------+ |
|                             |                                                 |
|                             |  [Card: Popular Services]                       |
|                             |  +--------------------------------------------+ |
|                             |  | [Bar Chart: Top 5 Services by Bookings]    | |
|                             |  +--------------------------------------------+ |
|                             |                                                 |
|                             |  [Card: Peak Booking Times]                     |
|                             |  +--------------------------------------------+ |
|                             |  | [Heatmap/Bar Chart: Hourly/Daily Bookings] | |
|                             |  +--------------------------------------------+ |
|                             |                                                 |
+---------------------------------------------------------------------------------+
| [Footer: Copyright | Links]                                                     |
+---------------------------------------------------------------------------------+
```

## 5. Angular Component Definitions

### 5.1. `AnalyticsComponent` (Feature Component)

*   **Purpose:** Displays various analytics charts and data, with filtering capabilities.
*   **Selector:** `app-analytics`
*   **Location:** `src/app/features/analytics/analytics.component.ts`
*   **TypeScript Logic:**
    *   **Imports:** `AnalyticsService`, `AnalyticsFilterDto`.
    *   **Properties:** `revenueData: any`, `popularServicesData: any`, `peakTimesData: any`, `isLoading: boolean`, `filter: AnalyticsFilterDto`.
    *   **Constructor:** Injects `AnalyticsService`.
    *   **`ngOnInit()`:** Calls `analyticsService.getRevenueTrends()`, `analyticsService.getPopularServices()`, `analyticsService.getPeakTimes()` to fetch initial data.
    *   **`applyFilters()`:** Re-fetches data based on changes in `filter`.
*   **Styling:** Uses Tailwind CSS for layout.

### 5.2. `AnalyticsService` (Core Service)

*   **Purpose:** Provides methods for fetching analytics data.
*   **Selector:** N/A (service)
*   **Location:** `src/app/core/services/analytics.service.ts`
*   **Methods:**
    *   `getRevenueTrends(filter: AnalyticsFilterDto): Observable<any>`: Fetches revenue data for charts.
    *   `getPopularServices(filter: AnalyticsFilterDto): Observable<any>`: Fetches popular services data.
    *   `getPeakTimes(filter: AnalyticsFilterDto): Observable<any>`: Fetches data on peak booking times.

### 5.3. Reused Components

*   **`MainLayoutComponent`**: Provides the overall page structure.
*   **`AppHeaderComponent`**: Displays header with breadcrumbs (e.g., Analytics / Overview).
*   **`AppSidebarComponent`**: Handles main navigation.
*   **`AppFooterComponent`**: Displays footer content.
*   **`CardComponent`**: Used to wrap individual chart sections and filters.
*   **`ChartComponent`**: Generic component for rendering various chart types.
*   **Form Elements**: `form-select`, `btn`, `btn-primary`, `btn-secondary`.

## 6. Strict Adherence

All HTML structure, CSS classes, and design tokens used in the implementation of these components must strictly follow the specifications provided in `docs/ui-components/auth-components-spec.json` (for basic form elements), `docs/design-system/design-tokens.json`, and `docs/layout-patterns/page-layouts.json`. No deviations are allowed.