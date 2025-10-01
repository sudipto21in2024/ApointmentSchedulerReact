# UI Flow: Authentication - General User Registration

## 1. Overview

This document outlines the user interface flow for the **general user/customer registration** process within the Multi-Tenant Appointment Booking System. It adheres to the `auth_centered_layout` pattern and utilizes components defined in the `auth-components-spec.json` and `design-tokens.json`.

For service provider registration, which includes business information and subscription plan selection, please refer to: [UI Flow: Service Provider Registration with Subscription Selection](ServiceProvider_Registration_Flow.md)

## 2. User Journey Context

This flow is typically part of user journeys where an individual consumer wishes to create an account to book services, manage their appointments, and access their personal profile.

## 3. High-Level Layout

**Template Type:** Layout 1 (Public-Facing / Logged Out)
**Specific Layout Pattern:** `auth_centered_layout` from `docs/layout-patterns/page-layouts.json`

The layout will feature a minimal header (optional logo), a centrally aligned card containing the registration form, and a minimal footer (optional copyright). The background will be `neutral.50` as per `design-tokens.json`.

## 4. Wireframe (Textual Representation)

```
+----------------------------------------------------------------+
| [Header - Optional/Minimal, e.g., only Logo]                   |
+----------------------------------------------------------------+
|                                                                |
|                         [Centered Card]                        |
|                         +-----------------------+              |
|                         | [App Logo]            |              |
|                         |                       |              |
|                         | Create Account        |              |
|                         | Sign up for a new account|           |
|                         |                       |              |
|                         | First Name            | Last Name    |
|                         | [Input Field]         | [Input Field]|
|                         | [Error Text]          | [Error Text] |
|                         |                       |              |
|                         | Email Address         |              |
|                         | [Email Input Field]   |              |
|                         | [Email Error Text]    |              |
|                         |                       |              |
|                         | Password              |              |
|                         | [Password Input Field]|              |
|                         | [Password Error Text] |              |
|                         |                       |              |
|                         | Confirm Password      |              |
|                         | [Confirm Password Input Field]|      |
|                         | [Confirm Password Error Text]|      |
|                         |                       |              |
|                         | [Register Button]     |              |
|                         |                       |              |
|                         | Already have an account? Sign In |   |
|                         | Are you a Service Provider? Register Here |
|                         +-----------------------+              |
|                                                                |
+----------------------------------------------------------------+
| [Footer - Optional/Minimal, e.g., Copyright]                   |
+----------------------------------------------------------------+
```

## 5. Angular Component Definitions

### 5.1. `AuthLayoutComponent` (Container/Wrapper)

*   **Purpose:** Implements the `auth_centered_layout` pattern, providing the overall structure for authentication-related pages. This component is shared with the login flow.
*   **Selector:** `app-auth-layout`
*   **Location:** `src/app/core/layout/auth-layout/auth-layout.component.ts` (or similar)
*   **Template:** (Same as Login Flow)
    ```html
    <div class="auth-container min-h-screen flex items-center justify-center bg-gray-50">
      <div class="auth-card max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <router-outlet></router-outlet>
      </div>
    </div>
    ```
*   **TypeScript Logic:** Minimal, primarily for structural purposes.
*   **Styling:** Uses Tailwind CSS classes as per `auth_centered_layout` in `docs/layout-patterns/page-layouts.json` and `auth_components` in `docs/design-system/component-patterns.json`.

### 5.2. `RegisterComponent` (Feature Component)

*   **Purpose:** Handles general user registration functionality, including form display, validation, and interaction with the authentication service.
*   **Selector:** `app-register`
*   **Location:** `src/app/features/auth/register/register.component.ts` (or similar)
*   **Template:** HTML structure will precisely match `docs/ui-components/auth-components-spec.json#RegisterComponent.required_structure`.
    ```html
    <!-- Example structure based on auth-components-spec.json, to be copied exactly -->
    <div class="auth-header text-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
      <p class="text-sm text-gray-600">Sign up for a new account</p>
    </div>
    <form class="auth-form space-y-6">
      <div class="grid grid-cols-2 gap-4">
        <div class="field-group">
          <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input type="text" id="firstName" name="firstName" placeholder="First name" required
                 class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
          <div class="text-red-600 text-sm mt-1 hidden" role="alert"></div>
        </div>
        <div class="field-group">
          <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input type="text" id="lastName" name="lastName" placeholder="Last name" required
                 class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
          <div class="text-red-600 text-sm mt-1 hidden" role="alert"></div>
        </div>
      </div>
      <div class="field-group">
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
        <input type="email" id="email" name="email" placeholder="Enter your email" required
               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
        <div class="text-red-600 text-sm mt-1 hidden" role="alert"></div>
      </div>
      <div class="field-group">
        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <input type="password" id="password" name="password" placeholder="Enter your password" required
               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
        <div class="text-red-600 text-sm mt-1 hidden" role="alert"></div>
      </div>
      <div class="field-group">
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
        <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm your password" required
               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
        <div class="text-red-600 text-sm mt-1 hidden" role="alert"></div>
      </div>
      <button type="submit" class="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 font-medium">Register</button>
    </form>
    <div class="auth-footer text-center mt-6 space-y-4">
      <p class="text-sm text-gray-600">Already have an account? <a href='/auth/login' class='text-primary hover:text-primary-hover font-medium'>Sign In</a></p>
      <p class="text-sm text-gray-600">Are you a Service Provider? <a href='service-provider-register.html' class='text-primary hover:text-primary-hover font-medium'>Register Here</a></p>
    </div>
    ```
*   **TypeScript Logic (`register.component.ts`):**
    *   **Imports:** `FormBuilder`, `FormGroup`, `Validators` from `@angular/forms`. `AuthService` (custom). `Router` from `@angular/router`.
    *   **Properties:** `registerForm: FormGroup`, `isLoading: boolean`.
    *   **Constructor:** Injects `FormBuilder`, `AuthService`, `Router`. Initializes `registerForm` with `FormControl`s for `firstName`, `lastName`, `email`, `password`, `confirmPassword`.
    *   **Validation:** Implements Angular Reactive Forms validation based on `auth-components-spec.json#RegisterComponent.validation_rules` (e.g., `Validators.required`, `Validators.email`, `Validators.minLength(8)`, `passwordMatchValidator` for `confirmPassword`). Displays error messages dynamically.
    *   **`onSubmit()` method:**
        *   Checks `registerForm.valid`.
        *   Sets `isLoading = true`.
        *   Calls `authService.register(this.registerForm.value)`.
        *   On success, navigates to login page or a confirmation page.
        *   On error, displays error message.
        *   Sets `isLoading = false`.
    *   **`passwordMatchValidator` (Custom Validator Function):** Ensures `password` and `confirmPassword` fields match.
    *   **Navigation:** Uses `Router` to navigate to `/auth/login`.
*   **Styling (`register.component.scss`):** Will be minimal, primarily importing Tailwind CSS and ensuring no custom styles are introduced beyond the approved design tokens and classes.

## 6. Strict Adherence

All HTML structure, CSS classes, and design tokens used in the implementation of `RegisterComponent` must strictly follow the specifications provided in `docs/ui-components/auth-components-spec.json`, `docs/design-system/design-tokens.json`, and `docs/layout-patterns/page-layouts.json`. No deviations are allowed.