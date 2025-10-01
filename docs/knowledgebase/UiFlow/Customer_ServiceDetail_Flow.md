# UI Flow: Customer - Service Detail Page

## 1. Overview

This document outlines the UI flow for the Service Detail Page, which provides comprehensive information about a specific service offered within the Multi-Tenant Appointment Booking System. It allows individual consumers to review service descriptions, view images, read reviews, and initiate the booking process. This directly supports FR-5.3 and FR-5.4 from the BRD.

## 2. Purpose

To provide users with all necessary details about a selected service, enabling them to make an informed decision before proceeding to book. It serves as a bridge between service discovery and the actual booking process.

## 3. Actors

*   **Individual Consumer:** A user interested in a specific service.

## 4. Preconditions

*   The user has navigated to this page from the Service Search & Discovery page or a direct link, with a specific service ID.

## 5. Postconditions

*   User has a complete understanding of the service.
*   User has initiated the booking process for the service.
*   User has read or written a review for the service.

## 6. Flow Steps

The Service Detail Page will display all relevant information about a single service.

### 6.1. Page Structure

**Template Type:** Layout 1 (Public-Facing / Logged Out).
**Specific Layout Pattern:** A content-focused layout, potentially with a hero-like section for the service image/video, followed by detailed sections for description, provider info, availability, and reviews.

**UI Elements:**
*   **Header:** Standard public-facing header with logo, navigation (e.g., Home, Features, Pricing, Contact, Login/Register).
*   **Main Content Area:**
    *   **Service Hero Section:**
        *   **Service Image Gallery/Video Player:** High-quality images or a video showcasing the service or provider's location.
        *   **Service Name:** Prominent display.
        *   **Provider Name/Business:** Link to provider's profile/page (if applicable).
        *   **Rating & Reviews Summary:** (e.g., 4.8 stars, 245 reviews) with a link to the full reviews section.
        *   **Price & Duration:** Clearly displayed.
        *   **Call to Action:** `Book Now` button (prominently displayed, potentially sticky on scroll for mobile).
    *   **Service Details Section:**
        *   **Description:** Detailed text describing what the service entails.
        *   **What's Included/Excluded:** Bullet points or structured list of deliverables.
        *   **Requirements/Preparation:** Any prerequisites for the client.
        *   **Cancellation Policy:** Summary of the policy.
    *   **Provider Information Section:**
        *   **Provider Profile:** Short bio, experience, qualifications.
        *   **Contact Information (Limited):** Business address, hours of operation.
        *   **Link to Provider's Full Profile:** (If applicable)
    *   **Availability Section (Optional, if not handled in booking flow):**
        *   A mini-calendar or next available slots display.
    *   **Reviews Section:**
        *   **Section Title:** "Customer Reviews"
        *   **Average Rating:** Large display of overall rating.
        *   **Rating Breakdown:** Bar charts for 5-star, 4-star, etc.
        *   **Individual Reviews:** List of customer reviews with reviewer name, date, rating, and text.
        *   **`Write a Review` button:** For logged-in users.
    *   **Related Services Section (Optional):**
        *   "You might also like..." displaying other services from the same provider or similar categories.
*   **Footer:** Standard public-facing footer.

## 7. Angular Component Definitions

*   **`ServiceDetailPageComponent` (Smart Component):**
    *   **Purpose:** Manages fetching and displaying service details, and orchestrates child components.
    *   **Selector:** `app-service-detail-page`
    *   **Location:** `src/app/features/public/service-detail/service-detail.component.ts`
    *   **TypeScript Logic:**
        *   Retrieves service ID from route parameters.
        *   Calls `ServiceService` to fetch detailed service information.
        *   Calls `ReviewService` to fetch reviews for the service.
        *   Manages loading states and error messages.
        *   Handles `Book Now` button click, navigating to the booking process.
    *   **Template:** Integrates `ServiceImageGalleryComponent`, `ServiceReviewsComponent`, and other basic HTML for static content.

*   **`ServiceImageGalleryComponent` (Dumb Component - Optional):**
    *   **Purpose:** Displays service images in a carousel or gallery format.
    *   **Selector:** `app-service-image-gallery`
    *   **Inputs:** `images: string[]`.
    *   **Template:** Renders image gallery.

*   **`ServiceReviewsComponent` (Dumb Component):**
    *   **Purpose:** Displays service reviews and allows users to write new ones.
    *   **Selector:** `app-service-reviews`
    *   **Inputs:** `reviews: ReviewDto[]`, `averageRating: number`.
    *   **Outputs:** `reviewSubmitted: EventEmitter<NewReviewDto>`.
    *   **Template:** Renders review summary, individual reviews, and a form for new reviews (if logged in).

## 8. Styling and Responsiveness

*   **Layout:** A flexible layout that adapts to different screen sizes. Sections will stack vertically on mobile. Images/videos will be responsive.
*   **Information Hierarchy:** Clear visual distinction between service name, price, description, and reviews.
*   **Reviews:** Visually appealing presentation of ratings and review text.
*   **Buttons:** Prominent `Book Now` button.
*   **Icons:** Use appropriate icons for ratings, features, and contact information.

## 9. Accessibility Considerations

*   Semantic HTML for proper structure (e.g., `section`, `article`, `h1-h6`).
*   Keyboard navigation for all interactive elements (buttons, links).
*   ARIA attributes for image galleries, review forms, and dynamic content.
*   Proper alt text for all images.
*   Sufficient color contrast for text and interactive elements.

## 10. Integration

*   **Backend API:** `ServiceService` will communicate with backend API endpoints for `GET /api/services/:id` and `ReviewService` for `GET /api/services/:id/reviews` and `POST /api/services/:id/reviews`.
*   **Routing:**
    *   `Book Now` button navigates to `/book/:serviceId` (Booking Process Page), potentially pre-filling service details.
    *   Links to provider profile (e.g., `/providers/:id`).