# UI Flow: Settings Management

## 1. Overview

This document outlines the user interface flow for managing various settings for the service provider's account and business operations.

## 2. User Journey Context

This flow allows service providers to customize their profile, notification preferences, billing information, and security settings.

## 3. High-Level Layout

**Template Type:** Layout 2 (Main Application / Logged In)
**Specific Layout Pattern:** `dashboard_sidebar_layout` from `docs/layout-patterns/page-layouts.json`

The layout will feature the standard logged-in application structure: header, sidebar, and main content area. The settings content will be displayed within the main content area, likely utilizing a tabbed or vertical menu navigation for different setting categories.

## 4. Wireframe (Textual Representation)

```
+---------------------------------------------------------------------------------+
| [Header: Logo | Company Name | Breadcrumbs | User Profile | Notifications]     |
+---------------------------------------------------------------------------------+
| [Sidebar]                   | [Main Content Area]                             |
|  - [Navigation Menu]        |                                                 |
|    - Dashboard              |  [Page Header: Settings]                        |
|    - Services               |                                                 |
|    - Bookings               |  [Settings Navigation - Tabs/Vertical Menu]     |
|    - Customers              |  +--------------------------------------------+ |
|    - Analytics              |  | [Profile] [Notifications] [Billing] [Security] |
|    - Settings (Active)      |  +--------------------------------------------+ |
|                             |                                                 |
|                             |  [Content Area based on selected setting]       |
|                             |  +--------------------------------------------+ |
|                             |  | [Card: Profile Information]                | |
|                             |  |   - Name: [Input]                          | |
|                             |  |   - Email: [Input]                         | |
|                             |  |   - Phone: [Input]                         | |
|                             |  |   [Save Button]                            | |
|                             |  +--------------------------------------------+ |
|                             |                                                 |
|                             |  [Card: Notification Preferences]               |
|                             |  +--------------------------------------------+ |
|                             |  |   - Email Notifications: [Toggle]          | |
|                             |  |   - SMS Notifications: [Toggle]            | |
|                             |  |   [Save Button]                            | |
|                             |  +--------------------------------------------+ |
|                             |                                                 |
+---------------------------------------------------------------------------------+
| [Footer: Copyright | Links]                                                     |
+---------------------------------------------------------------------------------+
```

## 5. Angular Component Definitions

### 5.1. `SettingsComponent` (Feature Component)

*   **Purpose:** Acts as the main container for all settings sections, managing navigation between them (e.g., using tabs or a side menu).
*   **Selector:** `app-settings`
*   **Location:** `src/app/features/settings/settings.component.ts`
*   **TypeScript Logic:**
    *   **Properties:** `activeTab: string = 'profile'`.
    *   **`selectTab(tab: string)`:** Updates `activeTab` to control which settings sub-component is displayed.
*   **Styling:** Uses Tailwind CSS for layout and tab/menu styling.

### 5.2. `ProfileSettingsComponent` (Feature Component)

*   **Purpose:** Manages the service provider's personal and company profile information.
*   **Selector:** `app-profile-settings`
*   **Location:** `src/app/features/settings/profile-settings/profile-settings.component.ts`
*   **TypeScript Logic:**
    *   **Imports:** `UserService`.
    *   **Properties:** `profileForm: FormGroup`.
    *   **`ngOnInit()`:** Fetches current user profile data using `UserService.getProfile()` and populates `profileForm`.
    *   **`onSubmit()`:** Calls `UserService.updateProfile()` to save changes.
*   **Styling:** Uses Tailwind CSS for form elements and layout.

### 5.3. `NotificationSettingsComponent` (Feature Component)

*   **Purpose:** Manages notification preferences for the service provider.
*   **Selector:** `app-notification-settings`
*   **Location:** `src/app/features/settings/notification-settings/notification-settings.component.ts`
*   **TypeScript Logic:**
    *   **Imports:** `NotificationService`.
    *   **Properties:** `notificationForm: FormGroup`.
    *   **`ngOnInit()`:** Fetches current notification preferences using `NotificationService.getPreferences()`.
    *   **`onSubmit()`:** Calls `NotificationService.updatePreferences()` to save changes.
*   **Styling:** Uses Tailwind CSS for form elements and layout.

### 5.4. `BillingSettingsComponent` (Feature Component)

*   **Purpose:** Manages billing information and subscription details.
*   **Selector:** `app-billing-settings`
*   **Location:** `src/app/features/settings/billing-settings/billing-settings.component.ts`
*   **TypeScript Logic:**
    *   **Imports:** `PaymentService`, `SubscriptionService`.
    *   **Properties:** `billingForm: FormGroup`, `currentSubscription: Subscription`.
    *   **`ngOnInit()`:** Fetches current billing details and subscription info.
    *   **`onSubmit()`:** Calls `PaymentService.updateBillingInfo()` or `SubscriptionService.updateSubscription()`.
*   **Styling:** Uses Tailwind CSS for form elements and layout.

### 5.5. `SecuritySettingsComponent` (Feature Component)

*   **Purpose:** Manages security-related settings like password changes.
*   **Selector:** `app-security-settings`
*   **Location:** `src/app/features/settings/security-settings/security-settings.component.ts`
*   **TypeScript Logic:**
    *   **Imports:** `UserService`.
    *   **Properties:** `passwordChangeForm: FormGroup`.
    *   **`onSubmit()`:** Calls `UserService.changePassword()`.
*   **Styling:** Uses Tailwind CSS for form elements and layout.

### 5.6. Core Services (Reused/Extended)

*   **`UserService`**: For profile and security updates.
*   **`NotificationService`**: For notification preferences.
*   **`PaymentService`**: For billing information.
*   **`SubscriptionService`**: For subscription management.

## 6. Strict Adherence

All HTML structure, CSS classes, and design tokens used in the implementation of these components must strictly follow the specifications provided in `docs/ui-components/auth-components-spec.json` (for basic form elements), `docs/design-system/design-tokens.json`, and `docs/layout-patterns/page-layouts.json`. No deviations are allowed.