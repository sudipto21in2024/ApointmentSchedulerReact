# UI Flow: Booking Management - Calendar View

## 1. Overview

This document outlines the user interface flow for a calendar-based view of bookings, providing service providers with a visual representation of their schedule and the ability to manage appointments directly from the calendar.

## 2. User Journey Context

This flow complements the list view of bookings, offering an alternative visual way for service providers to manage their schedule. It addresses the need for a live calendar view mentioned in FR-6.1 (for customers, but also applicable for providers).

## 3. High-Level Layout

**Template Type:** Layout 2 (Main Application / Logged In)
**Specific Layout Pattern:** `dashboard_sidebar_layout` from `docs/layout-patterns/page-layouts.json`

The layout will feature the standard logged-in application structure: header, sidebar, and main content area. The interactive calendar will be displayed within the main content area, alongside filtering options.

## 4. Wireframe (Textual Representation)

```
+---------------------------------------------------------------------------------+
| [Header: Logo | Company Name | Breadcrumbs | User Profile | Notifications]     |
+---------------------------------------------------------------------------------+
| [Sidebar]                   | [Main Content Area]                             |
|  - [Navigation Menu]        |                                                 |
|    - Dashboard              |  [Page Header: Bookings]                        |
|    - Services               |  [Filter Bar: Date Range, Service Type, Status] |
|    - Bookings (Active)      |  +--------------------------------------------+ |
|      - List                 |  | [Search Input] [Date Range Picker] [Status Filter] |
|      - Calendar (Active)    |  +--------------------------------------------+ |
|                             |                                                 |
|                             |  [Calendar View]                                |
|                             |  +--------------------------------------------+ |
|                             |  | [Calendar Controls: Prev/Next Month/Week, Today, View Type (Day/Week/Month)] |
|                             |  | [Calendar Grid with Bookings/Events]       | |
|                             |  |   - Booking 1: Service (Time)              | |
|                             |  |   - Booking 2: Service (Time)              | |
|                             |  +--------------------------------------------+ |
|                             |                                                 |
+---------------------------------------------------------------------------------+
| [Footer: Copyright | Links]                                                     |
+---------------------------------------------------------------------------------+
```

## 5. Angular Component Definitions

### 5.1. `BookingCalendarComponent` (Feature Component)

*   **Purpose:** Displays an interactive calendar populated with booking events.
*   **Selector:** `app-booking-calendar`
*   **Location:** `src/app/features/booking-management/booking-calendar/booking-calendar.component.ts`
*   **TypeScript Logic:**
    *   **Imports:** `BookingService`, `FullCalendarModule` (or similar library), `Booking`.
    *   **Properties:** `calendarOptions: any`, `bookings: Booking[]`, `isLoading: boolean`, `filter: BookingFilterDto`.
    *   **Constructor:** Injects `BookingService`.
    *   **`ngOnInit()`:** Initializes the calendar configuration (e.g., views, plugins, event sources). Calls `bookingService.getBookings()` to fetch booking data and maps it to `FullCalendar` events.
    *   **`applyFilters()`:** Fetches new booking data based on filter changes and updates the calendar events.
    *   **`handleEventClick(info)`:** Handles clicks on a calendar event, potentially opening a modal for booking details or navigating to a detail page.
    *   **`handleDateClick(info)`:** Handles clicks on a date or time slot, potentially opening a form to create a new booking for that slot.
    *   **`updateCalendarView(viewType)`:** Changes the calendar view (day, week, month).
    *   **`goToDate(date)`:** Navigates the calendar to a specific date.
*   **Styling:** Uses Tailwind CSS for general layout, and integrates with the calendar library's styling. Custom styles for calendar events (e.g., color-coding by status).

### 5.4. Multi-Slot Booking Visualization and Management

*   **Visualization:**
    *   For services configured with multiple parallel slots, calendar events will visually indicate the current booked capacity versus total capacity (e.g., "Yoga Class (5/20 booked)").
    *   Events for multi-slot services might have a distinct visual style (e.g., a patterned background, a specific icon) to differentiate them from single-slot bookings.
*   **Management:**
    *   **Clicking an event:** When a service provider clicks on a multi-slot event, a modal or a side-panel will appear, displaying a list of all customers booked for that specific time slot.
    *   **Individual Booking Actions:** From this list, the service provider can perform actions on individual bookings (e.g., "Mark as Attended", "Cancel Individual Booking", "View Customer Profile").
    *   **Slot-level Actions:** Options to manage the entire slot might be available (e.g., "Close Remaining Slots", "Send Reminder to All Booked").
    *   **Availability Display:** The calendar will dynamically update to reflect remaining availability as slots are booked or cancelled.

### 5.2. `BookingService` (Core Service)

*   **Purpose:** Provides methods for fetching booking data, used by both list and calendar views.
*   **Selector:** N/A (service)
*   **Location:** `src/app/core/services/booking.service.ts`
*   **Methods:**
    *   `getBookings(filter?: BookingFilterDto): Observable<Booking[]>`: Fetches a list of bookings, supporting filtering by date range, service, status, etc.

### 5.3. Reused Components

*   **`MainLayoutComponent`**: Provides the overall page structure.
*   **`AppHeaderComponent`**: Displays header with breadcrumbs (e.g., Bookings / Calendar).
*   **`AppSidebarComponent`**: Handles main navigation, with "Calendar View" as a sub-item under "Bookings".
*   **`AppFooterComponent`**: Displays footer content.
*   **`CardComponent`**: Used to wrap the filter section and the calendar itself.
*   **Form Elements**: `form-input`, `form-select`, `btn`, `btn-primary`, `btn-secondary`.

## 6. Strict Adherence

All HTML structure, CSS classes, and design tokens used in the implementation of these components must strictly follow the specifications provided in `docs/ui-components/auth-components-spec.json` (for basic form elements), `docs/design-system/design-tokens.json`, and `docs/layout-patterns/page-layouts.json`. No deviations are allowed.