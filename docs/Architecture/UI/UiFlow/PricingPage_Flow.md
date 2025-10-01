# UI Flow: Pricing Page

## 1. Overview

This document outlines the UI flow for the public-facing Pricing Page of the Multi-Tenant Appointment Booking System. This page aims to clearly present the different subscription plans available to service providers, highlighting their features and benefits to encourage sign-ups and upgrades.

## 2. Purpose

To inform potential and existing service providers about the available subscription tiers, their associated costs, and the features included in each plan, facilitating informed decision-making regarding their service usage.

## 3. Actors

*   **Potential Service Provider:** A user exploring the platform before registration.
*   **Existing Service Provider:** A logged-in user considering upgrading or downgrading their current plan.

## 4. Preconditions

*   The user has navigated to the Pricing Page (e.g., via a link from the homepage, registration page, or within their dashboard settings).

## 5. Postconditions

*   User has a clear understanding of the pricing plans.
*   User is encouraged to register or upgrade/downgrade their plan.
*   If a plan is selected, the user is redirected to the service provider registration page (for new users) or the subscription management page (for existing users).

## 6. Flow Steps

The Pricing Page is a static content page with interactive elements for plan selection.

### 6.1. Page Structure

**Template Type:** Layout 1 (Public-Facing / Logged Out) - for general access.
**Specific Layout Pattern:** A custom layout combining elements from `auth_centered_layout` for content blocks and a more general layout for the header/footer. It will feature a prominent section for plan comparison.

**UI Elements:**
*   **Header:** Standard public-facing header with logo, navigation (e.g., Home, Features, Pricing, Contact, Login/Register).
*   **Main Content Area:**
    *   **Hero Section:**
        *   **Title:** "Simple Pricing, Powerful Features" or "Find the Perfect Plan for Your Business"
        *   **Description:** A brief persuasive paragraph about the value proposition.
        *   **Call to Action (Optional):** "Start Your Free Trial" button.
    *   **Pricing Plans Section:**
        *   **Section Title:** "Choose Your Plan"
        *   **Plan Cards/Tiles:** Display multiple subscription plans (e.g., "Free", "Starter", "Pro", "Enterprise"). Each card should include:
            *   Plan Name
            *   Price (e.g., "$X/month", "$Y/year", or "Free")
            *   Billing Cycle Toggle (e.g., "Monthly" vs "Annually" - optional, but good for business)
            *   Key features/benefits (e.g., "Up to 5 Services", "Unlimited Bookings", "Analytics Dashboard", "Multi-user support") with checkmarks or icons.
            *   "Most Popular" or "Recommended" tag if applicable.
            *   `Select Plan` button (for new users, navigates to Service Provider Registration with pre-selected plan).
            *   `Upgrade/Downgrade` button (for logged-in users, navigates to Subscription Management).
    *   **Pricing Plan Comparison Table (Variant):**
        *   An alternative presentation where plans are compared side-by-side in a table format.
        *   **Wireframe:** `docs/knowledgebase/UiFlow/wireframe/public/pricing-comparison.html`
    *   **FAQ Section (Optional):** Common questions about pricing, features, and billing.
    *   **Call to Action Section (Optional):** Another prompt to sign up or contact sales.
*   **Footer:** Standard public-facing footer with copyright, privacy policy, terms of service links.

## 7. Angular Component Definitions

*   **`PricingPageComponent` (Smart Component):**
    *   **Purpose:** Orchestrates the display of pricing information.
    *   **Selector:** `app-pricing-page`
    *   **Location:** `src/app/features/public/pricing/pricing.component.ts` (or similar)
    *   **TypeScript Logic:**
        *   Fetches available pricing plans from a `PricingService`.
        *   Manages the state of the billing cycle toggle (if implemented).
        *   Handles `Select Plan` and `Upgrade/Downgrade` button clicks, navigating to appropriate routes.
    *   **Template:** Integrates `PricingPlanCardComponent` instances and potentially a `FeatureComparisonTableComponent`.

*   **`PricingPlanCardComponent` (Dumb Component):**
    *   **Purpose:** Displays individual subscription plan details.
    *   **Selector:** `app-pricing-plan-card`
    *   **Inputs:** `plan: PricingPlanDto`, `isRecommended: boolean`, `isSelected: boolean`.
    *   **Outputs:** `planSelected: EventEmitter<PricingPlanDto>`.
    *   **Template:** Renders plan name, price, features, and the action button.

*   **`FeatureComparisonTableComponent` (Dumb Component - Optional):**
    *   **Purpose:** Presents a detailed comparison of features across all plans.
    *   **Selector:** `app-feature-comparison-table`
    *   **Inputs:** `plans: PricingPlanDto[]`.
    *   **Template:** Renders a table with features as rows and plans as columns.

## 8. Styling and Responsiveness

*   **Layout:** Utilizes a flexible grid system for displaying plan cards (e.g., 1 column on mobile, 2-3 columns on tablet/desktop).
*   **Plan Cards:** Designed to be visually distinct, highlighting the plan name, price, and key features. Hover effects for interactivity.
*   **Typography:** Headings and text sizes will follow the hierarchy defined in `DesignTokens.json` and `StyleGuide.md`.
*   **Color Palette:** Adheres strictly to the brand colors defined in `DesignTokens.json` and `StyleGuide.md`.
*   **Responsiveness:** Mobile-first approach, ensuring optimal readability and interaction on all screen sizes. Plan cards will stack vertically on smaller screens.

## 9. Accessibility Considerations

*   Semantic HTML for proper structure and screen reader interpretation.
*   Keyboard navigation for all interactive elements (buttons, links, toggles).
*   Sufficient color contrast for text and interactive elements.
*   Clear focus indicators.
*   Appropriate ARIA attributes for dynamic content or complex interactions.

## 10. Integration

*   **Backend API:** `PricingService` will interact with a backend API to fetch the latest pricing plan data.
*   **Routing:**
    *   `Select Plan` button (for new users) navigates to `/auth/service-provider-register` with the selected plan as a query parameter or state.
    *   `Upgrade/Downgrade` button (for existing users) navigates to `/dashboard/settings/subscription` or a similar internal route.