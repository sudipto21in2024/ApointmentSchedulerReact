# UI Flow: Tenant Admin - Settings

## 1. Overview

This document outlines the UI flow for the Tenant Admin Settings section within the Multi-Tenant Appointment Booking System. This section provides clinic administrators with the ability to configure various tenant-specific settings, including general clinic information, default booking policies, and notification preferences. It directly supports Journey 2: Small to Medium Clinic - Multi-Practitioner Scheduling (Stage 1: Team Setup - Permissions Setup, and general operational efficiency goals).

## 2. Purpose

To enable tenant administrators to customize the platform's behavior and appearance for their specific organization, ensuring it aligns with their operational policies, branding, and communication preferences.

## 3. Actors

*   **Clinic Administrator:** The primary user responsible for managing a tenant's operations.

## 4. Preconditions

*   The user is logged into the platform with a "Tenant Admin" role.
*   The user has navigated to the Settings section (e.g., via the sidebar navigation).

## 5. Postconditions

*   Tenant-specific settings are successfully configured and saved.
*   Platform behavior for the tenant is updated according to the new settings.

## 6. Flow Steps

The Tenant Admin Settings section will typically be organized into several categories, accessible via tabs or a left-hand navigation, similar to the customer profile management.

### 6.1. Page Structure

**Template Type:** Layout 2 (Main Application / Logged In).
**Specific Layout Pattern:** Header, footer, and a main content area with a collapsible sidebar. The main content area will feature a multi-section form or tabbed interface for different settings categories.

**UI Elements:**
*   **Header:** Standard logged-in header with logo, company name, user profile info, notifications drawer, and breadcrumb. The breadcrumb should indicate "Settings".
*   **Sidebar:** Tenant Admin-specific navigation menu. The "Settings" item will be active.
*   **Main Content Area:**
    *   **Page Title:** "Tenant Settings" or "Clinic Settings"
    *   **Navigation Tabs/Sidebar (within main content):**
        *   `General Settings`
        *   `Booking Policies`
        *   `Notification Defaults`
        *   `Branding & Appearance` (Optional)
        *   `Integrations` (Optional)
    *   **Content Area (for selected tab/section):**

        #### **A. General Settings Section:**
        *   **Clinic Name:** (Text Input)
        *   **Clinic Address:** (Text Area/Input)
        *   **Contact Email:** (Email Input)
        *   **Contact Phone:** (Phone Input)
        *   **Time Zone:** (Dropdown)
        *   **Default Currency:** (Dropdown)
        *   **Website URL:** (Text Input)
        *   **Actions:** `Save Changes` button.

        #### **B. Booking Policies Section:**
        *   **Minimum Booking Notice:** (Number Input, e.g., "hours before appointment")
        *   **Maximum Booking Horizon:** (Number Input, e.g., "days in advance")
        *   **Cancellation Policy:** (Text Area, rich text editor optional)
        *   **Rescheduling Policy:** (Text Area, rich text editor optional)
        *   **Allow Guest Bookings:** (Toggle)
        *   **Require Payment at Booking:** (Toggle)
        *   **Actions:** `Save Policies` button.

        #### **C. Notification Defaults Section:**
        *   **Default Confirmation Message (Email/SMS):** (Text Area) - Template variables allowed.
        *   **Default Reminder Message (Email/SMS):** (Text Area) - Configurable timing (e.g., "24 hours before", "1 hour before").
        *   **Default Cancellation Message (Email/SMS):** (Text Area)
        *   **Enable SMS Notifications Globally:** (Toggle)
        *   **Actions:** `Save Defaults` button.

        #### **D. Branding & Appearance Section (Optional):**
        *   **Clinic Logo Upload:** (File Input)
        *   **Primary Brand Color:** (Color Picker)
        *   **Accent Color:** (Color Picker)
        *   **Custom CSS/JavaScript Injection:** (Text Area - for advanced customization, with warnings)
        *   **Actions:** `Save Branding` button.

        #### **E. Integrations Section (Optional):**
        *   **Payment Gateway Configuration:** API keys, secret keys for Stripe, PayPal etc.
        *   **SMS Gateway Configuration:** API keys for Twilio, etc.
        *   **Calendar Sync:** Google Calendar, Outlook Calendar integration settings.
        *   **Actions:** `Save Integrations` button.
*   **Footer:** Standard logged-in footer.

## 7. Angular Component Definitions

*   **`TenantAdminSettingsComponent` (Smart Component):**
    *   **Purpose:** Manages the overall tenant settings, orchestrating data fetching, updates, and navigation between sections.
    *   **Selector:** `app-tenant-admin-settings`
    *   **Location:** `src/app/features/tenant-admin/settings/tenant-admin-settings.component.ts`
    *   **TypeScript Logic:**
        *   Fetches various settings from a `TenantSettingsService`.
        *   Manages the active tab/section.
        *   Handles form submissions for each section, calling appropriate services (`TenantSettingsService`).
        *   Manages loading states and displays success/error messages.
    *   **Template:** Integrates `GeneralSettingsFormComponent`, `BookingPoliciesFormComponent`, `NotificationDefaultsFormComponent`, `BrandingAppearanceFormComponent`, `IntegrationsFormComponent`.

*   **`GeneralSettingsFormComponent` (Dumb Component):**
    *   **Purpose:** Form for updating general clinic information.
    *   **Selector:** `app-general-settings-form`
    *   **Inputs:** `settings: GeneralSettingsDto`.
    *   **Outputs:** `settingsUpdated: EventEmitter<GeneralSettingsDto>`.

*   **`BookingPoliciesFormComponent` (Dumb Component):**
    *   **Purpose:** Form for configuring booking rules.
    *   **Selector:** `app-booking-policies-form`
    *   **Inputs:** `policies: BookingPoliciesDto`.
    *   **Outputs:** `policiesUpdated: EventEmitter<BookingPoliciesDto>`.

*   **`NotificationDefaultsFormComponent` (Dumb Component):**
    *   **Purpose:** Form for setting default notification messages and preferences.
    *   **Selector:** `app-notification-defaults-form`
    *   **Inputs:** `defaults: NotificationDefaultsDto`.
    *   **Outputs:** `defaultsUpdated: EventEmitter<NotificationDefaultsDto>`.

*   **`BrandingAppearanceFormComponent` (Dumb Component - Optional):**
    *   **Purpose:** Form for uploading logo and setting brand colors.
    *   **Selector:** `app-branding-appearance-form`
    *   **Inputs:** `branding: BrandingDto`.
    *   **Outputs:** `brandingUpdated: EventEmitter<BrandingDto>`.

*   **`IntegrationsFormComponent` (Dumb Component - Optional):**
    *   **Purpose:** Form for configuring third-party integrations.
    *   **Selector:** `app-integrations-form`
    *   **Inputs:** `integrations: IntegrationsDto`.
    *   **Outputs:** `integrationsUpdated: EventEmitter<IntegrationsDto>`.

## 8. Styling and Responsiveness

*   **Layout:** Responsive layout for the main content area, with side-navigation or tabs for sections. Forms will be well-structured and easy to use.
*   **Toggle Switches:** Custom styling for toggles.
*   **Color Pickers:** Integration with a suitable color picker component.
*   **Theming:** Adheres to `DesignTokens.json` and `StyleGuide.md`.

## 9. Accessibility Considerations

*   Semantic HTML for all forms, headings, and lists.
*   Keyboard navigation for all interactive elements, including tabs/sections.
*   ARIA attributes for form validation, tabs, and dynamic content.
*   Clear focus indicators.
*   Sufficient color contrast.

## 10. Integration

*   **Backend API:** `TenantSettingsService` will communicate with backend API endpoints for fetching and updating tenant settings.