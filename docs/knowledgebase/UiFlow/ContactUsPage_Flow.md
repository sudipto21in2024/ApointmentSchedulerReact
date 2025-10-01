# UI Flow: Contact Us Page

## 1. Overview

This document outlines the UI flow for the public-facing Contact Us page of the Multi-Tenant Appointment Booking System. This page serves as a primary point of contact for users (potential customers, service providers, or general inquiries) to reach out to the platform support or sales teams.

## 2. Purpose

To provide users with various methods to contact the system administrators or support team, including a contact form for direct inquiries, and information on alternative contact channels (e.g., email, phone, social media).

## 3. Actors

*   **Potential Customer:** Individuals interested in booking services.
*   **Potential Service Provider:** Businesses interested in using the platform.
*   **Existing User:** Users with general inquiries or support needs.
*   **General Public:** Anyone seeking information about the platform.

## 4. Preconditions

*   The user has navigated to the Contact Us page (e.g., via a link in the public header or footer).

## 5. Postconditions

*   User has successfully submitted an inquiry via the contact form.
*   User has obtained necessary contact information (email, phone, address).
*   User is aware of alternative contact channels.

## 6. Flow Steps

The Contact Us page will be a static content page featuring a contact form and additional contact information.

### 6.1. Page Structure

**Template Type:** Layout 1 (Public-Facing / Logged Out)
**Specific Layout Pattern:** A simple content layout with a main content area for the form and contact details.

**UI Elements:**
*   **Header:** Standard public-facing header with logo, navigation (e.g., Home, Features, Pricing, Contact, Login/Register).
*   **Main Content Area:**
    *   **Hero Section (Optional):**
        *   **Title:** "Get in Touch" or "We'd Love to Hear From You"
        *   **Description:** A brief welcoming message.
    *   **Contact Form Section:**
        *   **Section Title:** "Send Us a Message"
        *   **Form Fields:**
            *   `Full Name` (Text Input)
            *   `Email Address` (Email Input)
            *   `Subject` (Text Input / Dropdown for common subjects like "Support Inquiry", "Sales Inquiry", "Partnership")
            *   `Message` (Text Area)
        *   **Action:** `Send Message` button.
        *   **Success/Error Message:** Display feedback after form submission.
    *   **Alternative Contact Information Section:**
        *   **Section Title:** "Other Ways to Connect"
        *   **Details:**
            *   **Email:** `support@yourdomain.com`
            *   **Phone:** `+1 (XXX) XXX-XXXX`
            *   **Address:** Physical address (if applicable)
            *   **Social Media Links:** Icons for Facebook, Twitter, LinkedIn, etc.
    *   **Map (Optional):** Embedded map showing physical location.
*   **Footer:** Standard public-facing footer with copyright, privacy policy, terms of service links.

## 7. Angular Component Definitions

*   **`ContactUsPageComponent` (Smart Component):**
    *   **Purpose:** Manages the overall Contact Us page, including form submission logic.
    *   **Selector:** `app-contact-us-page`
    *   **Location:** `src/app/features/public/contact/contact-us.component.ts` (or similar)
    *   **TypeScript Logic:**
        *   Manages the contact form state using Angular Reactive Forms.
        *   Handles form validation.
        *   Submits form data to a backend API (e.g., `ContactService`).
        *   Manages loading states and displays success/error messages after submission.
    *   **Template:** Integrates `ContactFormComponent` and displays static contact information.

*   **`ContactFormComponent` (Dumb Component):**
    *   **Purpose:** Encapsulates the contact form.
    *   **Selector:** `app-contact-form`
    *   **Inputs:** None (form group managed by parent or internal).
    *   **Outputs:** `formSubmitted: EventEmitter<ContactFormData>`.
    *   **Template:** Renders the `Full Name`, `Email Address`, `Subject`, and `Message` fields, and the `Send Message` button.
    *   **TypeScript Logic:**
        *   Creates and manages its own `FormGroup`.
        *   Emits `formSubmitted` event with form data on valid submission.
        *   Handles local form validation and error display.

## 8. Styling and Responsiveness

*   **Layout:** A clean, two-column layout can be used for the form and alternative contact info on larger screens, stacking vertically on mobile.
*   **Form Elements:** All form fields and buttons will adhere to the styles defined in `DesignTokens.json` and `StyleGuide.md`.
*   **Typography:** Headings and text sizes will follow the hierarchy defined in `DesignTokens.json` and `StyleGuide.md`.
*   **Color Palette:** Adheres strictly to the brand colors defined in `DesignTokens.json` and `StyleGuide.md`.
*   **Responsiveness:** Mobile-first approach, ensuring optimal readability and interaction on all screen sizes.

## 9. Accessibility Considerations

*   All form fields will have proper `<label>` associations and `aria-describedby` for validation messages.
*   Keyboard navigation will be fully supported for all interactive elements.
*   Sufficient color contrast for text and interactive elements.
*   Clear focus indicators.
*   Appropriate ARIA attributes for form feedback (e.g., `aria-live` for success/error messages).

## 10. Integration

*   **Backend API:** `ContactService` will interact with a backend API endpoint (e.g., `/api/contact`) to send inquiry messages.
*   **Email Service:** The backend will typically integrate with an email service to forward inquiries to the appropriate team.