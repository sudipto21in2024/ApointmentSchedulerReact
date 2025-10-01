# UI Flow: Booking Management - List Bookings

## 1. Overview

This document outlines the user interface flow for viewing and managing a list of bookings for the service provider.

## 2. User Journey Context

This flow is crucial for service providers to keep track of their appointments, accept/reject new requests, and manage their schedule. It directly addresses Functional Requirement FR-3.2: View dashboard with all bookings with filtering and search.

## 3. High-Level Layout

**Template Type:** Layout 2 (Main Application / Logged In)
**Specific Layout Pattern:** `dashboard_sidebar_layout` from `docs/layout-patterns/page-layouts.json`

The layout will feature the standard logged-in application structure: header, sidebar, and main content area. The booking list will be displayed within the main content area.

## 4. Wireframe (Textual Representation)

```
+---------------------------------------------------------------------------------+
| [Header: Logo | Company Name | Breadcrumbs | User Profile | Notifications]     |
+---------------------------------------------------------------------------------+
| [Sidebar]                   | [Main Content Area]                             |
|  - [Navigation Menu]        |                                                 |
|    - Dashboard              |  [Page Header: Bookings]                        |
|    - Services               |                                                 |
|    - Bookings (Active)      |  [Search and Filter Bar]                        |
|                             |  +--------------------------------------------+ |
|                             |  | [Search Input] [Date Range Picker] [Status Filter] |
|                             |  +--------------------------------------------+ |
|                             |                                                 |
|                             |  [Booking List - Table/Grid]                    |
|                             |  +--------------------------------------------+ |
|                             |  | [Table Header: Service, Customer, Date, Time, Status, Actions] |
|                             |  | [Booking Row 1: Haircut, Jane Doe, 2023-10-26, 10:00 AM, Confirmed, [View] [Cancel]] |
|                             |  | [Booking Row 2: Massage, Mike Smith, 2023-10-26, 02:00 PM, Pending, [Accept] [Reject] [View]] |
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

### 5.1. `BookingListComponent` (Feature Component)

*   **Purpose:** Displays a paginated, filterable, and searchable list of bookings with relevant actions (accept, reject, view, cancel).
*   **Selector:** `app-booking-list`
*   **Location:** `src/app/features/booking-management/booking-list/booking-list.component.ts`
*   **TypeScript Logic:**
    *   **Imports:** `BookingService`, `Router`, `Booking`.
    *   **Properties:** `bookings: Booking[]`, `isLoading: boolean`, `filter: BookingFilterDto`.
    *   **Constructor:** Injects `BookingService`, `Router`.
    *   **`ngOnInit()`:** Calls `bookingService.getBookings()` to fetch initial data.
    *   **`applyFilters()`:** Fetches data based on search and filter inputs.
    *   **`onAcceptBooking(bookingId)`:** Calls `bookingService.acceptBooking(bookingId)`.
    *   **`onRejectBooking(bookingId)`:** Calls `bookingService.rejectBooking(bookingId)`.
    *   **`onCancelBooking(bookingId)`:** Calls `bookingService.cancelBooking(bookingId)`.
    *   **`onViewBooking(bookingId)`:** Navigates to a booking detail page (not yet defined).
*   **Styling:** Uses Tailwind CSS for layout, forms, and table styling.

### 5.2. `BookingService` (Core Service)

*   **Purpose:** Provides methods for fetching and managing booking data.
*   **Selector:** N/A (service)
*   **Location:** `src/app/core/services/booking.service.ts`
*   **Methods:**
    *   `getBookings(filter?: BookingFilterDto): Observable<Booking[]>`: Fetches a list of bookings, supporting filtering.
    *   `acceptBooking(id: string): Observable<void>`: Accepts a pending booking.
    *   `rejectBooking(id: string): Observable<void>`: Rejects a pending booking.
    *   `cancelBooking(id: string): Observable<void>`: Cancels a booking.
    *   `getBooking(id: string): Observable<Booking>`: Fetches a single booking's details.

### 5.3. Reused Components

*   **`MainLayoutComponent`**: Provides the overall page structure.
*   **`AppHeaderComponent`**: Displays header with breadcrumbs (e.g., Bookings / List).
*   **`AppSidebarComponent`**: Handles main navigation.
*   **`AppFooterComponent`**: Displays footer content.
*   **`AgGridTableComponent`**: (Conceptual usage) Used for displaying the booking list with pagination and actions.
*   **`CardComponent`**: Used to wrap filter section and the table.
*   **Form Elements**: `form-input`, `form-select`, `btn`, `btn-primary`, `btn-secondary`.

## 6. Strict Adherence

All HTML structure, CSS classes, and design tokens used in the implementation of these components must strictly follow the specifications provided in `docs/ui-components/auth-components-spec.json` (for basic form elements), `docs/design-system/design-tokens.json`, and `docs/layout-patterns/page-layouts.json`. No deviations are allowed.