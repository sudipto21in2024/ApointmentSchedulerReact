# UI Flow: System Admin - Dashboard

## 1. Overview

This document outlines the UI flow for the System Admin Dashboard within the Multi-Tenant Appointment Booking System. This dashboard serves as the central monitoring and control panel for platform administrators, providing a high-level overview of the entire system's health, key global metrics, and alerts. It directly supports FR-9.4 and provides insights for overall business KPIs (BKPI-1.1, BKPI-1.2, BKPI-1.4).

## 2. Purpose

To provide system administrators with a comprehensive, real-time view of the platform's operational status, performance, user adoption, and revenue generation across all tenants. This enables proactive identification of issues, monitoring of business growth, and quick access to global management functionalities.

## 3. Actors

*   **System Administrator:** The primary user responsible for maintaining and supporting the entire platform. This role has global access.

## 4. Preconditions

*   The user is logged into the platform with a "SuperAdmin" role (as per FR-10.2, via `admin.yourdomain.com`).
*   The user has navigated to the dashboard (typically the default landing page after SuperAdmin login).

## 5. Postconditions

*   User has a clear overview of the entire platform's health and key global metrics.
*   User can quickly navigate to relevant global management sections (e.g., Tenant Management, Pricing Plan Management, Global Settings).

## 6. Flow Steps

The System Admin Dashboard will feature various global KPI cards, charts, and system-wide alerts.

### 6.1. Page Structure

**Template Type:** Layout 2 (Main Application / Logged In).
**Specific Layout Pattern:** Header, footer, and a main content area with a collapsible sidebar. The main content area will be organized into a grid of global metrics and charts.

**UI Elements:**
*   **Header:** Standard logged-in header with logo, system name, user profile info, notifications drawer, and breadcrumb. The breadcrumb should indicate "System Admin Dashboard". Note: This header will be distinct from tenant-specific headers (no tenant name displayed).
*   **Sidebar:** System Admin-specific navigation menu (e.g., Dashboard, Tenant Management, Pricing Plans, User Management (Global), Service Moderation (Global), Billing & Invoicing, System Settings). The "Dashboard" item will be active.
*   **Main Content Area:**
    *   **Page Title:** "System Overview" or "Global Dashboard"
    *   **Date Range Selector (Global):** Allows filtering dashboard data by time period.
    *   **Global Key Performance Indicator (KPI) Cards:**
        *   **Total Tenants:** Number of active tenants on the platform.
        *   **Total Users:** Number of registered users across all tenants.
        *   **Total Bookings (Platform-wide):** Aggregate number of appointments booked.
        *   **Total Revenue (Platform-wide):** Aggregate gross revenue across all tenants.
        *   **Active Subscriptions:** Number of active paid subscriptions.
        *   **Platform Uptime:** Percentage of uptime (FR-9.4).
    *   **Charts/Graphs (Dynamic Widgets - Global Data):**
        *   **Tenant Growth:** Line chart showing new tenant registrations over time.
        *   **Booking Volume Trends:** Line chart showing total bookings per month/quarter.
        *   **Revenue Growth:** Line chart showing platform revenue over time.
        *   **Subscription Distribution:** Pie chart showing active subscriptions by plan type.
        *   **System Health Metrics:** Graphs for API response times, page load times, server load (FR-9.4, NR-1.2, NR-1.3).
    *   **System Alerts/Notifications Widget:**
        *   Table listing critical system alerts (e.g., "API Error Rate High", "Server Overload", "Payment Gateway Offline").
        *   Links to detailed logs or monitoring systems.
    *   **Recent Global Activity Feed/Table:**
        *   Table listing recent tenant sign-ups, global service approvals, or major system events.
    *   **Quick Action Buttons (Global):**
        *   "Create New Pricing Plan"
        *   "Onboard New Tenant"
        *   "View All Tenants"
        *   "Access Monitoring Logs"
*   **Footer:** Standard logged-in footer.

## 7. Angular Component Definitions

*   **`SystemAdminDashboardComponent` (Smart Component):**
    *   **Purpose:** Serves as the main system-wide dashboard, fetching and orchestrating global data for various widgets.
    *   **Selector:** `app-system-admin-dashboard`
    *   **Location:** `src/app/features/system-admin/dashboard/system-admin-dashboard.component.ts`
    *   **TypeScript Logic:**
        *   Fetches global dashboard data (KPIs, chart data, system alerts, recent activity) from a `SystemDashboardService` or specific global services.
        *   Manages the global date range filter.
        *   Passes data to child presentation components (KPI cards, chart components).
        *   Handles navigation to relevant global management pages.
        *   Injects `SystemDashboardService`, `SystemAnalyticsService`, `TenantService`, `PricingPlanService`.
    *   **Template:** Organizes `GlobalKpiCardComponent` instances, `SystemChartComponent` instances, `SystemAlertsWidgetComponent`, and `RecentGlobalActivityTableComponent`.

*   **`GlobalKpiCardComponent` (Dumb Component):**
    *   **Purpose:** Displays a single global key performance indicator.
    *   **Selector:** `app-global-kpi-card`
    *   **Inputs:** `title: string`, `value: number | string`, `icon: string`, `trend: number` (optional, for percentage change).
    *   **Template:** Renders the KPI title, value, and icon.

*   **`SystemChartComponent` (Dumb Component):**
    *   **Purpose:** Reusable component for displaying various types of charts with global data.
    *   **Selector:** `app-system-chart`
    *   **Inputs:** `type: 'bar' | 'line' | 'pie'`, `data: any`, `options: any`.
    *   **Template:** Integrates a charting library (e.g., Chart.js, Ngx-Charts) to render the graph.

*   **`SystemAlertsWidgetComponent` (Dumb Component):**
    *   **Purpose:** Displays a list of critical system alerts.
    *   **Selector:** `app-system-alerts-widget`
    *   **Inputs:** `alerts: SystemAlertDto[]`.
    *   **Template:** Renders a list or table of alerts with severity and timestamp.

*   **`RecentGlobalActivityTableComponent` (Dumb Component):**
    *   **Purpose:** Displays a list of recent global activities.
    *   **Selector:** `app-recent-global-activity-table`
    *   **Inputs:** `activityData: GlobalActivityDto[]`.
    *   **Template:** Renders a table with columns for activity type, details, and date.

## 8. Styling and Responsiveness

*   **Layout:** Responsive grid layout for dashboard widgets. Widgets will rearrange and stack on smaller screens.
*   **KPI Cards:** Visually distinct, possibly with color-coded indicators for status.
*   **Charts:** Clear and readable, adapting to available space.
*   **Tables:** Readable and responsive.
*   **Theming:** Adheres to `DesignTokens.json` and `StyleGuide.md`.

## 9. Accessibility Considerations

*   Semantic HTML for all dashboard widgets and sections.
*   Keyboard navigation for date pickers and interactive elements within widgets.
*   ARIA attributes for dynamic content updates and chart descriptions.
*   Sufficient color contrast for text and chart elements.
*   Alternative text for all chart images/visualizations.

## 10. Integration

*   **Backend API:** `SystemDashboardService` and various global services will communicate with backend API endpoints to retrieve aggregated system-wide data.
*   **Authentication:** Requires "SuperAdmin" authentication.
*   **Routing:** Quick action buttons and links will navigate to respective global management pages (e.g., `/system-admin/tenants`, `/system-admin/pricing-plans`).