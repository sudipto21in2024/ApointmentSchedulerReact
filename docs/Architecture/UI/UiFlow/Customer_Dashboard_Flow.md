# UI Flow: Customer - Dashboard / My Appointments Page

## 1. Overview

This document outlines the UI flow for the Customer Dashboard, which serves as the central hub for individual consumers to manage and view their appointments within the Multi-Tenant Appointment Booking System. This page directly supports FR-7.1 and FR-7.2.

## 2. Purpose

To provide customers with a comprehensive overview of their past and upcoming appointments, enable them to easily manage (cancel, reschedule) their bookings, and offer quick access to other relevant account features.

## 3. Actors

*   **Individual Consumer:** A logged-in user who has previously booked services.

## 4. Preconditions

*   The user is logged into their account.
*   The user has navigated to the dashboard (e.g., after login, from a confirmation page, or via direct navigation).

## 5. Postconditions

*   User has viewed their appointment history.
*   User has successfully managed (cancelled or rescheduled) an appointment.
*   User has navigated to other account management sections.

## 6. Flow Steps

The Customer Dashboard will primarily display lists of appointments, with options for filtering and quick actions.

### 6.1. Page Structure

**Template Type:** Layout 2 (Main Application / Logged In).
**Specific Layout Pattern:** Header, footer, and a main content area with a collapsible sidebar.

**UI Elements:**
*   **Header:** Standard logged-in header with logo, company name, user profile info, notifications drawer, and breadcrumb.
*   **Sidebar:** Customer-specific navigation menu (e.g., Dashboard, My Appointments, Profile, Payment Methods, Settings).
*   **Main Content Area:**
    *   **Dashboard Overview Section:**
        *   **Welcome Message:** "Welcome, [Customer Name]!"
        *   **Upcoming Appointments Summary:** A card or prominent section displaying the next 1-3 upcoming appointments. Each item shows: Service Name, Provider, Date, Time, and quick actions (e.g., "View Details", "Reschedule", "Cancel").
        *   **Quick Links/Call to Actions:** Buttons for common tasks like "Book New Service", "View All Appointments".
    *   **Appointments List/Calendar Section:**
        *   **Tabs:** "Upcoming Appointments" and "Past Appointments".
        *   **View Toggle:** Option to switch between "List View" and "Calendar View".
        *   **Filtering/Sorting Options:** By date range, service type, provider.
        *   **Appointment Cards/Rows (List View):** For each appointment:
            *   Service Name, Provider, Date, Time, Status (Confirmed, Completed, Cancelled).
            *   Actions: "View Details", "Reschedule" (for upcoming), "Cancel" (for upcoming, within policy), "Write Review" (for completed).
        *   **Calendar Display (Calendar View):** Visual representation of appointments on a calendar (similar to `BookingManagement_CalendarView_Flow.md`, but customer-centric).
    *   **Payment Methods Summary (Optional):** A small section showing saved payment methods (e.g., last 4 digits of card) with a link to Payment Methods management.
*   **Footer:** Standard logged-in footer.

## 7. Angular Component Definitions

*   **`CustomerDashboardComponent` (Smart Component):**
    *   **Purpose:** Serves as the main customer dashboard, orchestrating data fetching and display.
    *   **Selector:** `app-customer-dashboard`
    *   **Location:** `src/app/features/customer/dashboard/customer-dashboard.component.ts`
    *   **TypeScript Logic:**
        *   Fetches upcoming and past appointments from an `AppointmentService`.
        *   Manages the active tab (Upcoming/Past) and view mode (List/Calendar).
        *   Handles sorting and filtering logic.
        *   Navigates to detail pages or triggers modals for reschedule/cancel actions.
        *   Injects `AppointmentService`, `UserService` (for profile info).
    *   **Template:** Integrates `AppointmentListComponent`, `AppointmentCalendarComponent`, `DashboardSummaryCardComponent`.

*   **`DashboardSummaryCardComponent` (Dumb Component):**
    *   **Purpose:** Displays a summary of the next few upcoming appointments or quick links.
    *   **Selector:** `app-dashboard-summary-card`
    *   **Inputs:** `upcomingAppointments: AppointmentDto[]`.
    *   **Template:** Renders the summarized upcoming appointments and quick action buttons.

*   **`AppointmentListComponent` (Dumb Component):**
    *   **Purpose:** Displays appointments in a list format.
    *   **Selector:** `app-appointment-list`
    *   **Inputs:** `appointments: AppointmentDto[]`.
    *   **Outputs:** `viewDetails: EventEmitter<string>`, `reschedule: EventEmitter<string>`, `cancel: EventEmitter<string>`, `writeReview: EventEmitter<string>`.
    *   **Template:** Renders a table or cards for appointments, with status indicators and action buttons.

*   **`AppointmentCalendarComponent` (Dumb Component):**
    *   **Purpose:** Displays appointments in a calendar format. (Similar to `BookingManagement_CalendarView_Flow.md`).
    *   **Selector:** `app-appointment-calendar`
    *   **Inputs:** `appointments: AppointmentDto[]`.
    *   **Outputs:** `viewDetails: EventEmitter<string>`.
    *   **Template:** Integrates a calendar library (e.g., FullCalendar) to display events.

## 8. Styling and Responsiveness

*   **Layout:** Responsive layout with main content area adapting to screen size. Sidebar will be collapsible/hamburger menu on smaller screens.
*   **Cards/Lists:** Visually clear presentation of appointment details.
*   **Action Buttons:** Prominent and easy to interact with.
*   **Theming:** Adheres to `DesignTokens.json` and `StyleGuide.md`.

## 9. Accessibility Considerations

*   Semantic HTML for headings, lists, and navigation.
*   Keyboard navigation for all interactive elements.
*   ARIA attributes for tabs, calendar events, and dynamic updates.
*   Sufficient color contrast for text and status indicators.

## 10. Integration

*   **Backend API:** `AppointmentService` will communicate with backend API endpoints for fetching `GET /api/customer/appointments` (with filters for upcoming/past).
*   **Routing:**
    *   `View Details` navigates to `/customer/appointments/:id/details`.
    *   `Book New Service` navigates to `/services` (Customer Service Search & Discovery Page).
    *   `View All Appointments` navigates to the same page, but potentially activates a specific tab/view.
    *   Reschedule/Cancel actions might trigger modals or navigate to dedicated forms.