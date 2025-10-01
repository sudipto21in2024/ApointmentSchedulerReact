# UI Flow: Authentication - User Login

## 1. Overview

This document outlines the user interface flow for the user login process within the Multi-Tenant Appointment Booking System. It adheres to the `auth_centered_layout` pattern and utilizes components defined in the `auth-components-spec.json` and `design-tokens.json`.

## 2. User Journey Context

This flow is part of the following user journeys:
- **Journey 1: Individual Practitioner - Setting Up and Managing Services** (Stage 1: Onboarding - Step 2: Sign Up/Login)
- **Journey 3: Individual Consumer - Booking a Service** (Stage 2: Booking Process - Step 1: Access Platform)

It also addresses Functional Requirements FR-10.1 (Multi-tenant aware login) and FR-10.2 (SuperAdmin login).

## 3. High-Level Layout

**Template Type:** Layout 1 (Public-Facing / Logged Out)
**Specific Layout Pattern:** `auth_centered_layout` from `docs/layout-patterns/page-layouts.json`

The layout will feature a minimal header (optional logo), a centrally aligned card containing the login form, and a minimal footer (optional copyright). The background will be `neutral.50` as per `design-tokens.json`.

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
|                         | Welcome Back          |              |
|                         | Sign in to your account|              |
|                         |                       |              |
|                         | Email Address         |              |
|                         | [Email Input Field]   |              |
|                         | [Email Error Text]    |              |
|                         |                       |              |
|                         | Password              |              |
|                         | [Password Input Field]|              |
|                         | [Password Error Text] |              |
|                         |                       |              |
|                         | [Sign In Button]      |              |
|                         |                       |              |
|                         | Forgot your password? |              |
|                         | Don't have an account? Sign up |     |
|                         +-----------------------+              |
|                                                                |
+----------------------------------------------------------------+
| [Footer - Optional/Minimal, e.g., Copyright]                   |
+----------------------------------------------------------------+
```

## 5. Angular Component Definitions

### 5.1. `AuthLayoutComponent` (Container/Wrapper)

*   **Purpose:** Implements the `auth_centered_layout` pattern, providing the overall structure for authentication-related pages. It acts as a wrapper for `LoginComponent`, `RegisterComponent`, etc.
*   **Selector:** `app-auth-layout`
*   **Location:** `src/app/core/layout/auth-layout/auth-layout.component.ts` (or similar)
*   **Template:**
    ```html
    <div class="auth-container min-h-screen flex items-center justify-center bg-gray-50">
      <div class="auth-card max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <router-outlet></router-outlet>
      </div>
    </div>
    ```
*   **TypeScript Logic:** Minimal, primarily for structural purposes.
*   **Styling:** Uses Tailwind CSS classes as per `auth_centered_layout` in `docs/layout-patterns/page-layouts.json` and `auth_components` in `docs/design-system/component-patterns.json`.

### 5.2. `LoginComponent` (Feature Component)

*   **Purpose:** Handles user login functionality, including form display, validation, and interaction with the authentication service.
*   **Selector:** `app-login`
*   **Location:** `src/app/features/auth/login/login.component.ts` (or similar)
*   **Template:** HTML structure will precisely match `docs/ui-components/auth-components-spec.json#LoginComponent.required_structure`.
    ```html
    <!-- Example structure based on auth-components-spec.json, to be copied exactly -->
    <div class="auth-header text-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
      <p class="text-sm text-gray-600">Sign in to your account</p>
    </div>
    <form class="auth-form space-y-6">
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
      <button type="submit" class="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 font-medium">Sign In</button>
    </form>
    <div class="auth-footer text-center mt-6 space-y-4">
      <a href="/auth/forgot-password" class="text-primary hover:text-primary-hover text-sm font-medium">Forgot your password?</a>
      <p class="text-sm text-gray-600">Don't have an account? <a href='/auth/register' class='text-primary hover:text-primary-hover font-medium'>Sign up</a></p>
    </div>
    ```
*   **TypeScript Logic (`login.component.ts`):**
    *   **Imports:** `FormBuilder`, `FormGroup`, `Validators` from `@angular/forms`. `AuthService` (custom). `Router` from `@angular/router`.
    *   **Properties:** `loginForm: FormGroup`, `isLoading: boolean`.
    *   **Constructor:** Injects `FormBuilder`, `AuthService`, `Router`. Initializes `loginForm` with `FormControl`s for `email` and `password`.
    *   **Validation:** Implements Angular Reactive Forms validation based on `auth-components-spec.json#LoginComponent.validation_rules` (e.g., `Validators.required`, `Validators.email`, `Validators.minLength(8)`). Displays error messages dynamically (`email_error`, `password_error` elements).
    *   **`onSubmit()` method:**
        *   Checks `loginForm.valid`.
        *   Sets `isLoading = true`.
        *   Calls `authService.login(this.loginForm.value)`.
        *   On success, navigates to dashboard.
        *   On error, displays error message (e.g., from API response).
        *   Sets `isLoading = false`.
    *   **Navigation:** Uses `Router` to navigate to `/auth/forgot-password` and `/auth/register`.
*   **Styling (`login.component.scss`):** Will be minimal, primarily importing Tailwind CSS and ensuring no custom styles are introduced beyond the approved design tokens and classes.

### 5.3. `AuthService` (Core Service)

*   **Purpose:** Centralized service for handling all authentication-related business logic, including API communication, JWT management, and user session state.
*   **Selector:** N/A (service)
*   **Location:** `src/app/core/services/auth.service.ts`
*   **Methods:**
    *   `login(credentials: { email: string; password: string }): Observable<AuthResponse>`: Sends login request to backend (`/api/auth/login`). Stores JWT and refresh token.
    *   `logout(): void`: Clears user session and tokens.
    *   `refreshToken(): Observable<AuthResponse>`: Handles token refresh.
    *   `isAuthenticated(): boolean`: Checks if user is authenticated.
    *   `getAuthToken(): string`: Retrieves stored JWT.
    *   `getTenantId(): string`: Extracts tenant ID from JWT (for non-SuperAdmin).
    *   `isSuperAdmin(): boolean`: Checks user role for SuperAdmin.
*   **Dependencies:** `HttpClient` from `@angular/common/http`.
*   **Error Handling:** Integrates with HTTP interceptors for global error handling (e.g., 401 Unauthorized, 403 Forbidden).

## 6. Strict Adherence

All HTML structure, CSS classes, and design tokens used in the implementation of `AuthLayoutComponent` and `LoginComponent` must strictly follow the specifications provided in `docs/ui-components/auth-components-spec.json`, `docs/design-system/design-tokens.json`, and `docs/layout-patterns/page-layouts.json`. No deviations are allowed.