# UI Flow: Service Provider Registration with Subscription Selection

## 1. Overview

This document outlines the UI flow for service provider registration, which includes account creation, business information entry, and subscription plan selection. This distinct flow ensures that service providers are onboarded with the necessary business context and billing arrangements from the outset.

## 2. Purpose

To define a clear, multi-step registration process for service providers that captures essential user and business details, and integrates subscription plan selection, aligning with the platform's revenue model and service provider needs.

## 3. Actors

*   **Service Provider:** Individual practitioners, small to medium clinics, large service organizations.

## 4. Preconditions

*   The user has navigated to the dedicated service provider registration URL (e.g., `register.yourdomain.com/provider` or `yourdomain.com/signup/provider`).

## 5. Postconditions

*   Service provider account is successfully created.
*   A subscription plan has been selected and associated with the provider's account.
*   The provider is logged in and redirected to their dashboard or a "getting started" guide.
*   Billing information (if provided) is stored securely.

## 6. Flow Steps

The registration process is structured as a multi-step form using a stepper component for clear progress indication.

### Step 1: Account Details

**Purpose:** Capture basic user authentication information.

**UI Elements:**
*   **Header:** "Create Your Service Provider Account"
*   **Sub-header:** "Start by telling us a little about yourself."
*   **Form Fields:**
    *   `First Name` (Text Input)
    *   `Last Name` (Text Input)
    *   `Email Address` (Email Input)
    *   `Password` (Password Input)
    *   `Confirm Password` (Password Input)
*   **Actions:**
    *   `Next` button: Proceeds to Step 2.

**Validation:**
*   All fields are required.
*   `Email Address`: Valid email format, unique within the tenant.
*   `Password`: Minimum 8 characters, must contain at least one uppercase letter, one lowercase letter, and one number.
*   `Confirm Password`: Must match `Password`.

### Step 2: Business Information

**Purpose:** Gather essential details about the service provider's business.

**UI Elements:**
*   **Header:** "Tell Us About Your Business"
*   **Sub-header:** "This information will help us set up your dedicated service environment."
*   **Form Fields:**
    *   `Company/Practice Name` (Text Input)
    *   `Desired Subdomain` (Text Input with `.[yourdomain.com]` suffix hint) - e.g., if user types "myclinic", the full URL becomes `myclinic.yourdomain.com`.
    *   `Industry/Category` (Dropdown/Select - e.g., Healthcare, Beauty, Consulting, Fitness)
    *   `Business Phone Number` (Phone Input)
    *   `Business Address` (Text Area/Input)
*   **Actions:**
    *   `Previous` button: Returns to Step 1.
    *   `Next` button: Proceeds to Step 3.

**Validation:**
*   All fields are required.
*   `Company/Practice Name`: Minimum 2 characters.
*   `Desired Subdomain`: Alphanumeric, lowercase, no spaces, unique across the platform. Real-time availability check for subdomain.
*   `Business Phone Number`: Valid phone number format.

### Step 3: Choose Your Subscription Plan

**Purpose:** Allow the service provider to select a suitable subscription plan.

**UI Elements:**
*   **Header:** "Select Your Subscription Plan"
*   **Sub-header:** "Choose the plan that best fits your business needs. You can upgrade or downgrade anytime."
*   **Plan Cards/Tiles:** Display multiple subscription plans (e.g., "Starter", "Pro", "Enterprise"). Each card should include:
    *   Plan Name
    *   Price (e.g., "$XX/month" or "Free")
    *   Key features/benefits (e.g., "Up to 5 Services", "Unlimited Bookings", "Analytics Dashboard", "Multi-user support")
    *   "Most Popular" tag if applicable.
*   **Plan Comparison Table (Optional but Recommended):** A table summarizing features across all plans.
*   **Actions:**
    *   `Previous` button: Returns to Step 2.
    *   `Select Plan` button (on each plan card): Proceeds to Step 4 (if paid plan) or completes registration (if free plan).

**Business Logic:**
*   Dynamically fetch available pricing plans from the backend.
*   Clearly differentiate between free and paid plans.

### Step 4: Payment Information (Conditional)

**Purpose:** Collect billing details for paid subscription plans. This step is skipped for free plans.

**UI Elements:**
*   **Header:** "Enter Payment Details"
*   **Sub-header:** "Securely provide your payment information to activate your chosen plan."
*   **Form Fields:**
    *   `Card Number` (Credit Card Input)
    *   `Cardholder Name` (Text Input)
    *   `Expiry Date` (Month/Year Input)
    *   `CVC/CVV` (Numeric Input)
    *   `Billing Address` (Text Area/Input - may pre-fill from business address)
    *   Checkbox: "Save card for future use"
*   **Actions:**
    *   `Previous` button: Returns to Step 3.
    *   `Complete Registration` button: Submits all registration and payment details.
    *   `Skip for now (Start Free Trial)` button (if applicable): Skips payment, activates a trial.

**Validation:**
*   All payment fields are required and must be valid for payment processing.
*   Integrate with a payment gateway for tokenization and secure submission.

## 7. Angular Component Breakdown

*   **`ServiceProviderRegistrationComponent` (Smart Component):**
    *   Manages the overall multi-step flow.
    *   Holds the registration form group and controls.
    *   Handles navigation between steps (Next, Previous).
    *   Orchestrates data submission to backend services (User, Tenant, Subscription, Payment).
    *   Injects `AuthService`, `TenantService`, `SubscriptionService`, `PaymentService`.
    *   Uses reactive forms (`FormGroup`, `FormControl`, `FormBuilder`).
    *   Handles loading states and error messages.

*   **`AccountDetailsFormComponent` (Dumb Component):**
    *   `@Input()` `formGroup`: Receives a subset of the registration form group for account details.
    *   `@Output()` `nextStep`: Emits an event to signal completion of this step.
    *   Displays `First Name`, `Last Name`, `Email Address`, `Password`, `Confirm Password` fields.
    *   Includes local validation and error display.

*   **`BusinessInfoFormComponent` (Dumb Component):**
    *   `@Input()` `formGroup`: Receives a subset of the registration form group for business info.
    *   `@Output()` `previousStep`: Emits an event to go back.
    *   `@Output()` `nextStep`: Emits an event to signal completion.
    *   Displays `Company/Practice Name`, `Desired Subdomain`, `Industry/Category`, `Business Phone Number`, `Business Address` fields.
    *   Handles real-time subdomain availability check (may involve a service call).
    *   Includes local validation and error display.

*   **`SubscriptionPlanSelectorComponent` (Dumb Component):**
    *   `@Input()` `availablePlans`: Receives an array of `PricingPlanDto` objects.
    *   `@Output()` `planSelected`: Emits the selected `PricingPlanDto`.
    *   `@Output()` `previousStep`: Emits an event to go back.
    *   Renders the plan cards/tiles and optional comparison table.
    *   Handles plan selection logic.

*   **`PaymentDetailsFormComponent` (Dumb Component):**
    *   `@Input()` `formGroup`: Receives a subset of the registration form group for payment details.
    *   `@Output()` `previousStep`: Emits an event to go back.
    *   `@Output()` `completeRegistration`: Emits an event to finalize registration.
    *   Displays `Card Number`, `Cardholder Name`, `Expiry Date`, `CVC/CVV`, `Billing Address` fields.
    *   Integrates with a payment service/library for secure input and tokenization.
    *   Includes local validation and error display.

## 8. Styling and Responsiveness

*   **Layout:** Utilizes the `auth_centered_layout` pattern for the overall registration page.
*   **Stepper:** Custom styling for the multi-step indicator.
*   **Form Elements:** All form fields and buttons will adhere to the styles defined in `DesignTokens.json` and `StyleGuide.md`.
*   **Plan Cards:** Designed to be visually appealing and clearly highlight plan features and pricing. Responsive grid for plan display.
*   **Error Handling:** Validation messages displayed directly under the field, with CSS error states for input controls, as per `StyleGuide.md` and `AccessibilityGuidelines.md`.
*   **Responsiveness:** Mobile-first approach, ensuring optimal experience on all devices, as per `ResponsiveGuidelines.md`.

## 9. Accessibility Considerations

*   All form fields will have proper `<label>` associations and `aria-describedby` for validation messages.
*   Keyboard navigation will be fully supported for all interactive elements, including stepper controls and plan selection.
*   Color contrast ratios will meet WCAG 2.1 AA standards.
*   Screen reader announcements for step changes and form errors.

## 10. Future Considerations

*   **Email Verification:** Add an email verification step after initial account creation.
*   **Trial Period Management:** Clear indication of trial status and options to upgrade.
*   **Admin Approval:** For certain business types, registration might require admin approval before full activation.