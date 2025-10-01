# UI Flow: Customer - Booking Confirmation Page/Modal

## 1. Overview

This document outlines the UI flow for the Booking Confirmation Page or Modal within the Multi-Tenant Appointment Booking System. This interface is displayed immediately after a user successfully completes the booking process, providing confirmation and next steps. It directly supports FR-6.2.

## 2. Purpose

To confirm to the user that their appointment has been successfully booked, provide a summary of the booking details, and guide them on what to do next (e.g., view appointments, add to calendar, receive email confirmation).

## 3. Actors

*   **Individual Consumer:** A user who has just completed booking a service.

## 4. Preconditions

*   The user has successfully completed all steps of the booking process (e.g., selected service, chosen time, provided details, made payment if required).
*   The backend API has confirmed the booking.

## 5. Postconditions

*   User has received visual confirmation of their booking.
*   User has access to essential booking details.
*   User is aware of how to manage their new booking.

## 6. Flow Steps

The Booking Confirmation can be presented as a full page or a modal, depending on the preceding booking flow. For this document, we will describe it as a full page, which can be adapted into a modal.

### 6.1. Page/Modal Structure

**Template Type:** Layout 1 (Public-Facing / Logged Out) if the booking was done without login, or Layout 2 (Main Application / Logged In) if the user was logged in.
**Specific Layout Pattern:** A simple centered content layout, focusing on the confirmation message.

**UI Elements:**
*   **Header:** (If full page) Standard public-facing header or logged-in header.
*   **Main Content Area (or Modal Body):**
    *   **Success Icon/Illustration:** A clear visual indicator of success (e.g., checkmark).
    *   **Confirmation Message:** Prominent text like "Booking Confirmed!" or "Your Appointment is Booked!"
    *   **Summary of Booking Details:**
        *   Service Name
        *   Provider Name
        *   Date and Time
        *   Location/Address
        *   Total Price (if applicable)
        *   Booking Reference/ID
    *   **Next Steps/Call to Action Buttons:**
        *   `View My Appointments` (Navigates to Customer Dashboard/Appointments List)
        *   `Add to Calendar` (Provides options to download .ics file or integrate with Google/Outlook Calendar)
        *   `Go to Homepage`
        *   `Close` (If modal)
    *   **Information about Email Confirmation:** "A confirmation email has been sent to [user's email address]."
*   **Footer:** (If full page) Standard public-facing footer.

## 7. Angular Component Definitions

*   **`BookingConfirmationComponent` (Smart Component):**
    *   **Purpose:** Displays booking confirmation details and provides post-booking actions.
    *   **Selector:** `app-booking-confirmation`
    *   **Location:** `src/app/features/customer/booking-confirmation/booking-confirmation.component.ts`
    *   **TypeScript Logic:**
        *   Receives booking details (e.g., via route state or a service).
        *   Formats and displays the booking information.
        *   Handles "Add to Calendar" logic (e.g., generating .ics file, opening calendar links).
        *   Navigates to other pages based on button clicks.
        *   Manages loading states (if any asynchronous operations like email sending are visualized).
    *   **Template:** Renders the success message, booking summary, and action buttons.

## 8. Styling and Responsiveness

*   **Layout:** Centered content with clear visual hierarchy.
*   **Success Visuals:** Prominent checkmark or illustration.
*   **Booking Summary:** Easy-to-read layout for key details.
*   **Buttons:** Clear and actionable.
*   **Responsiveness:** Adapts well to mobile and desktop screens, ensuring readability and usability.
*   **Theming:** Adheres to `DesignTokens.json` and `StyleGuide.md`.

## 9. Accessibility Considerations

*   Semantic HTML for headings and content.
*   ARIA attributes for confirmation messages (e.g., `role="status"` or `aria-live="assertive"`) to ensure screen readers announce success.
*   Keyboard navigation for all buttons.
*   Sufficient color contrast.
*   Clear focus indicators.

## 10. Integration

*   **Routing:** This component is typically the destination after a successful booking completion.
    *   `View My Appointments` button navigates to `/customer/appointments` (Customer Dashboard/Appointments List).
    *   `Go to Homepage` button navigates to `/` (Public Homepage).