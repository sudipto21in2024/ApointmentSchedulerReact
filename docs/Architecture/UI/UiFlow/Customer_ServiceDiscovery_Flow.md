# UI Flow: Customer - Service Search & Discovery Page

## 1. Overview

This document outlines the UI flow for the public-facing Service Search & Discovery page, designed for individual consumers to find and explore available services within the Multi-Tenant Appointment Booking System. It focuses on providing intuitive search, filtering, and browsing capabilities, aligning with user journey FR-5.1 to FR-5.4.

## 2. Purpose

To enable individual consumers to efficiently search for services by keywords, filter results by various criteria (location, price, availability, ratings), browse services by category, and compare similar services, leading them to detailed service information and booking options.

## 3. Actors

*   **Individual Consumer:** A user seeking to book a service.

## 4. Preconditions

*   The user has accessed the main public portal of the Appointment Booking System (e.g., `yourdomain.com`).

## 5. Postconditions

*   User has found relevant services based on their criteria.
*   User has navigated to a Service Detail Page for a chosen service.

## 6. Flow Steps

The Service Search & Discovery page combines a search interface with a dynamic display of service listings.

### 6.1. Page Structure

**Template Type:** Layout 1 (Public-Facing / Logged Out).
**Specific Layout Pattern:** A combination of a search/filter sidebar (or top bar) and a main content area displaying service cards.

**UI Elements:**
*   **Header:** Standard public-facing header with logo, navigation (e.g., Home, Features, Pricing, Contact, Login/Register).
*   **Main Content Area:**
    *   **Hero Section (Optional, if combined with homepage):**
        *   **Title:** "Find Your Perfect Service"
        *   **Search Bar:** Prominent input field for keyword search (e.g., "dentist", "yoga", "haircut").
    *   **Filters/Sidebar (or Collapsible Panel on Mobile):**
        *   **Keyword Search Input:** (If not in Hero)
        *   **Location Filter:** (Text input, or dropdown with common cities/regions, or map integration)
        *   **Category Filter:** (Dropdown, checkboxes for multiple selection, or clickable tags based on FR-1.3)
        *   **Price Range Slider/Inputs:** (Min/Max price)
        *   **Availability Filter:** (Date picker, time slot selection)
        *   **Rating Filter:** (Star rating selection, e.g., 4+ stars)
        *   **Reset Filters Button**
        *   **Apply Filters Button**
    *   **Service Listings Area:**
        *   **Results Count:** "Showing X services"
        *   **Sort By:** (Dropdown for "Relevance", "Price: Low to High", "Price: High to Low", "Rating")
        *   **Service Cards Grid:** Displays `ServiceCardComponent` instances in a responsive grid. Each card (as per `ComponentLibrary.mmd`) will show:
            *   Service Image
            *   Service Name
            *   Short Description
            *   Price and Duration
            *   Provider Name/Business
            *   Rating (Stars) and Number of Reviews
            *   `View Details` button (links to Service Detail Page)
            *   `Book Now` button (optional, if direct booking from listing is allowed)
    *   **Pagination:** For navigating through multiple pages of results.
    *   **"No Results Found" State:** Displayed when no services match the criteria.
*   **Footer:** Standard public-facing footer.

## 7. Angular Component Definitions

*   **`ServiceDiscoveryPageComponent` (Smart Component):**
    *   **Purpose:** Manages the overall search and discovery logic, fetches services, and orchestrates child components.
    *   **Selector:** `app-service-discovery-page`
    *   **Location:** `src/app/features/public/service-discovery/service-discovery.component.ts`
    *   **TypeScript Logic:**
        *   Manages search query and filter parameters.
        *   Calls `ServiceService` to fetch service listings based on filters and pagination.
        *   Handles pagination logic.
        *   Manages loading states and error messages.
        *   Navigates to `ServiceDetailPage` or `BookingProcessPage`.
    *   **Template:** Integrates `ServiceSearchFilterComponent`, `ServiceListingGridComponent`, and `PaginationComponent`.

*   **`ServiceSearchFilterComponent` (Dumb Component):**
    *   **Purpose:** Provides UI for search input and various filters.
    *   **Selector:** `app-service-search-filter`
    *   **Inputs:** `currentFilters: ServiceFilterCriteriaDto`.
    *   **Outputs:** `filtersChanged: EventEmitter<ServiceFilterCriteriaDto>`.
    *   **Template:** Renders search input, dropdowns, sliders, and buttons for filters.

*   **`ServiceListingGridComponent` (Dumb Component):**
    *   **Purpose:** Displays a grid of `ServiceCardComponent` instances.
    *   **Selector:** `app-service-listing-grid`
    *   **Inputs:** `services: ServiceDto[]`.
    *   **Outputs:** `serviceClicked: EventEmitter<string>` (emits service ID for navigation).
    *   **Template:** Uses `ngFor` to render `ServiceCardComponent` for each service.

*   **`ServiceCardComponent` (Dumb Component):**
    *   **Purpose:** Renders a single service listing card. (Reuses from `ComponentLibrary.mmd` if defined, or defines here).
    *   **Selector:** `app-service-card`
    *   **Inputs:** `service: ServiceDto`.
    *   **Outputs:** `viewDetailsClicked: EventEmitter<string>`, `bookNowClicked: EventEmitter<string>`.
    *   **Template:** Displays service image, name, description, price, provider, ratings, and action buttons.

*   **`PaginationComponent` (Dumb Component):**
    *   **Purpose:** Provides pagination controls.
    *   **Selector:** `app-pagination`
    *   **Inputs:** `currentPage: number`, `totalPages: number`.
    *   **Outputs:** `pageChange: EventEmitter<number>`.
    *   **Template:** Renders page numbers, previous/next buttons.

## 8. Styling and Responsiveness

*   **Layout:** Responsive layout with filters potentially collapsing into an off-canvas menu or accordion on mobile. Service cards will adapt column count based on screen size.
*   **Search Bar:** Visually prominent.
*   **Filters:** Clear and easy to use.
*   **Service Cards:** Visually appealing and consistent, following `DesignTokens.json` and `StyleGuide.md`.
*   **Icons:** Use appropriate icons for search, filters, categories, and ratings.

## 9. Accessibility Considerations

*   Semantic HTML for headings, navigation, and content regions.
*   Keyboard navigation for all interactive elements (search, filters, buttons, links).
*   ARIA attributes for dynamic content updates (e.g., search results loading).
*   Proper labeling for form fields.
*   Sufficient color contrast.

## 10. Integration

*   **Backend API:** `ServiceService` will communicate with backend API endpoints for service search (`/api/services/search`), filtering, and pagination.
*   **Routing:**
    *   `View Details` button navigates to `/services/:id` (Service Detail Page).
    *   `Book Now` button navigates to `/book/:serviceId` (Booking Process Page).