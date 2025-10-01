# UI Flow: Customer - Profile/Account Management Page

## 1. Overview

This document outlines the UI flow for the Customer Profile/Account Management page within the Multi-Tenant Appointment Booking System. This page allows individual consumers to manage their personal information, contact preferences, notification settings, and payment methods. It consolidates various account-related functionalities into a single, accessible interface. This supports FR-7.4, and aspects of FR-7.1, FR-7.2, FR-7.3, and FR-7.4 from the BRD.

## 2. Purpose

To provide customers with a centralized location to view and update their personal and account-related information, ensuring data accuracy, personalized communication, and secure payment management.

## 3. Actors

*   **Individual Consumer:** A logged-in user managing their account.

## 4. Preconditions

*   The user is logged into their account.
*   The user has navigated to the profile/account management page (e.g., from the dashboard sidebar or a user menu).

## 5. Postconditions

*   User has successfully updated their personal information.
*   User has modified their notification preferences.
*   User has added, updated, or removed payment methods.
*   User has changed their password or other security settings.

## 6. Flow Steps

The Customer Profile/Account Management page will likely be structured with a tabbed or multi-section interface to organize different categories of settings.

### 6.1. Page Structure

**Template Type:** Layout 2 (Main Application / Logged In).
**Specific Layout Pattern:** Header, footer, and a main content area with a collapsible sidebar. The main content area will feature a multi-section form or tabbed interface.

**UI Elements:**
*   **Header:** Standard logged-in header with logo, company name, user profile info, notifications drawer, and breadcrumb.
*   **Sidebar:** Customer-specific navigation menu (e.g., Dashboard, My Appointments, Profile, Payment Methods, Settings). The "Profile" or "Account" item will be active.
*   **Main Content Area:**
    *   **Page Title:** "Account Settings" or "My Profile"
    *   **Navigation Tabs/Sidebar (within main content):**
        *   `Personal Information`
        *   `Notification Preferences`
        *   `Payment Methods`
        *   `Security Settings` (e.g., Change Password, Two-Factor Authentication)
        *   `Privacy Settings` (e.g., Data Access, Deletion)
    *   **Content Area (for selected tab/section):**

        #### **A. Personal Information Section:**
        *   **Profile Picture:** Avatar upload and display.
        *   **Form Fields:**
            *   `First Name` (Text Input)
            *   `Last Name` (Text Input)
            *   `Email Address` (Read-only, or editable with re-verification)
            *   `Phone Number` (Text Input)
            *   `Address` (Text Area/Input)
        *   **Action:** `Save Changes` button.

        #### **B. Notification Preferences Section:**
        *   **Checkboxes/Toggles:** For various notification types:
            *   `Booking Confirmations` (Email/SMS)
            *   `Reminders` (Email/SMS)
            *   `Cancellations/Reschedules` (Email/SMS)
            *   `Promotional Offers` (Email)
            *   `System Updates` (Email)
        *   **Action:** `Save Preferences` button.

        #### **C. Payment Methods Section:**
        *   **List of Saved Cards:** Display masked card numbers (e.g., `**** **** **** 1234`), expiry dates, and card type icons.
        *   **Actions for Each Card:** `Edit`, `Remove`.
        *   **`Add New Payment Method` button:** Opens a modal or navigates to a form for adding a new card.
        *   **Transaction History:** Link to a separate transaction history page (FR-7.4).

        #### **D. Security Settings Section:**
        *   **`Change Password` Form:**
            *   `Current Password`
            *   `New Password`
            *   `Confirm New Password`
            *   `Change Password` button.
        *   **Two-Factor Authentication (2FA) Toggle:** Enable/Disable 2FA.
        *   **`Delete Account` Button:** (Prominently displayed, requires confirmation).

        #### **E. Privacy Settings Section:**
        *   **Data Access Request:** Button to request a copy of their data.
        *   **Data Deletion Request:** Button to request account deletion.
        *   **Marketing Opt-out:** Checkbox for marketing communications.
*   **Footer:** Standard logged-in footer.

## 7. Angular Component Definitions

*   **`CustomerProfilePageComponent` (Smart Component):**
    *   **Purpose:** Manages the overall profile/account settings, orchestrating data fetching, updates, and navigation between sections.
    *   **Selector:** `app-customer-profile-page`
    *   **Location:** `src/app/features/customer/profile/customer-profile-page.component.ts`
    *   **TypeScript Logic:**
        *   Fetches user profile, notification preferences, and payment methods from respective services.
        *   Manages the active tab/section.
        *   Handles form submissions for each section, calling appropriate services (`UserService`, `NotificationService`, `PaymentService`).
        *   Manages loading states and displays success/error messages.
    *   **Template:** Integrates `PersonalInformationFormComponent`, `NotificationPreferencesComponent`, `PaymentMethodsListComponent`, `SecuritySettingsComponent`, `PrivacySettingsComponent`.

*   **`PersonalInformationFormComponent` (Dumb Component):**
    *   **Purpose:** Form for updating personal details.
    *   **Selector:** `app-personal-information-form`
    *   **Inputs:** `user: UserProfileDto`.
    *   **Outputs:** `profileUpdated: EventEmitter<UserProfileDto>`.

*   **`NotificationPreferencesComponent` (Dumb Component):**
    *   **Purpose:** Manages notification settings.
    *   **Selector:** `app-notification-preferences`
    *   **Inputs:** `preferences: NotificationPreferenceDto`.
    *   **Outputs:** `preferencesUpdated: EventEmitter<NotificationPreferenceDto>`.

*   **`PaymentMethodsListComponent` (Dumb Component):**
    *   **Purpose:** Displays saved payment methods and provides options to manage them.
    *   **Selector:** `app-payment-methods-list`
    *   **Inputs:** `paymentMethods: PaymentMethodDto[]`.
    *   **Outputs:** `addMethod: EventEmitter<void>`, `editMethod: EventEmitter<string>`, `removeMethod: EventEmitter<string>`.

*   **`SecuritySettingsComponent` (Dumb Component):**
    *   **Purpose:** Handles password change and 2FA settings.
    *   **Selector:** `app-security-settings`
    *   **Outputs:** `passwordChanged: EventEmitter<void>`, `twoFaToggled: EventEmitter<boolean>`.

*   **`PrivacySettingsComponent` (Dumb Component):**
    *   **Purpose:** Handles data access and deletion requests.
    *   **Selector:** `app-privacy-settings`
    *   **Outputs:** `dataRequest: EventEmitter<void>`, `accountDeletion: EventEmitter<void>`.

## 8. Styling and Responsiveness

*   **Layout:** Responsive layout for the main content area, with side-navigation or tabs for sections. Forms will be well-structured and easy to use.
*   **Profile Picture:** Circular image with upload overlay.
*   **Payment Methods:** Clean display of cards with action buttons.
*   **Theming:** Adheres to `DesignTokens.json` and `StyleGuide.md`.

## 9. Accessibility Considerations

*   Semantic HTML for all forms, headings, and lists.
*   Keyboard navigation for all interactive elements, including tabs/sections.
*   ARIA attributes for form validation, tabs, and dynamic content updates.
*   Clear focus indicators.
*   Sufficient color contrast.

## 10. Integration

*   **Backend API:** Various services (`UserService`, `NotificationService`, `PaymentService`) will communicate with backend API endpoints for fetching and updating user data.
*   **Routing:**
    *   Navigation between different sections of the profile page (if using routing for tabs).
    *   Navigation to a dedicated "Add Payment Method" page/modal.