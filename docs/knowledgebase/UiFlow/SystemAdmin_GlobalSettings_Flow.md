# UI Flow: System Admin - Global Settings

## 1. Overview

This document outlines the UI flow for the Global Settings section within the System Admin panel of the Multi-Tenant Appointment Booking System. This section provides super administrators with the ability to configure platform-wide settings that affect all tenants and the overall system behavior. It supports critical administrative functions for platform maintenance and control.

## 2. Purpose

To enable system administrators to manage fundamental platform configurations, such as default values, system-wide policies, and critical integration settings, ensuring consistent behavior and operational efficiency across all tenants.

## 3. Actors

*   **System Administrator:** The primary user responsible for maintaining and supporting the entire platform.

## 4. Preconditions

*   The user is logged into the platform with a "SuperAdmin" role.
*   The user has navigated to the Global Settings section (e.g., via the sidebar navigation).

## 5. Postconditions

*   Platform-wide settings are successfully configured and saved.
*   Changes are applied globally across all tenants or system components as intended.

## 6. Flow Steps

The Global Settings section will typically be organized into several categories, accessible via tabs or a left-hand navigation, similar to tenant-specific settings but with a global scope.

### 6.1. Page Structure

**Template Type:** Layout 2 (Main Application / Logged In).
**Specific Layout Pattern:** Header, footer, and a main content area with a collapsible sidebar. The main content area will feature a multi-section form or tabbed interface for different global settings categories.

**UI Elements:**
*   **Header:** System Admin-specific logged-in header.
*   **Sidebar:** System Admin-specific navigation menu. The "Global Settings" item will be active.
*   **Main Content Area:**
    *   **Page Title:** "Global System Settings"
    *   **Navigation Tabs/Sidebar (within main content):**
        *   `General Platform Settings`
        *   `Default Tenant Policies`
        *   `Global Notification Templates`
        *   `System Integrations`
        *   `Security & Audit`
    *   **Content Area (for selected tab/section):**

        #### **A. General Platform Settings Section:**
        *   **Platform Name:** (Text Input)
        *   **Default Domain:** (Text Input, e.g., `yourdomain.com`)
        *   **Support Email:** (Email Input)
        *   **Support Phone:** (Phone Input)
        *   **Default Time Zone:** (Dropdown)
        *   **Default Currency:** (Dropdown)
        *   **Welcome Message for New Tenants:** (Text Area)
        *   **Actions:** `Save Changes` button.

        #### **B. Default Tenant Policies Section:**
        *   **Default Minimum Booking Notice:** (Number Input, e.g., "hours before appointment" - applies to new tenants)
        *   **Default Maximum Booking Horizon:** (Number Input, e.g., "days in advance" - applies to new tenants)
        *   **Default Cancellation Policy:** (Text Area)
        *   **Default Guest Booking Allowed:** (Toggle)
        *   **Default Payment Required at Booking:** (Toggle)
        *   **Actions:** `Save Defaults` button.

        #### **C. Global Notification Templates Section:**
        *   **Template Editor for Platform-wide Notifications:** (e.g., "New Tenant Welcome Email", "Subscription Renewal Notice", "Platform Downtime Alert")
        *   Rich text editor or markdown editor for email body.
        *   Fields for subject line, sender name.
        *   **Actions:** `Save Templates` button.

        #### **D. System Integrations Section:**
        *   **Main Payment Gateway API Keys:** (Text Inputs for API Key, Secret Key - applies to the primary platform payment processing)
        *   **Main SMS Gateway Credentials:** (Text Inputs for API Key, Account SID - applies to primary platform SMS sending)
        *   **Global Calendar Sync Settings:** (e.g., API keys for Google/Outlook for platform-level sync features)
        *   **Actions:** `Save Integrations` button.

        #### **E. Security & Audit Section:**
        *   **Audit Log Retention Period:** (Number Input, e.g., "days")
        *   **Force Password Reset Interval:** (Number Input, e.g., "days")
        *   **Platform Security Alerts Thresholds:** (Configuration for system-level security anomaly detection).
        *   **Actions:** `Save Settings` button.
*   **Footer:** Standard logged-in footer.

## 7. Angular Component Definitions

*   **`SystemAdminGlobalSettingsComponent` (Smart Component):**
    *   **Purpose:** Manages overall global platform settings, orchestrating data fetching, updates, and navigation between sections.
    *   **Selector:** `app-system-admin-global-settings`
    *   **Location:** `src/app/features/system-admin/global-settings/system-admin-global-settings.component.ts`
    *   **TypeScript Logic:**
        *   Fetches various global settings from a `GlobalSettingsService`.
        *   Manages the active tab/section.
        *   Handles form submissions for each section, calling appropriate services (`GlobalSettingsService`).
        *   Manages loading states and displays success/error messages.
    *   **Template:** Integrates `GeneralPlatformSettingsFormComponent`, `DefaultTenantPoliciesFormComponent`, `GlobalNotificationTemplatesComponent`, `SystemIntegrationsFormComponent`, `SecurityAuditSettingsComponent`.

*   **`GeneralPlatformSettingsFormComponent` (Dumb Component):**
    *   **Purpose:** Form for updating general platform information.
    *   **Selector:** `app-general-platform-settings-form`
    *   **Inputs:** `settings: GlobalPlatformSettingsDto`.
    *   **Outputs:** `settingsUpdated: EventEmitter<GlobalPlatformSettingsDto>`.

*   **`DefaultTenantPoliciesFormComponent` (Dumb Component):**
    *   **Purpose:** Form for configuring default booking rules for new tenants.
    *   **Selector:** `app-default-tenant-policies-form`
    *   **Inputs:** `policies: DefaultTenantPoliciesDto`.
    *   **Outputs:** `policiesUpdated: EventEmitter<DefaultTenantPoliciesDto>`.

*   **`GlobalNotificationTemplatesComponent` (Dumb Component):**
    *   **Purpose:** Form for editing platform-wide notification templates.
    *   **Selector:** `app-global-notification-templates`
    *   **Inputs:** `templates: GlobalNotificationTemplatesDto`.
    *   **Outputs:** `templatesUpdated: EventEmitter<GlobalNotificationTemplatesDto>`.

*   **`SystemIntegrationsFormComponent` (Dumb Component):**
    *   **Purpose:** Form for configuring core system-level integrations (payment, SMS, calendar).
    *   **Selector:** `app-system-integrations-form`
    *   **Inputs:** `integrations: SystemIntegrationsDto`.
    *   **Outputs:** `integrationsUpdated: EventEmitter<SystemIntegrationsDto>`.

*   **`SecurityAuditSettingsComponent` (Dumb Component):**
    *   **Purpose:** Form for security and audit-related settings.
    *   **Selector:** `app-security-audit-settings`
    *   **Inputs:** `securitySettings: SecurityAuditSettingsDto`.
    *   **Outputs:** `settingsUpdated: EventEmitter<SecurityAuditSettingsDto>`.

## 8. Styling and Responsiveness

*   **Layout:** Responsive layout for the main content area, with side-navigation or tabs for sections. Forms will be well-structured and easy to use.
*   **Toggle Switches:** Custom styling for toggles.
*   **Theming:** Adheres to `DesignTokens.json` and `StyleGuide.md`.

## 9. Accessibility Considerations

*   Semantic HTML for all forms, headings, and lists.
*   Keyboard navigation for all interactive elements, including tabs/sections.
*   ARIA attributes for form validation, tabs, and dynamic content.
*   Clear focus indicators.
*   Sufficient color contrast.

## 10. Integration

*   **Backend API:** `GlobalSettingsService` will communicate with backend API endpoints for fetching and updating global system settings.